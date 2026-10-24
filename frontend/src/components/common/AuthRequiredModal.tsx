import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogIn, 
  Building2, 
  Zap, 
  X, 
  ArrowRight, 
  AlertCircle,
  Sparkles,
  KeyRound,
  Eye
} from 'lucide-react';
import { useBrandGuard } from '../../context/BrandGuardContext';

export const AuthRequiredModal: React.FC = () => {
  const { 
    authModalState, 
    closeAuthModal, 
    setViewMode, 
    login, 
    showToast 
  } = useBrandGuard();

  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  if (!authModalState.isOpen) return null;

  const handleSignIn = () => {
    closeAuthModal();
    setViewMode('login');
  };

  const handleRegister = () => {
    closeAuthModal();
    setViewMode('onboarding');
  };

  const handleDemoAccess = async () => {
    setIsLoadingDemo(true);
    try {
      await login('alex.mercer@acmepay.com', 'password123');
      showToast('Authenticated as Alex Mercer (Demo SOC Lead). Action unlocked!', 'success');
      
      const callback = authModalState.onSuccess;
      closeAuthModal();
      
      if (callback) {
        try {
          await callback();
        } catch {
          // Callback handled its own error
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Demo authentication failed.', 'error');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00050B]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#020713]/95 border border-[#00FFA3]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,255,163,0.18)] overflow-hidden text-slate-100">
        
        {/* Cyber Neon Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#00FFA3]/15 via-[#00E5FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors z-10"
          title="Continue Browsing as Guest"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FFA3]/20 via-[#00E5FF]/15 to-transparent border border-[#00FFA3]/40 flex items-center justify-center text-[#00FFA3] shadow-[0_0_20px_rgba(0,255,163,0.25)] shrink-0">
            <Lock className="w-6 h-6 text-[#00FFA3]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[10px] font-mono text-[#00FFA3] mb-1.5 uppercase tracking-wider">
              <Eye className="w-3 h-3 text-[#00FFA3]" />
              Guest Exploration Mode
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Authentication Required
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              You are exploring BrandGuard features in read-only guest mode. To perform actions, choose an option to continue:
            </p>
          </div>
        </div>

        {/* Action Badge Notice */}
        {authModalState.actionTitle && (
          <div className="mb-5 p-3 rounded-xl bg-[#00050B] border border-cyan-950 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Target Action:</span>
            <span className="text-[#00FFA3] font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#00FFA3]" />
              {authModalState.actionTitle}
            </span>
          </div>
        )}

        {/* 3 Main Choice Cards */}
        <div className="space-y-3 mb-6 relative z-10">
          
          {/* Option 1: Sign In */}
          <button
            onClick={handleSignIn}
            className="w-full p-3.5 rounded-2xl bg-[#040C1D] hover:bg-[#061229] border border-cyan-900/60 hover:border-[#00FFA3]/50 transition-all text-left flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-[#00FFA3]/15 border border-slate-700/80 group-hover:border-[#00FFA3]/40 flex items-center justify-center text-slate-300 group-hover:text-[#00FFA3] transition-colors shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#00FFA3] transition-colors flex items-center gap-2">
                  <span>Sign In with Account</span>
                  <span className="text-[9px] font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Existing User
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Log in with your verified SecOps email and password
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00FFA3] group-hover:translate-x-1 transition-all" />
          </button>

          {/* Option 2: Register / Sign Up */}
          <button
            onClick={handleRegister}
            className="w-full p-3.5 rounded-2xl bg-[#040C1D] hover:bg-[#061229] border border-cyan-900/60 hover:border-[#00E5FF]/50 transition-all text-left flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-[#00E5FF]/15 border border-slate-700/80 group-hover:border-[#00E5FF]/40 flex items-center justify-center text-slate-300 group-hover:text-[#00E5FF] transition-colors shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors flex items-center gap-2">
                  <span>Register Company</span>
                  <span className="text-[9px] font-mono font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    New Perimeter
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Set up your brand identity and official digital assets
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00E5FF] group-hover:translate-x-1 transition-all" />
          </button>

          {/* Option 3: Instant One-Click Demo Analyst Access */}
          <button
            onClick={handleDemoAccess}
            disabled={isLoadingDemo}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#00FFA3]/10 via-[#00E5FF]/10 to-[#040C1D] hover:from-[#00FFA3]/20 hover:via-[#00E5FF]/20 border border-[#00FFA3]/40 hover:border-[#00FFA3] transition-all text-left flex items-center justify-between group shadow-[0_0_20px_rgba(0,255,163,0.15)]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/20 border border-[#00FFA3]/40 flex items-center justify-center text-[#00FFA3] shrink-0 shadow-[0_0_12px_rgba(0,255,163,0.3)]">
                {isLoadingDemo ? (
                  <div className="w-4 h-4 border-2 border-[#00FFA3]/30 border-t-[#00FFA3] rounded-full animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 text-[#00FFA3]" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#00FFA3] transition-colors flex items-center gap-2">
                  <span>One-Click Demo Analyst</span>
                  <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40">
                    Instant Trial
                  </span>
                </div>
                <p className="text-[11px] text-[#00FFA3]/80 mt-0.5 font-mono">
                  alex.mercer@acmepay.com (AcmePay SOC Lead)
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#00FFA3] group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        {/* Modal Footer / Continue Exploring */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Want to keep browsing?
          </span>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  );
};
