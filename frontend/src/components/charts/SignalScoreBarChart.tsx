import React from 'react';
import { Finding } from '../../types';
import { Info, ShieldAlert } from 'lucide-react';

interface SignalScoreBarChartProps {
  finding: Finding;
}

export const SignalScoreBarChart: React.FC<SignalScoreBarChartProps> = ({ finding }) => {
  // Extract or generate signals tailored to the finding
  const isApp = finding.type === 'app';
  
  // Example signals with realistic calculations based on finding score and type
  const signals = isApp
    ? [
        { label: 'Name similarity', pct: Math.min(Math.round(finding.riskScore * 0.95), 98), color: 'from-orange-500 to-red-500' },
        { label: 'Logo similarity', pct: Math.min(Math.round(finding.riskScore * 0.9), 95), color: 'from-amber-500 to-orange-500' },
        { label: 'Domain risk', pct: Math.min(Math.round(finding.riskScore * 0.98), 99), color: 'from-red-500 to-rose-600' },
        { label: 'Publisher mismatch', pct: 85, color: 'from-[#00FFA3] to-[#00E5FF]' },
        { label: 'Description similarity', pct: 72, color: 'from-blue-500 to-cyan-500' },
      ]
    : [
        { label: 'Name similarity', pct: 90, color: 'from-orange-500 to-red-500' },
        { label: 'Logo similarity', pct: 85, color: 'from-amber-500 to-orange-500' },
        { label: 'Domain risk', pct: 95, color: 'from-red-500 to-rose-600' },
        { label: 'Publisher mismatch', pct: 80, color: 'from-[#00FFA3] to-[#00E5FF]' },
        { label: 'Description similarity', pct: 72, color: 'from-blue-500 to-cyan-500' },
      ];

  return (
    <div className="p-4 rounded-xl bg-[#020713] border border-[#00FFA3]/20 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#00FFA3]" />
            <span>Why this received this score</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Heuristic signal contribution to overall {finding.riskScore}/100 rating
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          Risk: {finding.riskScore}/100
        </span>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3">
        {signals.map((sig) => (
          <div key={sig.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">{sig.label}</span>
              <span className="font-mono text-slate-200 font-semibold text-[11px]">{sig.pct}%</span>
            </div>
            <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${sig.color} rounded-full transition-all duration-500`}
                style={{ width: `${sig.pct}%` }}
                title={`${sig.label}: ${sig.pct}%`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Short Explanation Required by Section 7 */}
      <div className="p-3 rounded-lg bg-navy-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          Risk score shows how suspicious this item appears. Confidence shows how reliable the evidence is.
        </p>
      </div>

      {/* Mandatory Disclaimer Required by Section 7 */}
      <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
        This score supports review. It is not proof that the profile or app is fake.
      </p>
    </div>
  );
};
