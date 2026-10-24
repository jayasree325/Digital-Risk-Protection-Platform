import crypto from 'crypto';

export type GoogleSourceStatus =
  | 'Live indexed data'
  | 'Google Search unavailable'
  | 'Google API not configured'
  | 'Google quota exceeded'
  | 'Rate limited'
  | 'No indexed results found'
  | 'Partial results available'
  | 'Google Web Risk unavailable'
  | 'Unable to assess';

export interface WebRiskResult {
  threatMatch: boolean;
  threatLabel:
    | 'Known dangerous URL'
    | 'Known phishing or social-engineering threat'
    | 'Known malware threat'
    | 'Known unwanted software'
    | 'No known Google threat match'
    | 'Unable to check URL'
    | 'Google Web Risk not configured';
  threatTypes: string[];
  timestamp: string;
}

export interface GoogleDiscoveredFinding {
  id: string;
  companyId: string;
  type: 'social' | 'app' | 'link';
  referenceId: string;
  title: string;
  platform: string;
  usernameOrPackage: string;
  candidateUrl: string;
  riskSeverity: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  confidence: 'High' | 'Medium' | 'Low';
  status: 'New';
  mainReason: string;
  detailedReason: string;
  detectedTime: string;
  firstSeen: string;
  lastSeen: string;
  publisherOrOwner: string;
  candidateWebsite: string;
  description: string;
  avatarColor: string;
  avatarInitials: string;
  lookalike: {
    official: string;
    candidate: string;
    differenceType: string;
    highlightedParts: Array<{ text: string; isDifferent: boolean; differenceLabel?: string }>;
    explanation: string;
  };
  signals: Array<{
    id: string;
    signalType: string;
    title: string;
    explanation: string;
    strength: 'Critical' | 'High' | 'Medium' | 'Low';
    iconName: string;
  }>;
  evidence: {
    id: string;
    type: string;
    urlOrPath: string;
    timestamp: string;
    description: string;
    source: string;
    sha256Hash: string;
  };
  webRisk: WebRiskResult;
  isDemo: number; // 0 for live indexed data
}

export interface GoogleDiscoveryConfigStatus {
  searchConfigured: boolean;
  searchEngineIdConfigured: boolean;
  webRiskConfigured: boolean;
  status: 'live_ready' | 'not_configured';
  sourceStatus: GoogleSourceStatus;
  message: string;
}

/**
 * Returns safe status about Google Search and Web Risk configuration without exposing keys.
 */
export function getGoogleDiscoveryStatus(): GoogleDiscoveryConfigStatus {
  const searchApiKey = process.env.GOOGLE_SEARCH_API_KEY?.trim() || '';
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID?.trim() || '';
  const webRiskApiKey = (process.env.GOOGLE_WEB_RISK_API_KEY?.trim() || searchApiKey).trim();

  const searchConfigured = searchApiKey.length > 0;
  const searchEngineIdConfigured = searchEngineId.length > 0;
  const webRiskConfigured = webRiskApiKey.length > 0;

  if (!searchConfigured || !searchEngineIdConfigured) {
    return {
      searchConfigured,
      searchEngineIdConfigured,
      webRiskConfigured,
      status: 'not_configured',
      sourceStatus: 'Google API not configured',
      message: 'Google Discovery is not configured. Add the backend API credentials and Search Engine ID to enable live discovery.',
    };
  }

  return {
    searchConfigured: true,
    searchEngineIdConfigured: true,
    webRiskConfigured,
    status: 'live_ready',
    sourceStatus: 'Live indexed data',
    message: `Google Discovery is configured with live Custom Search engine.${
      webRiskConfigured ? ' Google Web Risk threat intelligence is enabled.' : ' Google Web Risk not configured.'
    }`,
  };
}

/**
 * Validates URLs against SSRF: allows only HTTP/HTTPS and blocks private/loopback/cloud metadata ranges.
 */
export function isSsrfSafe(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Check hostnames
    if (
      host === 'localhost' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan') ||
      host === 'metadata.google.internal' ||
      host === 'instance-data'
    ) {
      return false;
    }

    // Check IPv4 addresses
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = host.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);

      // Loopback 127.0.0.0/8 & 0.0.0.0
      if (octet1 === 127 || octet1 === 0) return false;

      // Private 10.0.0.0/8
      if (octet1 === 10) return false;

      // Private 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;

      // Private 192.168.0.0/16
      if (octet1 === 192 && octet2 === 168) return false;

      // Link-local / Cloud Metadata 169.254.0.0/16
      if (octet1 === 169 && octet2 === 254) return false;
    }

    // IPv6 loopback / unique local / link-local
    if (host === '[::1]' || host === '::1' || host.startsWith('fc') || host.startsWith('fe80')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL to canonical form and removes tracking parameters.
 */
export function normalizeCanonicalUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hash = '';

    // Strip common tracking parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
      'source',
      'spm',
    ];
    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }

    let normalized = parsed.toString();
    // Remove trailing slash if path is non-empty
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Classifies the candidate platform based on URL hostname without altering existing platform types.
 */
export function classifyPlatformFromUrl(urlStr: string): string {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('facebook.com') || host.includes('fb.me')) return 'Facebook';
    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'X';
    if (host.includes('telegram.me') || host.includes('t.me') || host.includes('telegram.org')) return 'Telegram';
    if (host.includes('play.google.com')) return 'Google Play';
    if (host.includes('apps.apple.com')) return 'Apple App Store';
    return 'Web Domain';
  } catch {
    return 'Web Domain';
  }
}

/**
 * Extracts username or package ID or domain name for concise display.
 */
export function extractUsernameOrIdentifier(urlStr: string, platform: string): string {
  try {
    const parsed = new URL(urlStr);
    const pathSegments = parsed.pathname.split('/').filter(Boolean);

    if (platform === 'Instagram' || platform === 'X' || platform === 'Facebook' || platform === 'Telegram') {
      const handle = pathSegments[0] || 'profile';
      return handle.startsWith('@') ? handle : `@${handle}`;
    }
    if (platform === 'LinkedIn') {
      return pathSegments[1] ? `in/${pathSegments[1]}` : (pathSegments[0] || 'company');
    }
    if (platform === 'Google Play') {
      return parsed.searchParams.get('id') || pathSegments[pathSegments.length - 1] || 'play.app';
    }
    return parsed.hostname;
  } catch {
    return 'candidate-asset';
  }
}

/**
 * Checks discovered URL against Google Web Risk API if configured.
 */
export async function checkGoogleWebRisk(url: string): Promise<WebRiskResult> {
  const timestamp = new Date().toISOString();
  const apiKey = (process.env.GOOGLE_WEB_RISK_API_KEY?.trim() || process.env.GOOGLE_SEARCH_API_KEY?.trim()) || '';

  if (!apiKey) {
    return {
      threatMatch: false,
      threatLabel: 'Google Web Risk not configured',
      threatTypes: [],
      timestamp,
    };
  }

  if (!isSsrfSafe(url)) {
    return {
      threatMatch: false,
      threatLabel: 'Unable to check URL',
      threatTypes: [],
      timestamp,
    };
  }

  const endpoint = new URL('https://webrisk.googleapis.com/v1/uris:search');
  endpoint.searchParams.set('key', apiKey);
  endpoint.searchParams.set('uri', url);
  endpoint.searchParams.append('threatTypes', 'MALWARE');
  endpoint.searchParams.append('threatTypes', 'SOCIAL_ENGINEERING');
  endpoint.searchParams.append('threatTypes', 'UNWANTED_SOFTWARE');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        threatMatch: false,
        threatLabel: 'Unable to check URL',
        threatTypes: [],
        timestamp,
      };
    }

    const data: any = await response.json();
    const threats: string[] = data?.threat?.threatTypes || [];

    if (threats.length === 0) {
      return {
        threatMatch: false,
        threatLabel: 'No known Google threat match',
        threatTypes: [],
        timestamp,
      };
    }

    let threatLabel: WebRiskResult['threatLabel'] = 'Known dangerous URL';
    if (threats.includes('SOCIAL_ENGINEERING')) {
      threatLabel = 'Known phishing or social-engineering threat';
    } else if (threats.includes('MALWARE')) {
      threatLabel = 'Known malware threat';
    } else if (threats.includes('UNWANTED_SOFTWARE')) {
      threatLabel = 'Known unwanted software';
    }

    return {
      threatMatch: true,
      threatLabel,
      threatTypes: threats,
      timestamp,
    };
  } catch {
    return {
      threatMatch: false,
      threatLabel: 'Unable to check URL',
      threatTypes: [],
      timestamp,
    };
  }
}

/**
 * Builds a small, controlled set of search queries derived from the registered brand data.
 */
export function generateBrandSearchQueries(brandData: {
  brandName: string;
  aliases?: string[];
  productNames?: string[];
  slogans?: string[];
}): string[] {
  const cleanBrand = brandData.brandName.trim();
  const queries: string[] = [];

  // Core brand queries
  queries.push(`"${cleanBrand}"`);
  queries.push(`"${cleanBrand}" official`);
  queries.push(`"${cleanBrand}" support`);
  queries.push(`"${cleanBrand}" login`);

  // Targeted platform queries
  queries.push(`site:instagram.com "${cleanBrand}"`);
  queries.push(`site:facebook.com "${cleanBrand}"`);
  queries.push(`site:linkedin.com "${cleanBrand}"`);
  queries.push(`site:x.com "${cleanBrand}"`);

  // Aliases / products if available (controlled max)
  if (brandData.aliases && brandData.aliases.length > 0) {
    const alias = brandData.aliases[0].trim();
    if (alias && alias.toLowerCase() !== cleanBrand.toLowerCase()) {
      queries.push(`"${alias}" official`);
    }
  }

  if (brandData.productNames && brandData.productNames.length > 0) {
    const product = brandData.productNames[0].trim();
    if (product && product.toLowerCase() !== cleanBrand.toLowerCase()) {
      queries.push(`"${cleanBrand}" "${product}" support`);
    }
  }

  // Cap at 6 queries max per scan to respect rate limits
  return queries.slice(0, 6);
}

/**
 * Evaluates candidate URL and metadata against official brand perimeter to determine risk & reasons.
 */
function evaluateAgainstOfficialPerimeter(params: {
  candidateUrl: string;
  candidateTitle: string;
  snippet: string;
  platform: string;
  brandName: string;
  aliases: string[];
  officialDomains: string[];
  officialSocialUrls: string[];
  webRiskResult: WebRiskResult;
}) {
  const {
    candidateUrl,
    candidateTitle,
    snippet,
    platform,
    brandName,
    aliases,
    officialDomains,
    officialSocialUrls,
    webRiskResult,
  } = params;

  const candidateLower = (candidateTitle + ' ' + candidateUrl + ' ' + snippet).toLowerCase();
  const brandLower = brandName.toLowerCase();

  // Suspicious phishing/impersonation triggers
  const suspiciousKeywords = [
    'support',
    'customer care',
    'helpdesk',
    'dispute',
    'chargeback',
    'login',
    'verify',
    'recovery',
    'airdrop',
    'bonus',
    'official account',
    'direct support',
    'contact center',
    'unauthorized',
    'claim now',
  ];

  const matchedKeywords = suspiciousKeywords.filter((k) => candidateLower.includes(k));

  // Determine signals
  const signals: GoogleDiscoveredFinding['signals'] = [];
  let baseScore = 62;
  let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  let confidence: 'High' | 'Medium' | 'Low' = 'Medium';

  // Signal 1: Public index discovery
  signals.push({
    id: 'sig-goog-index-' + Math.random().toString(36).substring(2, 7),
    signalType: 'google_discovery',
    title: 'Discovered via Google Search',
    explanation: `Candidate profile indexed by Google search engine matching brand term "${brandName}".`,
    strength: 'Medium',
    iconName: 'name',
  });

  // Signal 2: Official domain / handle mismatch
  const isApprovedUrl = officialSocialUrls.some((u) => u.toLowerCase() === candidateUrl.toLowerCase());
  const isApprovedDomain = officialDomains.some((d) => {
    try {
      return new URL(candidateUrl).hostname.toLowerCase().endsWith(d.toLowerCase());
    } catch {
      return false;
    }
  });

  if (!isApprovedUrl && !isApprovedDomain) {
    signals.push({
      id: 'sig-goog-mismatch-' + Math.random().toString(36).substring(2, 7),
      signalType: 'perimeter_mismatch',
      title: 'Unapproved external perimeter',
      explanation: `Asset is not listed in ${brandName}'s verified official domains or approved social handles.`,
      strength: 'High',
      iconName: 'domain',
    });
    baseScore += 12;
  }

  // Signal 3: Suspicious keyword match
  if (matchedKeywords.length > 0) {
    const kwDisplay = matchedKeywords.slice(0, 3).join(', ');
    signals.push({
      id: 'sig-goog-kw-' + Math.random().toString(36).substring(2, 7),
      signalType: 'deceptive_intent',
      title: 'High-risk account wording',
      explanation: `Candidate uses support/credential keywords ("${kwDisplay}") under brand naming.`,
      strength: 'High',
      iconName: 'desc',
    });
    baseScore += 14;
  }

  // Signal 4: Web Risk threat intelligence
  if (webRiskResult.threatMatch) {
    signals.push({
      id: 'sig-goog-webrisk-' + Math.random().toString(36).substring(2, 7),
      signalType: 'google_web_risk',
      title: 'Google threat intelligence returned a known threat match',
      explanation: `Google Web Risk detected active danger: ${webRiskResult.threatLabel}.`,
      strength: 'Critical',
      iconName: 'permission',
    });
    baseScore = Math.max(baseScore, 94);
    severity = 'critical';
    confidence = 'High';
  } else {
    // Web Risk no match / unconfigured note
    signals.push({
      id: 'sig-goog-webrisk-clean-' + Math.random().toString(36).substring(2, 7),
      signalType: 'google_web_risk',
      title: webRiskResult.threatLabel,
      explanation:
        webRiskResult.threatLabel === 'No known Google threat match'
          ? 'Google threat intelligence returned no active malware/phishing blocklist match (does not prove URL is authentic).'
          : 'Google Web Risk check status: ' + webRiskResult.threatLabel,
      strength: 'Low',
      iconName: 'redirect',
    });
  }

  // Calculate severity
  if (baseScore >= 88 || webRiskResult.threatMatch) {
    severity = 'critical';
    confidence = 'High';
  } else if (baseScore >= 72) {
    severity = 'high';
    confidence = 'High';
  } else {
    severity = 'medium';
    confidence = 'Medium';
  }

  const isOfficialComplete = officialDomains.length > 0 || officialSocialUrls.length > 0;
  const assessment = isOfficialComplete
    ? 'Potential impersonation'
    : 'Suspicious match — official comparison is limited';

  return {
    riskScore: Math.min(Math.max(baseScore, 45), 98),
    riskSeverity: severity,
    confidence,
    signals,
    assessment,
    matchedKeywords,
  };
}

/**
 * Executes Google Custom Search API queries from the backend, deduplicates results,
 * classifies platforms, evaluates official asset parity, and checks Google Web Risk.
 */
export async function executeGoogleDiscovery(params: {
  companyId: string;
  brandName: string;
  aliases?: string[];
  productNames?: string[];
  slogans?: string[];
  officialDomains?: string[];
  officialSocialUrls?: string[];
  officialUsernames?: string[];
}): Promise<{
  findings: GoogleDiscoveredFinding[];
  sourceStatus: GoogleSourceStatus;
  status: 'completed' | 'partial' | 'error' | 'not_configured';
  message: string;
  totalIndexedResults: number;
}> {
  const searchApiKey = process.env.GOOGLE_SEARCH_API_KEY?.trim() || '';
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID?.trim() || '';

  if (!searchApiKey || !searchEngineId) {
    return {
      findings: [],
      sourceStatus: 'Google API not configured',
      status: 'not_configured',
      message: 'Google Discovery is not configured. Add the backend API credentials and Search Engine ID to enable live discovery.',
      totalIndexedResults: 0,
    };
  }

  const queries = generateBrandSearchQueries({
    brandName: params.brandName,
    aliases: params.aliases,
    productNames: params.productNames,
    slogans: params.slogans,
  });

  const now = new Date().toISOString();
  const officialDomains = (params.officialDomains || []).map((d) => d.toLowerCase());
  const officialSocialUrls = (params.officialSocialUrls || []).map((u) => normalizeCanonicalUrl(u).toLowerCase());

  const seenUrls = new Set<string>();
  const rawItems: Array<{ query: string; title: string; link: string; snippet: string }> = [];

  let isQuotaExceeded = false;
  let isRateLimited = false;
  let hasApiError = false;

  // Perform controlled sequential requests with small delays to respect quotas
  for (const q of queries) {
    try {
      const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
      searchUrl.searchParams.set('key', searchApiKey);
      searchUrl.searchParams.set('cx', searchEngineId);
      searchUrl.searchParams.set('q', q);
      searchUrl.searchParams.set('num', '10');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(searchUrl.toString(), {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (resp.status === 429) {
        isRateLimited = true;
        break;
      }

      if (!resp.ok) {
        const errJson: any = await resp.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || '';
        if (errMsg.toLowerCase().includes('quota') || resp.status === 403) {
          isQuotaExceeded = true;
        } else {
          hasApiError = true;
        }
        break;
      }

      const data: any = await resp.json();
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.link && typeof item.link === 'string') {
            rawItems.push({
              query: q,
              title: item.title || 'Untitled Candidate',
              link: item.link,
              snippet: item.snippet || '',
            });
          }
        }
      }

      // Small 150ms throttle between requests
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch {
      hasApiError = true;
    }
  }

  // Deduplicate and filter out SSRF unsafe links
  const validCandidates: typeof rawItems = [];
  for (const item of rawItems) {
    const canonical = normalizeCanonicalUrl(item.link);
    if (!isSsrfSafe(canonical)) continue;

    // Filter out official approved assets so they aren't reported as impersonators
    const canonicalLower = canonical.toLowerCase();
    const isApprovedSocial = officialSocialUrls.includes(canonicalLower);
    const isApprovedDomain = officialDomains.some((d) => {
      try {
        return new URL(canonical).hostname.toLowerCase().endsWith(d);
      } catch {
        return false;
      }
    });

    if (isApprovedSocial || isApprovedDomain) {
      continue;
    }

    if (!seenUrls.has(canonicalLower)) {
      seenUrls.add(canonicalLower);
      validCandidates.push({
        ...item,
        link: canonical,
      });
    }
  }

  const findings: GoogleDiscoveredFinding[] = [];

  // Limit processing to at most 10 distinct high-relevance findings to prevent overwhelming the scan
  const candidatesToProcess = validCandidates.slice(0, 10);

  for (const candidate of candidatesToProcess) {
    const platform = classifyPlatformFromUrl(candidate.link);
    const usernameOrPackage = extractUsernameOrIdentifier(candidate.link, platform);

    // Run Google Web Risk check
    const webRiskResult = await checkGoogleWebRisk(candidate.link);

    // Evaluate perimeter comparison
    const evalResult = evaluateAgainstOfficialPerimeter({
      candidateUrl: candidate.link,
      candidateTitle: candidate.title,
      snippet: candidate.snippet,
      platform,
      brandName: params.brandName,
      aliases: params.aliases || [],
      officialDomains,
      officialSocialUrls,
      webRiskResult,
    });

    const findingId = 'find-goog-' + crypto.randomBytes(4).toString('hex');
    const sha256Hash = crypto.createHash('sha256').update(candidate.link + now).digest('hex');

    const cleanTitle = candidate.title.replace(/[|–—].*$/, '').trim() || `${params.brandName} Candidate`;
    const initials = cleanTitle.substring(0, 2).toUpperCase() || 'GS';

    let type: 'social' | 'app' | 'link' = 'link';
    if (['Instagram', 'Facebook', 'LinkedIn', 'X', 'Telegram'].includes(platform)) {
      type = 'social';
    } else if (['Google Play', 'Apple App Store', 'Third-party APK'].includes(platform)) {
      type = 'app';
    }

    findings.push({
      id: findingId,
      companyId: params.companyId,
      type,
      referenceId: findingId,
      title: cleanTitle,
      platform,
      usernameOrPackage,
      candidateUrl: candidate.link,
      riskSeverity: evalResult.riskSeverity,
      riskScore: evalResult.riskScore,
      confidence: evalResult.confidence,
      status: 'New',
      mainReason: `${evalResult.assessment}: Publicly indexed ${platform} profile matching "${params.brandName}".`,
      detailedReason: candidate.snippet
        ? `Discovered via Google Search: "${candidate.snippet.slice(0, 200)}". Assessment: ${evalResult.assessment}. Web Risk: ${webRiskResult.threatLabel}.`
        : `Discovered through Google Search index query. Evaluated against official ${params.brandName} perimeter.`,
      detectedTime: 'Just now',
      firstSeen: now,
      lastSeen: now,
      publisherOrOwner: 'Unverified Operator (Google Indexed)',
      candidateWebsite: candidate.link,
      description: candidate.snippet || 'Public candidate indexed by search engine crawler.',
      avatarColor: evalResult.riskSeverity === 'critical' ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-cyan-600',
      avatarInitials: initials,
      lookalike: {
        official: params.brandName,
        candidate: cleanTitle,
        differenceType: 'character_variation',
        highlightedParts: [
          { text: params.brandName, isDifferent: false },
          { text: ` (${platform})`, isDifferent: true, differenceLabel: 'Unapproved channel' },
        ],
        explanation: `Indexed on Google as public candidate for ${params.brandName}. Requires analyst triage.`,
      },
      signals: evalResult.signals,
      evidence: {
        id: `ev-${findingId}`,
        type: 'web_search_index',
        urlOrPath: candidate.link,
        timestamp: now,
        description: `Google Search public index candidate. Query: ${candidate.query}. Telemetry: ${webRiskResult.threatLabel}`,
        source: 'Google Search',
        sha256Hash,
      },
      webRisk: webRiskResult,
      isDemo: 0, // Live indexed data
    });
  }

  // Determine overall status
  let sourceStatus: GoogleSourceStatus = 'Live indexed data';
  let scanStatus: 'completed' | 'partial' | 'error' = 'completed';
  let message = `Google Discovery scanned public indexes. Identified ${findings.length} candidate(s).`;

  if (isRateLimited) {
    sourceStatus = 'Rate limited';
    scanStatus = 'partial';
    message = 'Google Discovery rate limited. Partial results available.';
  } else if (isQuotaExceeded) {
    sourceStatus = 'Google quota exceeded';
    scanStatus = 'partial';
    message = 'Google Search quota exceeded. Partial results available.';
  } else if (hasApiError && findings.length === 0) {
    sourceStatus = 'Google Search unavailable';
    scanStatus = 'error';
    message = 'Google Search API is currently unavailable or returned an error.';
  } else if (findings.length === 0) {
    sourceStatus = 'No indexed results found';
    message = `No new unapproved candidates indexed on Google for brand "${params.brandName}".`;
  }

  return {
    findings,
    sourceStatus,
    status: scanStatus,
    message,
    totalIndexedResults: validCandidates.length,
  };
}
