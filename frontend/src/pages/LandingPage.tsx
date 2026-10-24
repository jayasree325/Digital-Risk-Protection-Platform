import React from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Smartphone, 
  Share2, 
  Code2, 
  FileSearch, 
  FileCheck2, 
  Radar, 
  Layers, 
  Radio, 
  Cpu, 
  Lock, 
  Terminal, 
  Activity, 
  Zap, 
  ExternalLink,
  ChevronRight,
  Eye,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ThreatConstellation } from '../components/landing/ThreatConstellation';
import { BrandShieldIntroAnimation } from '../components/landing/BrandShieldIntroAnimation';

export const LandingPage: React.FC = () => {
  const { startOnboarding, setViewMode, setActivePage, brandProfile } = useBrandGuard();

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchDemo = () => {
    setViewMode('app');
    setActivePage('home');
  };

  return (
    <div className="min-h-screen bg-[#00050B] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#00FFA3]/30 selection:text-[#00FFA3] relative overflow-x-hidden">
      {/* Background Subtle Cyber Ambient Overlays */}
      <div className="pointer-events-none fixed inset-0 cyber-grid-bg opacity-35 z-0" />
      <div className="pointer-events-none fixed -top-40 right-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#00FFA3]/15 via-[#00E88F]/10 to-transparent blur-[140px] z-0" />
      <div className="pointer-events-none fixed bottom-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#00E88F]/15 to-transparent blur-[120px] z-0" />

      {/* 1. HEADER */}
      <header className="h-20 px-6 lg:px-12 bg-[#00050B]/95 backdrop-blur-xl border-b border-cyan-950/80 flex items-center justify-between sticky top-0 z-40">
        <div 
          onClick={handleLaunchDemo}
          className="flex items-center gap-3 cursor-pointer group"
          title="Open Cyvanta Command Center"
        >
          {/* Brand Shield Logo */}
          <div className="relative p-2.5 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/40 text-[#00FFA3] shadow-lg shadow-[#00FFA3]/15 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-[#00FFA3]" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl tracking-tight text-white font-black font-sans">
                Cyvanta
              </span>
              <span className="px-1.5 py-0.5 text-[8px] font-mono font-semibold uppercase tracking-wider rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 hidden sm:inline-flex">
                SOC
              </span>
            </div>
            <span className="text-[10px] text-[#00FFA3] uppercase font-mono tracking-widest block font-medium">
              Digital Risk Protection
            </span>
          </div>
        </div>

        {/* Product Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-medium text-slate-300">
          <button 
            onClick={() => handleScrollTo('capabilities-section')} 
            className="hover:text-[#00FFA3] transition-colors"
          >
            Capabilities
          </button>
          <button 
            onClick={() => handleScrollTo('how-it-works-section')} 
            className="hover:text-[#00FFA3] transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => handleScrollTo('security-section')} 
            className="hover:text-[#00FFA3] transition-colors"
          >
            Security
          </button>
          <button 
            onClick={() => setViewMode('verify')} 
            className="hover:text-[#00FFA3] transition-colors flex items-center gap-1.5 text-cyan-300 font-semibold"
            title="Open Public Brand Verification Tool"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span>Verify Asset</span>
          </button>
          <button 
            onClick={handleLaunchDemo} 
            className="hover:text-white transition-colors text-[#00FFA3] flex items-center gap-1 font-mono text-[11px]"
            title="Launch Command Center"
          >
            <Sparkles className="w-3 h-3 text-[#00FFA3]" />
            <span>Command Center</span>
          </button>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3 font-mono">
          <button
            onClick={() => setViewMode('verify')}
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 transition-all btn-smooth items-center gap-1.5"
            title="Public Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verify Brand</span>
          </button>

          <button
            onClick={() => setViewMode('login')}
            className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all btn-smooth"
          >
            Sign in
          </button>

          <button
            onClick={handleLaunchDemo}
            className="px-4.5 py-2.5 rounded-xl text-xs font-bold btn-smooth bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] shadow-[0_0_20px_rgba(0, 255, 163,0.35)] border border-white/20 flex items-center gap-2"
          >
            <span>Launch SOC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 text-left">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#040C1D] border border-[#00FFA3]/40 text-[#00FFA3] text-xs font-medium mb-6 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(0, 255, 163,0.3)]">
              <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-ping" />
              <span className="font-mono text-[11px] tracking-wide text-white">
                ENTERPRISE DIGITAL RISK PROTECTION
              </span>
            </div>

            {/* 5-Second Hero Impact Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] mb-6 font-black text-white font-sans">
              Detect Brand Impersonation Before It Becomes a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] via-[#00E5FF] to-[#00E88F]">
                Customer Threat
              </span>
            </h1>

            {/* Concise Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8 font-sans">
              Verify official assets, uncover suspicious look-alikes, and investigate every signal with clear evidence.
            </p>

            {/* Calls to Action */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 font-mono">
              <button
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold btn-smooth bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] flex items-center justify-center gap-2.5 shadow-xl shadow-[#00FFA3]/25 border border-white/20 group focus-visible:ring-2 focus-visible:ring-[#00FFA3]"
              >
                <span>Explore Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleScrollTo('how-it-works-section')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold btn-smooth bg-[#040C1D] hover:bg-[#060D1A] text-white border border-cyan-500/40 hover:border-[#00FFA3]/60 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,163,0.08)] focus-visible:ring-2 focus-visible:ring-[#00FFA3]"
              >
                <Activity className="w-4 h-4 text-[#00FFA3]" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Three Compact Capability Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-cyan-950/80">
              <div className="p-3 rounded-xl bg-[#040C1D] border border-cyan-950/80 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/30 flex items-center justify-center text-[#00FFA3] shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate font-sans">Social Identity</div>
                  <div className="text-[9.5px] font-mono text-slate-400">Continuous surveillance</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#040C1D] border border-cyan-950/80 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate font-sans">Mobile App Intel</div>
                  <div className="text-[9.5px] font-mono text-slate-400">Rogue APK interception</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#040C1D] border border-cyan-950/80 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/30 flex items-center justify-center text-[#00FFA3] shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate font-sans">Explainable Heuristics</div>
                  <div className="text-[9.5px] font-mono text-slate-400">Cryptographic audit trail</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Threat-Intelligence Constellation with Clean Breathing Room */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-2 lg:p-4">
            <ThreatConstellation brandName={brandProfile?.brandName || 'AcmePay'} />
          </div>

        </div>

        {/* Compact Trust Strip */}
        <div className="mt-12 pt-6 border-t border-cyan-950/80 flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040C1D] border border-cyan-900/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span className="font-semibold text-white">Verified Official Assets</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040C1D] border border-cyan-900/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span className="font-semibold text-white">Explainable Risk Scores</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040C1D] border border-cyan-900/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span className="font-semibold text-white">Cross-Channel Detection</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040C1D] border border-cyan-900/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span className="font-semibold text-white">Evidence-Based Review</span>
          </div>
        </div>
      </section>

      {/* 4-Step "How BrandGuard Works" Strip */}
      <section id="how-it-works-section" className="py-14 px-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10 border-t border-cyan-950/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="aegis-badge mb-2.5">
            <ShieldCheck className="w-3 h-3 text-[#00FFA3]" />
            END-TO-END WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How BrandGuard Works
          </h2>
          <p className="text-xs sm:text-sm text-[#A6B3CD] mt-1.5">
            From brand baseline verification to evidence-based threat response in four clear steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00FFA3]/40 transition-all relative flex flex-col justify-between group shadow-md hover-lift-subtle">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#00FFA3] bg-[#00FFA3]/15 px-2.5 py-1 rounded-lg border border-[#00FFA3]/30">01</span>
              <ShieldCheck className="w-5 h-5 text-[#00FFA3]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#00FFA3] transition-colors">1. Verify Official Assets</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Establish verified official domains, authorized social handles, and trademark records as an immutable baseline.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00E5FF]/40 transition-all relative flex flex-col justify-between group shadow-md hover-lift-subtle">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/15 px-2.5 py-1 rounded-lg border border-[#00E5FF]/30">02</span>
              <Activity className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#00E5FF] transition-colors">2. Monitor Suspicious Signals</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track lookalike domains, typosquats, impersonator channels, and spoofed mobile apps across the digital perimeter.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00FFA3]/40 transition-all relative flex flex-col justify-between group shadow-md hover-lift-subtle">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#00FFA3] bg-[#00FFA3]/15 px-2.5 py-1 rounded-lg border border-[#00FFA3]/30">03</span>
              <Sparkles className="w-5 h-5 text-[#00FFA3]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#00FFA3] transition-colors">3. Explain the Evidence</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deconstruct risk with transparent heuristics: visual logo matching, homoglyph detection, and routing anomalies.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00E5FF]/40 transition-all relative flex flex-col justify-between group shadow-md hover-lift-subtle">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/15 px-2.5 py-1 rounded-lg border border-[#00E5FF]/30">04</span>
              <CheckCircle2 className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#00E5FF] transition-colors">4. Review and Respond</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review forensic side-by-side breakdowns, confirm threats with human analyst governance, and remediate risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: ADVANCED INTELLIGENCE. REAL-WORLD IMPACT */}
      <section id="capabilities-section" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-cyan-950/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="aegis-badge mb-3">
            <Radio className="w-3 h-3 text-[#00FFA3] animate-pulse" />
            SECURITY ACTIVITY OVERVIEW
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Advanced Intelligence. Real-World Impact.
          </h2>
          <p className="text-sm text-[#A6B3CD] max-w-xl mx-auto">
            Traditional threat feeds notify you hours after harm is done. BrandGuard predicts lookalike domains and catches unauthorized accounts the moment they appear.
          </p>
        </div>

        {/* Real Metrics Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#00FFA3] mb-1">
              &lt; 1.2s
            </div>
            <div className="text-xs font-bold text-white">Demo Latency</div>
            <div className="text-[10px] text-[#A6B3CD] mt-0.5">Real-time heuristic evaluation</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#00FFA3] mb-1">
              99.8%
            </div>
            <div className="text-xs font-bold text-white">Demo Precision</div>
            <div className="text-[10px] text-[#A6B3CD] mt-0.5">Verified official exclusion list</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#00E5FF] mb-1">
              14
            </div>
            <div className="text-xs font-bold text-white">Intelligence Channels</div>
            <div className="text-[10px] text-[#A6B3CD] mt-0.5">Mobile, DNS, social & registries</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 text-center shadow-lg">
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#F59E0B] mb-1">
              0
            </div>
            <div className="text-xs font-bold text-white">Demo False Takedowns</div>
            <div className="text-[10px] text-[#A6B3CD] mt-0.5">Human-in-the-loop governance</div>
          </div>
        </div>

        {/* 4. EIGHT-CARD FEATURE GRID */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Comprehensive Digital Risk Protection Modules
          </h3>
          <p className="text-xs text-[#A6B3CD] mt-1">
            Engineered for security operations teams and corporate brand custodians.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Lookalike Domain Radar */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00FFA3]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#00FFA3] transition-colors">
                Lookalike Domain Radar
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                Predictive typosquatting engine scanning DNS zones and certificate transparency logs before sites launch phishing campaigns.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>Predictive Radar</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 2. Rogue Mobile App Discovery */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00FFA3]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#00FFA3] transition-colors">
                Rogue Mobile App Discovery
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                Detect trojanized APK droppers, third-party Android store clones, and fake iOS profiles masquerading with your brand logo.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>APK Signature Scan</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 3. Social Identity Protection */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00FFA3]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#00FFA3] transition-colors">
                Social Identity Protection
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                Surveillance across Telegram, Instagram, TikTok, and X to identify unauthorized brand handles, VIP impersonators, and fake support channels.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>Handle Surveillance</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 4. Unicode X-Ray Forensics */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00FFA3]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#00FFA3] transition-colors">
                Unicode X-Ray Forensics
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                Deep character-level inspection revealing Cyrillic, Greek, and mixed-script homoglyphs designed to visually spoof human eyes.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>Codepoint Inspector</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 5. Scam Script NLP Analyzer */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#FF5878]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FF5878]/15 border border-[#FF5878]/30 text-[#FF5878] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileSearch className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#FF5878] transition-colors">
                Scam Script NLP Analyzer
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                13-heuristic linguistic parser identifying urgency, payment coercion, and fraudulent support scripts circulating in customer dms.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>Linguistic Parser</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 6. Cryptographic Evidence Locker */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00FFA3]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#00FFA3] transition-colors">
                Cryptographic Evidence Locker
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                Automated screenshot captures, HTTP response archives, and SHA-256 hash receipts that meet legal standards for domain registrars.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>Immutable Hashes</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 7. Real-Time Ingestion Pipeline */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#FFBD69]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFBD69]/15 border border-[#FFBD69]/30 text-[#FFBD69] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Radar className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#FFBD69] transition-colors">
                Real-Time Ingestion Pipeline
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                Multi-threaded background crawlers scanning domain WHOIS, social API streams, and security telemetry with zero service disruption.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>Continuous Radar</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* 8. Automated Takedown Dossier */}
          <div className="p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 hover:border-[#00E5FF]/50 transition-all duration-300 flex flex-col justify-between group shadow-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#00E5FF] transition-colors">
                Automated Takedown Packets
              </h4>
              <p className="text-xs text-[#A6B3CD] leading-relaxed">
                Pre-formatted abuse reports mapped to platform policies (Meta, Google Play, ICANN) for swift, one-click enforcement requests.
              </p>
            </div>
            <div className="pt-3 mt-4 border-t border-cyan-950/80 text-[10px] font-mono text-[#00FFA3] flex items-center justify-between">
              <span>Policy Mapped</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEE IN ACTION: EMBEDDED DASHBOARD PRODUCT PREVIEW */}
      <section id="how-it-works-section" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full border-t border-cyan-950/80 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="aegis-badge mb-3">
            <Terminal className="w-3 h-3 text-[#00FFA3]" />
            SOC PLATFORM PREVIEW
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            See BrandGuard in Action
          </h2>
          <p className="text-sm text-[#A6B3CD]">
            A unified security operations console designed for rapid investigation, evidence collection, and brand enforcement.
          </p>
        </div>

        {/* Embedded Interactive Product Preview Card */}
        <div className="p-3 sm:p-5 rounded-3xl bg-[#00050B] border border-cyan-950/80 shadow-2xl relative overflow-hidden">
          {/* Dashboard Window Header Bar */}
          <div className="px-4 py-3 bg-[#040C1D] rounded-2xl border border-cyan-950/80 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5878]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#00FFA3]/80 inline-block" />
              </div>
              <span className="text-xs font-mono font-bold text-white border-l border-cyan-950/80 pl-3 flex items-center gap-2">
                <span>BrandGuard Enterprise Console</span>
                <span className="text-[10px] text-[#00FFA3] bg-[#00FFA3]/15 px-2 py-0.5 rounded border border-[#00FFA3]/30">v2.4 SecOps</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/15 px-2.5 py-1 rounded-lg border border-[#00FFA3]/30 hidden sm:inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
                <span>RADAR ONLINE</span>
              </span>
              <button
                onClick={handleLaunchDemo}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0, 255, 163,0.3)] font-mono"
              >
                <span>Open Live Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Preview Body: Scan Summary & Staged Review Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            {/* Left 4 Cols: Telemetry Counters & Stages */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-2xl bg-[#040C1D] border border-cyan-950/80">
                <span className="text-[10px] font-mono text-[#A6B3CD] uppercase tracking-wider block mb-2">
                  Active Threat Scope ({brandProfile?.brandName || 'AcmePay'})
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#00050B] border border-[#FF5878]/30">
                    <span className="text-[10px] text-[#FF5878] font-bold block">CRITICAL</span>
                    <span className="text-xl font-mono font-black text-white">4 Threats</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#00050B] border border-[#F59E0B]/30">
                    <span className="text-[10px] text-[#F59E0B] font-bold block">HIGH RISK</span>
                    <span className="text-xl font-mono font-black text-white">6 Threats</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/30">
                    <span className="text-[10px] text-[#00FFA3] font-bold block">MEDIUM</span>
                    <span className="text-xl font-mono font-black text-white">8 Threats</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#00050B] border border-cyan-950/80">
                    <span className="text-[10px] text-[#A6B3CD] font-bold block">TOTAL</span>
                    <span className="text-xl font-mono font-black text-[#00FFA3]">23 Tracked</span>
                  </div>
                </div>
              </div>

              {/* 4 Prioritized Review Stages */}
              <div className="p-4 rounded-2xl bg-[#040C1D] border border-cyan-950/80 space-y-2">
                <span className="text-[10px] font-mono text-[#A6B3CD] uppercase tracking-wider block mb-1">
                  Prioritized Staged Review
                </span>

                <div className="p-2 rounded-xl bg-[#FF5878]/10 border border-[#FF5878]/40 flex items-center justify-between text-white">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF5878]" />
                    <span>Stage 1: Critical Risks</span>
                  </span>
                  <span className="text-[10px] font-mono bg-[#FF5878]/20 px-2 py-0.5 rounded text-[#FF5878]">4 Open</span>
                </div>

                <div className="p-2 rounded-xl bg-[#00050B] border border-cyan-950/80 flex items-center justify-between text-[#A6B3CD]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Stage 2: High Risks</span>
                  </span>
                  <span className="text-[10px] font-mono">6 Open</span>
                </div>

                <div className="p-2 rounded-xl bg-[#00050B] border border-cyan-950/80 flex items-center justify-between text-[#A6B3CD]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00FFA3]" />
                    <span>Stage 3: Medium Risks</span>
                  </span>
                  <span className="text-[10px] font-mono">8 Open</span>
                </div>

                <div className="p-2 rounded-xl bg-[#00050B] border border-cyan-950/80 flex items-center justify-between text-[#A6B3CD]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>Stage 4: Low Risks</span>
                  </span>
                  <span className="text-[10px] font-mono">5 Open</span>
                </div>
              </div>
            </div>

            {/* Right 8 Cols: Side-by-Side Review Simulation */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-[#040C1D] border border-cyan-950/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-cyan-950/80 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FF5878] font-bold tracking-wider">
                      INVESTIGATION STAGE 1 &bull; FINDING #AP-094
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      Rogue Telegram Customer Support Impersonator
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5878]/15 text-[#FF5878] border border-[#FF5878]/40">
                    Risk Score: 94/100
                  </span>
                </div>

                {/* Side-by-Side Asset vs Threat Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* Verified Official Asset */}
                  <div className="p-3 rounded-xl bg-[#00050B] border border-[#00E5FF]/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-mono uppercase text-[#00E5FF] font-bold">
                        VERIFIED OFFICIAL
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                    </div>
                    <div className="text-xs font-bold text-white">AcmePay Official Support</div>
                    <div className="text-[10px] font-mono text-[#00E5FF]">@acmepay_support (HQ)</div>
                    <div className="text-[9.5px] text-[#A6B3CD]">Authorized Domain: acmepay.com</div>
                  </div>

                  {/* Suspicious Impersonator */}
                  <div className="p-3 rounded-xl bg-[#00050B] border border-[#FF5878]/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-mono uppercase text-[#FF5878] font-bold">
                        FLAGGED IMPERSONATOR
                      </span>
                      <ShieldAlert className="w-3.5 h-3.5 text-[#FF5878]" />
                    </div>
                    <div className="text-xs font-bold text-white">AcmePay Urgent Helpdesk</div>
                    <div className="text-[10px] font-mono text-[#FF5878]">@acmepay_help_billing</div>
                    <div className="text-[9.5px] text-[#A6B3CD]">Redirect Link: pay-acme-claim.xyz</div>
                  </div>
                </div>

                {/* Heuristic Explanation */}
                <div className="p-3 rounded-xl bg-[#060D1A] border border-cyan-950/80 text-[11px] text-[#A6B3CD]">
                  <span className="font-bold text-white block mb-0.5">Why this was flagged:</span>
                  Channel uses copyrighted AcmePay vector logo without corporate license. Bio contains credential harvesting phishing form redirecting customers to untrusted offshore host.
                </div>
              </div>

              {/* Action Buttons in Review Preview */}
              <div className="pt-4 border-t border-cyan-950/80 flex items-center justify-between gap-3 mt-4">
                <span className="text-[10px] font-mono text-[#A6B3CD]">Evidence: SHA-256 Verified Capture</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLaunchDemo}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF5878]/20 hover:bg-[#FF5878]/30 text-[#FF5878] border border-[#FF5878]/40 transition-colors"
                  >
                    Confirm Impersonation
                  </button>
                  <button
                    onClick={handleLaunchDemo}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] transition-colors font-mono"
                  >
                    Open Takedown Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & CONVERSION SECTION */}
      <section id="security-section" className="py-20 px-6 lg:px-12 max-w-5xl mx-auto w-full relative z-10 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#060D1A] to-[#040C1D] border border-[#00FFA3]/40 shadow-[0_0_30px_rgba(0, 255, 163,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FFA3]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00E88F]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="aegis-badge mb-4">
              <Lock className="w-3 h-3 text-[#00FFA3]" />
              ENTERPRISE TRUST ASSURANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Protect Trust Before It Is Exploited.
            </h2>
            <p className="text-sm text-[#A6B3CD] leading-relaxed mb-8">
              Counterfeiters weaponize consumer trust to drain bank accounts and steal credentials. Deploy BrandGuard 24/7 surveillance to safeguard your organization&apos;s digital identity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold btn-smooth bg-gradient-to-r from-[#00FFA3] to-[#00E88F] hover:brightness-110 text-white flex items-center justify-center gap-2 shadow-xl shadow-[#00FFA3]/30 border border-[#00FFA3]/40"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={startOnboarding}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold btn-smooth bg-[#00050B] hover:bg-[#060D1A] text-[#F5F7FF] border border-cyan-950/80 flex items-center justify-center gap-2"
              >
                <span>Register Company Profile</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REFINED MULTICOLUMN FOOTER */}
      <footer className="mt-auto pt-16 pb-12 px-6 lg:px-12 border-t border-cyan-950/80 bg-[#00050B] text-[#A6B3CD] text-xs relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#00FFA3]/20 border border-[#00FFA3]/40 text-[#00FFA3]">
                <ShieldCheck className="w-4 h-4 text-[#00FFA3]" />
              </div>
              <span className="font-display-3d text-lg font-black text-white">
                BrandGuard
              </span>
            </div>
            <p className="text-xs text-[#A6B3CD] max-w-sm leading-relaxed">
              Autonomous enterprise Digital Risk Protection platform. Detecting brand impersonation, fraudulent mobile apps, and deceptive infrastructure with cryptographic certainty.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#00E5FF]">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span>RADAR SURVEILLANCE ACTIVE // 2026</span>
            </div>
          </div>

          {/* Col 2: Capabilities */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase font-mono text-[11px] tracking-wider">Capabilities</h5>
            <ul className="space-y-2">
              <li><button onClick={handleLaunchDemo} className="hover:text-white transition-colors">Lookalike Radar</button></li>
              <li><button onClick={handleLaunchDemo} className="hover:text-white transition-colors">Social Handle Monitor</button></li>
              <li><button onClick={handleLaunchDemo} className="hover:text-white transition-colors">Rogue APK Discovery</button></li>
              <li><button onClick={handleLaunchDemo} className="hover:text-white transition-colors">Staged Risk Review</button></li>
            </ul>
          </div>

          {/* Col 3: Forensics Labs */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase font-mono text-[11px] tracking-wider">Forensic Labs</h5>
            <ul className="space-y-2">
              <li><button onClick={() => { handleLaunchDemo(); setActivePage('unicode-xray'); }} className="hover:text-white transition-colors">Unicode X-Ray</button></li>
              <li><button onClick={() => { handleLaunchDemo(); setActivePage('scam-analyzer'); }} className="hover:text-white transition-colors">Scam Script NLP</button></li>
              <li><button onClick={() => { handleLaunchDemo(); setActivePage('warning-kit'); }} className="hover:text-white transition-colors">Customer Warning Kit</button></li>
              <li><button onClick={() => { handleLaunchDemo(); setActivePage('board-report'); }} className="hover:text-white transition-colors">Executive Board Brief</button></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase font-mono text-[11px] tracking-wider">Security & Trust</h5>
            <ul className="space-y-2 text-[#A6B3CD]">
              <li><span>Security-focused architecture</span></li>
              <li><span>Cryptographic SHA-256 Vault</span></li>
              <li><span>Human-in-the-Loop Review</span></li>
              <li><span>Human-reviewed takedown workflow</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-cyan-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; 2026 BrandGuard Security Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <button 
              onClick={handleLaunchDemo}
              className="text-[#00FFA3] hover:underline flex items-center gap-1 font-bold"
            >
              <span>Explore Live Workspace</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
