import React, { useState } from 'react';

interface TrendItem {
  day: string;
  social: number;
  apps: number;
  total: number;
}

interface TrendLineChartProps {
  data?: TrendItem[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const defaultData: TrendItem[] = [
    { day: 'Mon', social: 3, apps: 1, total: 4 },
    { day: 'Tue', social: 5, apps: 2, total: 7 },
    { day: 'Wed', social: 4, apps: 2, total: 6 },
    { day: 'Thu', social: 7, apps: 3, total: 10 },
    { day: 'Fri', social: 6, apps: 4, total: 10 },
    { day: 'Sat', social: 9, apps: 3, total: 12 },
    { day: 'Sun', social: 8, apps: 5, total: 13 },
  ];

  const points = data || defaultData;
  const maxVal = Math.max(...points.map((p) => p.total), 15);

  const svgWidth = 300;
  const svgHeight = 110;
  const paddingX = 20;
  const paddingY = 15;

  const getX = (index: number) => {
    return paddingX + (index / (points.length - 1)) * (svgWidth - 2 * paddingX);
  };

  const getY = (val: number) => {
    return svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);
  };

  const pathD = points.reduce((acc, p, i) => {
    const x = getX(i);
    const y = getY(p.total);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="p-4.5 rounded-2xl bg-[#0C142E]/70 backdrop-blur-2xl border border-white/[0.08] hover:border-[#00FFA3]/40 transition-all flex flex-col justify-between shadow-glass relative overflow-hidden group">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/30 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-white tracking-tight">Threat Ingestion Trends</h4>
        <span className="text-[10px] text-[#00E5FF] font-medium font-mono">Last 7 Days</span>
      </div>

      <div className="relative my-1">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24 overflow-visible">
          {/* Subtle horizontal grid lines */}
          <line x1={paddingX} y1={getY(maxVal / 2)} x2={svgWidth - paddingX} y2={getY(maxVal / 2)} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={getY(0)} x2={svgWidth - paddingX} y2={getY(0)} stroke="#1e293b" />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => {
            const x = getX(i);
            const y = getY(p.total);
            const isHovered = hoveredIndex === i;

            return (
              <g key={p.day}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#00e5ff' : '#0891b2'}
                  stroke="#080d1a"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                <text
                  x={x}
                  y={svgHeight}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {p.day}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIndex !== null && (
          <div className="absolute top-0 right-2 bg-navy-900 border border-slate-700 px-2 py-1 rounded text-[10px] shadow-lg text-slate-200">
            <span className="font-bold text-cyan-400">{points[hoveredIndex].day}: </span>
            <span>{points[hoveredIndex].total} threats</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 leading-relaxed">
        Discovery volume climbed from 4 candidates early in the week to 13 on Sunday.
      </p>
    </div>
  );
};
