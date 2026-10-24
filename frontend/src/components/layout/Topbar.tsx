import React, { useState, useEffect } from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  Calendar, 
  ShieldCheck, 
  User, 
  Sparkles,
  Bot,
  ExternalLink,
  Shield,
  Layers,
  Activity,
  LogIn
} from 'lucide-react';
import { AskBrandShieldModal } from '../assistant/AskBrandShieldModal';
import { CommandPaletteModal } from '../common/CommandPaletteModal';

interface TopbarProps {
  onToggleHud?: () => void;
  isHudActive?: boolean;
}

export type UserRole = 'Admin' | 'SOC Analyst' | 'Legal / Compliance' | 'Executive Auditor';

export const Topbar: React.FC<TopbarProps> = ({ onToggleHud, isHudActive }) => {
  const { 
    activePage, 
    searchQuery, 
    setSearchQuery, 
    sources, 
    brandProfile,
    findings,
    setSelectedFinding,
    user,
    company,
    logout,
    availableCompanies,
    selectedCompanyId,
    switchCompany,
    isDemoMode,
    isAuthenticated,
    openAuthModal,
  } = useBrandGuard();

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('SOC Analyst');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pageTitles: Record<string, string> = {
    home: 'Security Command Center',
    'check-link': 'Link Verification Lab',
    social: 'Social Threat Vectors',
    apps: 'Mobile Rogue App Radar',
    findings: 'Threat & Finding Matrix',
    'scan-results': 'Staged Attack Radar',
    'brand-profile': 'Digital Perimeter Profile',
    settings: 'SOC System Parameters',
    watchlist: 'Pre-emptive Watchlist',
    'scam-analyzer': 'Scam Script Analyzer',
    'unicode-xray': 'Unicode Spoof Lab',
    'warning-kit': 'Advisory Warning Kit',
    'board-report': 'Executive Intelligence Report',
    'alert-preview': 'Alert Dispatcher',
  };

  const currentDateFormatted = 'Wed, 14 Aug 2026';
  const recentAlerts = findings.slice(0, 4);

  return (
    <header className="h-16 px-6 bg-[#00050B] border-b border-cyan-950/80 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* 1. Left: Brand Title & Active View */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-white tracking-wide font-sans">
            {pageTitles[activePage] || 'Security Command Center'}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3] animate-pulse" />
        </div>
      </div>

      {/* 2. Center: Quick Search Bar & AI Analyst Button */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="relative w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#040C1D] border border-[#00FFA3]/20 hover:border-[#00FFA3]/50 text-xs text-slate-400 font-mono transition-all text-left shadow-inner group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#00FFA3] shrink-0" />
            <span className="truncate group-hover:text-white transition-colors">Quick command / search threats...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[#060D1A] border border-[#00FFA3]/30 text-[10px] text-[#00FFA3] font-bold font-mono">
            ⌘K
          </kbd>
        </button>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 border border-[#00FFA3]/30 text-[#00FFA3] text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
          title="Open AI Threat Intelligence Analyst"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">AI Analyst</span>
        </button>
      </div>

      {/* 3. Right: Date Filter Pill, Notifications, Operator Profile */}
      <div className="flex items-center gap-3">
        {/* Date Filter Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#040C1D] border border-cyan-950/90 text-xs text-slate-300 font-mono shadow-inner">
          <Calendar className="w-3.5 h-3.5 text-[#00FFA3]" />
          <span className="text-[11px]">{currentDateFormatted}</span>
        </div>

        {/* Search trigger on mobile */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notification Bell with Cyan Dot */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-9 h-9 rounded-xl bg-[#040C1D] hover:bg-[#060D1A] border border-cyan-950/90 hover:border-[#00FFA3]/30 text-slate-300 hover:text-white flex items-center justify-center transition-all relative"
            title="Active Security Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 p-3 rounded-2xl bg-[#040C1D] border border-[#00FFA3]/30 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
                <span className="text-xs font-semibold text-white">Live Threat Alerts</span>
                <span className="text-[10px] font-mono text-[#00FFA3]">{recentAlerts.length} Active</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {recentAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => {
                      setSelectedFinding(alt);
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2 rounded-xl bg-[#060D1A] hover:bg-[#102048] border border-cyan-950 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="text-[#00FFA3] font-mono">{alt.platform || alt.type}</span>
                      <span>{alt.detectedTime || 'Just now'}</span>
                    </div>
                    <p className="text-xs text-white font-medium truncate mt-0.5">{alt.candidateUrl || alt.usernameOrPackage || alt.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile or Guest Mode Indicator */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2.5 font-mono">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[10px] text-[#00FFA3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
              <span>GUEST EXPLORER</span>
            </div>
            <button
              onClick={() => openAuthModal('Session Authentication', 'Sign in or register your company to unlock full incident remediation and custom scans.')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)] flex items-center gap-1.5 border border-white/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-[#040C1D] hover:bg-[#060D1A] border border-cyan-950/90 hover:border-[#00FFA3]/30 transition-all"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FFA3]/20 to-[#00E88F]/10 border border-[#00FFA3]/40 text-[#00FFA3] flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || company?.name?.charAt(0) || 'C'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00FFA3] ring-2 ring-[#00050B]" />
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight font-sans">
                  {user?.name || company?.name || 'SecOps Lead'}
                </span>
                <span className="text-[9px] font-mono text-[#00FFA3]">CYVANTA SOC</span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Menu Popover */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#040C1D] border border-[#00FFA3]/30 shadow-2xl backdrop-blur-2xl z-50">
                <div className="p-2 border-b border-cyan-950">
                  <p className="text-xs font-bold text-white">{user?.name || 'Security Analyst'}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{user?.email || 'analyst@cyvanta.corp'}</p>
                </div>

                {/* RBAC Role Switcher */}
                <div className="py-1 border-b border-cyan-950">
                  <span className="text-[9px] font-mono uppercase text-slate-500 px-2">Active Persona / RBAC:</span>
                  {(['SOC Analyst', 'Admin', 'Legal / Compliance', 'Executive Auditor'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setActiveRole(r);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                        r === activeRole ? 'text-[#00FFA3] bg-[#00FFA3]/10 font-bold' : 'text-slate-400 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>{r}</span>
                      {r === activeRole && <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />}
                    </button>
                  ))}
                </div>

                {availableCompanies.length > 1 && (
                  <div className="py-1 border-b border-cyan-950">
                    <span className="text-[9px] font-mono uppercase text-slate-500 px-2">Switch Tenant:</span>
                    {availableCompanies.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          switchCompany(c.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          c.id === selectedCompanyId ? 'text-[#00FFA3] bg-[#00FFA3]/10' : 'text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1 font-mono"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ask BrandShield AI Modal */}
      <AskBrandShieldModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </header>
  );
};
