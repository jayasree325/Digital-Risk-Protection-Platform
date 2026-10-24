import React, { useState } from 'react';
import { SourceStatusItem, Finding } from '../../types';
import { Info, Radio, Database, AlertCircle, EyeOff } from 'lucide-react';

export type SourceStatusType = 'LIVE DATA' | 'DEMO DATA' | 'RATE LIMITED' | 'UNAVAILABLE';

interface SourceStatusBadgeProps {
  source?: SourceStatusItem;
  status?: SourceStatusType | string;
  finding?: Partial<Finding>;
  compact?: boolean;
  className?: string;
  sourceLabel?: string;
}

export function resolveSourceStatus(
  explicitStatus?: string,
  finding?: Partial<Finding>,
  source?: SourceStatusItem
): {
  type: SourceStatusType;
  label: string;
  tooltip: string;
  rawSource?: string;
} {
  // 1. Explicit status passed
  if (explicitStatus) {
    const s = explicitStatus.toUpperCase();
    if (s.includes('LIVE')) {
      return {
        type: 'LIVE DATA',
        label: 'LIVE DATA',
        tooltip: 'Authenticated live telemetry actively ingested from platform API streams and web crawlers.',
      };
    }
    if (s.includes('RATE')) {
      return {
        type: 'RATE LIMITED',
        label: 'RATE LIMITED',
        tooltip: 'API ingestion rate limit reached. Results cached from recent collection window.',
      };
    }
    if (s.includes('UNAVAIL') || s.includes('OFFLINE')) {
      return {
        type: 'UNAVAILABLE',
        label: 'UNAVAILABLE',
        tooltip: 'Source telemetry ingestion is currently unavailable or unreachable.',
      };
    }
    return {
      type: 'DEMO DATA',
      label: 'DEMO DATA',
      tooltip: 'Simulated intelligence telemetry generated for demonstration and offline evaluation.',
    };
  }

  // 2. Source item passed
  if (source) {
    if (source.status === 'live') {
      return {
        type: 'LIVE DATA',
        label: 'LIVE DATA',
        tooltip: source.tooltipText || 'Live data ingestion active.',
        rawSource: source.name,
      };
    }
    if (source.status === 'rate_limited') {
      return {
        type: 'RATE LIMITED',
        label: 'RATE LIMITED',
        tooltip: source.tooltipText || 'Rate limited ingestion.',
        rawSource: source.name,
      };
    }
    if (source.status === 'unavailable') {
      return {
        type: 'UNAVAILABLE',
        label: 'UNAVAILABLE',
        tooltip: source.tooltipText || 'Source telemetry unavailable.',
        rawSource: source.name,
      };
    }
    return {
      type: 'DEMO DATA',
      label: 'DEMO DATA',
      tooltip: source.tooltipText || 'Demo simulated data.',
      rawSource: source.name,
    };
  }

  // 3. Finding passed
  if (finding) {
    const rawSource = finding.evidence?.source;
    if (finding.isDemo) {
      return {
        type: 'DEMO DATA',
        label: 'DEMO DATA',
        tooltip: 'Simulated security finding. Demonstrates heuristic detection and triage workflows.',
        rawSource,
      };
    }

    if (rawSource) {
      const lower = rawSource.toLowerCase();
      if (lower.includes('demo') || lower.includes('simul')) {
        return {
          type: 'DEMO DATA',
          label: 'DEMO DATA',
          tooltip: `Source: ${rawSource} (Simulated baseline dataset).`,
          rawSource,
        };
      }
      if (lower.includes('rate') || lower.includes('limit')) {
        return {
          type: 'RATE LIMITED',
          label: 'RATE LIMITED',
          tooltip: `Source: ${rawSource} (Rate limited by upstream provider).`,
          rawSource,
        };
      }
      if (lower.includes('unavail') || lower.includes('offline') || lower.includes('down')) {
        return {
          type: 'UNAVAILABLE',
          label: 'UNAVAILABLE',
          tooltip: `Source: ${rawSource} (Currently unreachable).`,
          rawSource,
        };
      }
      if (lower.includes('google') || lower.includes('indexed')) {
        return {
          type: 'LIVE DATA',
          label: 'LIVE INDEXED DATA',
          tooltip: 'Publicly indexed candidate discovered via Google Search discovery engine.',
          rawSource: 'Google Search',
        };
      }
      if (lower.includes('live') || lower.includes('stream') || lower.includes('crawler') || lower.includes('graph') || lower.includes('api')) {
        return {
          type: 'LIVE DATA',
          label: 'LIVE DATA',
          tooltip: `Source: ${rawSource} (Live verified stream).`,
          rawSource,
        };
      }
    }

    // Default to DEMO DATA to be safe and never invent live data
    return {
      type: 'DEMO DATA',
      label: 'DEMO DATA',
      tooltip: 'Simulated intelligence telemetry generated for demonstration and offline evaluation.',
      rawSource,
    };
  }

  return {
    type: 'DEMO DATA',
    label: 'DEMO DATA',
    tooltip: 'Demonstration and evaluation dataset.',
  };
}

export const SourceStatusBadge: React.FC<SourceStatusBadgeProps> = ({ 
  source, 
  status,
  finding,
  compact = true,
  className = '',
  sourceLabel
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const resolved = resolveSourceStatus(status, finding, source);

  // Existing emerald cybersecurity theme mappings:
  // LIVE DATA: emerald/green
  // DEMO DATA: blue or neutral
  // RATE LIMITED: amber
  // UNAVAILABLE: muted grey
  const styles: Record<SourceStatusType, { badge: string; dot: string; icon: React.ReactNode }> = {
    'LIVE DATA': {
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
      dot: 'bg-emerald-400 animate-pulse',
      icon: <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
    },
    'DEMO DATA': {
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
      dot: 'bg-cyan-400',
      icon: <Database className="w-2.5 h-2.5 text-cyan-400" />
    },
    'RATE LIMITED': {
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
      icon: <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
    },
    'UNAVAILABLE': {
      badge: 'bg-slate-800/80 text-slate-400 border-slate-700',
      dot: 'bg-slate-500',
      icon: <EyeOff className="w-2.5 h-2.5 text-slate-500" />
    },
  };

  const current = styles[resolved.type];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wider cursor-help transition-all ${current.badge}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        role="status"
        aria-label={`Source status: ${resolved.label}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot} flex-shrink-0`} />
        <span>
          {sourceLabel 
            ? `${sourceLabel}: ${resolved.label}` 
            : resolved.rawSource === 'Google Search' 
            ? `GOOGLE SEARCH • ${resolved.label}` 
            : resolved.label}
        </span>
        {!compact && <Info className="w-3 h-3 opacity-60 hover:opacity-100 transition-opacity" />}
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2.5 bg-[#00050B] border border-[#00FFA3]/40 rounded-xl shadow-2xl text-[11px] text-slate-200 pointer-events-none animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="font-semibold text-white mb-0.5 flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#00FFA3] flex items-center gap-1">
              {current.icon}
              {resolved.label}
            </span>
            {resolved.rawSource && (
              <span className="text-slate-400 text-[9px] truncate max-w-[100px]">{resolved.rawSource}</span>
            )}
          </div>
          <p className="text-slate-300 leading-snug font-sans text-[11px]">{resolved.tooltip}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#00050B]" />
        </div>
      )}
    </div>
  );
};
