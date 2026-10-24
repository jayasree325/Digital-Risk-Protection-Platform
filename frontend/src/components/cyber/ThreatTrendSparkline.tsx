import React from 'react';

interface ThreatTrendSparklineProps {
  onViewAll?: () => void;
  className?: string;
}

export const ThreatTrendSparkline: React.FC<ThreatTrendSparklineProps> = ({
  onViewAll,
  className = '',
}) => {
  const dates = ['Aug 20', 'Aug 21', 'Aug 22', 'Aug 23'];

  // 4 data points for dates:
  // Aug 20 (y=28), Aug 21 (y=45), Aug 22 (y=32), Aug 23 (y=18)
  const points = [
    { x: 30, y: 38 },
    { x: 75, y: 52 },
    { x: 120, y: 30 },
    { x: 165, y: 48 },
    { x: 210, y: 22 },
    { x: 255, y: 42 },
    { x: 300, y: 18 },
  ];

  // SVG curved path string
  const pathD = "M 20,40 Q 50,55 90,32 T 160,45 T 230,22 T 310,38";

  return (
    <div className={`cyber-bento-card p-4 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-200 tracking-wide font-sans">
          Threat Trend
        </h3>
        <button
          onClick={onViewAll}
          className="text-[11px] text-[#00FFA3] hover:text-[#00E5FF] transition-colors flex items-center gap-1 font-sans group"
        >
          <span>View All</span>
          <span className="group-hover:translate-x-0.5 transition-transform">&gt;</span>
        </button>
      </div>

      {/* Dotted Sine Wave Sparkline Graphic */}
      <div className="relative w-full h-20 my-auto flex items-center justify-center">
        <svg
          viewBox="0 0 320 70"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trendGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00FFA3" stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shaded Area */}
          <path
            d={`${pathD} L 310,65 L 20,65 Z`}
            fill="url(#trendGlow)"
          />

          {/* Dotted curve background guide */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(0, 255, 163, 0.25)"
            strokeWidth="3"
            strokeDasharray="2 4"
          />

          {/* Neon main wave line */}
          <path
            d={pathD}
            fill="none"
            stroke="#00FFA3"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            filter="url(#neonBlur)"
          />

          {/* Active Data Nodes */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#00050B"
                stroke="#00FFA3"
                strokeWidth="1.5"
                className="hover:scale-150 transition-transform cursor-pointer"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="1.2"
                fill="#00FFA3"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Date Markers on X-Axis */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-cyan-950/60">
        {dates.map((date, idx) => (
          <span key={idx} className="hover:text-cyan-400 transition-colors">
            {date}
          </span>
        ))}
      </div>
    </div>
  );
};
