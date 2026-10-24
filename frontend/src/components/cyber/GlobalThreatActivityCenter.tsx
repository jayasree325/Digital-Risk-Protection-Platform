import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Layers, 
  Play, 
  Pause, 
  FastForward, 
  Rewind,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { CyberGlobe3D, ThreatVector } from '../common/CyberGlobe3D';

interface GlobalThreatActivityCenterProps {
  threats: ThreatVector[];
  className?: string;
  onThreatSelect?: (threat: ThreatVector) => void;
}

export const GlobalThreatActivityCenter: React.FC<GlobalThreatActivityCenterProps> = ({
  threats,
  className = '',
  onThreatSelect,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [timelineProgress, setTimelineProgress] = useState(42);
  const [speedMultiplier, setSpeedMultiplier] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D'>('7D');

  const containerRef = useRef<HTMLDivElement>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  // Historical Threat Evolution Replay Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 200 / speedMultiplier);
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    phish: true,
    typo: true,
    impr: true,
    rogu: true,
    leak: true,
    bots: true,
  });

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleZoomIn = () => {
    // Dispatch scroll or simulate camera zoom if available
    const el = containerRef.current?.querySelector('canvas');
    if (el) {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true }));
    }
  };

  const handleZoomOut = () => {
    const el = containerRef.current?.querySelector('canvas');
    if (el) {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`cyber-bento-card overflow-hidden relative flex flex-col justify-between select-none ${className}`}
      style={{ minHeight: '390px' }}
    >
      {/* 1. Header */}
      <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <h2 className="text-base font-semibold text-white tracking-wide font-sans">
            Global Threat Activity
          </h2>
          <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-ping ml-1" />
        </div>

        {/* Region / Node telemetry pill */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#00050B]/90 border border-cyan-950 text-[10px] font-mono text-slate-400">
          <span className="text-[#00FFA3]">NODE:</span>
          <span>North America / Global Hub</span>
        </div>
      </div>

      {/* 2. Floating Left Action Stack (Fullscreen, Zoom In, Zoom Out, Layers) */}
      <div className="absolute left-5 top-16 z-20 flex flex-col gap-2">
        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-xl bg-[#040C1D]/90 hover:bg-[#060D1A] border border-[#00FFA3]/20 text-slate-300 hover:text-[#00FFA3] flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl bg-[#040C1D]/90 hover:bg-[#060D1A] border border-[#00FFA3]/20 text-slate-300 hover:text-[#00FFA3] flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl bg-[#040C1D]/90 hover:bg-[#060D1A] border border-[#00FFA3]/20 text-slate-300 hover:text-[#00FFA3] flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Layers toggle */}
        <div className="relative">
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${
              isLayersOpen
                ? 'bg-[#00FFA3]/20 border-[#00FFA3] text-[#00FFA3]'
                : 'bg-[#040C1D]/90 hover:bg-[#060D1A] border-[#00FFA3]/20 text-slate-300 hover:text-[#00FFA3]'
            }`}
            title="Filter Threat Layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Layers Popover Menu */}
          {isLayersOpen && (
            <div className="absolute left-10 top-0 w-44 p-2 rounded-xl bg-[#040C1D]/95 border border-[#00FFA3]/30 shadow-2xl backdrop-blur-xl z-30 space-y-1 font-mono text-[10px]">
              <div className="text-slate-400 font-bold px-1.5 py-0.5 border-b border-cyan-950 mb-1">
                RADAR VECTORS
              </div>
              {Object.keys(activeLayers).map((k) => (
                <button
                  key={k}
                  onClick={() => toggleLayer(k)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-lg transition-colors ${
                    activeLayers[k]
                      ? 'bg-[#00FFA3]/15 text-[#00FFA3]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="uppercase">{k}</span>
                  <span>{activeLayers[k] ? 'ON' : 'OFF'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. 3D Globe Canvas Container */}
      <div className="flex-1 w-full h-full relative z-10 flex items-center justify-center min-h-[300px]">
        <CyberGlobe3D
          threats={threats}
          activeLayers={activeLayers}
          isAutoRotate={isPlaying}
          onCameraResetRef={resetCameraRef}
          onSelectThreat={onThreatSelect}
          className="w-full h-full"
        />

        {/* Soft Radial Ambient Cyan Glow Behind Globe */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[380px] h-[380px] rounded-full bg-[#00FFA3]/8 blur-[100px]" />
        </div>
      </div>

      {/* 4. Floating Bottom Timeline Scrubber */}
      <div className="absolute bottom-4 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#00050B]/90 border border-cyan-950 backdrop-blur-md shadow-xl text-slate-300 text-xs">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-6 h-6 rounded-full bg-[#00FFA3]/20 hover:bg-[#00FFA3]/40 text-[#00FFA3] flex items-center justify-center transition-colors shadow-[0_0_8px_rgba(0,255,163,0.3)]"
            title={isPlaying ? 'Pause Historical Replay' : 'Play Historical Threat Evolution'}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </button>

          {/* Interactive Timeline scrub track */}
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
              setTimelineProgress(pos);
            }}
            className="w-28 sm:w-44 h-2 bg-[#040C1D] border border-cyan-950 rounded-full relative cursor-pointer overflow-hidden group"
            title="Click to seek historical evolution"
          >
            <div
              className="h-full bg-gradient-to-r from-[#00E88F] to-[#00FFA3] rounded-full relative"
              style={{ width: `${timelineProgress}%` }}
            />
          </div>

          <span className="text-[10px] font-mono text-[#00FFA3] font-bold min-w-[28px]">
            {timelineProgress}%
          </span>

          {/* Timeframe selector (7D / 30D / 90D) */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            {(['7D', '30D', '90D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#00FFA3] text-[#00050B] shadow-[0_0_6px_rgba(0,255,163,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Speed multiplier control */}
          <button
            onClick={() => setSpeedMultiplier(prev => (prev === 2 ? 4 : prev === 4 ? 1 : 2))}
            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#00FFA3] hover:bg-[#00FFA3]/10 transition-colors flex items-center gap-0.5 border-l border-slate-800 pl-2"
            title="Cycle Playback Speed"
          >
            <span>{speedMultiplier}x</span>
          </button>
        </div>

        {/* Live Threat Replay Telemetry */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00050B]/90 border border-cyan-950 backdrop-blur-md shadow-xl text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
          <span className="text-white font-bold">
            HISTORICAL EVOLUTION ({timeframe}):
          </span>
          <span className="text-[#00FFA3]">
            T-{Math.max(1, Math.round(((100 - timelineProgress) / 100) * (timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : 90)))}D &bull; {threats.length + Math.round(timelineProgress / 10)} VECTORS LOGGED
          </span>
        </div>
      </div>
    </div>
  );
};
