import React from 'react';
import { BrandGuardProvider, useBrandGuard } from './context/BrandGuardContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingWizardPage } from './pages/OnboardingWizardPage';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { OverviewPage } from './pages/OverviewPage';
import { CheckLinkPage } from './pages/CheckLinkPage';
import { SocialMonitoringPage } from './pages/SocialMonitoringPage';
import { AppMonitoringPage } from './pages/AppMonitoringPage';
import { FindingsPage } from './pages/FindingsPage';
import { BrandProfilePage } from './pages/BrandProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { FindingDetailDrawer } from './components/findings/FindingDetailDrawer';
import { StepByStepReportModal } from './components/findings/StepByStepReportModal';
import { ScanResultsView } from './components/scan/ScanResultsView';
import { LoadingScanModal } from './components/common/LoadingScanModal';
import { ToastNotification } from './components/common/ToastNotification';
import { WatchlistPage } from './pages/WatchlistPage';
import { ScamScriptAnalyzerPage } from './pages/ScamScriptAnalyzerPage';
import { UnicodeXRayPage } from './pages/UnicodeXRayPage';
import { CustomerWarningKitPage } from './pages/CustomerWarningKitPage';
import { BoardReportPage } from './pages/BoardReportPage';
import { AlertPreviewPage } from './pages/AlertPreviewPage';
import { BrandShieldIntroAnimation } from './components/landing/BrandShieldIntroAnimation';

import { PublicBrandVerificationPage } from './pages/PublicBrandVerificationPage';
import { AuthRequiredModal } from './components/common/AuthRequiredModal';

const MainAppRouter: React.FC = () => {
  const { 
    viewMode, 
    activePage, 
    selectedFinding, 
    setSelectedFinding,
    reportModalFinding,
    closeReportModal,
    isAuthenticated,
    isLoadingAuth,
    isDemoMode
  } = useBrandGuard();

  // 1. First screen MUST be the Landing Page for visitors (loads immediately)
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage />
        <ToastNotification />
      </>
    );
  }

  // Public Brand Verification Page
  if (viewMode === 'verify') {
    return (
      <>
        <PublicBrandVerificationPage />
        <ToastNotification />
      </>
    );
  }

  // Loading auth session check for dashboard views
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#00050B] flex flex-col items-center justify-center text-slate-300">
        <div className="w-8 h-8 border-2 border-[#00FFA3]/20 border-t-[#00FFA3] rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(0, 255, 163,0.3)]" />
        <span className="text-sm font-semibold font-mono text-[#00FFA3]">Loading BrandGuard</span>
        <span className="text-xs text-slate-400 mt-1 font-mono">Preparing your secure workspace...</span>
      </div>
    );
  }

  // 2. Authentication: Login Page
  if (viewMode === 'login') {
    return (
      <>
        <LoginPage />
        <ToastNotification />
      </>
    );
  }

  // 3. Authentication: Forgot Password Page
  if (viewMode === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage />
        <ToastNotification />
      </>
    );
  }

  // 4. Company Onboarding Wizard (4 steps)
  if (viewMode === 'onboarding') {
    return (
      <>
        <OnboardingWizardPage />
        <ToastNotification />
      </>
    );
  }

  // 5. Dashboard Workspace (Explorable by guests, protected actions require login/signin)

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <OverviewPage />;
      case 'check-link':
        return <CheckLinkPage />;
      case 'scan-results':
        return <ScanResultsView />;
      case 'social':
        return <FindingsPage />;
      case 'apps':
        return <FindingsPage />;
      case 'findings':
        return <FindingsPage />;
      case 'brand-profile':
        return <BrandProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'watchlist':
        return <WatchlistPage />;
      case 'scam-analyzer':
        return <ScamScriptAnalyzerPage />;
      case 'unicode-xray':
        return <UnicodeXRayPage />;
      case 'warning-kit':
        return <CustomerWarningKitPage />;
      case 'board-report':
        return <BoardReportPage />;
      case 'alert-preview':
        return <AlertPreviewPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#00050B] text-slate-100 overflow-hidden font-sans relative">
      {/* Holographic Blue Cyber HUD Ambient Background Lighting Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-[#00FFA3]/15 via-[#00E88F]/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-10 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00E88F]/12 via-[#00FFA3]/8 to-transparent rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[450px] bg-gradient-to-t from-[#00FFA3]/10 via-[#00E88F]/6 to-transparent rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0, 255, 163,0.04)_1px,transparent_1px)] [background-size:32px_32px] opacity-75" />
      </div>

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Topbar */}
        <Topbar />

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/25 px-6 py-2 text-xs text-amber-300 flex items-center justify-between gap-2 font-mono flex-shrink-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <span>Demo mode is active. Some findings and metrics use simulated data.</span>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
          {renderActivePage()}
        </main>
      </div>

      {/* Finding Detail Side Drawer */}
      <FindingDetailDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />

      {/* Step-by-Step 5-Stage Progressive Disclosure Report Modal */}
      <StepByStepReportModal
        finding={reportModalFinding}
        onClose={closeReportModal}
      />

      {/* Global Threat Scanning Modal Overlay */}
      <LoadingScanModal />

      {/* Guest Authentication Prompt Modal */}
      <AuthRequiredModal />

      {/* Global Interactive Toast Notification Stack */}
      <ToastNotification />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrandGuardProvider>
      <MainAppRouter />
    </BrandGuardProvider>
  );
};

export default App;
