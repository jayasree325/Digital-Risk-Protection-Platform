import React, { useState } from 'react';
import { Finding, ChangeType, FindingChangeRecord } from '../../types';
import { getFindingChanges } from '../../data/mockData';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  RefreshCw, 
  MinusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileDiff,
  Tag
} from 'lucide-react';

interface ChangeDetectionTimelineProps {
  finding: Finding;
}

export const ChangeDetectionTimeline: React.FC<ChangeDetectionTimelineProps> = ({ finding }) => {
  const changes = getFindingChanges(finding);
  const [activeFilter, setActiveFilter] = useState<'all' | ChangeType>('all');

  const filteredChanges = changes.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.changeType === activeFilter;
  });

  const getChangeBadge = (type: ChangeType) => {
    switch (type) {
      case 'New':
        return {
          icon: <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />,
          classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
        };
      case 'Changed':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-purple-400" />,
          classes: 'bg-purple-500/15 text-purple-300 border-purple-500/35',
        };
      case 'Removed':
        return {
          icon: <MinusCircle className="w-3.5 h-3.5 text-slate-400" />,
          classes: 'bg-slate-500/15 text-slate-300 border-slate-500/35',
        };
      case 'Risk Increased':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-red-400" />,
          classes: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-950/40',
        };
      case 'Risk Decreased':
        return {
          icon: <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />,
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
        };
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/20">
              CHANGE_DETECTION_RADAR
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Demo data
            </span>
          </div>
          <h3 className="text-sm font-bold text-white font-mono mt-1">
            Scan-to-Scan Perimeter Differences
          </h3>
          <p className="text-xs text-slate-400">
            Automated differential tracking of logos, descriptions, suspicious links, publishers, and risk scores.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
          {(['all', 'Risk Increased', 'Changed', 'New', 'Removed', 'Risk Decreased'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setActiveFilter(ft)}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                activeFilter === ft
                  ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 font-bold'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
              }`}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* Changes Timeline List */}
      <div className="space-y-3">
        {filteredChanges.map((change) => {
          const badge = getChangeBadge(change.changeType);
          return (
            <div
              key={change.id}
              className="unlumen-card p-4.5 bg-[#030917]/85 border border-slate-800/90 hover:border-slate-700 rounded-xl space-y-3 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badge.classes}`}>
                    {badge.icon}
                    <span>{change.changeType}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white font-semibold text-[11px] border border-white/[0.08]">
                    {change.attribute}
                  </span>
                </div>

                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>{change.timestamp}</span>
                </span>
              </div>

              {/* Value Diff (if available) */}
              {change.previousValue && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-[#020713] p-2.5 rounded-lg border border-slate-800/80">
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Previous Value:</span>
                    <span className="text-slate-400 line-through truncate block">{change.previousValue}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Current Value:</span>
                    <span className="text-[#00FFA3] font-semibold truncate block">{change.currentValue}</span>
                  </div>
                </div>
              )}

              {/* Explanation Note */}
              <p className="text-xs text-slate-300 leading-relaxed pl-1 border-l-2 border-[#00FFA3]/40">
                {change.explanation}
              </p>
            </div>
          );
        })}

        {filteredChanges.length === 0 && (
          <div className="p-8 text-center bg-[#020713] rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
            No changes match the selected filter category.
          </div>
        )}
      </div>
    </div>
  );
};
