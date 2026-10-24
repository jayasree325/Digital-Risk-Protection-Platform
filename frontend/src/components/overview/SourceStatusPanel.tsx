import React from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { Radio, Database, Shield, Globe, Clock, CheckCircle2 } from 'lucide-react';

export const SourceStatusPanel: React.FC = () => {
  const { sources } = useBrandGuard();

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'src-1': Radio,
    'src-2': Globe,
    'src-3': Database,
    'src-4': Shield,
  };

  return (
    <div className="p-5 rounded-2xl bg-[#020713]/85 backdrop-blur-2xl border border-[#00FFA3]/20 space-y-4 shadow-glass relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/40 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Telemetry Ingestion Sources
            </h3>
            <p className="text-xs text-slate-400">
              Live crawler and threat stream operational health
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-[#00FFA3] flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/30 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
          System Operational
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sources.map((source) => {
          const Icon = iconMap[source.id] || Shield;

          const statusBadgeMap: Record<string, { badge: string; dot: string }> = {
            live: {
              badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
              dot: 'bg-emerald-400 animate-pulse',
            },
            partially_available: {
              badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
              dot: 'bg-cyan-400',
            },
            rate_limited: {
              badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
              dot: 'bg-amber-400',
            },
            unavailable: {
              badge: 'bg-red-500/10 text-red-400 border-red-500/25',
              dot: 'bg-red-400',
            },
            demo_data: {
              badge: 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/25',
              dot: 'bg-[#00FFA3]',
            },
          };

          const currentBadge = statusBadgeMap[source.status] || statusBadgeMap.demo_data;

          return (
            <div
              key={source.id}
              className="p-3.5 rounded-xl bg-[#00050B]/80 hover:bg-[#00050B] border border-white/[0.06] hover:border-[#00FFA3]/40 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-white/[0.05] text-[#00FFA3] border border-white/[0.08]">
                    <Icon className="w-3.5 h-3.5 text-[#00FFA3]" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentBadge.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot}`} />
                    {source.statusLabel}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {source.name}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {source.tooltipText}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {source.lastSync}
                </span>
                <span className="text-slate-400 font-medium">99.9% SLA</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
