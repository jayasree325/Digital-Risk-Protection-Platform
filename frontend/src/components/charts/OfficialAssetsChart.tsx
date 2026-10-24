import React from 'react';
import { ShieldCheck, Clock, AlertCircle } from 'lucide-react';

interface OfficialAssetsChartProps {
  verifiedCount?: number;
  pendingCount?: number;
  needsUpdateCount?: number;
}

export const OfficialAssetsChart: React.FC<OfficialAssetsChartProps> = ({
  verifiedCount = 5,
  pendingCount = 1,
  needsUpdateCount = 0,
}) => {
  const total = verifiedCount + pendingCount + needsUpdateCount || 1;
  const verifiedPct = Math.round((verifiedCount / total) * 100);
  const pendingPct = Math.round((pendingCount / total) * 100);
  const needsUpdatePct = Math.round((needsUpdateCount / total) * 100);

  const items = [
    {
      label: 'Verified',
      count: verifiedCount,
      pct: verifiedPct,
      color: '#00FFA3', // electric cyan HUD
      badgeColor: 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30',
      icon: ShieldCheck,
    },
    {
      label: 'Pending verification',
      count: pendingCount,
      pct: pendingPct,
      color: '#00E5FF', // sky azure
      badgeColor: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30',
      icon: Clock,
    },
    {
      label: 'Needs update',
      count: needsUpdateCount,
      pct: needsUpdatePct,
      color: '#64748b', // slate
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-[#040C1D] border border-[#00FFA3]/20 hover:border-[#00FFA3]/50 transition-colors flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-white tracking-tight">Official assets</h4>
        <span className="text-[10px] text-[#00FFA3] font-mono font-semibold">
          {verifiedCount} of {total} Verified
        </span>
      </div>

      {/* Segmented Horizontal Stacked Bar */}
      <div className="my-2">
        <div className="w-full h-3 bg-[#00050B] rounded-full overflow-hidden flex p-0.5 border border-[#00FFA3]/20 mb-3">
          <div
            className="h-full bg-[#00FFA3] rounded-l-full transition-all duration-500 shadow-[0_0_8px_rgba(0, 255, 163,0.4)]"
            style={{ width: `${verifiedPct}%` }}
            title={`Verified: ${verifiedCount} (${verifiedPct}%)`}
          />
          {pendingCount > 0 && (
            <div
              className="h-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${pendingPct}%` }}
              title={`Pending verification: ${pendingCount} (${pendingPct}%)`}
            />
          )}
          {needsUpdateCount > 0 && (
            <div
              className="h-full bg-slate-500 rounded-r-full transition-all duration-500"
              style={{ width: `${needsUpdatePct}%` }}
              title={`Needs update: ${needsUpdateCount} (${needsUpdatePct}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="space-y-1.5 text-xs">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.label}
                className="flex items-center justify-between p-1 rounded-md text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: it.color }}
                  />
                  <span className="text-slate-300">{it.label}</span>
                </div>
                <span className="font-mono text-slate-400 font-semibold">
                  {it.count} ({it.pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessible Text Summary */}
      <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 leading-relaxed">
        Verified official assets are protected references and excluded from risk scoring.
      </p>
    </div>
  );
};
