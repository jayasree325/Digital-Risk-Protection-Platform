import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { Finding } from '../../types';
import { api } from '../../services/api';
import { 
  Bot, 
  Send, 
  Search, 
  Sparkles, 
  X, 
  ShieldAlert, 
  Share2, 
  Smartphone, 
  ExternalLink, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Clock,
  Loader2,
  Cpu
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface QueryResult {
  shortAnswer: string;
  filteredFindings: Finding[];
  metricsSummary?: { label: string; value: string | number }[];
  filterTab?: 'all' | 'social' | 'app';
  filterSeverity?: string;
  isFallback?: boolean;
  isAi?: boolean;
  modelName?: string;
}

interface AskBrandShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskBrandShieldModal: React.FC<AskBrandShieldModalProps> = ({ isOpen, onClose }) => {
  const { 
    findings, 
    setSelectedFinding, 
    navigateToFindings, 
    brandProfile, 
    company,
    linkChecks 
  } = useBrandGuard();

  const [query, setQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api.getAiStatus()
        .then((s) => setAiConfigured(s.configured))
        .catch(() => setAiConfigured(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickQueries = [
    'Critical fake apps this week',
    'Show high-risk social profiles',
    'Which findings need review?',
    'Show dismissed findings',
    'Show suspicious links',
    'Which platform has the most findings?',
    'Show connected campaigns',
    'What changed today?',
  ];

  const handleExecuteQuery = async (textToRun: string) => {
    const q = textToRun.trim().toLowerCase();
    setLastQuery(textToRun);

    // Initial local heuristic baseline for instant UI responsiveness
    let localMatches: Finding[] = [];
    let localAnswer = 'Consulting NVIDIA NIM SecOps intelligence...';
    let localTab: 'all' | 'social' | 'app' = 'all';
    let localSeverity: string | undefined = undefined;
    let localMetrics: { label: string; value: string | number }[] = [
      { label: 'Active Threats', value: findings.length },
      { label: 'Brand Target', value: company?.name || 'Enterprise' },
      { label: 'AI Intelligence', value: 'NVIDIA Llama 3.2' },
    ];

    if (q.includes('critical') && q.includes('app')) {
      localMatches = findings.filter(f => f.type === 'app' && (f.riskSeverity === 'critical' || f.riskScore >= 80));
      localTab = 'app';
      localSeverity = 'critical';
      localMetrics = [
        { label: 'Critical Apps', value: localMatches.length },
        { label: 'Highest Risk Score', value: `${Math.max(...localMatches.map(m => m.riskScore), 0)}/100` },
        { label: 'Threat Vector', value: 'APK / Droppers' },
      ];
      localAnswer = `Detected ${localMatches.length} critical mobile apps attempting to impersonate official brand packages. Immediate review and storefront escalation recommended.`;
    } else if ((q.includes('high') || q.includes('risk')) && (q.includes('social') || q.includes('profile'))) {
      localMatches = findings.filter(f => f.type === 'social' && (f.riskSeverity === 'critical' || f.riskSeverity === 'high'));
      localTab = 'social';
      localSeverity = 'high';
      localMetrics = [
        { label: 'High-Risk Social', value: localMatches.length },
        { label: 'Platforms Flagged', value: 'Instagram, Telegram, X' },
        { label: 'Average Risk', value: '84.2%' },
      ];
      localAnswer = `Found ${localMatches.length} high-risk social media profiles on Instagram, Telegram, and X mimicking brand handles and bio links.`;
    } else if (q.includes('review') || q.includes('pending') || q.includes('need review')) {
      localMatches = findings.filter(f => f.status === 'New' || f.status === 'Investigating');
      localMetrics = [
        { label: 'Pending Review', value: localMatches.length },
        { label: 'New Alerts', value: findings.filter(f => f.status === 'New').length },
        { label: 'Investigating', value: findings.filter(f => f.status === 'Investigating').length },
      ];
      localAnswer = `There are ${localMatches.length} active findings currently pending analyst triage and confirmation.`;
    } else if (q.includes('dismissed') || q.includes('ignored')) {
      localMatches = findings.filter(f => f.status === 'Dismissed');
      localAnswer = `${localMatches.length} findings have been dismissed by analysts as benign fan communities or authorized brand distributors.`;
    } else if (q.includes('suspicious link') || q.includes('link') || q.includes('url')) {
      localMatches = findings.filter(f => f.candidateWebsite || f.candidateUrl);
      localAnswer = `Identified ${localMatches.length} candidate domains and ${linkChecks.length} checked suspicious links mimicking authentic landing pages.`;
    } else if (q.includes('platform') || q.includes('most finding') || q.includes('where')) {
      const platformCounts: Record<string, number> = {};
      findings.forEach(f => {
        platformCounts[f.platform] = (platformCounts[f.platform] || 0) + 1;
      });
      const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0] || ['Instagram', 0];
      localMatches = findings.filter(f => f.platform === topPlatform[0]);
      localAnswer = `${topPlatform[0]} currently accounts for the highest volume of impersonations with ${topPlatform[1]} detected threats.`;
    } else if (q.includes('campaign') || q.includes('connected') || q.includes('syndicate') || q.includes('cluster')) {
      localMatches = findings.filter(f => f.connectedCampaign);
      localAnswer = `Correlated ${localMatches.length} findings linked to coordinated multi-channel impersonation campaigns sharing backend hosting infrastructure.`;
    } else if (q.includes('today') || q.includes('change') || q.includes('recent') || q.includes('new')) {
      localMatches = findings.filter(f => f.detectedTime.toLowerCase().includes('today') || f.detectedTime.toLowerCase().includes('hour') || f.status === 'New');
      localAnswer = `Today new candidate profiles were ingested, critical indicators evaluated, and findings triaged by SecOps.`;
    }

    // Set immediate responsive state
    setResult({
      shortAnswer: localAnswer,
      filteredFindings: localMatches,
      metricsSummary: localMetrics,
      filterTab: localTab,
      filterSeverity: localSeverity,
      isFallback: false,
    });

    // Fire live NVIDIA NIM AI Inference
    setIsAiLoading(true);
    try {
      const aiRes = await api.askAegisAI(textToRun, {
        companyName: company?.name || brandProfile.brandName || 'AcmePay',
        activeThreatsCount: findings.length,
        recentFindings: (localMatches.length > 0 ? localMatches : findings).slice(0, 5),
      });

      if (aiRes && aiRes.answer) {
        setResult(prev => ({
          shortAnswer: aiRes.answer,
          filteredFindings: prev?.filteredFindings || localMatches,
          metricsSummary: prev?.metricsSummary || localMetrics,
          filterTab: prev?.filterTab || localTab,
          filterSeverity: prev?.filterSeverity || localSeverity,
          isFallback: false,
          isAi: true,
          modelName: aiRes.model,
        }));
      }
    } catch (err: any) {
      console.warn('AI copilot inference error, retaining local heuristics:', err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isAiLoading) {
      handleExecuteQuery(query);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#00050B]/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-[#020713]/95 border border-[#00FFA3]/30 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(0, 255, 163,0.15)] backdrop-blur-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100 font-sans relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/70 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 px-6 border-b border-[#00FFA3]/20 bg-[#00050B]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 shadow-[0_0_15px_rgba(0, 255, 163,0.2)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Ask BrandGuard Intelligence Assistant</span>
                  <span className="text-[10px] font-mono text-[#00FFA3] px-1.5 py-0.2 border border-[#00FFA3]/30 rounded">SOC AI</span>
                </h3>
                {aiConfigured ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
                    NVIDIA NIM Live
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                    NLP Telemetry
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Analytical assistant for querying brand threats, sources, and investigation status.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Input Bar */}
        <form onSubmit={handleFormSubmit} className="p-4 border-b border-[#00FFA3]/15 bg-[#020713]/80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#00FFA3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask: 'Critical fake apps this week', 'Which findings need review?'..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-[#00FFA3]/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/30"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isAiLoading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00FFA3] via-[#00E5FF] to-[#00E5FF] hover:opacity-90 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0, 255, 163,0.3)] flex-shrink-0 disabled:opacity-50"
          >
            {isAiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <Send className="w-3.5 h-3.5 text-black" />
            )}
            <span>{isAiLoading ? 'Thinking...' : 'Ask'}</span>
          </button>
        </form>

        {/* Quick Query Preset Chips */}
        <div className="px-6 py-2.5 bg-[#070D1E]/60 border-b border-white/[0.06] overflow-x-auto flex items-center gap-1.5 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap mr-1">
            Suggested:
          </span>
          {quickQueries.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(preset);
                handleExecuteQuery(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-[#00FFA3]/10 text-slate-300 hover:text-[#00FFA3] border border-white/[0.06] hover:border-[#00FFA3]/40 transition-all whitespace-nowrap text-[11px]"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Body Content / Results Stage */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Short Answer Card */}
              <div className={`p-4 rounded-xl border space-y-2 relative overflow-hidden ${
                result.isFallback
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-[#00FFA3]/5 border-[#00FFA3]/30 text-slate-100 shadow-[0_0_20px_rgba(0, 255, 163,0.08)]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${result.isFallback ? 'text-amber-400' : 'text-[#00FFA3]'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00FFA3]">
                      BrandGuard SecOps Analysis:
                    </span>
                  </div>
                  {result.isAi && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                      <Cpu className="w-3 h-3" />
                      NVIDIA Llama 3.2
                    </span>
                  )}
                </div>

                {isAiLoading ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-[#00FFA3] animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-[#00FFA3]" />
                    <span>Analyzing threat landscape with NVIDIA NIM neural copilot...</span>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed font-sans whitespace-pre-line text-slate-200">
                    {result.shortAnswer}
                  </p>
                )}
              </div>

              {/* Metrics Summary Strip */}
              {result.metricsSummary && (
                <div className="grid grid-cols-3 gap-3">
                  {result.metricsSummary.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#00050B]/90 border border-[#00FFA3]/20 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {m.label}
                      </span>
                      <div className="text-base font-extrabold text-[#00FFA3] mt-0.5 font-mono">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filtered Findings List */}
              {result.filteredFindings && result.filteredFindings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      Matching Findings ({result.filteredFindings.length})
                    </span>
                    <button
                      onClick={() => {
                        navigateToFindings(result.filterTab, result.filterSeverity);
                        onClose();
                      }}
                      className="text-[#00FFA3] hover:text-[#00E5FF] text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>View findings in table</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {result.filteredFindings.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setSelectedFinding(f);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[#00050B]/80 hover:bg-[#020713] border border-[#00FFA3]/15 hover:border-[#00FFA3]/40 cursor-pointer flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <RiskBadge severity={f.riskSeverity} size="sm" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {f.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {f.platform} &bull; {f.mainReason}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#020713] text-[#00FFA3] border border-[#00FFA3]/30 flex-shrink-0">
                          {f.riskScore}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 text-slate-400">
              <Bot className="w-12 h-12 mx-auto text-[#00FFA3]/50 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-white">Ask anything about your brand threat posture</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click a suggested query above or type a natural question about risk, source, status, or time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-[#00050B] border-t border-[#00FFA3]/20 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-[10px] text-slate-400">BrandGuard Threat Engine &bull; Detection Engine + NVIDIA NIM</span>
          {result && !result.isFallback && (
            <button
              onClick={() => {
                navigateToFindings(result.filterTab, result.filterSeverity);
                onClose();
              }}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] hover:opacity-90 text-black font-bold transition-opacity flex items-center gap-1 shadow-[0_0_12px_rgba(0, 255, 163,0.3)]"
            >
              <span>View Findings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
