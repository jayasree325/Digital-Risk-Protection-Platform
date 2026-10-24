import React from 'react';

interface EqualizerBarsProps {
  count?: number;
  activeCount?: number;
  className?: string;
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  count = 8,
  activeCount = 8,
  className = '',
}) => {
  // Preset animation delays and heights to create realistic cyber telemetry equalizer effect
  const barConfigs = [
    { height: '65%', animClass: 'eq-bar-1', delay: '0.1s' },
    { height: '85%', animClass: 'eq-bar-2', delay: '0.3s' },
    { height: '45%', animClass: 'eq-bar-3', delay: '0.05s' },
    { height: '95%', animClass: 'eq-bar-4', delay: '0.4s' },
    { height: '70%', animClass: 'eq-bar-5', delay: '0.2s' },
    { height: '80%', animClass: 'eq-bar-2', delay: '0.15s' },
    { height: '55%', animClass: 'eq-bar-1', delay: '0.35s' },
    { height: '90%', animClass: 'eq-bar-3', delay: '0.25s' },
  ];

  return (
    <div className={`flex items-end gap-1.5 h-12 py-1 ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i < activeCount;
        const config = barConfigs[i % barConfigs.length];

        return (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end items-center h-full group"
          >
            <div
              className={`w-full max-w-[10px] rounded-full transition-all duration-300 ${config.animClass} ${
                isActive
                  ? 'bg-gradient-to-t from-[#00E88F] via-[#00B4D8] to-[#00FFA3] shadow-[0_0_12px_rgba(0, 255, 163,0.45)]'
                  : 'bg-slate-900/40 border border-cyan-900/40'
              }`}
              style={{
                height: isActive ? config.height : '20%',
                animationDelay: config.delay,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
