import React from 'react';
import { Share2, Smartphone } from 'lucide-react';

interface ComparisonBarChartProps {
  socialCount: number;
  appCount: number;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ socialCount, appCount }) => {
  const total = socialCount + appCount || 1;
  const socialPct = Math.round((socialCount / total) * 100);
  const appPct = Math.round((appCount / total) * 100);

  return (
    <div className="p-4.5 rounded-2xl bg-[#0C142E]/70 backdrop-blur-2xl border border-white/[0.08] hover:border-[#00FFA3]/40 transition-all flex flex-col justify-between shadow-glass relative overflow-hidden group">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/30 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-white tracking-tight">Channel Comparison</h4>
        <span className="text-[10px] text-slate-400 font-mono">Social vs Apps</span>
      </div>

      <div className="space-y-3.5 my-2">
        {/* Social Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Social Profiles</span>
            </span>
            <span className="text-slate-200 font-mono font-semibold">
              {socialCount} <span className="text-slate-400 text-[10px]">({socialPct}%)</span>
            </span>
          </div>
          <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0, 255, 163,0.4)]"
              style={{ width: `${socialPct}%` }}
              title={`Social: ${socialCount} (${socialPct}%)`}
            />
          </div>
        </div>

        {/* Mobile App Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Mobile Apps</span>
            </span>
            <span className="text-slate-200 font-mono font-semibold">
              {appCount} <span className="text-slate-400 text-[10px]">({appPct}%)</span>
            </span>
          </div>
          <div className="w-full h-3 bg-[#00050B] rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00FFA3] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
              style={{ width: `${appPct}%` }}
              title={`Apps: ${appCount} (${appPct}%)`}
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 leading-relaxed">
        {socialCount > appCount
          ? `Social impersonations account for ${socialPct}% of candidate detections.`
          : `Mobile application collisions represent ${appPct}% of detected risks.`}
      </p>
    </div>
  );
};
