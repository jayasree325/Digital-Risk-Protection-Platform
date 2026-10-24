import React from 'react';
import { ConfidenceLevel } from '../../types';
import { CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  percentage?: number;
  size?: 'sm' | 'md';
  uppercase?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ 
  confidence, 
  percentage,
  size = 'md',
  uppercase = false
}) => {
  const config = {
    High: {
      label: percentage ? `${percentage}% Confidence` : 'High Confidence',
      style: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      icon: CheckCircle2,
    },
    Medium: {
      label: percentage ? `${percentage}% Confidence` : 'Medium Confidence',
      style: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      icon: HelpCircle,
    },
    Low: {
      label: percentage ? `${percentage}% Confidence` : 'Low Confidence',
      style: 'bg-slate-700/30 text-slate-400 border-slate-700',
      icon: HelpCircle,
    },
  }[confidence] || {
    label: percentage ? `${percentage}% Confidence` : 'Medium Confidence',
    style: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    icon: HelpCircle,
  };

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1 font-mono' : 'text-xs px-2.5 py-1 gap-1.5 font-mono';
  const IconComponent = config.icon;
  const displayLabel = uppercase ? config.label.toUpperCase() : config.label;

  return (
    <span 
      className={`inline-flex items-center rounded-full border ${config.style} ${sizeClass} font-semibold select-none`}
      title="Supporting indicator based on heuristic matches — not proof of malicious intent"
      role="status"
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3 text-cyan-400' : 'w-3.5 h-3.5 text-cyan-400'} />
      <span>{displayLabel}</span>
    </span>
  );
};
