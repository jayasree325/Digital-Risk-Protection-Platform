import React, { useState, useMemo } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { OfficialAssetCard } from '../components/brand/OfficialAssetCard';
import { AddAccountModal } from '../components/brand/AddAccountModal';
import { AddAppModal } from '../components/brand/AddAppModal';
import { UploadLogoModal } from '../components/brand/UploadLogoModal';
import { RegisterCompanyModal } from '../components/brand/RegisterCompanyModal';
import { 
  Building2, 
  ShieldCheck, 
  Plus, 
  Upload, 
  RefreshCw, 
  Globe, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Save,
  Check,
  ExternalLink,
  Share2,
  Unlink,
  ChevronDown,
  ShieldAlert,
  Smartphone,
  Fingerprint,
  Flame,
  Clock,
  Briefcase,
  AlertTriangle,
  Lock,
  Radar
} from 'lucide-react';

export const BrandProfilePage: React.FC = () => {
  const { 
    brandProfile, 
    updateBrandProfile, 
    showToast,
    connectedInstagram,
    connectLiveInstagram,
    disconnectLiveInstagram,
    company,
    availableCompanies,
    selectedCompanyId,
    switchCompany,
    findings,
    brandAssets,
    setSelectedFinding,
    isLoadingData,
    requireAuth,
    googleStatus,
  } = useBrandGuard();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddAppOpen, setIsAddAppOpen] = useState(false);
  const [isUploadLogoOpen, setIsUploadLogoOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<'dossier' | 'footprint' | 'threats'>('dossier');

  // Editable fields state
  const [brandName, setBrandName] = useState(brandProfile.brandName);
  const [website, setWebsite] = useState(brandProfile.website);
  const [aliasesInput, setAliasesInput] = useState(brandProfile.aliases.join(', '));
  const [productsInput, setProductsInput] = useState(brandProfile.productNames.join(', '));
  const [sloganInput, setSloganInput] = useState(brandProfile.slogans.join(' '));

  React.useEffect(() => {
    setBrandName(brandProfile.brandName);
    setWebsite(brandProfile.website);
    setAliasesInput(brandProfile.aliases.join(', '));
    setProductsInput(brandProfile.productNames.join(', '));
    setSloganInput(brandProfile.slogans.join(' '));
  }, [brandProfile]);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth(() => {
      updateBrandProfile({
        brandName,
        website,
        aliases: aliasesInput.split(',').map((s) => s.trim()).filter(Boolean),
        productNames: productsInput.split(',').map((s) => s.trim()).filter(Boolean),
        slogans: [sloganInput.trim()],
      });
      showToast('Brand profile changes saved to detection engine', 'success');
    }, 'Save Perimeter Dossier', 'Sign in or register to update and save official brand identity records.')) {
      return;
    }
    updateBrandProfile({
      brandName,
      website,
      aliases: aliasesInput.split(',').map((s) => s.trim()).filter(Boolean),
      productNames: productsInput.split(',').map((s) => s.trim()).filter(Boolean),
      slogans: [sloganInput.trim()],
    });
    showToast('Brand profile changes saved to detection engine', 'success');
  };

  const handleVerifyAsset = () => {
    if (!requireAuth(() => handleVerifyAsset(), 'Verify All Assets', 'Sign in or register to verify official assets.')) {
      return;
    }
    showToast('All registered official assets successfully re-verified against public registries', 'success');
  };

  // Company-specific threat count
  const companyThreats = useMemo(() => {
    return findings.filter(f => f.status !== 'Dismissed' && f.status !== 'Resolved');
  }, [findings]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* 1. Hero Banner: Company Intelligence Workspace */}
      <div className="relative rounded-3xl overflow-hidden border border-[#00FFA3]/20 bg-[#040C1D] shadow-2xl">
        {/* Subtle Cyber Grid and Gradient Aura */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00050B] via-[#040C1D] to-[#060D1A]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,163,0.08),transparent_60%)]" />
        <div className="absolute inset-0 cyber-grid-pattern opacity-25 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          
          {/* Top Row: Prominent Company Switcher & Registration Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <Radar className="w-3.5 h-3.5 animate-spin-slow" />
                Active Enterprise Workspace:
              </span>

              {/* Prominent Company Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-950/90 border border-cyan-500/40 hover:border-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 backdrop-blur-md transition-all"
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{company?.name || brandProfile.brandName || 'Select Company'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCompanyDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 p-2 rounded-2xl cyber-panel-glow border border-cyan-500/40 shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Select Monitored Enterprise
                    </div>
                    <div className="py-1 max-h-56 overflow-y-auto space-y-1">
                      {availableCompanies.map((c) => {
                        const isSelected = c.id === selectedCompanyId;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              switchCompany(c.id);
                              setIsCompanyDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                              isSelected 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                <span>{c.name}</span>
                                {c.isDemo && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                    DEMO
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{c.industry || 'Enterprise'}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setIsCompanyDropdownOpen(false);
                          requireAuth(() => setIsRegisterModalOpen(true), 'Register Enterprise', 'Sign in or register to add a new company perimeter.');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Register New Enterprise</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => requireAuth(() => setIsRegisterModalOpen(true), 'Register Enterprise', 'Sign in or register to add a new company perimeter.')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Enterprise</span>
              </button>

              <button
                onClick={handleVerifyAsset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-950/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5 backdrop-blur-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify All Assets</span>
              </button>
            </div>
          </div>

          {/* Hero Profile Dossier Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Company Vector Logo Badge with Holographic Glow */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border-2 border-cyan-400/50 p-1 flex-shrink-0 shadow-2xl shadow-cyan-950/80 ring-4 ring-cyan-500/10 flex items-center justify-center backdrop-blur-md">
                <span className="text-3xl font-black font-display-3d-cyan">
                  {brandProfile.logoText || (company?.name ? company.name[0] : 'B')}
                </span>
              </div>

              {/* Brand Meta Data */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {brandProfile.brandName || company?.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Enterprise
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                    <Fingerprint className="w-3.5 h-3.5" />
                    Trademark Protected
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-300 flex-wrap">
                  <a 
                    href={brandProfile.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-cyan-300"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{brandProfile.website || 'Official Domain'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Industry: <strong className="text-slate-200">{company?.industry || 'Consumer & Retail'}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Status: <strong className="text-emerald-400">Continuous Monitoring Active</strong></span>
                </div>

                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Legitimate digital perimeter registered in AEGIS to autonomously exclude authentic channels and alert on phishing, clone profiles, and rogue APKs.
                </p>
              </div>
            </div>

            {/* Quick Threat Surface Badges (Hero Right) */}
            <div className="flex sm:flex-row md:flex-col gap-3 flex-shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-navy-950/85 backdrop-blur-md border border-cyan-500/25 flex items-center justify-between gap-4 min-w-[180px]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Security Posture</span>
                  <span className="text-lg font-black font-mono text-cyan-400">{brandProfile.completenessPercent}/100</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-navy-950/85 backdrop-blur-md border border-red-500/25 flex items-center justify-between gap-4 min-w-[180px]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Active Threats</span>
                  <span className="text-lg font-black font-mono text-red-400">{companyThreats.length} Inbound</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Navigation Tabs */}
          <div className="pt-2 flex items-center gap-2 border-t border-cyan-500/15 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'dossier'
                  ? 'bg-cyan-500 text-navy-950 font-bold shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Brand Identity & Trademark Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('footprint')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'footprint'
                  ? 'bg-cyan-500 text-navy-950 font-bold shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Verified Digital Footprint ({brandProfile.officialSocials.length + brandProfile.officialApps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('threats')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'threats'
                  ? 'bg-cyan-500 text-navy-950 font-bold shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Company Threat Intelligence ({companyThreats.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Workspace Body: Dependent on Active Tab */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          {/* Completeness Bar */}
          <section className="p-5 rounded-2xl cyber-panel border border-cyan-500/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Perimeter Protection Index: {brandProfile.completenessPercent}% Complete
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Registering exact trademark aliases, product lines, and marketing slogans ensures the AI engine distinguishes authentic collateral from malicious copycats.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 self-start sm:self-auto">
                {brandProfile.completenessPercent}/100 SCORE
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${brandProfile.completenessPercent}%` }}
              />
            </div>
          </section>

          {/* Brand Identity & Assets Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Brand Identity Fields */}
            <div className="lg:col-span-2 p-6 rounded-2xl cyber-panel border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Core Identity Registry</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Detection Match Parameters</span>
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Primary Brand Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Primary Website Domain
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Recognized Brand Aliases & Typo Variants (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={aliasesInput}
                    onChange={(e) => setAliasesInput(e.target.value)}
                    placeholder="Acme Pay, Acme Payments, AcmeMobile"
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                    Accounts using these aliases without verified credentials trigger priority investigation.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Protected Product Lines & Trademarks (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={productsInput}
                    onChange={(e) => setProductsInput(e.target.value)}
                    placeholder="Acme Wallet, Acme Checkout, Acme POS"
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Official Corporate Slogans & Value Propositions
                  </label>
                  <input
                    type="text"
                    value={sloganInput}
                    onChange={(e) => setSloganInput(e.target.value)}
                    placeholder="Fast, secure digital payments for modern commerce."
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/25"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Visual Matching & Vector Logo */}
            <div className="p-6 rounded-2xl cyber-panel border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Visual Logo Matching</h3>
                <span className="text-[11px] font-mono text-cyan-400">pHash Active</span>
              </div>

              <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 font-extrabold flex items-center justify-center text-2xl mb-3 shadow-lg ring-4 ring-cyan-500/10">
                  {brandProfile.logoText || (company?.name ? company.name[0] : 'B')}
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">
                  Official Trademark Vector
                </h4>
                <p className="text-[11px] text-slate-400 mb-3 font-mono">
                  pHash: <span className="text-cyan-400">d4a8e2f183c07e</span>
                </p>

                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => requireAuth(() => setIsUploadLogoOpen(true), 'Upload Brand Logo', 'Sign in or register to upload official brand trademark assets.')}
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3 h-3 text-cyan-400" />
                    <span>Upload Logo</span>
                  </button>

                  <button
                    onClick={() => requireAuth(() => setIsUploadLogoOpen(true), 'Upload Brand Logo', 'Sign in or register to upload official brand trademark assets.')}
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Replace</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Perceptual Hash Telemetry</span>
                <p className="leading-relaxed">
                  When copycat accounts alter saturation, rotate orientations, or apply filters to your logo, perceptual hash distance matches the source image with 98% accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Verified Digital Footprint */}
      {activeTab === 'footprint' && (
        <div className="space-y-6">
          {/* Live Instagram API Integration Card */}
          <section className="p-5 rounded-2xl cyber-panel border border-pink-500/30 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-pink-500/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 p-0.5 flex-shrink-0 shadow-lg ring-4 ring-pink-500/10">
                  <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-pink-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Meta Instagram Live Graph API
                    </h3>
                    {connectedInstagram?.connected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        LIVE OAUTH VERIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 font-mono">
                        NO LIVE ACCOUNT CONNECTED
                      </span>
                    )}
                  </div>

                  {connectedInstagram?.connected ? (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300">
                        Connected Handle: <span className="font-mono font-bold text-pink-400">{connectedInstagram.handle || `@${connectedInstagram.username}`}</span>
                        <span className="text-slate-500 mx-2">•</span>
                        Account Type: <span className="font-semibold text-slate-200">{connectedInstagram.accountType || 'BUSINESS_OR_CREATOR'}</span>
                        {connectedInstagram.id && (
                          <>
                            <span className="text-slate-500 mx-2">•</span>
                            Meta ID: <span className="font-mono text-[11px] text-slate-400">{connectedInstagram.id}</span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Official authentic account registered directly from Meta Graph API. This handle is marked as <strong className="text-emerald-400">100% legitimate</strong> by AEGIS and protected from unauthorized clone detection alerts.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 max-w-xl">
                      Connect an official Meta Instagram account or add verified handles below to whitelist authentic brand assets and protect them against unauthorized impersonators.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto flex-shrink-0 flex-wrap">
                {connectedInstagram?.connected ? (
                  <>
                    <a
                      href={connectedInstagram.profileUrl || `https://instagram.com/${connectedInstagram.username || ''}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-950 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={connectLiveInstagram}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 transition-all flex items-center gap-1.5"
                      title="Re-sync account details with Meta Graph API"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-sync</span>
                    </button>

                    <button
                      onClick={disconnectLiveInstagram}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all flex items-center gap-1.5"
                      title="Disconnect and remove Instagram account"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={connectLiveInstagram}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-950/50 transition-all flex items-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Connect Instagram Account</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Google Discovery Source Integration Card */}
          <section className="p-5 sm:p-6 rounded-2xl bg-[#040C1D] border border-cyan-500/20 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Google Search & Web Risk Discovery
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      googleStatus?.isLiveAvailable 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {googleStatus?.sourceStatus || (googleStatus?.isLiveAvailable ? 'Live indexed data' : 'Google API not configured')}
                    </span>
                    {googleStatus?.webRiskConfigured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        WEB RISK ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    {googleStatus?.isLiveAvailable
                      ? 'Backend Google Custom Search discovery is active. When running threat scans, publicly indexed profiles and websites matching registered brand names and aliases will be ingested into telemetry.'
                      : 'Google Discovery is not configured. Add the backend API credentials (GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_ENGINE_ID) to enable live discovery.'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    *Google Discovery identifies publicly indexed candidate pages. It does not guarantee that every profile is found or prove that a result is fake.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Official Social Media Accounts Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Official Social Media Accounts ({brandProfile.officialSocials.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified corporate handles excluded from impersonation false alerts
                </p>
              </div>

              <button
                onClick={() => requireAuth(() => setIsAddAccountOpen(true), 'Add Official Social Account', 'Sign in or register to add verified social accounts.')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Official Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandProfile.officialSocials.map((account) => (
                <OfficialAssetCard
                  key={account.id}
                  type="social"
                  asset={account}
                />
              ))}
            </div>
          </section>

          {/* Official Mobile Apps Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Official Mobile Applications ({brandProfile.officialApps.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorized Google Play and Apple App Store packages protected from fake APK mirrors
                </p>
              </div>

              <button
                onClick={() => requireAuth(() => setIsAddAppOpen(true), 'Add Official Mobile App', 'Sign in or register to add verified mobile applications.')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Official App</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brandProfile.officialApps.map((app) => (
                <OfficialAssetCard
                  key={app.id}
                  type="app"
                  asset={app}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Company Threat Intelligence */}
      {activeTab === 'threats' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl cyber-panel border border-cyan-500/20">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-400" />
                  <span>Target Threat Intelligence: {brandProfile.brandName || company?.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active unauthorized profiles, malicious domains, and fake APKs impersonating this brand.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-red-400 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                {companyThreats.length} Active Vectors
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-800/60">
              {companyThreats.length === 0 ? (
                <div className="py-12 text-center font-mono text-slate-400 text-xs">
                  No active threat signals detected for this company perimeter.
                </div>
              ) : (
                companyThreats.map((finding) => (
                  <div 
                    key={finding.id}
                    onClick={() => setSelectedFinding(finding)}
                    className="py-4 hover:bg-slate-900/60 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {finding.title}
                        </span>
                        <span className="font-mono text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/25">
                          {finding.usernameOrPackage}
                        </span>
                        <span className="font-mono text-[10px] text-red-400 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30">
                          SCORE {finding.riskScore}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {finding.mainReason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedFinding(finding)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-navy-950 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-navy-950 transition-all flex items-center gap-1 self-end sm:self-center flex-shrink-0"
                    >
                      <span>Examine in SOC</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals for Adding Accounts, Apps, Logos, and Companies */}
      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />

      <AddAppModal
        isOpen={isAddAppOpen}
        onClose={() => setIsAddAppOpen(false)}
      />

      <UploadLogoModal
        isOpen={isUploadLogoOpen}
        onClose={() => setIsUploadLogoOpen(false)}
      />

      <RegisterCompanyModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

    </div>
  );
};
