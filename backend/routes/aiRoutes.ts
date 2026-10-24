import { Router, Response } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from '../auth';

const router = Router();

const DEFAULT_MODEL = 'meta/llama-3.2-11b-vision-instruct';

/**
 * Helper to call Google Gemini API (from Google AI Studio)
 */
async function callGeminiChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { maxTokens?: number; temperature?: number; responseFormatJson?: boolean } = {}
) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment.');
  }

  const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
  const userMessages = messages.filter((m) => m.role !== 'system');
  const userText = userMessages.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: (systemMsg ? `${systemMsg}\n\n` : '') + userText }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxTokens ?? 800,
    },
  };

  if (options.responseFormatJson) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data: any = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      content: content.trim(),
      model: 'gemini-1.5-flash',
      provider: 'Google Gemini (AI Studio)',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Helper to call NVIDIA NIM OpenAI-compatible chat completions API
 */
async function callNvidiaChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { maxTokens?: number; temperature?: number; responseFormatJson?: boolean } = {}
) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('NVIDIA_API_KEY is not configured in backend environment.');
  }

  const payload: any = {
    model: DEFAULT_MODEL,
    messages,
    max_tokens: options.maxTokens ?? 512,
    temperature: options.temperature ?? 0.2,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content || '';
    return {
      content: content.trim(),
      model: data.model || DEFAULT_MODEL,
      provider: 'NVIDIA NIM',
      usage: data.usage,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Unified AI dispatcher: prefers Google Gemini if configured, then NVIDIA NIM
 */
async function callAiChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { maxTokens?: number; temperature?: number; responseFormatJson?: boolean } = {}
) {
  const hasGemini = Boolean((process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim());
  const hasNvidia = Boolean(process.env.NVIDIA_API_KEY?.trim());

  if (hasGemini) {
    return callGeminiChat(messages, options);
  } else if (hasNvidia) {
    return callNvidiaChat(messages, options);
  } else {
    throw new Error('Neither GEMINI_API_KEY nor NVIDIA_API_KEY is configured in backend environment.');
  }
}

// GET /api/ai/status - Safe status check (never leaks API key)
router.get('/status', optionalAuthMiddleware, async (_req, res: Response) => {
  const hasGemini = Boolean((process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY)?.trim());
  const hasNvidia = Boolean(process.env.NVIDIA_API_KEY?.trim());
  const hasKey = hasGemini || hasNvidia;

  const provider = hasGemini ? 'Google Gemini (AI Studio)' : hasNvidia ? 'NVIDIA NIM' : 'None';
  const model = hasGemini ? 'gemini-1.5-flash' : hasNvidia ? DEFAULT_MODEL : 'Local Heuristic Engine';

  res.json({
    configured: hasKey,
    provider,
    model,
    mode: hasKey ? 'live_ai' : 'simulated_heuristic',
    notice: hasKey
      ? `${provider} API key loaded. Neural SecOps engine active.`
      : 'No AI key set. Using local heuristic fallback engine.',
  });
});

// POST /api/ai/ask - Ask AEGIS SecOps Copilot
router.post('/ask', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, context } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'A query string is required.' });
      return;
    }

    const companyName = context?.companyName || 'Protected Brand';
    const threatsCount = context?.activeThreatsCount ?? 'several';
    const recentSample = Array.isArray(context?.recentFindings)
      ? context.recentFindings
          .slice(0, 4)
          .map((f: any) => `- [${f.riskSeverity?.toUpperCase() || 'HIGH'}] ${f.title} on ${f.platform} (${f.status})`)
          .join('\n')
      : 'No finding highlights provided.';

    const systemPrompt = `You are "AEGIS SecOps Copilot", a top-tier cybersecurity and brand protection intelligence analyst.
Enterprise Brand Being Defended: ${companyName}.
Active Incident Count: ${threatsCount} active threat vectors.
Recent Ingested Threats:
${recentSample}

Instructions:
1. Answer the security analyst's question clearly, concisely, and authoritatively.
2. Provide concrete SecOps analysis, threat vectors (impersonation, phishing, APK droppers), and next-step actions.
3. Keep the response crisp (under 160 words). Use clean bullet points or bold markers where helpful.`;

    const result = await callAiChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query.trim() },
    ]);

    res.json({
      success: true,
      query: query.trim(),
      answer: result.content,
      model: result.model,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error('[AI Ask Error]', error.message);
    res.status(500).json({
      error: 'AI Copilot inference error',
      message: error.message,
      fallbackUsed: true,
    });
  }
});

// POST /api/ai/analyze-scam - Deep Scam Script & Lure Analysis
router.post('/analyze-scam', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, companyName } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text content is required for scam script analysis.' });
      return;
    }

    const brand = companyName || 'the targeted brand';

    const systemPrompt = `You are an elite fraud investigator and forensic NLP specialist in digital risk protection.
Analyze the following suspected scam/phishing message targeting ${brand}.

You MUST respond ONLY with a raw JSON object (no markdown fences, no extra text) with this exact schema:
{
  "scamScore": <number between 0 and 100>,
  "confidence": <"High" | "Medium" | "Low">,
  "threatVerdict": <"High-Risk Impersonation Scam" | "Suspicious Phishing Vector" | "Low Suspicion">,
  "urgencyLevel": <"Critical" | "High" | "Medium" | "Low">,
  "summary": <concise 2-sentence forensic evaluation>,
  "detectedTactics": [
    {
      "name": <name of tactic, e.g. "Artificial Urgency" | "Credential Harvesting" | "Authority Spoofing" | "Financial Coercion">,
      "severity": <"critical" | "high" | "medium">,
      "weight": <number 5-30>,
      "matchedSnippet": <quote from text demonstrating tactic>,
      "explanation": <short explanation of the psychological manipulation>
    }
  ],
  "redFlags": [<string 1>, <string 2>, <string 3>],
  "recommendedAction": <1-sentence recommended action for SecOps or customer advisory>
}`;

    const result = await callAiChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text.trim() },
      ],
      { maxTokens: 800, temperature: 0.1, responseFormatJson: true }
    );

    // Parse JSON safely
    let parsedJson: any = null;
    try {
      // Strip potential ```json ... ``` wrapper
      const cleaned = result.content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```$/, '')
        .trim();
      parsedJson = JSON.parse(cleaned);
    } catch {
      // Fallback structured extraction if LLM wrapped in text
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse structured JSON from AI response.');
      }
    }

    res.json({
      success: true,
      analysis: parsedJson,
      model: result.model,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error('[AI Scam Analysis Error]', error.message);
    res.status(500).json({
      error: 'AI Scam analysis error',
      message: error.message,
    });
  }
});

export default router;
