import React, { useState, useMemo } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Headphones, 
  Crosshair, 
  Radar, 
  Activity, 
  Layers, 
  Flame, 
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Network
} from 'lucide-react';
import { DotMatrixDisplay } from '../components/cyber/DotMatrixDisplay';
import { EqualizerBars } from '../components/cyber/EqualizerBars';
import { ThreatTrendSparkline } from '../components/cyber/ThreatTrendSparkline';
import { NeedsAttentionBento } from '../components/cyber/NeedsAttentionBento';
import { ThreatEvidenceFolder } from '../components/cyber/ThreatEvidenceFolder';
import { ThreatDistributionVisualizer } from '../components/cyber/ThreatDistributionVisualizer';
import { RecentSecurityFeed } from '../components/cyber/RecentSecurityFeed';
import { GlobalThreatActivityCenter } from '../components/cyber/GlobalThreatActivityCenter';
import { OperationsHudView } from '../components/cyber/OperationsHudView';
import { ThreatVector } from '../components/common/CyberGlobe3D';
import { CampaignClusteringView } from '../components/cyber/CampaignClusteringView';
import { resolveSourceStatus } from '../components/common/SourceStatusBadge';

export const OverviewPage: React.FC = () => {
  const { 
    user, 
    company,
    counts, 
    runNewScan, 
    isScanning, 
    setActivePage, 
    findings, 
    brandProfile, 
    setSelectedFinding,
    navigateToFindings,
    isDemoMode,
  } = useBrandGuard();

  // Mode: Primary Video 1 Command Center vs Video 2 Operations HUD vs Campaign Clusters
  const [activeHudMode, setActiveHudMode] = useState<'command' | 'operations' | 'campaigns'>('command');

  // Map real findings and simulated threats into ThreatVector objects for 3D Globe
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

  const handleInspectFinding = (threat: ThreatVector) => {
    const match = findings.find(f => f.id === threat.id);
    if (match) {
      setSelectedFinding(match);
    } else {
      setActivePage('findings');
    }
  };

  // Executive threat metrics
  const criticalCount = useMemo(() => {
    return findings.filter(f => f.riskSeverity?.toLowerCase() === 'critical' && f.status !== 'Resolved' && f.status !== 'Dismissed').length;
  }, [findings]);

  const highRiskCount = useMemo(() => {
    return findings.filter(f => f.riskSeverity?.toLowerCase() === 'high' && f.status !== 'Resolved' && f.status !== 'Dismissed').length;
  }, [findings]);

  const activeInvestigationsCount = useMemo(() => {
    return findings.filter(f => f.status?.toLowerCase() === 'investigating').length;
  }, [findings]);

  const currentSourceStatus = useMemo(() => {
    if (!isDemoMode && findings.some(f => !f.isDemo && resolveSourceStatus(undefined, f).type === 'LIVE DATA')) {
      return 'LIVE DATA';
    }
    return 'DEMO DATA';
  }, [isDemoMode, findings]);

  return (
    <div className="space-y-4 max-w-[1560px] mx-auto pb-12 text-xs font-sans select-none">
      {/* "What Needs Attention?" Executive Summary Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#040C1D] border border-cyan-950/80 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF5878]/15 border border-[#FF5878]/30 flex items-center justify-center text-[#FF5878] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide font-sans">
                What Needs Attention?
              </h2>
              <span className="text-[10px] font-mono text-[#A6B3CD] uppercase tracking-wider">
                Executive Threat Summary
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Immediate threat signals requiring manual analyst review and verification.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto font-mono text-xs">
          {/* Critical Threats */}
          <button
            onClick={() => navigateToFindings(undefined, 'critical')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-[#00050B] border border-[#FF5878]/40 hover:bg-[#FF5878]/10 text-white flex items-center justify-between sm:justify-start gap-2 transition-all hover-lift-subtle focus-visible:ring-2 focus-visible:ring-[#FF5878]"
            title="Filter by Critical Threats"
          >
            <span className="text-[10px] text-slate-400 font-sans">Critical</span>
            <span className="text-xs font-black text-[#FF5878] bg-[#FF5878]/20 px-2 py-0.5 rounded">
              {criticalCount}
            </span>
          </button>

          {/* High-Risk Threats */}
          <button
            onClick={() => navigateToFindings(undefined, 'high')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-[#00050B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/10 text-white flex items-center justify-between sm:justify-start gap-2 transition-all hover-lift-subtle focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
            title="Filter by High-Risk Threats"
          >
            <span className="text-[10px] text-slate-400 font-sans">High-Risk</span>
            <span className="text-xs font-black text-[#F59E0B] bg-[#F59E0B]/20 px-2 py-0.5 rounded">
              {highRiskCount}
            </span>
          </button>

          {/* Active Investigations */}
          <button
            onClick={() => navigateToFindings(undefined, 'investigating')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-[#00050B] border border-[#00E5FF]/40 hover:bg-[#00E5FF]/10 text-white flex items-center justify-between sm:justify-start gap-2 transition-all hover-lift-subtle focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
            title="Filter by Active Investigations"
          >
            <span className="text-[10px] text-slate-400 font-sans">Investigations</span>
            <span className="text-xs font-black text-[#00E5FF] bg-[#00E5FF]/20 px-2 py-0.5 rounded">
              {activeInvestigationsCount}
            </span>
          </button>

          {/* Source Status */}
          <div className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-[#00050B] border border-cyan-900/60 flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] text-slate-400 font-sans">Source</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              currentSourceStatus === 'LIVE DATA' 
                ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30' 
                : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
            }`}>
              {currentSourceStatus}
            </span>
          </div>
        </div>
      </div>

      {/* View Mode Toggle Pill (Command Center vs Operations HUD) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#040C1D] border border-cyan-950 shadow-lg">
          <button
            onClick={() => setActiveHudMode('command')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeHudMode === 'command'
                ? 'bg-[#00FFA3]/20 border border-[#00FFA3]/40 text-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeHudMode === 'command' ? 'bg-[#00FFA3]' : 'bg-slate-500'}`} />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => setActiveHudMode('operations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeHudMode === 'operations'
                ? 'bg-[#00FFA3]/20 border border-[#00FFA3]/40 text-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Operations HUD</span>
          </button>

          <button
            onClick={() => setActiveHudMode('campaigns')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeHudMode === 'campaigns'
                ? 'bg-[#00FFA3]/20 border border-[#00FFA3]/40 text-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.25)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Campaign Clusters</span>
          </button>
        </div>

        {/* Scan Actions & DEFCON indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400 px-3 py-1 rounded-full bg-[#040C1D] border border-cyan-950">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-[#00FFA3] font-bold">DEFCON 2</span>
            <span>ACTIVE PERIMETER DEFENSE</span>
          </div>

          <button
            onClick={() => runNewScan('all')}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E88F] to-[#00FFA3] text-[#00050B] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0, 255, 163,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <Radar className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCANNING MESH...' : 'TRIGGER DEFENSE SCAN'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIMARY VIEW: EXACT VIDEO 1 COMMAND CENTER BENTO GRID */}
      {/* ========================================================================= */}
      {activeHudMode === 'command' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: 4 Bento Metric Cards (Video 1 signature) */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-3.5">
            {/* Bento Card 1: Security Status */}
            <div className="cyber-bento-card p-4 flex flex-col justify-between min-h-[92px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold font-sans tracking-wide">Security Status</span>
                <ShieldCheck className="w-4 h-4 text-[#00FFA3]" />
              </div>
              <div className="py-1">
                <DotMatrixDisplay text="PROTECTED" size="md" color="#00FFA3" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
                <span>Zero Breach Detected</span>
              </div>
            </div>

            {/* Bento Card 2: Protected Devices / Assets */}
            <div className="cyber-bento-card p-4 flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold font-sans tracking-wide">Protected Devices</span>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1 pt-0.5">
                <span>8</span>
                <span className="text-slate-500 text-sm">/ 8</span>
              </div>
              {/* Animated Vertical Equalizer Bars */}
              <EqualizerBars count={8} activeCount={8} />
            </div>

            {/* Bento Card 3: Security Score */}
            <div className="cyber-bento-card p-4 flex flex-col justify-between min-h-[105px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold font-sans tracking-wide">Security Score</span>
                <Headphones className="w-4 h-4 text-slate-400 hover:text-[#00FFA3] cursor-pointer transition-colors" />
              </div>
              <div className="py-0.5">
                <DotMatrixDisplay text="92/100" size="lg" color="#00FFA3" />
              </div>
              {/* Dotted fine progress line */}
              <div className="w-full flex items-center gap-1 pt-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < 22 ? 'bg-[#00FFA3] shadow-[0_0_6px_#00FFA3]' : 'bg-cyan-950'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bento Card 4: Active Threats */}
            <div className="cyber-bento-card p-4 flex flex-col justify-between min-h-[100px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold font-sans tracking-wide">Active Threats</span>
                <Crosshair className="w-4 h-4 text-[#00FFA3]" />
              </div>
              <div className="flex items-baseline justify-between">
                <DotMatrixDisplay text="2" size="xl" color="#00FFA3" />
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  MITIGATING
                </span>
              </div>
              {/* Dotted micro sparkline wave */}
              <div className="w-full h-4 flex items-center pt-1">
                <svg viewBox="0 0 100 12" className="w-full h-full overflow-visible">
                  <path
                    d="M 0,6 Q 25,1 50,8 T 100,5"
                    fill="none"
                    stroke="#00FFA3"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* CENTER COLUMN: Global Threat Activity 3D Globe + Bottom 3 Bento Cards */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Top Stage: 3D Global Threat Activity (Exact Video 1 setup) */}
            <GlobalThreatActivityCenter
              threats={threats}
              onThreatSelect={handleInspectFinding}
              className="flex-1"
            />

            {/* Bottom Row of 3 Bento Cards Underneath Globe */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Threat Trend */}
              <ThreatTrendSparkline
                onViewAll={() => setActivePage('findings')}
                className="h-full"
              />

              {/* 2. Needs Attention */}
              <NeedsAttentionBento
                findings={findings}
                onSelectFinding={setSelectedFinding}
                onAction={(actionId) => {
                  if (actionId === 'login-detected') {
                    setActivePage('findings');
                  } else {
                    setActivePage('settings');
                  }
                }}
                className="h-full"
              />

              {/* 3. Threat Evidence */}
              <ThreatEvidenceFolder
                count={findings.length || 24}
                onExplore={() => setActivePage('board-report')}
                className="h-full"
              />
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Threat Distribution & Recent Security (Video 1 signature) */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Threat Distribution with Dual Frequency Curves */}
            <ThreatDistributionVisualizer className="flex-1 min-h-[220px]" />

            {/* Recent Security Activity Stream */}
            <RecentSecurityFeed
              onViewAll={() => setActivePage('findings')}
              className="flex-1 min-h-[240px]"
            />
          </div>
        </div>
      ) : activeHudMode === 'operations' ? (
        /* 2. SECONDARY VIEW: EXACT VIDEO 2 HIGH-TECH OPERATIONS HUD */
        <OperationsHudView />
      ) : (
        /* 3. TERTIARY VIEW: CAMPAIGN INFRASTRUCTURE CORRELATION ENGINE */
        <CampaignClusteringView findings={findings} onOpenFinding={setSelectedFinding} />
      )}
    </div>
  );
};
