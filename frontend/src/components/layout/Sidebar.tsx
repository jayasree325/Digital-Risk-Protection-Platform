import React, { useState } from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { PageId } from '../../types';
import { 
  ShieldCheck, 
  Home, 
  Radar, 
  ShieldAlert, 
  Link2, 
  Building2, 
  Shield, 
  FileSearch, 
  Code2, 
  Megaphone, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Activity,
  LogIn
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    counts, 
    isSidebarCollapsed, 
    toggleSidebar,
    resetDemoData,
    setViewMode,
    logout,
    company,
    isDemoMode,
    isAuthenticated,
    openAuthModal,
  } = useBrandGuard();

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Video 1 Navigation Dock Items
  const navItems = [
    { id: 'home' as PageId, label: 'Command Center', icon: Home, badge: undefined },
    { 
      id: 'findings' as PageId, 
      label: 'Active Threats', 
      icon: ShieldAlert, 
      badge: counts.open || 2, 
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
    },
    { 
      id: 'scan-results' as PageId, 
      label: 'Telemetry Radar', 
      icon: Radar, 
      badge: 'LIVE', 
      badgeColor: 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30' 
    },
    { id: 'check-link' as PageId, label: 'Check Suspicious Link', icon: Link2, badge: undefined },
    { id: 'brand-profile' as PageId, label: 'Asset Perimeter', icon: Building2, badge: undefined },
    { id: 'watchlist' as PageId, label: 'Pre-emptive Watchlist', icon: Shield, badge: undefined },
    { id: 'scam-analyzer' as PageId, label: 'Scam Script Analyzer', icon: FileSearch, badge: undefined },
    { id: 'unicode-xray' as PageId, label: 'Unicode X-Ray', icon: Code2, badge: undefined },
    { id: 'board-report' as PageId, label: 'Board Intelligence', icon: FileText, badge: undefined },
    { id: 'alert-preview' as PageId, label: 'Alert Notification Kit', icon: Bell, badge: undefined },
  ];

  return (
    <aside 
      className={`relative flex flex-col h-screen bg-[#00050B] border-r border-cyan-950/80 shadow-[4px_0_35px_rgba(0,0,0,0.9)] transition-all duration-300 z-30 select-none ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* 1. Brand Header (Video 2 icon emblem) */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-cyan-950/80 bg-[#00050B] relative">
        <div 
          onClick={() => setViewMode('landing')}
          className="flex items-center gap-3 overflow-hidden cursor-pointer group"
          title="Return to BrandGuard landing page"
        >
          {/* Glowing Cyan Hexagonal Shield Emblem */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00FFA3]/20 via-[#00E88F]/10 to-[#00050B] border border-[#00FFA3]/40 text-[#00FFA3] shadow-[0_0_15px_rgba(0, 255, 163,0.25)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:border-[#00FFA3] transition-all">
            <ShieldCheck className="w-5 h-5 text-[#00FFA3]" />
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  Cyvanta
                </span>
                <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 truncate tracking-wider">
                COMMAND CENTER
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Navigation Items (Video 2 sleek vertical icon dock) */}
      <nav className="flex-1 py-4 px-2.5 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'findings' && (activePage === 'social' || activePage === 'apps'));

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 rounded-2xl text-xs transition-all duration-200 relative group ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5 justify-between'
              } ${
                isActive
                  ? 'bg-[#040C1D] text-white border border-[#00FFA3]/40 shadow-[0_0_18px_rgba(0, 255, 163,0.18)] font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#040C1D]/50 border border-transparent'
              }`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'text-[#00FFA3] drop-shadow-[0_0_8px_rgba(0, 255, 163,0.8)]'
                      : 'text-slate-400 group-hover:text-[#00FFA3]'
                  }`}
                />
                {!isSidebarCollapsed && (
                  <span className="truncate text-left text-xs font-medium font-sans">
                    {item.label}
                  </span>
                )}
              </div>

              {/* Badges */}
              {!isSidebarCollapsed && item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed hover */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#040C1D] border border-[#00FFA3]/30 text-white text-xs font-mono shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                  {item.badge && <span className="ml-2 text-[#00FFA3]">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Bottom Footer Controls (Settings, Sound, Logout) */}
      <div className="p-2.5 border-t border-cyan-950/80 bg-[#00050B] space-y-1">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-full flex items-center gap-3 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#040C1D]/60 transition-colors ${
            isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-start'
          }`}
          title={soundEnabled ? 'Mute Audio Telemetry' : 'Enable Audio Telemetry'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#00FFA3] flex-shrink-0" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500 flex-shrink-0" />
          )}
          {!isSidebarCollapsed && <span className="text-[11px] font-sans">Audio FX</span>}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActivePage('settings')}
          className={`w-full flex items-center gap-3 rounded-xl text-xs transition-colors ${
            isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-start'
          } ${
            activePage === 'settings'
              ? 'bg-[#040C1D] text-[#00FFA3] border border-[#00FFA3]/30 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-[#040C1D]/60'
          }`}
          title="System Settings"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="text-[11px] font-sans">Settings</span>}
        </button>

        {/* Reset Demo State (if in demo mode) */}
        {isDemoMode && (
          <button
            onClick={resetDemoData}
            className={`w-full flex items-center gap-3 rounded-xl text-xs text-amber-400 hover:text-amber-200 hover:bg-amber-500/10 transition-colors ${
              isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-start'
            }`}
            title="Reset Simulated Threat Stream"
          >
            <RotateCcw className="w-4 h-4 flex-shrink-0 text-amber-400" />
            {!isSidebarCollapsed && <span className="font-mono text-[10px]">Reset Stream</span>}
          </button>
        )}

        {/* Sign In / Register (for Guests) or Logout (for Authed Users) */}
        {!isAuthenticated ? (
          <>
            <button
              onClick={() => openAuthModal('Session Authentication', 'Sign in or register your company to unlock automated takedowns and custom scans.')}
              className={`w-full flex items-center gap-3 rounded-xl text-xs font-bold text-[#00FFA3] hover:text-[#00E5FF] hover:bg-[#00FFA3]/10 transition-colors ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-start'
              }`}
              title="Sign In / Register"
            >
              <LogIn className="w-4 h-4 flex-shrink-0 text-[#00FFA3]" />
              {!isSidebarCollapsed && <span className="text-[11px] font-sans">Sign In</span>}
            </button>

            <button
              onClick={() => setViewMode('landing')}
              className={`w-full flex items-center gap-3 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#040C1D]/60 transition-colors ${
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-start'
              }`}
              title="Back to Landing Page"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="text-[11px] font-sans">Exit to Home</span>}
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
              isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-start'
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="text-[11px] font-sans">Exit SOC</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
