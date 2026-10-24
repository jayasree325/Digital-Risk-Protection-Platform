import React from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  ShieldAlert, 
  ExternalLink, 
  Terminal, 
  Clock, 
  AlertTriangle, 
  Share2, 
  Smartphone, 
  CheckCircle2,
  ChevronRight,
  Flame,
  Radio
} from 'lucide-react';
import { Finding } from '../../types';
import { PlatformBadge, PlatformLogo } from '../common/PlatformBadge';

export const LiveThreatStream: React.FC = () => {
  const { 
    findings, 
    setSelectedFinding, 
    setActivePage, 
    isDemoMode,
    company,
    brandProfile
  } = useBrandGuard();

  // Active findings sorted by riskScore descending
  const streamFindings = findings
    .filter(f => f.status !== 'Dismissed' && f.status !== 'Resolved')
    .slice(0, 5);

  const getPlatformIcon = (platform: string, type: string) => {
    if (type === 'app') return <Smartphone className="w-3.5 h-3.5 text-[#00E5FF]" />;
    return <Share2 className="w-3.5 h-3.5 text-[#00FFA3]" />;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            HIGH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
            MEDIUM
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-[#020713]/85 backdrop-blur-2xl border border-[#00FFA3]/20 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/40 to-transparent pointer-events-none" />
      {/* Stream Header */}
      <div className="px-5 py-3.5 border-b border-[#00FFA3]/15 flex items-center justify-between bg-[#00050B]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-sm">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
              <span>Live Threat Activity Feed</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              Active incident telemetry for {brandProfile.brandName || company?.name || 'Protected Enterprise'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('findings')}
          className="text-[11px] font-mono font-bold text-[#00FFA3] hover:text-[#00E5FF] transition-colors flex items-center gap-1"
        >
          <span>All Findings ({findings.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Threat List */}
      <div className="divide-y divide-[#00FFA3]/10">
        {streamFindings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            No active threat alerts detected for this brand perimeter.
          </div>
        ) : (
          streamFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => setSelectedFinding(finding)}
              className="p-4 hover:bg-[#00050B]/60 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00050B] border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-[#00FFA3]/50 group-hover:scale-105 transition-all mt-0.5 shadow-sm p-1.5">
                  <PlatformLogo platform={finding.platform} size="md" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white group-hover:text-[#00FFA3] transition-colors">
                      {finding.title}
                    </span>
                    {getSeverityBadge(finding.riskSeverity)}
                    <PlatformBadge platform={finding.platform} size="xs" />
                    <span className="text-[10px] font-mono text-[#00FFA3]">
                      Score: {finding.riskScore}/100
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-1 leading-relaxed">
                    {finding.mainReason}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                    <span className="text-slate-400">
                      Handle: <span className="text-pink-400 font-semibold">{finding.usernameOrPackage}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {finding.detectedTime}
                    </span>
                    <span>•</span>
                    <span className={finding.id.startsWith('finding-') ? 'text-amber-400/80' : 'text-emerald-400/80'}>
                      {finding.id.startsWith('finding-') ? 'Simulated Heuristic' : 'Live Sensor'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#00050B] hover:bg-[#020713] text-[#00FFA3] border border-[#00FFA3]/40 hover:border-[#00FFA3] transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Investigate</span>
                  <ExternalLink className="w-3 h-3 text-[#00FFA3]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
