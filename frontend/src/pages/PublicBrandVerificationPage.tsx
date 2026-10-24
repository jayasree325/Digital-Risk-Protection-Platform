import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { mockVerifyPublicQuery } from '../data/mockData';
import { VerificationSearchResult, VerificationVerdict } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  HelpCircle, 
  Search, 
  ExternalLink, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Sparkles, 
  Smartphone, 
  Share2, 
  Globe, 
  Headphones, 
  RefreshCw,
  Copy,
  ChevronRight
} from 'lucide-react';

export const PublicBrandVerificationPage: React.FC = () => {
  const { brandProfile, findings, setViewMode, setActivePage, showToast } = useBrandGuard();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VerificationSearchResult | null>(null);

  const quickExamples = [
    { label: 'Official Domain', value: brandProfile?.website || 'acmepay.com' },
    { label: 'Official Social', value: '@acmepay' },
    { label: 'Official App', value: 'com.acmepay.mobile' },
    { label: 'Suspicious Domain', value: 'acmepay-urgent-verify.com' },
    { label: 'Suspicious Handle', value: '@acmepay_urgent_claims' },
  ];

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery !== undefined ? searchQuery : query).trim();
    if (!q) return;

    if (searchQuery !== undefined) {
      setQuery(searchQuery);
    }

    setIsSearching(true);
    setTimeout(() => {
      const res = mockVerifyPublicQuery(q, brandProfile, findings);
      setResult(res);
      setHasSearched(true);
      setIsSearching(false);
    }, 350);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied to clipboard`, 'info');
  };

  const getVerdictConfig = (verdict: VerificationVerdict) => {
    switch (verdict) {
      case 'Verified Official':
        return {
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400 animate-pulse" />,
          title: 'Verified Official Brand Asset',
          badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
          containerClass: 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-[#020B16]',
          textColor: 'text-emerald-400',
          summary: 'This asset is verified as authentic and officially authorized by corporate brand security.',
        };
      case 'Suspicious':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-red-400 animate-bounce" />,
          title: 'Suspicious Impersonation Asset Flagged',
          badgeClass: 'bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
          containerClass: 'border-red-500/40 bg-gradient-to-b from-red-950/35 to-[#020B16]',
          textColor: 'text-red-400',
          summary: 'High risk detected. This asset exhibits unauthorized trademark usage and signs of deception.',
        };
      case 'Unavailable':
        return {
          icon: <HelpCircle className="w-8 h-8 text-slate-400" />,
          title: 'Verification Service Unavailable',
          badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
          containerClass: 'border-slate-700/60 bg-[#060D1E]',
          textColor: 'text-slate-400',
          summary: 'The verification query could not resolve against registries. Please try again.',
        };
      case 'Not Recognized':
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          title: 'Not Recognized in Official Directory',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
          containerClass: 'border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-[#020B16]',
          textColor: 'text-amber-400',
          summary: 'No official record matches this query. Exercise extreme caution before trusting this link.',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#00050B] text-slate-100 flex flex-col font-sans selection:bg-[#00FFA3]/30 selection:text-[#00FFA3] relative overflow-x-hidden">
      {/* Aurora Ambient Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-[#00FFA3]/12 via-[#00E5FF]/8 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-[#00E5FF]/10 via-[#00FFA3]/6 to-transparent rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0, 255, 163,0.03)_1px,transparent_1px)] [background-size:32px_32px] opacity-70" />
      </div>

      {/* Header Bar */}
      <header className="h-20 px-6 lg:px-12 bg-[#00050B]/90 backdrop-blur-xl border-b border-[#00FFA3]/20 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('landing')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/40 text-[#00FFA3] shadow-md shadow-[#00FFA3]/10">
              <ShieldCheck className="w-5 h-5 text-[#00FFA3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg text-white">BrandGuard</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                  Public Trust Portal
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                Official Consumer Verification Service
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Demo data enabled</span>
          </span>
          <button
            onClick={() => setViewMode('login')}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setViewMode('app');
              setActivePage('home');
            }}
            className="px-4 py-2 rounded-xl bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_20px_rgba(0, 255, 163,0.3)] hover:bg-[#00E5FF] transition-all"
          >
            SecOps Console
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 relative z-10 space-y-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Public Anti-Fraud Verification Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
            Verify Before You Trust
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Check if a website, social media profile, mobile app package, or customer support channel is verified and officially managed by <strong className="text-white">{brandProfile?.companyName || 'AcmePay Technologies'}</strong>.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="unlumen-card p-6 bg-[#040C1D]/90 border border-[#00FFA3]/30 shadow-2xl rounded-2xl space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste link, domain, @handle, app package, or support email..."
              className="w-full bg-[#020713] border border-slate-700/80 rounded-xl pl-12 pr-32 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00FFA3] focus:ring-2 focus:ring-[#00FFA3]/20 font-mono transition-all shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg bg-[#00FFA3] text-[#00050B] font-bold text-xs hover:bg-[#00E5FF] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1.5 font-mono"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Verify</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Click Demo Queries */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Try sample query:</span>
            {quickExamples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => handleSearch(ex.value)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-[#00FFA3]/15 text-slate-300 hover:text-[#00FFA3] border border-white/[0.08] hover:border-[#00FFA3]/40 transition-colors font-mono text-[11px]"
              >
                {ex.label} ({ex.value})
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Card */}
        {hasSearched && result && (
          <div className={`unlumen-card p-6 sm:p-8 rounded-2xl border shadow-2xl transition-all animate-in fade-in duration-300 ${getVerdictConfig(result.verdict).containerClass}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 shadow-inner flex-shrink-0">
                  {getVerdictConfig(result.verdict).icon}
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${getVerdictConfig(result.verdict).badgeClass}`}>
                    Verdict: {result.verdict}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 font-mono">
                    {getVerdictConfig(result.verdict).title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {getVerdictConfig(result.verdict).summary}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center text-xs font-mono text-slate-400">
                <span className="text-slate-500">Confidence: {result.confidenceScore}%</span>
                <span className="flex items-center gap-1 text-[#00FFA3] mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{result.checkedAt}</span>
                </span>
              </div>
            </div>

            {/* Target Query Details */}
            <div className="py-4 border-b border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-1">Target Checked:</span>
                <span className="text-white bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 block break-all">
                  {result.query}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Authenticity Status:</span>
                <span className={`font-bold block py-1.5 ${getVerdictConfig(result.verdict).textColor}`}>
                  {result.notes}
                </span>
              </div>
            </div>

            {/* Safety Warnings if Suspicious or Not Recognized */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-5 p-4 rounded-xl bg-red-950/30 border border-red-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Safety Warning & Advisory</span>
                </div>
                <ul className="space-y-1.5 text-xs text-red-200/90 pl-6 list-disc">
                  {result.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Official Brand Portfolio Directory */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#00FFA3] uppercase tracking-widest bg-[#00FFA3]/10 px-2.5 py-0.5 rounded border border-[#00FFA3]/30">
                  AUTHORITATIVE_PORTFOLIO
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Official Channels & Contact Roster
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Only trust communication directly originating from these verified assets.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Last Verified: Today, 11:45 UTC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Official Web Domain */}
            <div className="unlumen-card p-5 bg-[#030917]/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#00FFA3]" />
                  <span>Official Website</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                https://{brandProfile?.website || 'acmepay.com'}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">SSL / TLS Certificate</span>
                <span className="text-emerald-400 font-semibold">Active & Valid</span>
              </div>
            </div>

            {/* 2. Official Social Handles */}
            <div className="unlumen-card p-5 bg-[#030917]/80 border border-slate-800 hover:border-cyan-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Verified Socials</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {(brandProfile?.officialSocials || []).length} Accounts
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {(brandProfile?.officialSocials || []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-slate-300 py-0.5">
                    <span>{s.platform}:</span>
                    <span className="text-cyan-400 font-semibold">{s.handle}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Official Mobile Applications */}
            <div className="unlumen-card p-5 bg-[#030917]/80 border border-slate-800 hover:border-purple-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Official Apps</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {(brandProfile?.officialApps || []).length} Verified
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {(brandProfile?.officialApps || []).map((a) => (
                  <div key={a.id} className="text-slate-300 py-0.5 truncate">
                    <span className="text-white font-bold block">{a.name} ({a.platform})</span>
                    <span className="text-purple-400 text-[11px]">{a.packageId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Support Channels & Customer Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="unlumen-card p-5 bg-[#030917]/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase tracking-wider">
                <Headphones className="w-4 h-4 text-[#00FFA3]" />
                <span>Authorized Support Channels</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Online Help Center:</span>
                  <span className="text-white font-semibold">https://help.acmepay.com</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Security Hotline:</span>
                  <span className="text-emerald-400 font-semibold">security@acmepay.com</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Emergency Fraud Desk:</span>
                  <span className="text-white font-semibold">+1 (800) 555-ACME</span>
                </div>
              </div>
            </div>

            <div className="unlumen-card p-5 bg-[#030917]/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Active Safety Rules for Customers</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 list-disc pl-5">
                <li>AcmePay representatives will <strong>never</strong> request your PIN, password, or SMS OTP.</li>
                <li>Never install APK files sent via WhatsApp, Telegram, or SMS.</li>
                <li>Always confirm that URLs start strictly with <code>https://acmepay.com</code>.</li>
              </ul>
            </div>
          </div>

        </section>

      </main>

      {/* Public Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#00050B] py-6 px-6 lg:px-12 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>&copy; 2026 {brandProfile?.companyName || 'AcmePay Technologies Inc.'}. Protected by BrandGuard.</span>
        <div className="flex items-center gap-4">
          <span className="text-amber-400 text-[11px]">Notice: Demo data active</span>
          <button 
            onClick={() => setViewMode('landing')}
            className="text-slate-300 hover:text-white underline underline-offset-4"
          >
            Back to Home
          </button>
        </div>
      </footer>
    </div>
  );
};
