import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  Globe2, 
  ShieldAlert, 
  Radar, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Activity, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Box, 
  Zap, 
  Flame, 
  Clock, 
  Radio, 
  Terminal,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { CyberGlobe3D, ThreatVector, LAYER_HEX } from '../common/CyberGlobe3D';

export const GlobalThreatMap: React.FC = () => {
  const { 
    company, 
    brandProfile, 
    findings, 
    setSelectedFinding, 
    runNewScan, 
    isScanning,
    isDemoMode 
  } = useBrandGuard();

  // Mode States
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedThreat, setSelectedThreat] = useState<ThreatVector | null>(null);
  const [utcTime, setUtcTime] = useState<string>('');
  const [detectionCount, setDetectionCount] = useState<number>(2419080);
  const [activeTab, setActiveTab] = useState<'stream' | 'targets' | 'telemetry'>('stream');

  const containerRef = useRef<HTMLDivElement>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  // Active Layer Filters (Kaspersky signature layer toggles)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    phish: true,
    typo: true,
    impr: true,
    rogu: true,
    leak: true,
    bots: true,
  });

  // Toggle single layer
  const toggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Live UTC Clock ticking
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Attack Velocity simulation counter increment
  useEffect(() => {
    const interval = setInterval(() => {
      setDetectionCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Map real findings and simulated threats into Kaspersky ThreatVector objects
  const threats: ThreatVector[] = useMemo(() => {
    const originCities = [
      { city: 'Frankfurt', country: 'Germany', lat: 50.11, lng: 8.68 },
      { city: 'Moscow', country: 'Russia', lat: 55.75, lng: 37.61 },
      { city: 'Shenzhen', country: 'China', lat: 22.54, lng: 114.05 },
      { city: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.63 },
      { city: 'London', country: 'United Kingdom', lat: 51.50, lng: -0.12 },
      { city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.89 },
      { city: 'Lagos', country: 'Nigeria', lat: 6.52, lng: 3.37 },
      { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38 },
      { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.81 },
      { city: 'Tokyo', country: 'Japan', lat: 35.67, lng: 139.65 },
    ];

    const targetHq = {
      city: 'San Francisco',
      country: 'United States',
      lat: 37.77,
      lng: -122.41,
      asset: brandProfile.website || 'brandguard.io'
    };

    const types: ('phish' | 'typo' | 'impr' | 'rogu' | 'leak' | 'bots')[] = [
      'phish', 'typo', 'impr', 'rogu', 'leak', 'bots'
    ];

    return findings.slice(0, 10).map((f, idx) => {
      const origin = originCities[idx % originCities.length];
      const threatType = types[idx % types.length];
      const statuses: ('BLOCKED' | 'MITIGATING' | 'DETECTED' | 'TAKEDOWN_SENT')[] = [
        'BLOCKED', 'MITIGATING', 'DETECTED', 'TAKEDOWN_SENT'
      ];

      return {
        id: f.id,
        name: f.title,
        type: threatType,
        severity: (f.riskSeverity as 'critical' | 'high' | 'medium') || 'critical',
        originCity: origin.city,
        originCountry: origin.country,
        originLat: origin.lat,
        originLng: origin.lng,
        targetCity: targetHq.city,
        targetCountry: targetHq.country,
        targetLat: targetHq.lat,
        targetLng: targetHq.lng,
        targetAsset: f.candidateWebsite || f.candidateUrl || f.usernameOrPackage || targetHq.asset,
        riskScore: f.riskScore || 85,
        status: statuses[idx % statuses.length],
        timestamp: `${String(12 - (idx % 4)).padStart(2, '0')}:${String((idx * 7) % 60).padStart(2, '0')}:${String((idx * 13) % 60).padStart(2, '0')} UTC`,
      };
    });
  }, [findings, brandProfile]);

  const visibleThreats = useMemo(() => {
    return threats.filter(t => activeLayers[t.type] !== false);
  }, [threats, activeLayers]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleInspectFinding = (threat: ThreatVector) => {
    const match = findings.find(f => f.id === threat.id);
    if (match) {
      setSelectedFinding(match);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative rounded-3xl bg-[#00050B] border border-[#00E5FF]/20 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full'
      }`}
    >
      {/* Background Cyber Grid Lines */}
      <div className="absolute inset-0 kaspersky-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/50 to-transparent pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP COMMAND BAR & LIVE HUD CONTROLS (Kaspersky Style) */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-4 sm:px-6 py-3.5 bg-[#020713]/85 backdrop-blur-2xl border-b border-[#00E5FF]/15 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Map Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 flex items-center justify-center text-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.3)]">
            <Globe2 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-white uppercase font-mono">
                BRANDGUARD <span className="text-[#00FFA3]">//</span> CYBERTHREAT REAL-TIME MAP
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FF2E54]/15 text-[#FF2E54] border border-[#FF2E54]/30 flex items-center gap-1 shadow-[0_0_10px_rgba(255,46,84,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E54] animate-ping" />
                DEFCON 2 ACTIVE
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3 mt-0.5">
              <span>PROTECTED ASSET: <strong className="text-[#00E5FF]">{brandProfile.brandName || company?.name || 'Enterprise'}</strong></span>
              <span>&bull;</span>
              <span>ATTACK VELOCITY: <strong className="text-[#00FFA3]">54/SEC</strong></span>
            </div>
          </div>
        </div>

        {/* Center Live Detections Ticker */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-[#00050B]/80 border border-[#00E5FF]/20 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span className="text-[10px] text-slate-400">TOTAL DETECTIONS:</span>
            <span className="font-bold text-[#00FFA3] tracking-wider">{detectionCount.toLocaleString()}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="font-bold text-[#00E5FF]">{utcTime}</span>
          </div>
        </div>

        {/* Right HUD Control Switches */}
        <div className="flex items-center gap-2">
          {/* 3D Globe / 2D Tactical View Switcher */}
          <div className="p-0.5 rounded-xl bg-[#060D1A] border border-[#00E5FF]/20 flex items-center text-[10px] font-mono font-bold">
            <button
              onClick={() => setIs3DMode(true)}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                is3DMode 
                  ? 'bg-[#00E5FF] text-[#00050B] shadow-[0_0_12px_rgba(0,229,255,0.4)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to 3D WebGL Spherical Globe"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D GLOBE</span>
            </button>
            <button
              onClick={() => setIs3DMode(false)}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                !is3DMode 
                  ? 'bg-[#00E5FF] text-[#00050B] shadow-[0_0_12px_rgba(0,229,255,0.4)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to 2D Equirectangular Tactical Map"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2D FLAT</span>
            </button>
          </div>

          {/* Sound FX Toggle (Cyber Synthesizer) */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 rounded-xl border text-xs font-mono transition-all ${
              isSoundEnabled 
                ? 'bg-[#00FFA3]/20 border-[#00FFA3] text-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.3)]' 
                : 'bg-[#060D1A] border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isSoundEnabled ? 'Cyber Audio Pings Enabled' : 'Enable Cyber Audio Synthesizer'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto-Rotation Toggle */}
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`p-2 rounded-xl border text-xs font-mono transition-all ${
              isAutoRotate 
                ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' 
                : 'bg-[#060D1A] border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isAutoRotate ? 'Auto-Rotate Active' : 'Auto-Rotate Paused'}
          >
            {isAutoRotate ? <RotateCw className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
          </button>

          {/* Reset Camera View */}
          <button
            onClick={() => resetCameraRef.current?.()}
            className="p-2 rounded-xl bg-[#060D1A] border border-slate-800 text-slate-400 hover:text-white transition-all text-xs"
            title="Reset 3D Globe Camera"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Radar Sweep Scan Trigger */}
          <button
            onClick={() => runNewScan('all')}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 border border-[#00FFA3]/40 text-[#00FFA3] flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0, 255, 163,0.2)]"
          >
            <Radar className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? 'SCANNING...' : 'PING RADAR'}</span>
          </button>

          {/* Fullscreen Mode */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#060D1A] border border-slate-800 text-slate-400 hover:text-white transition-all text-xs"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3D / 2D INTERACTIVE STAGE */}
      {/* ========================================================================= */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/7.5] min-h-[480px] bg-[#00050B] overflow-hidden select-none">
        
        {/* Render 3D Three.js Globe */}
        {is3DMode ? (
          <CyberGlobe3D
            threats={threats}
            activeLayers={activeLayers}
            selectedThreatId={selectedThreat?.id}
            onSelectThreat={(t) => setSelectedThreat(t)}
            isSoundEnabled={isSoundEnabled}
            isAutoRotate={isAutoRotate}
            onCameraResetRef={resetCameraRef}
            className="w-full h-full min-h-[480px]"
          />
        ) : (
          /* 2D Equirectangular Tactical Cyber Map Mode */
          <div className="relative w-full h-full flex items-center justify-center p-6">
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="kaspersky-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              <g stroke="rgba(0, 229, 255, 0.08)" strokeWidth="0.8" strokeDasharray="3,6">
                <line x1="0" y1="125" x2="1000" y2="125" />
                <line x1="0" y1="250" x2="1000" y2="250" />
                <line x1="0" y1="375" x2="1000" y2="375" />
                <line x1="250" y1="0" x2="250" y2="500" />
                <line x1="500" y1="0" x2="500" y2="500" />
                <line x1="750" y1="0" x2="750" y2="500" />
              </g>

              {/* Continents Vectors */}
              <g opacity="0.28" fill="#040D1D" stroke="#00E5FF" strokeWidth="0.8">
                {/* North America */}
                <path d="M 120 100 Q 180 80 260 90 Q 310 130 280 190 Q 230 220 180 260 Q 140 210 110 160 Z" />
                {/* South America */}
                <path d="M 280 280 Q 360 290 380 340 Q 360 420 310 460 Q 270 380 280 280 Z" />
                {/* Europe */}
                <path d="M 460 120 Q 520 110 560 130 Q 580 180 520 200 Q 470 190 460 140 Z" />
                {/* Africa */}
                <path d="M 460 210 Q 550 200 580 260 Q 560 360 500 400 Q 450 330 460 210 Z" />
                {/* Asia */}
                <path d="M 580 100 Q 720 90 840 130 Q 880 220 800 270 Q 700 280 610 220 Q 580 160 580 100 Z" />
                {/* Australia */}
                <path d="M 820 340 Q 910 330 920 380 Q 880 430 810 410 Q 790 370 820 340 Z" />
              </g>

              {/* Central Target HQ Node */}
              <circle cx="200" cy="180" r="28" fill="none" stroke="#00FFA3" strokeWidth="1" strokeOpacity="0.4" className="animate-pulse" />
              <circle cx="200" cy="180" r="14" fill="rgba(0, 255, 163, 0.15)" stroke="#00FFA3" strokeWidth="1.5" />
              <circle cx="200" cy="180" r="5" fill="#00FFA3" filter="url(#kaspersky-glow)" />

              {/* 2D Attack Arcs */}
              {visibleThreats.map((t, idx) => {
                const origX = ((t.originLng + 180) / 360) * 1000;
                const origY = ((90 - t.originLat) / 180) * 500;
                const targetX = 200;
                const targetY = 180;
                const midX = (origX + targetX) / 2;
                const midY = Math.min(origY, targetY) - 50;
                const strokeHex = LAYER_HEX[t.type] || '#00E5FF';

                return (
                  <g key={`2d-arc-${t.id}`}>
                    <path
                      d={`M ${origX} ${origY} Q ${midX} ${midY} ${targetX} ${targetY}`}
                      fill="none"
                      stroke={strokeHex}
                      strokeWidth="1.6"
                      strokeOpacity="0.75"
                      strokeDasharray="4,4"
                    />
                    <circle r="3" fill={strokeHex}>
                      <animateMotion
                        path={`M ${origX} ${origY} Q ${midX} ${midY} ${targetX} ${targetY}`}
                        dur={`${2.2 + (idx % 3) * 0.4}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx={origX} cy={origY} r="4" fill={strokeHex} filter="url(#kaspersky-glow)" />
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. ICONIC KASPERSKY LAYER FILTER LEGEND (Left Floating Dock) */}
        {/* ======================================================================= */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 max-w-[210px]">
          <div className="px-3 py-1.5 rounded-xl bg-[#020713]/90 backdrop-blur-xl border border-[#00E5FF]/20 text-[10px] font-mono text-slate-300 shadow-xl flex items-center justify-between">
            <span className="font-bold text-[#00FFA3] flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-[#00FFA3]" />
              THREAT FILTERS
            </span>
            <span className="text-slate-400">{visibleThreats.length} ACTIVE</span>
          </div>

          {/* Layer Pills */}
          {[
            { id: 'phish', label: 'PHISH', desc: 'Phishing Clones', color: '#FF2E54' },
            { id: 'typo', label: 'TYPO', desc: 'Typosquats & Homoglyphs', color: '#00E5FF' },
            { id: 'impr', label: 'IMPR', desc: 'Executive Impersonation', color: '#BD00FF' },
            { id: 'rogu', label: 'ROGU', desc: 'Rogue Mobile APKs', color: '#FFBD00' },
            { id: 'leak', label: 'LEAK', desc: 'Dark Web Data Leaks', color: '#00FFA3' },
            { id: 'bots', label: 'BOTS', desc: 'Credential Stuffers', color: '#00E88F' },
          ].map((layer) => {
            const isEnabled = activeLayers[layer.id] !== false;
            const count = threats.filter(t => t.type === layer.id).length;

            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`group px-2.5 py-1.5 rounded-xl border text-[10px] font-mono flex items-center justify-between transition-all backdrop-blur-xl ${
                  isEnabled 
                    ? 'bg-[#020713]/85 border-[#00E5FF]/25 shadow-md' 
                    : 'bg-[#00050B]/60 border-slate-900 opacity-40 hover:opacity-75'
                }`}
                title={`Toggle ${layer.desc}`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ 
                      backgroundColor: layer.color, 
                      color: layer.color,
                      boxShadow: isEnabled ? `0 0 8px ${layer.color}` : 'none'
                    }}
                  />
                  <span className={`font-bold ${isEnabled ? 'text-white' : 'text-slate-500'}`}>
                    {layer.label}
                  </span>
                </div>
                <span 
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                  style={{ 
                    color: layer.color,
                    backgroundColor: `${layer.color}15`,
                    border: `1px solid ${layer.color}30`
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ======================================================================= */}
        {/* 4. REAL-TIME ATTACK STREAM & TELEMETRY PANEL (Right Floating Dock) */}
        {/* ======================================================================= */}
        <div className="hidden md:flex absolute top-4 right-4 z-20 w-80 flex-col rounded-2xl bg-[#020713]/90 backdrop-blur-2xl border border-[#00E5FF]/20 shadow-2xl overflow-hidden">
          {/* Header Tabs */}
          <div className="flex items-center border-b border-slate-800 text-[10px] font-mono font-bold">
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'stream' 
                  ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-b-2 border-[#00FFA3]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>LIVE FEED</span>
            </button>
            <button
              onClick={() => setActiveTab('targets')}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'targets' 
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-b-2 border-[#00E5FF]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>HOT ASSETS</span>
            </button>
          </div>

          {/* Tab Content: Live Stream */}
          {activeTab === 'stream' && (
            <div className="p-3 max-h-64 overflow-y-auto space-y-2 font-mono text-[11px]">
              {visibleThreats.map((t) => {
                const color = LAYER_HEX[t.type] || '#00E5FF';
                const isSelected = selectedThreat?.id === t.id;

                return (
                  <div
                    key={`feed-${t.id}`}
                    onClick={() => setSelectedThreat(t)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#060D1A] border-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.2)]' 
                        : 'bg-[#00050B]/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="px-1.5 py-0.2 rounded font-bold uppercase"
                          style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
                        >
                          {t.type}
                        </span>
                        <span className="text-slate-400">{t.timestamp}</span>
                      </div>
                      <span className="text-[#00FFA3] font-bold text-[9px]">{t.status}</span>
                    </div>

                    <div className="text-white font-bold truncate text-[11px]">
                      {t.targetAsset}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                      <span>ORIGIN: {t.originCity}, {t.originCountry}</span>
                      <span className="text-[#FF2E54] font-bold">{t.riskScore}% RISK</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content: Hot Assets Ranking */}
          {activeTab === 'targets' && (
            <div className="p-3 max-h-64 overflow-y-auto space-y-3 font-mono text-[11px]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Top Targeted Brand Vectors:
              </div>
              {[
                { name: brandProfile.website || 'brandguard.io', hits: 142, pct: 45, type: 'Domain Squatting' },
                { name: 'login.brandguard-verify.com', hits: 89, pct: 28, type: 'Phishing Campaign' },
                { name: '@brandguard_ceo_real', hits: 44, pct: 16, type: 'Exec Impersonation' },
                { name: 'BrandGuard_v2.apk', hits: 32, pct: 11, type: 'Rogue App APK' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white font-bold truncate">{item.name}</span>
                    <span className="text-[#00FFA3] font-bold">{item.hits} hits</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 5. BOTTOM THREAT INSPECTOR CARD / RETICLE */}
        {/* ======================================================================= */}
        {selectedThreat ? (
          <div className="absolute bottom-4 inset-x-4 md:inset-x-auto md:left-4 z-20 max-w-md p-4 rounded-2xl bg-[#020713]/95 backdrop-blur-2xl border border-[#00FFA3]/40 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: LAYER_HEX[selectedThreat.type] }}
                />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  [{selectedThreat.type}] VECTOR TELEMETRY
                </span>
              </div>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-slate-400 hover:text-white font-mono text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-2.5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">TARGET ASSET:</span>
                <span className="font-bold text-[#00E5FF]">{selectedThreat.targetAsset}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">ORIGIN COORDINATES:</span>
                <span className="text-slate-200">
                  {selectedThreat.originCity}, {selectedThreat.originCountry} ({selectedThreat.originLat.toFixed(1)}°, {selectedThreat.originLng.toFixed(1)}°)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">DEFENSE POSTURE:</span>
                <span className="font-bold text-[#00FFA3] px-2 py-0.5 rounded bg-[#00FFA3]/10 border border-[#00FFA3]/30">
                  {selectedThreat.status}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => handleInspectFinding(selectedThreat)}
                className="flex-1 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0, 255, 163,0.3)] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>INVESTIGATE IN SOC</span>
              </button>
            </div>
          </div>
        ) : (
          /* Subtle Coordinate HUD Readout when no node is locked */
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <div className="px-3 py-1.5 rounded-xl bg-[#020713]/80 border border-[#00E5FF]/20 backdrop-blur-md text-slate-300">
              <span className="text-[#00FFA3] font-bold">RADAR SWEEP:</span> 360° ACTIVE &bull; 60 FPS
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#020713]/80 border border-slate-800 backdrop-blur-md">
              CLICK OR DRAG 3D GLOBE TO ROTATE &bull; SCROLL TO ZOOM
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
