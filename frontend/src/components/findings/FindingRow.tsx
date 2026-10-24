import React, { useMemo } from 'react';
import { Finding } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { PlatformBadge } from '../common/PlatformBadge';
import { SourceStatusBadge } from '../common/SourceStatusBadge';
import { GoogleWebRiskBadge } from '../common/GoogleWebRiskBadge';
import { ChevronRight, FileSearch } from 'lucide-react';

interface FindingRowProps {
  finding: Finding;
  onSelect: (finding: Finding) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
}

export const FindingRow: React.FC<FindingRowProps> = ({ 
  finding, 
  onSelect,
  isSelected = false,
  onToggleSelect
}) => {
  const isCritical = finding.riskSeverity === 'critical';

  // Extract up to 2-3 concise reason chips
  const reasonList: string[] = useMemo(() => {
    if (finding.signals && finding.signals.length > 0) {
      return finding.signals.map(s => s.title);
    }
    if (finding.mainReason) {
      return finding.mainReason.split(',').map(s => s.trim()).filter(Boolean);
    }
    return ['Heuristic Anomaly'];
  }, [finding.signals, finding.mainReason]);

  const displayReasons = reasonList.slice(0, 2);
  const remainingCount = Math.max(0, reasonList.length - 2);

  return (
    <tr 
      onClick={() => onSelect(finding)}
      className={`group border-b border-white/[0.05] transition-all cursor-pointer text-xs font-sans ${
        isSelected ? 'bg-[#00FFA3]/10' : 'hover:bg-white/[0.04]'
      }`}
    >
      {/* Checkbox Selector */}
      <td className="py-3.5 pl-4 pr-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect?.(finding.id, e as unknown as React.MouseEvent)}
          className="w-4 h-4 rounded bg-[#00050B] border border-[#00FFA3]/40 text-[#00FFA3] focus:ring-[#00FFA3] focus:ring-offset-0 cursor-pointer accent-[#00FFA3]"
          aria-label={`Select ${finding.title}`}
        />
      </td>

      {/* Target & Impersonator Identity */}
      <td className="py-3.5 px-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${finding.avatarColor} text-white font-black flex items-center justify-center text-xs shadow-md ring-2 ring-white/10 group-hover:ring-[#00FFA3]/50 flex-shrink-0 transition-all font-mono`}>
            {finding.avatarInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-white group-hover:text-[#00FFA3] transition-colors truncate">
                {finding.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
              <span className="text-[#00E5FF] font-semibold truncate">{finding.usernameOrPackage}</span>
              {finding.candidateWebsite && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500 truncate">{finding.candidateWebsite}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Platform & Source Status */}
      <td className="py-3.5 px-4 text-slate-300">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PlatformBadge platform={finding.platform} type={finding.type} size="sm" />
          <SourceStatusBadge finding={finding} compact={true} />
          <GoogleWebRiskBadge finding={finding} />
        </div>
      </td>

      {/* Separate Visual Value 1: Risk Level */}
      <td className="py-3.5 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RiskBadge severity={finding.riskSeverity} uppercase={true} size="sm" />
            <span className="font-mono font-bold text-[11px] text-white">
              {finding.riskScore}/100
            </span>
          </div>
          <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                isCritical ? 'bg-red-500' : finding.riskSeverity === 'high' ? 'bg-amber-500' : 'bg-[#00FFA3]'
              }`}
              style={{ width: `${finding.riskScore}%` }}
            />
          </div>
        </div>
      </td>

      {/* Separate Visual Value 2: Confidence (Supporting Indicator) */}
      <td className="py-3.5 px-4">
        <div title="Supporting indicator based on heuristic matching — not definitive proof">
          <ConfidenceBadge 
            confidence={finding.confidence} 
            percentage={finding.riskScore} 
            uppercase={true} 
            size="sm" 
          />
        </div>
      </td>

      {/* “Why was this flagged?” Signal Chips */}
      <td className="py-3.5 px-4 max-w-xs">
        <div className="flex flex-wrap gap-1 items-center">
          {displayReasons.map((reason, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#00FFA3]/10 text-emerald-300 border border-[#00FFA3]/20 whitespace-nowrap"
            >
              <span className="w-1 h-1 rounded-full bg-[#00FFA3]" />
              <span>{reason}</span>
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="px-1 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-cyan-300 border border-cyan-500/25">
              +{remainingCount} more
            </span>
          )}
        </div>
      </td>

      {/* Incident Status */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
          finding.status === 'Confirmed fake'
            ? 'bg-red-500/15 text-red-400 border-red-500/30'
            : finding.status === 'Dismissed'
            ? 'bg-slate-800/80 text-slate-400 border-slate-700'
            : finding.status === 'Investigating'
            ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30'
            : 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30'
        }`}>
          {finding.status}
        </span>
      </td>

      {/* Detection Timecode */}
      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
        {finding.detectedTime}
      </td>

      {/* Clear Action Button: Review Evidence */}
      <td className="py-3.5 px-4 text-right">
        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00050B] text-[#00FFA3] hover:text-[#00050B] hover:bg-[#00FFA3] border border-[#00FFA3]/40 font-bold transition-all text-[11px] hover:shadow-[0_0_12px_rgba(0,255,163,0.3)] font-mono btn-arrow-motion focus-visible:ring-2 focus-visible:ring-[#00FFA3] focus:outline-none cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(finding);
          }}
          title="Review complete forensic evidence"
          aria-label={`Review Evidence for ${finding.title}`}
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Review Evidence</span>
          <ChevronRight className="w-3.5 h-3.5 btn-arrow-icon" />
        </button>
      </td>
    </tr>
  );
};
