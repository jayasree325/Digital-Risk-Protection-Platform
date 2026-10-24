import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  Share2, 
  Smartphone, 
  Globe, 
  Upload,
  Info,
  Check
} from 'lucide-react';

import { SpotlightCard } from '../components/common/SpotlightCard';

export const OnboardingWizardPage: React.FC = () => {
  const { 
    brandProfile, 
    updateBrandProfile, 
    completeOnboarding, 
    setViewMode,
    onboardingStep,
    setOnboardingStep,
    showToast,
    register
  } = useBrandGuard();

  // Local step form state prefilled with initial profile
  const [companyName, setCompanyName] = useState(brandProfile.companyName || 'AcmePay Technologies Inc.');
  const [website, setWebsite] = useState(brandProfile.website || 'acmepay.com');
  const [companyEmail, setCompanyEmail] = useState(brandProfile.companyEmail || 'security@acmepay.com');
  const [password, setPassword] = useState('password123');
  const [industry, setIndustry] = useState(brandProfile.industry || 'Financial Technology & Payments');

  // Step 2
  const [brandName, setBrandName] = useState(brandProfile.brandName || 'AcmePay');
  const [aliases, setAliases] = useState(brandProfile.aliases.join(', ') || 'Acme Pay, Acme Payments');
  const [products, setProducts] = useState(brandProfile.productNames.join(', ') || 'Acme Wallet, AcmePay Mobile');
  const [slogans, setSlogans] = useState(brandProfile.slogans.join(' ') || 'Fast, secure digital payments for modern commerce.');
  const [logoText, setLogoText] = useState(brandProfile.logoText || 'AP');

  // Step 3
  const [socialUrl, setSocialUrl] = useState('https://x.com/acmepay');
  const [socialAccountId, setSocialAccountId] = useState('x_88192039');
  const [appLink, setAppLink] = useState('https://play.google.com/store/apps/details?id=com.acmepay.mobile');
  const [packageId, setPackageId] = useState('com.acmepay.mobile');
  const [publisher, setPublisher] = useState('AcmePay Technologies');

  // Step 4 verification flag
  const [isAssetsVerified, setIsAssetsVerified] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist changes on step advance
    if (onboardingStep === 1) {
      updateBrandProfile({ companyName, website, companyEmail, industry });
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      updateBrandProfile({
        brandName,
        aliases: aliases.split(',').map((s) => s.trim()).filter(Boolean),
        productNames: products.split(',').map((s) => s.trim()).filter(Boolean),
        slogans: [slogans.trim()],
        logoText: logoText.toUpperCase().slice(0, 3),
      });
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      setOnboardingStep(4);
    }
  };

  const handleBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    } else {
      setViewMode('landing');
    }
  };

  const handleVerifyAssets = () => {
    setIsAssetsVerified(true);
    showToast('Official assets verified successfully!', 'success');
  };

  const handleFinish = async () => {
    try {
      await register({
        name: brandName + ' Administrator',
        email: companyEmail,
        password: password || 'password123',
        companyName,
        website,
        industry,
      });
    } catch {
      completeOnboarding();
    }
  };

  return (
    <div className="min-h-screen bg-[#00050B] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Haikei gradient mesh */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#00FFA3]/10 via-[#00E5FF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#00E5FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="h-16 px-6 lg:px-12 bg-[#00050B]/90 backdrop-blur-xl border-b border-[#00FFA3]/20 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.2)]">
            <ShieldCheck className="w-5 h-5 text-[#00FFA3]" />
          </div>
          <div>
            <span className="font-black text-white text-sm tracking-wider">BrandGuard</span>
            <span className="text-xs font-mono text-[#00FFA3] ml-2">[SETUP_WIZARD]</span>
          </div>
        </div>

        <button
          onClick={() => setViewMode('landing')}
          className="text-xs text-slate-400 hover:text-white transition-colors btn-smooth"
        >
          Exit to website
        </button>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <SpotlightCard
          enable3DTilt={false}
          spotlightColor="rgba(6, 182, 212, 0.15)"
          className="w-full max-w-2xl unlumen-card border border-cyan-500/25 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 min-h-[580px]"
        >
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-cyan-400 font-mono">
                [STEP {onboardingStep} OF 4]
              </span>
              <span className="text-slate-400 font-medium">
                {onboardingStep === 1 && 'Company Details'}
                {onboardingStep === 2 && 'Brand Identity'}
                {onboardingStep === 3 && 'Official Digital Assets'}
                {onboardingStep === 4 && 'Review and Verify'}
              </span>
            </div>

            {/* Step Bar */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step <= onboardingStep ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Company details */}
          {onboardingStep === 1 && (
            <form onSubmit={handleNext} className="space-y-5 text-xs">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Company details</h2>
                <p className="text-slate-400">
                  Enter your official legal name and primary web domain.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="AcmePay Technologies Inc."
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Official website
                  </label>
                  <input
                    type="text"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="acmepay.com"
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Work email
                    </label>
                    <input
                      type="email"
                      required
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="security@acmepay.com"
                      className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Financial Technology & Payments">Financial Technology & Payments</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                      <option value="Enterprise SaaS">Enterprise SaaS</option>
                      <option value="Media & Entertainment">Media & Entertainment</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Brand identity */}
          {onboardingStep === 2 && (
            <form onSubmit={handleNext} className="space-y-5 text-xs">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Brand identity</h2>
                <p className="text-slate-400">
                  Register recognized names and slogans to prevent typosquatting and visual clones.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">
                      Brand name
                    </label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="AcmePay"
                      className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Logo initials
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={3}
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                        className="w-16 bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-center text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                      />
                      <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/40">
                        {logoText || 'AP'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Alternative names and aliases (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={aliases}
                    onChange={(e) => setAliases(e.target.value)}
                    placeholder="Acme Pay, Acme Payments"
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Helps us detect character swaps like AcmeePay or added words.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Product names (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={products}
                    onChange={(e) => setProducts(e.target.value)}
                    placeholder="Acme Wallet, AcmePay Mobile"
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Slogans
                  </label>
                  <input
                    type="text"
                    value={slogans}
                    onChange={(e) => setSlogans(e.target.value)}
                    placeholder="Fast, secure digital payments for modern commerce."
                    className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <span>Save and continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Official digital assets */}
          {onboardingStep === 3 && (
            <form onSubmit={handleNext} className="space-y-5 text-xs">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Official digital assets</h2>
                <p className="text-slate-400">
                  Register your legitimate channels so we can exempt them from scanning alerts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Share2 className="w-4 h-4" />
                    <span>Official social channel</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">
                        Official social profile URL
                      </label>
                      <input
                        type="url"
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="https://x.com/acmepay"
                        className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">
                        Social account ID
                      </label>
                      <input
                        type="text"
                        value={socialAccountId}
                        onChange={(e) => setSocialAccountId(e.target.value)}
                        placeholder="x_88192039"
                        className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>Official mobile application</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">
                        Official mobile-app link
                      </label>
                      <input
                        type="url"
                        value={appLink}
                        onChange={(e) => setAppLink(e.target.value)}
                        placeholder="https://play.google.com/store/apps/details?id=com.acmepay.mobile"
                        className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-medium mb-1">
                          Package ID or bundle ID
                        </label>
                        <input
                          type="text"
                          value={packageId}
                          onChange={(e) => setPackageId(e.target.value)}
                          placeholder="com.acmepay.mobile"
                          className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-medium mb-1">
                          Official developer or publisher
                        </label>
                        <input
                          type="text"
                          value={publisher}
                          onChange={(e) => setPublisher(e.target.value)}
                          placeholder="AcmePay Technologies"
                          className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Review and verify */}
          {onboardingStep === 4 && (
            <div className="space-y-5 text-xs">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Review and verify</h2>
                <p className="text-slate-400">
                  Confirm your registered official brand references before starting monitoring.
                </p>
              </div>

              {/* Required Explanation Box */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-slate-200 leading-relaxed flex items-start gap-3">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  “We use your official accounts and apps as trusted references. This helps us find possible fake ones and avoid flagging your genuine assets.”
                </p>
              </div>

              {/* Review Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Website */}
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-semibold text-white block">Website</span>
                      <span className="text-[11px] text-slate-400 font-mono">{website}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verified official
                  </span>
                </div>

                {/* Logo */}
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                      {logoText}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">Logo Asset</span>
                      <span className="text-[11px] text-slate-400">pHash Generated</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verified official
                  </span>
                </div>

                {/* Social accounts */}
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-semibold text-white block">Social accounts</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">{socialUrl}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verified official
                  </span>
                </div>

                {/* Mobile apps */}
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-semibold text-white block">Mobile apps</span>
                      <span className="text-[11px] text-slate-400 font-mono truncate max-w-[140px] block">{packageId}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verified official
                  </span>
                </div>

                {/* Publisher */}
                <div className="p-3.5 rounded-xl bg-[#00050B] border border-slate-800 flex items-center justify-between sm:col-span-2">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-[#00FFA3]" />
                    <div>
                      <span className="font-semibold text-white block">Official publisher</span>
                      <span className="text-[11px] text-slate-400">{publisher}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verified official
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
                >
                  Back
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {!isAssetsVerified ? (
                    <button
                      type="button"
                      onClick={handleVerifyAssets}
                      className="px-4 py-2.5 rounded-xl font-semibold bg-navy-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verify official assets</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Assets verified</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-950/60"
                  >
                    <span>Start monitoring</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </SpotlightCard>
      </main>
    </div>
  );
};
