import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  FileText,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { SpotlightCard } from '../components/common/SpotlightCard';

export const LoginPage: React.FC = () => {
  const { login, setViewMode } = useBrandGuard();
  const [email, setEmail] = useState('alex.mercer@acmepay.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'agreement' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTermsError(false);

    if (!acceptedTerms) {
      setTermsError(true);
      setError('You must read and agree to the Privacy Policy and User Agreement to enter.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'The email or password is incorrect. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('alex.mercer@acmepay.com');
    setPassword('password123');
    setAcceptedTerms(true);
    setTermsError(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 haikei-mesh-bg relative overflow-hidden">
      {/* Background Cyber Ambient Overlays */}
      <div className="pointer-events-none fixed inset-0 cyber-grid-pattern opacity-25" />

      {/* Top bar with Unlumen UI Glass Polish */}
      <header className="h-20 px-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <button
          onClick={() => setViewMode('landing')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FFA3] to-[#00E5FF] flex items-center justify-center shadow-[0_0_20px_rgba(0, 255, 163,0.3)] group-hover:scale-105 transition-transform border border-[#00FFA3]/50">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-bold text-xl block leading-tight text-white tracking-wider">BrandGuard</span>
            <span className="text-[10px] text-[#00FFA3] font-mono font-medium tracking-wider uppercase block">
              Enterprise Risk Gateway
            </span>
          </div>
        </button>

        <button
          onClick={() => setViewMode('landing')}
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Authenticate Session Card Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <SpotlightCard 
            enable3DTilt={false}
            className="p-8 shadow-2xl relative bg-[#020713]/95 border border-[#00FFA3]/30" 
            showCornerAccents={true}
          >
            <div className="mb-7 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] mb-3 shadow-[0_0_15px_rgba(0, 255, 163,0.2)]">
                <KeyRound className="w-6 h-6 text-[#00FFA3]" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5 font-display-3d">
                Authenticate Session
              </h1>
              <p className="text-xs text-slate-400">
                Enter your verified credentials to enter the SecOps threat intelligence portal.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#00050B] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setViewMode('forgot-password')}
                    className="text-[11px] text-[#00FFA3] hover:text-[#00E5FF] transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#00050B] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Privacy Policy & User Agreement Tick Box */}
              <div className="pt-1 pb-1">
                <label className={`flex items-start gap-2.5 text-xs cursor-pointer select-none p-2.5 rounded-xl transition-all border ${
                  termsError 
                    ? 'bg-red-950/30 border-red-500/50 text-red-200' 
                    : 'bg-[#00050B]/60 border-slate-800 hover:border-[#00FFA3]/40 text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    id="login-terms-checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (termsError) setTermsError(false);
                      if (error && error.includes('Privacy Policy')) setError(null);
                    }}
                    className="mt-0.5 rounded bg-[#00050B] border-slate-700 text-[#00FFA3] focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer accent-[#00FFA3]"
                  />
                  <span className="leading-relaxed text-[11px] text-slate-300">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveLegalModal('privacy');
                      }}
                      className="text-[#00FFA3] underline hover:text-[#00E5FF] font-semibold"
                    >
                      Privacy Policy
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveLegalModal('agreement');
                      }}
                      className="text-[#00FFA3] underline hover:text-[#00E5FF] font-semibold"
                    >
                      User Agreement
                    </button>
                    .
                  </span>
                </label>
                {termsError && (
                  <p className="text-[10px] text-red-400 font-mono mt-1 px-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Required: Check this box to confirm agreement before entering.</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00FFA3] via-[#00E5FF] to-[#00E5FF] text-black text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0, 255, 163,0.3)] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Verifying session handshake...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Pill with Monospace Retro Indicator */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
              <p className="text-xs text-slate-300 font-medium">
                Use the pre-filled demo account to explore the workspace.
              </p>
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00050B] hover:bg-[#040C1D] border border-[#00FFA3]/20 hover:border-[#00FFA3]/50 text-[11px] text-slate-300 transition-colors cursor-pointer group"
                title="Click to auto-fill demo credentials and accept terms"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFA3] group-hover:scale-110 transition-transform" />
                <span>Demo Analyst:</span>
                <code className="text-[#00FFA3] font-mono">alex.mercer@acmepay.com</code>
              </button>
            </div>

            <div className="mt-5 text-center text-xs text-slate-400">
              <span>Don't have an enterprise account? </span>
              <button
                onClick={() => setViewMode('onboarding')}
                className="text-[#00FFA3] hover:text-[#00E5FF] font-semibold transition-colors"
              >
                Register your company
              </button>
            </div>
          </SpotlightCard>
        </div>
      </main>

      {/* Footer note */}
      <footer className="py-6 text-center text-[11px] font-mono text-slate-500 relative z-10">
        BrandGuard Security Cloud &bull; TLS 1.3 &bull; AES-256 Encrypted Session Handshake
      </footer>

      {/* Privacy Policy & User Agreement Modal */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#040C1D] border border-[#00FFA3]/30 shadow-2xl flex flex-col overflow-hidden text-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#00050B]/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3]">
                  {activeLegalModal === 'privacy' ? (
                    <Shield className="w-5 h-5 text-[#00FFA3]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#00FFA3]" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                    {activeLegalModal === 'privacy' ? 'BrandGuard Privacy Policy' : 'BrandGuard Enterprise User Agreement'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    SecOps Compliance Version 2026.4 &bull; Effective Immediately
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300 font-sans">
              {activeLegalModal === 'privacy' ? (
                <>
                  <div className="p-3.5 rounded-xl bg-[#00FFA3]/5 border border-[#00FFA3]/20 text-[11px] text-[#00FFA3]">
                    <strong>Executive Privacy Commitment:</strong> BrandGuard processes digital threat indicators exclusively to protect registered brands against trademark infringement, phishing campaigns, executive impersonation, and fraudulent mobile apps.
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">1. Scope of Data Ingestion</h4>
                    <p className="text-slate-400">
                      BrandGuard collects public registry information (WHOIS, DNS records, Certificate Transparency logs), social media profile metadata, and mobile store listings. We do not inspect private communications or internal employee personal data.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">2. Threat Telemetry Processing</h4>
                    <p className="text-slate-400">
                      All suspicious domains and phishing scripts analyzed through the platform are tokenized and hashed using SHA-256 digests. Evidence records are immutable and stored with cryptographic signatures to ensure forensic admissibility.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">3. Confidentiality & Security Measures</h4>
                    <p className="text-slate-400">
                      All analyst interactions are encrypted with TLS 1.3 in transit and AES-256-GCM at rest. Role-based access control (RBAC) ensures only authorized team members can access brand threat queues and dispatch registrar takedown requests.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">4. User Rights & Data Deletion</h4>
                    <p className="text-slate-400">
                      Users retain the full right to delete their accounts and revoke personal credentials at any time via the Settings console. Account deletion permanently erases authentication keys, session tokens, and analyst preferences within 24 hours.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-[11px] text-[#00E5FF]">
                    <strong>Authorized SecOps Platform Agreement:</strong> By accessing BrandGuard, you acknowledge you are an authorized representative of your organization with authority to manage brand assets and review intellectual property threats.
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">1. Lawful Threat Neutralization</h4>
                    <p className="text-slate-400">
                      You agree to utilize automated takedown packets, abuse notices, and registry escalations only against genuine bad-faith impersonators, trademark infringers, and malicious infrastructure. You will not submit false or deceptive takedowns.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">2. Credential Governance</h4>
                    <p className="text-slate-400">
                      You are responsible for safeguarding your authentication credentials. Sharing credentials outside authorized SOC personnel is prohibited. Users can change passwords or rotate authentication secrets at any time in Settings.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">3. Automated AI & Scanning Advisory</h4>
                    <p className="text-slate-400">
                      Automated threat scores, logo similarity diffs, and machine-learning classifications serve as decision-support telemetry for analysts. Final enforcement actions remain subject to human verification and policy review.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white font-mono uppercase mb-1">4. Termination & Account Deletion</h4>
                    <p className="text-slate-400">
                      Either party may terminate platform access at will. Users can permanently delete their account directly within platform Settings with immediate effect.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-[#00050B]/90 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Clicking Agree will mark the checkbox on the sign-in form.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveLegalModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedTerms(true);
                    setTermsError(false);
                    if (error && error.includes('Privacy Policy')) setError(null);
                    setActiveLegalModal(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold font-mono bg-[#00FFA3] hover:bg-[#00E88F] text-[#00050B] transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)]"
                >
                  I AGREE &amp; ACCEPT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
