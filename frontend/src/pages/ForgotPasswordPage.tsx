import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { api } from '../services/api';
import { Shield, Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { SpotlightCard } from '../components/common/SpotlightCard';

export const ForgotPasswordPage: React.FC = () => {
  const { setViewMode } = useBrandGuard();
  const [email, setEmail] = useState('alex.mercer@acmepay.com');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await api.forgotPassword(email);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Unable to process reset request. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050B] text-slate-100 flex flex-col justify-between selection:bg-[#00FFA3]/30 relative overflow-hidden">
      {/* Background Cyber Ambient Overlays */}
      <div className="pointer-events-none fixed inset-0 cyber-grid-pattern opacity-25" />

      {/* Top bar */}
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
              Digital Risk Protection
            </span>
          </div>
        </button>

        <button
          onClick={() => setViewMode('login')}
          className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign in</span>
        </button>
      </header>

      {/* Main card */}
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
                Credential Recovery
              </h1>
              <p className="text-xs text-slate-400">
                Enter your corporate email address to receive secure session restoration instructions.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-9 h-9 text-[#00FFA3] mx-auto" />
                <h3 className="text-sm font-bold text-white font-mono">DISPATCH CONFIRMED</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {successMessage}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setViewMode('login')}
                    className="px-5 py-2.5 rounded-xl bg-[#00050B] hover:bg-[#020713] border border-[#00FFA3]/30 text-xs font-semibold text-[#00FFA3]"
                  >
                    Return to Sign in
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Registered Work Email
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#00FFA3] via-[#00E5FF] to-[#00E5FF] text-black text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0, 255, 163,0.3)] hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <span>Send recovery instructions</span>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-slate-400">
              <span>Remembered your password? </span>
              <button
                onClick={() => setViewMode('login')}
                className="text-[#00FFA3] hover:text-[#00E5FF] font-semibold transition-colors"
              >
                Sign in
              </button>
            </div>
          </SpotlightCard>
        </div>
      </main>

      <footer className="py-6 text-center text-[11px] font-mono text-slate-500 relative z-10">
        BrandGuard Security Cloud &bull; Encrypted Token Handshake
      </footer>
    </div>
  );
};
