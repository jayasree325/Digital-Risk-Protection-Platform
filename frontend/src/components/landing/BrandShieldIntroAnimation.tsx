import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, Sparkles, Terminal } from 'lucide-react';

interface BrandShieldIntroAnimationProps {
  onComplete?: () => void;
}

export const BrandShieldIntroAnimation: React.FC<BrandShieldIntroAnimationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Fast high-FPS progress counter (reaches 100% in ~850ms)
    const startTime = Date.now();
    const duration = 850;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
      }
    }, 25);

    // Fade out smoothly at 1000ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000);

    // Finish completely at 1200ms
    const finishTimer = setTimeout(() => {
      onComplete?.();
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete?.();
    }, 100);
  };

  return createPortal(
    <div 
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#00050B] select-none cursor-pointer transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      title="Click anywhere to skip"
    >
      {/* Background Cyber Ambient Overlays */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#00FFA3]/20 via-[#00E88F]/15 to-transparent blur-3xl pointer-events-none animate-pulse" />
      
      {/* Scanline Sweep Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FFA3]/10 to-transparent h-32 w-full animate-pulse pointer-events-none" />

      {/* Main Center Animation Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center max-w-lg mx-auto">
        
        {/* Orbital Shield Icon Construction */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer rotating neon ring */}
          <div className="absolute w-28 h-28 rounded-full border border-dashed border-[#00FFA3]/60 animate-spin" style={{ animationDuration: '4s' }} />
          
          {/* Pulsing inner ring */}
          <div className="absolute w-20 h-20 rounded-full border border-[#00E88F]/50 animate-ping" style={{ animationDuration: '1s' }} />

          {/* Central Holographic Shield Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFA3]/35 to-[#00E88F]/25 border border-[#00FFA3]/70 flex items-center justify-center shadow-[0_0_35px_rgba(0, 255, 163,0.5)] relative">
            <Shield className="w-8 h-8 text-[#00FFA3] drop-shadow-[0_0_14px_#00FFA3]" />
            <Sparkles className="w-4 h-4 text-[#00E5FF] absolute top-1.5 right-1.5 animate-pulse" />
          </div>
        </div>

        {/* BRANDGUARD Animated Typography */}
        <div className="overflow-hidden">
          <h1 className="text-4xl sm:text-5xl font-black tracking-[0.25em] text-white uppercase relative">
            <span className="bg-gradient-to-r from-white via-slate-100 to-[#A6B3CD] bg-clip-text text-transparent">
              BRAND
            </span>
            <span className="bg-gradient-to-r from-[#00FFA3] via-[#00E5FF] to-[#00E88F] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0, 255, 163,0.7)]">
              GUARD
            </span>

            {/* Glowing laser underline */}
            <div className="mt-3 h-[2px] w-full bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent shadow-[0_0_12px_#00FFA3]" />
          </h1>
        </div>

        {/* Subtitle Telemetry */}
        <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#A6B3CD]">
          <Terminal className="w-3.5 h-3.5 text-[#00FFA3]" />
          <span className="tracking-widest uppercase text-[10px] sm:text-xs">
            DIGITAL RISK PROTECTION &bull; NEURAL DEFENSE GRID
          </span>
        </div>

        {/* Fast Precision Progress Bar */}
        <div className="w-56 sm:w-64 h-1 bg-[#00050B] rounded-full overflow-hidden mt-6 border border-[#00FFA3]/20 relative">
          <div 
            className="h-full bg-gradient-to-r from-[#00E88F] to-[#00FFA3] transition-all duration-75 shadow-[0_0_10px_#00FFA3]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status indicator */}
        <div className="mt-2 flex items-center justify-between w-56 sm:w-64 text-[9px] font-mono text-slate-400">
          <span>INITIALIZING</span>
          <span className="text-[#42DDF5] font-bold">{progress}%</span>
          <span>ONLINE</span>
        </div>

        {/* Subtle skip prompt */}
        <span className="mt-4 text-[10px] text-slate-500 font-mono tracking-wider opacity-60 hover:opacity-100 transition-opacity">
          Click anywhere to skip
        </span>

      </div>
    </div>,
    document.body
  );
};
