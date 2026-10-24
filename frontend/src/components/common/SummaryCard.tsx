import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  trendText: string;
  trendType?: 'neutral' | 'danger' | 'info' | 'warning';
  accentColor?: 'cyan' | 'red' | 'blue' | 'purple' | 'green';
  onClick?: () => void;
  isActive?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  count,
  icon: Icon,
  trendText,
  trendType = 'neutral',
  accentColor = 'cyan',
  onClick,
  isActive = false,
}) => {
  const accentStyles = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.25)]',
    },
    red: {
      border: 'hover:border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.25)]',
    },
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.25)]',
    },
    purple: {
      border: 'hover:border-[#00FFA3]/40',
      iconBg: 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(0, 255, 163,0.3)]',
    },
    green: {
      border: 'hover:border-[#00FFA3]/40',
      iconBg: 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(0, 255, 163,0.3)]',
    },
  }[accentColor];

  const trendStyles = {
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20 font-medium',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/20',
  }[trendType];

  return (
    <button
      onClick={onClick}
      type="button"
      className={`group w-full text-left p-5 rounded-xl bg-[#020713]/90 border transition-all duration-250 relative overflow-hidden hover-lift-subtle focus-visible:ring-2 focus-visible:ring-[#00FFA3] focus:outline-none ${
        isActive 
          ? 'border-[#00FFA3]/60 shadow-[0_0_20px_rgba(0, 255, 163,0.2)] ring-1 ring-[#00FFA3]/40' 
          : `border-slate-800/80 ${accentStyles.border} ${accentStyles.glow}`
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <div className="text-3xl font-extrabold tracking-tight text-white mb-3">
            {count}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${accentStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-md border ${trendStyles}`}>
          {trendText}
        </span>
        <span className="text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors flex items-center gap-1 font-mono">
          <span>View list</span>
          <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
        </span>
      </div>
    </button>
  );
};
