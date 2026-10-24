import React from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  ShieldAlert, 
  Share2, 
  Smartphone, 
  ShieldCheck, 
  ArrowUpRight, 
  Radio, 
  Cpu,
  Flame,
  Globe2
} from 'lucide-react';
import { SpotlightCard } from '../common/SpotlightCard';

export const CompactTelemetryHUD: React.FC = () => {
  const { 
    counts, 
    setActivePage, 
    navigateToFindings, 
    isDemoMode,
    findings, 
    brandProfile, 
    company 
  } = useBrandGuard();

  const criticalCount = findings.filter(f => f.riskSeverity === 'critical').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {/* 1. Active Threats */}
      <SpotlightCard
        onClick={() => setActivePage('findings')}
        spotlightColor="rgba(255, 46, 84, 0.25)"
        className="p-4 cursor-pointer group bg-[#020713]/85 border border-[#FF2E54]/30 hover:border-[#FF2E54] transition-all shadow-xl hover:shadow-[0_0_25px_rgba(255,46,84,0.2)] rounded-2xl tilt-card cyber-corners"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-hover:text-[#FF2E54] transition-colors font-bold">
            [ACTIVE THREATS]
          </span>
          <span className="w-2 h-2 rounded-full bg-[#FF2E54] animate-ping" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {counts.open}
          </span>
          <span className="text-[10px] font-mono font-bold text-[#FF2E54] bg-[#FF2E54]/15 px-1.5 py-0.5 rounded border border-[#FF2E54]/30">
            {criticalCount} CRIT
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-[9px] uppercase text-slate-300 font-semibold">{counts.open} Open Findings</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#FF2E54] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </SpotlightCard>

      {/* 2. Social Profiles */}
      <SpotlightCard
        onClick={() => navigateToFindings('social')}
        spotlightColor="rgba(0, 229, 255, 0.25)"
        className="p-4 cursor-pointer group bg-[#020713]/85 border border-[#00E5FF]/30 hover:border-[#00E5FF] transition-all shadow-xl hover:shadow-[0_0_25px_rgba(0,229,255,0.2)] rounded-2xl tilt-card cyber-corners"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-hover:text-[#00E5FF] transition-colors font-bold">
            [SOCIAL PROFILES]
          </span>
          <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {counts.social}
          </span>
          <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/30 font-bold">
            5 CHANNELS
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-[9px] uppercase text-slate-300 font-semibold">{counts.social} Social-Profile Findings</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#00E5FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </SpotlightCard>

      {/* 3. Mobile Apps */}
      <SpotlightCard
        onClick={() => navigateToFindings('app')}
        spotlightColor="rgba(255, 189, 0, 0.25)"
        className="p-4 cursor-pointer group bg-[#020713]/85 border border-[#FFBD00]/30 hover:border-[#FFBD00] transition-all shadow-xl hover:shadow-[0_0_25px_rgba(255,189,0,0.2)] rounded-2xl tilt-card cyber-corners"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-hover:text-[#FFBD00] transition-colors font-bold">
            [MOBILE APPS]
          </span>
          <Smartphone className="w-3.5 h-3.5 text-[#FFBD00]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {counts.app}
          </span>
          <span className="text-[10px] font-mono text-[#FFBD00] bg-[#FFBD00]/10 px-1.5 py-0.5 rounded border border-[#FFBD00]/30 font-bold">
            STORE / APK
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-[9px] uppercase text-slate-300 font-semibold">{counts.app} Mobile-App Findings</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#FFBD00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </SpotlightCard>

      {/* 4. Verified Brand Footprint */}
      <SpotlightCard
        onClick={() => setActivePage('brand-profile')}
        spotlightColor="rgba(0, 255, 163, 0.25)"
        className="p-4 cursor-pointer group bg-[#020713]/85 border border-[#00FFA3]/30 hover:border-[#00FFA3] transition-all shadow-xl hover:shadow-[0_0_25px_rgba(0, 255, 163,0.2)] rounded-2xl tilt-card cyber-corners"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-hover:text-[#00FFA3] transition-colors font-bold">
            [BRAND PROFILE]
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-[#00FFA3]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {brandProfile.completenessPercent}%
          </span>
          <span className="text-[10px] font-mono font-bold text-[#00FFA3] bg-[#00FFA3]/10 px-1.5 py-0.5 rounded border border-[#00FFA3]/30">
            {counts.verifiedAssets} ASSETS
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-[9px] uppercase text-slate-300 font-semibold">{brandProfile.completenessPercent}% Brand Profile Completeness</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#00FFA3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </SpotlightCard>

      {/* 5. Defense Telemetry Engine State */}
      <SpotlightCard
        spotlightColor="rgba(0, 102, 255, 0.25)"
        className="p-4 col-span-2 md:col-span-1 flex flex-col justify-between bg-[#020713]/85 border border-[#00E88F]/30 hover:border-[#00E88F] transition-all shadow-xl rounded-2xl tilt-card cyber-corners"
      >
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E88F] font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#00E88F]" />
              [MONITORING STATUS]
            </span>
            <Radio className="w-3 h-3 text-[#00FFA3] animate-pulse" />
          </div>
          <div className="text-[11px] font-mono font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
            <span>{isDemoMode ? 'Demo data' : 'Live source'}</span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-slate-400 leading-tight mt-2 pt-2 border-t border-slate-800/80 truncate">
          HQ: <span className="text-[#00E5FF] font-bold">{brandProfile.brandName || company?.name || 'AcmePay'}</span>
        </p>
      </SpotlightCard>
    </div>
  );
};
