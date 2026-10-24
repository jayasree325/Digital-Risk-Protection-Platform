import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  count: number;
  pct: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  total: number;
  segments: DonutSegment[];
  textSummary?: string;
  onSelectSegment?: (segment: DonutSegment) => void;
}

export const DonutChart: React.FC<DonutChartProps> = ({ title, total, segments, textSummary, onSelectSegment }) => {
  const [hoveredSegment, setHoveredSegment] = useState<DonutSegment | null>(null);

  const radius = 64;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="p-4.5 rounded-2xl bg-[#0C142E]/70 backdrop-blur-2xl border border-white/[0.08] hover:border-[#00FFA3]/40 transition-all flex flex-col justify-between shadow-glass relative overflow-hidden group">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/30 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-white tracking-tight">{title}</h4>
        <span className="text-[10px] text-slate-400 font-mono">{total} Active</span>
      </div>

      <div className="flex items-center justify-around gap-4 my-2">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160" aria-label={title}>
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#070A14"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg) => {
              const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += (seg.pct / 100) * circumference;

              return (
                <circle
                  key={seg.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => onSelectSegment?.(seg)}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredSegment ? (
              <>
                <span className="text-lg font-bold text-white leading-tight font-mono">
                  {hoveredSegment.count}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {hoveredSegment.pct}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-white leading-tight font-mono">
                  {total}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Findings
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 text-xs">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={`flex items-center justify-between gap-3 p-1 rounded-md transition-colors cursor-pointer hover:bg-slate-800/80 ${
                hoveredSegment?.label === seg.label ? 'bg-slate-800/60' : ''
              }`}
              onMouseEnter={() => setHoveredSegment(seg)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => onSelectSegment?.(seg)}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-300 text-[11px]">{seg.label}</span>
              </div>
              <span className="font-mono text-slate-400 font-semibold text-[11px]">
                {seg.count} ({seg.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Text Summary */}
      <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 leading-relaxed">
        {textSummary || `Showing distribution of ${total} total findings by severity tier.`}
      </p>
    </div>
  );
};
