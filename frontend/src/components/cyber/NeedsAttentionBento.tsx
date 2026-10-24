import React from 'react';
import { ShieldAlert, ChevronRight, AlertTriangle, FileSearch } from 'lucide-react';
import { Finding } from '../../types';

interface NeedsAttentionBentoProps {
  onAction?: (actionId: string) => void;
  className?: string;
  findings?: Finding[];
  onSelectFinding?: (finding: Finding) => void;
}

export const NeedsAttentionBento: React.FC<NeedsAttentionBentoProps> = ({
  onAction,
  className = '',
  findings,
  onSelectFinding,
}) => {
  // Grab top actionable findings if provided
  const actionableFindings = findings
    ? findings.filter(f => f.status !== 'Resolved' && f.status !== 'Dismissed').slice(0, 2)
    : [];

  const count = actionableFindings.length > 0 ? actionableFindings.length : 2;

  return (
    <div className={`cyber-bento-card p-4 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-slate-200 tracking-wide font-sans">
            Needs Attention
          </h3>
          <span className="w-5 h-5 rounded-full bg-cyan-500/15 border border-[#00FFA3]/30 text-[#00FFA3] text-[10px] font-mono font-bold flex items-center justify-center">
            {count}
          </span>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5 my-auto">
        {actionableFindings.length > 0 ? (
          actionableFindings.map((finding) => (
            <div 
              key={finding.id}
              className="p-2.5 rounded-xl bg-[#060D1A]/90 border border-cyan-950/80 hover:border-[#00FFA3]/30 flex items-center justify-between gap-3 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  finding.riskSeverity === 'critical'
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-[#00FFA3] transition-colors">
                    {finding.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {finding.platform} &bull; {finding.usernameOrPackage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSelectFinding) {
                    onSelectFinding(finding);
                  } else {
                    onAction?.('review-finding');
                  }
                }}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 text-[#00FFA3] border border-[#00FFA3]/30 flex items-center gap-1 transition-all flex-shrink-0 font-mono btn-arrow-motion focus-visible:ring-2 focus-visible:ring-[#00FFA3]"
                title="Review Evidence"
              >
                <span>Review Evidence</span>
                <ChevronRight className="w-3 h-3 btn-arrow-icon" />
              </button>
            </div>
          ))
        ) : (
          <>
            {/* Fallback Item 1: Suspicious Domain Impersonator */}
            <div className="p-2.5 rounded-xl bg-[#060D1A]/90 border border-cyan-950/80 hover:border-amber-500/30 flex items-center justify-between gap-3 transition-colors group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                    Suspicious Domain Impersonator
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    Homoglyph character in checkout URL
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAction?.('login-detected')}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-all flex-shrink-0 font-mono btn-arrow-motion focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Review Evidence</span>
                <ChevronRight className="w-3 h-3 btn-arrow-icon" />
              </button>
            </div>

            {/* Fallback Item 2: Unverified Social Account */}
            <div className="p-2.5 rounded-xl bg-[#060D1A]/90 border border-cyan-950/80 hover:border-[#00FFA3]/30 flex items-center justify-between gap-3 transition-colors group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-[#00FFA3] transition-colors">
                    Unverified Support Account
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    Investigate rogue customer service handle
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAction?.('enable-2fa')}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 text-[#00FFA3] border border-[#00FFA3]/30 flex items-center gap-1 transition-all flex-shrink-0 shadow-[0_0_10px_rgba(0, 255, 163,0.15)] font-mono btn-arrow-motion focus-visible:ring-2 focus-visible:ring-[#00FFA3]"
              >
                <span>Start Investigation</span>
                <ChevronRight className="w-3 h-3 btn-arrow-icon" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
