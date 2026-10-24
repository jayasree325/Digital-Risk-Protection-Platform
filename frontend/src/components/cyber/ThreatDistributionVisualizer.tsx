import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ThreatDistributionProps {
  className?: string;
}

export const ThreatDistributionVisualizer: React.FC<ThreatDistributionProps> = ({
  className = '',
}) => {
  const [sliderPos, setSliderPos] = useState<number>(55);

  const categories = [
    { name: 'Ransomware', count: '5,170', pct: '28%', color: '#00FFA3' },
    { name: 'Malware', count: '1,748', pct: '15%', color: '#00E5FF' },
    { name: 'Phishing', count: '4,435', pct: '8%', color: '#00E88F' },
    { name: 'Others', count: '1,478', pct: '5%', color: '#64748B' },
  ];

  return (
    <div className={`cyber-bento-card p-4 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-200 tracking-wide font-sans">
          Threat Distribution
        </h3>
        <button className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Wavy Frequency Spline Curves Visualizer */}
      <div className="relative w-full h-16 my-auto flex items-center justify-center">
        <svg
          viewBox="0 0 280 60"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="distGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00FFA3" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="distGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E88F" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00E88F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background second wave */}
          <path
            d="M 10,40 Q 70,10 140,45 T 270,30"
            fill="none"
            stroke="rgba(0, 102, 255, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Primary wave filled */}
          <path
            d="M 10,45 Q 60,15 130,35 T 270,20 L 270,60 L 10,60 Z"
            fill="url(#distGrad1)"
          />

          {/* Primary wave stroke */}
          <path
            d="M 10,45 Q 60,15 130,35 T 270,20"
            fill="none"
            stroke="#00FFA3"
            strokeWidth="2"
          />

          {/* Interactive slider point handle on the wave */}
          <g transform={`translate(${10 + (260 * sliderPos) / 100}, 28)`}>
            <circle r="7" fill="#00FFA3" fillOpacity="0.25" className="animate-ping" />
            <circle r="4.5" fill="#00050B" stroke="#00FFA3" strokeWidth="2" />
            <circle r="2" fill="#00FFA3" />
          </g>
        </svg>

        {/* Subtle slider bar below wave */}
        <div className="absolute -bottom-1 inset-x-2 h-1 bg-cyan-950/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00E88F] to-[#00FFA3] rounded-full"
            style={{ width: `${sliderPos}%` }}
          />
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="space-y-1.5 pt-2 border-t border-cyan-950/60 font-mono text-[11px]">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
              />
              <span className="text-slate-300 font-sans text-xs">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{cat.count}</span>
              <span className="text-slate-500 text-[10px] w-7 text-right">{cat.pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
