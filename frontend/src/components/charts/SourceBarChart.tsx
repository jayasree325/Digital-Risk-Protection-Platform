import React, { useState } from 'react';
import { Share2, Smartphone, Link2 } from 'lucide-react';

interface SourceBarChartProps {
  socialCount: number;
  appCount: number;
  linkCount: number;
  onSelectSource?: (source: 'social' | 'app' | 'link') => void;
}

export const SourceBarChart: React.FC<SourceBarChartProps> = ({
  socialCount,
  appCount,
  linkCount,
  onSelectSource,
}) => {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const total = socialCount + appCount + linkCount || 1;
  const socialPct = Math.round((socialCount / total) * 100);
  const appPct = Math.round((appCount / total) * 100);
  const linkPct = Math.round((linkCount / total) * 100);

  const items = [
    {
      id: 'social' as const,
      label: 'Social profiles',
      count: socialCount,
      pct: socialPct,
      icon: Share2,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'app' as const,
      label: 'Mobile apps',
      count: appCount,
      pct: appPct,
      icon: Smartphone,
      color: 'bg-[#00E5FF]',
      textColor: 'text-[#00E5FF]',
      gradient: 'from-[#00FFA3] to-[#00E5FF]',
    },
    {
      id: 'link' as const,
      label: 'Suspicious links',
      count: linkCount,
      pct: linkPct,
      icon: Link2,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="p-4 rounded-xl bg-[#0D1425] border border-[#24324D] hover:border-[#00FFA3]/40 transition-colors flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-white tracking-tight">Findings by source</h4>
        <span className="text-[10px] text-slate-400 font-mono">3 Channel Types</span>
      </div>

      <div className="space-y-3 my-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredSource === item.id;

          return (
            <div
              key={item.id}
              className={`p-2 rounded-lg transition-all ${
                onSelectSource ? 'cursor-pointer hover:bg-slate-800/60' : ''
              } ${isHovered ? 'bg-slate-800/80' : ''}`}
              onMouseEnter={() => setHoveredSource(item.id)}
              onMouseLeave={() => setHoveredSource(null)}
              onClick={() => onSelectSource?.(item.id)}
              title={`Click to view ${item.label}`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Icon className={`w-3.5 h-3.5 ${item.textColor}`} />
                  <span>{item.label}</span>
                </span>
                <span className="text-slate-200 font-mono font-semibold text-xs">
                  {item.count}{' '}
                  <span className="text-slate-400 text-[10px]">({item.pct}%)</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(item.pct, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible Text Summary */}
      <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 leading-relaxed">
        {socialCount} social profiles, {appCount} mobile apps, and {linkCount} suspicious links detected.
      </p>
    </div>
  );
};
