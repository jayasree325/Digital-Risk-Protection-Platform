import React, { useState, useMemo } from 'react';
import { Finding } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { PlatformBadge, PlatformLogo } from '../common/PlatformBadge';
import { SourceStatusBadge } from '../common/SourceStatusBadge';
import { GoogleWebRiskBadge } from '../common/GoogleWebRiskBadge';
import { 
  ChevronRight, 
  Clock, 
  Flame,
  FileSearch,
  RotateCw,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

interface FindingCardProps {
  finding: Finding;
  onSelect: (finding: Finding) => void;
  onQuickReport?: (finding: Finding) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({ 
  finding, 
  onSelect,
  onQuickReport,
  isSelected = false,
  onToggleSelect
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const isCritical = finding.riskSeverity === 'critical';
  const isHigh = finding.riskSeverity === 'high';

  // Prevent accidental double-click during 600ms flip animation
  const handleFlip = (toFlipped: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isFlipping) return;
    setIsFlipping(true);
    setIsFlipped(toFlipped);
    setTimeout(() => setIsFlipping(false), 620);
  };

  // Severity color mappings for the visual gauge
  const meterColor = isCritical 
    ? 'from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
    : isHigh 
    ? 'from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
    : 'from-[#00FFA3] to-[#00E5FF] shadow-[0_0_12px_rgba(0,255,163,0.5)]';

  // Extract up to 3 concise reason chips from signals or mainReason
  const reasonList: string[] = useMemo(() => {
    if (finding.signals && finding.signals.length > 0) {
      return finding.signals.map(s => s.title);
    }
    if (finding.mainReason) {
      return finding.mainReason.split(',').map(s => s.trim()).filter(Boolean);
    }
    return ['Similar name', 'Suspicious domain'];
  }, [finding.signals, finding.mainReason]);

  const displayReasons = reasonList.slice(0, 3);
  const remainingCount = Math.max(0, reasonList.length - 3);

  return (
    <div 
      className={`card-flip-perspective w-full h-full min-h-[380px] rounded-2xl select-none ${
        isSelected ? 'ring-2 ring-[#00FFA3]' : ''
      }`}
    >
      <div className={`card-flip-inner h-full min-h-[380px] ${isFlipped ? 'is-flipped' : ''}`}>
        
        {/* =======================================================
            FRONT FACE: COMPACT SUMMARY (Platform, Candidate, Risk, Confidence, Source, Chips, Flip Control)
            ======================================================= */}
        <div 
          onClick={() => !isFlipped && onSelect(finding)}
          className={`card-flip-face card-flip-front cyber-bento-card p-4 sm:p-5 flex flex-col justify-between group transition-all duration-250 relative overflow-hidden rounded-2xl hover-lift-subtle ${
            isSelected 
              ? 'border-[#00FFA3] shadow-[0_0_30px_rgba(0,255,163,0.3)] bg-[#040C1D]' 
              : isCritical
              ? 'hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
              : 'hover:border-[#00FFA3]/60 hover:shadow-[0_0_20px_rgba(0,255,163,0.18)]'
          }`}
        >
          {/* Top accent cyber line */}
          <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${
            isCritical 
              ? 'from-transparent via-red-500 to-transparent group-hover:via-red-400' 
              : 'from-transparent via-[#00FFA3]/40 to-transparent group-hover:via-[#00FFA3]'
          } transition-all`} />

          <div>
            {/* 1. Platform and Source Status Bar */}
            <div className="flex items-center justify-between gap-2 mb-3 text-[10px] font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                {onToggleSelect && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onToggleSelect(finding.id, e as unknown as React.MouseEvent)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 rounded bg-[#00050B] border border-[#00FFA3]/40 text-[#00FFA3] focus:ring-[#00FFA3] cursor-pointer accent-[#00FFA3]"
                    title="Select finding for bulk triage"
                    aria-label={`Select ${finding.title}`}
                  />
                )}
                <PlatformBadge platform={finding.platform} type={finding.type} size="sm" />
                <SourceStatusBadge finding={finding} compact={true} />
                <GoogleWebRiskBadge finding={finding} />
              </div>

              <span className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{finding.detectedTime}</span>
              </span>
            </div>

            {/* 2. Candidate Name and Identity */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${finding.avatarColor} text-white font-black flex items-center justify-center text-xs shadow-md ring-2 ring-slate-800 group-hover:ring-[#00FFA3]/50 transition-all font-mono`}>
                    {finding.avatarInitials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00050B] border border-slate-700 flex items-center justify-center shadow-sm">
                    <PlatformLogo platform={finding.platform} size="xs" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00FFA3] transition-colors truncate">
                      {finding.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#00FFA3] font-mono truncate">
                    {finding.usernameOrPackage}
                  </p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border flex-shrink-0 ${
                finding.status === 'Confirmed fake'
                  ? 'bg-red-500/15 text-red-300 border-red-500/40'
                  : finding.status === 'Investigating'
                  ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40'
                  : finding.status === 'Resolved'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {finding.status.toUpperCase()}
              </span>
            </div>

            {/* 3. Separate Risk and Confidence Display */}
            <div className="p-2.5 rounded-xl bg-[#00050B]/90 border border-white/[0.07] mb-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <RiskBadge severity={finding.riskSeverity} uppercase={true} size="sm" />
                </div>

                <div title="Supporting indicator based on heuristic matching — not definitive proof">
                  <ConfidenceBadge 
                    confidence={finding.confidence} 
                    percentage={finding.riskScore} 
                    uppercase={true} 
                    size="sm" 
                  />
                </div>
              </div>

              {/* Visual Cyber Risk Meter Gauge */}
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                <div 
                  className={`h-full bg-gradient-to-r ${meterColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(Math.max(finding.riskScore, 10), 100)}%` }}
                />
              </div>
            </div>

            {/* 4. “Why was this flagged?” Signal Chips (Up to 3 reasons + '+N more') */}
            <div className="space-y-1.5 mb-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                <span>Why Flagged:</span>
                {remainingCount > 0 && (
                  <span className="text-[10px] text-cyan-400 font-mono">
                    +{remainingCount} more in evidence
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {displayReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-[#00FFA3]/10 text-emerald-300 border border-[#00FFA3]/25"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#00FFA3]" />
                    <span>{reason}</span>
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-800 text-cyan-300 border border-cyan-500/30"
                  >
                    +{remainingCount} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 5. Clear Action Buttons + 3D Flip Trigger */}
          <div className="pt-3 border-t border-[#00FFA3]/15 flex items-center justify-between gap-2 text-xs font-mono">
            {onQuickReport && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickReport(finding);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold transition-all flex-shrink-0 focus-visible:ring-2 focus-visible:ring-red-400 focus:outline-none cursor-pointer"
                title="Stage immediate takedown notice"
              >
                <Flame className="w-3 h-3 text-red-400" />
                <span>Takedown</span>
              </button>
            )}

            {/* Accessible 3D Flip Button */}
            <button
              type="button"
              onClick={(e) => handleFlip(true, e)}
              aria-label={`Show finding explanation for ${finding.title}`}
              title="Flip card to view detailed signals and forensic reasons"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 hover:text-white border border-cyan-500/30 text-[11px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#00FFA3] focus:outline-none cursor-pointer"
            >
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>Flip card</span>
            </button>

            {/* Primary Action Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(finding);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 text-[#00FFA3] hover:text-white border border-[#00FFA3]/30 hover:border-[#00FFA3]/60 font-bold transition-all text-[11px] btn-arrow-motion focus-visible:ring-2 focus-visible:ring-[#00FFA3] focus:outline-none cursor-pointer shadow-sm"
              aria-label={`Review Evidence for ${finding.title}`}
            >
              <FileSearch className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>Review Evidence</span>
              <ChevronRight className="w-3.5 h-3.5 btn-arrow-icon" />
            </button>
          </div>
        </div>

        {/* =======================================================
            BACK FACE: AVAILABLE EXPLANATION (Why Flagged, Signals, Evidence Summary, Review Button)
            ======================================================= */}
        <div 
          className="card-flip-face card-flip-back cyber-bento-card p-4 sm:p-5 flex flex-col justify-between bg-[#030919] border border-cyan-500/40 shadow-[0_0_30px_rgba(0,229,255,0.15)] rounded-2xl overflow-y-auto"
        >
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

          <div className="space-y-3">
            {/* Header: Platform, Title, Flip Back Button */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-cyan-500/20 text-[10px] font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <PlatformBadge platform={finding.platform} type={finding.type} size="sm" />
                <span className="text-white font-bold truncate text-xs">
                  {finding.title}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleFlip(false, e)}
                aria-label={`Show finding summary for ${finding.title}`}
                title="Return to finding overview"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-mono font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#00FFA3] focus:outline-none cursor-pointer flex-shrink-0"
              >
                <RotateCcw className="w-3 h-3 text-[#00FFA3]" />
                <span>Show summary</span>
              </button>
            </div>

            {/* “Why was this flagged?” Section */}
            <div className="p-2.5 rounded-xl bg-[#00050B]/90 border border-[#00FFA3]/20 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00FFA3] font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-[#00FFA3]" />
                <span>Why was this flagged?</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {finding.mainReason}
              </p>
            </div>

            {/* Detection Reasons / Signals Breakdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                Detection Reasons ({finding.signals?.length || displayReasons.length}):
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {finding.signals && finding.signals.length > 0 ? (
                  finding.signals.slice(0, 3).map((sig) => (
                    <div 
                      key={sig.id}
                      className="p-2 rounded-lg bg-[#00050B]/70 border border-slate-800/80 flex items-start gap-2 text-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] mt-1 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-white block text-[11px] leading-tight">
                          {sig.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                          {sig.explanation}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  displayReasons.map((reason, idx) => (
                    <div 
                      key={idx}
                      className="p-1.5 rounded-lg bg-[#00050B]/70 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
                      <span className="text-[11px]">{reason}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Evidence Summary */}
            {finding.detailedReason && (
              <div className="p-2 rounded-lg bg-navy-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-tight">
                <span className="text-[10px] text-cyan-400 font-mono block uppercase font-bold mb-0.5">
                  Evidence Summary:
                </span>
                <p className="line-clamp-2 text-slate-300">{finding.detailedReason}</p>
              </div>
            )}

            {/* Google Discovery Technical Credibility Notice */}
            {(finding.evidence?.source === 'Google Search' || finding.signals?.some(s => s.signalType === 'google_discovery')) && (
              <div className="p-2 rounded-lg bg-[#00050B]/90 border border-[#00FFA3]/30 text-[10px] text-slate-300 font-mono leading-relaxed">
                <span className="text-[#00FFA3] font-bold block uppercase mb-0.5">
                  Google Discovery Intelligence:
                </span>
                <p>
                  Google Discovery identifies publicly indexed candidate pages. It does not guarantee that every profile is found or prove that a result is fake.
                </p>
              </div>
            )}
          </div>

          {/* Back Action Bar */}
          <div className="pt-2.5 border-t border-cyan-500/20 flex items-center justify-between gap-2 text-xs font-mono mt-2">
            <button
              type="button"
              onClick={(e) => handleFlip(false, e)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#00FFA3] cursor-pointer"
            >
              <span>Back</span>
            </button>

            <button 
              type="button"
              onClick={() => onSelect(finding)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] text-black font-bold transition-opacity hover:opacity-95 text-[11px] shadow-[0_0_15px_rgba(0,255,163,0.3)] focus-visible:ring-2 focus-visible:ring-[#00FFA3] cursor-pointer"
              aria-label={`Review Evidence for ${finding.title}`}
            >
              <FileSearch className="w-3.5 h-3.5 text-black" />
              <span>Review Evidence</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
