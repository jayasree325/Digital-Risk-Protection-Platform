import React from 'react';
import { ShieldCheck, Globe, Radar, UserCheck, ChevronRight } from 'lucide-react';

interface RecentSecurityFeedProps {
  onViewAll?: () => void;
  className?: string;
}

export const RecentSecurityFeed: React.FC<RecentSecurityFeedProps> = ({
  onViewAll,
  className = '',
}) => {
  const events = [
    {
      id: '1',
      title: 'Malware Blocked',
      time: '2 min ago',
      icon: ShieldCheck,
      color: '#00FFA3',
      bgColor: 'rgba(0, 255, 163, 0.12)',
      borderColor: 'rgba(0, 255, 163, 0.3)',
    },
    {
      id: '2',
      title: 'Phishing site',
      time: '12 min ago',
      icon: Globe,
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    {
      id: '3',
      title: 'Security Scan',
      time: '45 min ago',
      icon: Radar,
      color: '#00E5FF',
      bgColor: 'rgba(56, 189, 248, 0.12)',
      borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    {
      id: '4',
      title: 'Login verified',
      time: '1 hour ago',
      icon: UserCheck,
      color: '#00E88F',
      bgColor: 'rgba(0, 102, 255, 0.12)',
      borderColor: 'rgba(0, 102, 255, 0.3)',
    },
  ];

  return (
    <div className={`cyber-bento-card p-4 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-200 tracking-wide font-sans">
          Recent Security
        </h3>
      </div>

      {/* Security Event List */}
      <div className="space-y-2.5 my-auto">
        {events.map((ev) => {
          const Icon = ev.icon;
          return (
            <div
              key={ev.id}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: ev.bgColor,
                    border: `1px solid ${ev.borderColor}`,
                    color: ev.color,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-slate-200 font-sans truncate font-medium group-hover:text-white transition-colors">
                  {ev.title}
                </span>
              </div>

              <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                {ev.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-cyan-950/60">
        <button
          onClick={onViewAll}
          className="text-[11px] text-[#00FFA3] hover:text-[#00E5FF] transition-colors flex items-center gap-1 font-sans group"
        >
          <span>View All</span>
          <span className="group-hover:translate-x-0.5 transition-transform">&gt;</span>
        </button>
      </div>
    </div>
  );
};
