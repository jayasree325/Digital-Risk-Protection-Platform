import React, { useState, useRef, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, Layers, Sliders, Sparkles } from 'lucide-react';

interface LogoDiffSliderProps {
  officialTitle: string;
  officialSubtitle: string;
  impersonatorTitle: string;
  impersonatorSubtitle: string;
  avatarInitials: string;
  avatarColor: string;
  riskScore: number;
}

export const LogoDiffSlider: React.FC<LogoDiffSliderProps> = ({
  officialTitle,
  officialSubtitle,
  impersonatorTitle,
  impersonatorSubtitle,
  avatarInitials,
  avatarColor,
  riskScore,
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [showHeatmap, setShowHeatmap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = () => {
    isDraggingRef.current = true;
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPos(pct);
  }, []);

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Controls & Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#00FFA3]/20">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#00FFA3]" />
          <span className="font-bold text-white uppercase text-[11px]">
            Interactive Trademark Forensics Diff Slider
          </span>
        </div>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[10px] font-bold ${
            showHeatmap
              ? 'bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/60 shadow-[0_0_12px_rgba(0,255,163,0.3)]'
              : 'bg-[#00050B] text-slate-400 border-slate-800 hover:text-white hover:border-[#00FFA3]/30'
          }`}
        >
          <Layers className="w-3 h-3 text-[#00FFA3]" />
          <span>pHash Mismatch Overlay: {showHeatmap ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Interactive Drag Split Screen Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative h-44 rounded-2xl bg-[#00050B] border border-[#00FFA3]/30 overflow-hidden select-none cursor-ew-resize cyber-corners shadow-inner"
      >
        {/* Right Base Layer: Impersonator (Red / Warning) */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 to-[#040C1D] flex items-center justify-end pr-8 sm:pr-12">
          <div className="text-right space-y-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              Flagged Spoof
            </span>
            <h4 className="text-sm font-black text-white">{impersonatorTitle}</h4>
            <p className="text-[11px] text-red-300/80 font-mono">{impersonatorSubtitle}</p>
            <div className="text-[10px] text-slate-500">
              Risk Score: <strong className="text-red-400 font-bold">{riskScore}/100</strong>
            </div>
          </div>
        </div>

        {/* Left Clipped Layer: Official Brand Asset (Emerald Green) */}
        <div
          style={{ width: `${sliderPos}%` }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#040C1D] via-emerald-950/40 to-transparent border-r-2 border-[#00FFA3] overflow-hidden flex items-center pl-6 sm:pl-10"
        >
          <div className="space-y-1.5 min-w-[220px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
              <ShieldCheck className="w-3 h-3 text-[#00FFA3]" />
              Authentic Asset
            </span>
            <h4 className="text-sm font-black text-white">{officialTitle}</h4>
            <p className="text-[11px] text-[#00E5FF] font-mono">{officialSubtitle}</p>
            <div className="text-[10px] text-slate-400">
              Identity Proof: <strong className="text-[#00FFA3]">Cryptographically Verified</strong>
            </div>
          </div>
        </div>

        {/* Heatmap Pixel Dissimilarity Grid Simulation */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,46,84,0.3)_1px,transparent_1px)] [background-size:12px_12px] opacity-80 mix-blend-screen animate-pulse" />
        )}

        {/* Draggable Divider Handle */}
        <div
          style={{ left: `${sliderPos}%` }}
          onPointerDown={handlePointerDown}
          className="absolute inset-y-0 -ml-3 w-6 flex items-center justify-center cursor-ew-resize z-20 group"
        >
          <div className="w-7 h-7 rounded-full bg-[#00050B] border-2 border-[#00FFA3] shadow-[0_0_15px_#00FFA3] flex items-center justify-center text-[10px] font-bold text-[#00FFA3] transition-transform group-hover:scale-110">
            ⇔
          </div>
        </div>

        {/* Floating Percentage Indicator */}
        <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] text-slate-400 font-mono pointer-events-none">
          Split Position: <strong className="text-[#00FFA3]">{sliderPos}%</strong> (Drag handle to inspect)
        </div>
      </div>

      {/* Forensic Telemetry Matrix Bar */}
      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
        <div className="p-2 rounded-xl bg-[#00050B] border border-[#00FFA3]/15">
          <span className="text-slate-500 block">pHash Match:</span>
          <strong className="text-[#00FFA3] font-mono text-xs">94.2% Similarity</strong>
        </div>
        <div className="p-2 rounded-xl bg-[#00050B] border border-[#00FFA3]/15">
          <span className="text-slate-500 block">Hamming Distance:</span>
          <strong className="text-red-400 font-mono text-xs">4 Bits (High Spoof)</strong>
        </div>
        <div className="p-2 rounded-xl bg-[#00050B] border border-[#00FFA3]/15">
          <span className="text-slate-500 block">Visual Vector:</span>
          <strong className="text-[#00E5FF] font-mono text-xs">Exact Color Collision</strong>
        </div>
      </div>
    </div>
  );
};
