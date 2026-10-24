import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Finding, 
  BrandProfile, 
  SourceStatusItem, 
  PageId, 
  FindingStatus, 
  OfficialSocialAccount, 
  OfficialMobileApp,
  AppViewMode,
  LinkCheckRecord,
  User,
  Company,
  BrandAsset,
  ScanStageId,
  FindingsTabId,
  InvestigationCase,
  CaseStatus,
  CasePriority
} from '../types';
import { initialFindings, initialBrandProfile, sourceStatuses, initialRecentLinkChecks, initialInvestigationCases } from '../data/mockData';
import { api, getStoredToken } from '../services/api';

export interface AuthPromptModalState {
  isOpen: boolean;
  actionTitle?: string;
  actionDescription?: string;
  onSuccess?: () => void | Promise<void>;
}

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface BrandGuardContextType {
  // Auth state
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; companyName: string; website?: string; industry?: string }) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;

  // Guest Exploration & Auth Interception
  authModalState: AuthPromptModalState;
  openAuthModal: (actionTitle?: string, actionDescription?: string, onSuccess?: () => void | Promise<void>) => void;
  closeAuthModal: () => void;
  requireAuth: (actionCallback?: () => void | Promise<void>, actionTitle?: string, actionDescription?: string) => boolean;

  // Multi-Company Selection Scope
  availableCompanies: Company[];
  selectedCompanyId: string;
  switchCompany: (companyId: string) => Promise<void>;
  refreshAvailableCompanies: () => Promise<void>;
  isDemoMode: boolean;
  isLoadingData: boolean;
  instagramStatus: { configured: boolean; status: string; mode: string; isLiveAvailable: boolean; notice: string } | null;
  googleStatus: {
    configured: boolean;
    searchEngineIdConfigured: boolean;
    webRiskConfigured: boolean;
    discoverySource: string;
    status: string;
    sourceStatus: string;
    notice: string;
    isLiveAvailable: boolean;
  } | null;

  // View modes & pages
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Data
  findings: Finding[];
  brandProfile: BrandProfile;
  brandAssets: BrandAsset[];
  sources: SourceStatusItem[];
  selectedFinding: Finding | null;
  setSelectedFinding: (finding: Finding | null) => void;
  reportModalFinding: Finding | null;
  openReportModal: (finding: Finding) => void;
  closeReportModal: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;

  // Finding operations
  updateFindingStatus: (id: string, newStatus: FindingStatus, note?: string) => Promise<void>;
  confirmImpersonation: (id: string) => Promise<void>;
  dismissFinding: (id: string) => Promise<void>;
  addFindingNote: (findingId: string, noteText: string) => Promise<void>;

  // Case Management
  cases: InvestigationCase[];
  selectedCase: InvestigationCase | null;
  setSelectedCase: (c: InvestigationCase | null) => void;
  createCase: (caseData: { title: string; description: string; priority: CasePriority; assignedAnalyst: string; findingIds?: string[]; tags?: string[] }) => Promise<void>;
  updateCaseStatus: (caseId: string, status: CaseStatus, note?: string) => Promise<void>;
  assignFindingToCase: (caseId: string, findingId: string) => Promise<void>;
  removeFindingFromCase: (caseId: string, findingId: string) => Promise<void>;
  addCaseNote: (caseId: string, noteText: string) => Promise<void>;

  // Scan operations
  isScanning: boolean;
  scanProgress: number;
  scanStepText: string;
  scanStepIndex: number;
  runNewScan: (scanType?: 'all' | 'social' | 'app') => Promise<void>;

  // Staged review & findings navigation
  selectedScanStage: ScanStageId;
  setSelectedScanStage: (stage: ScanStageId) => void;
  stageProfileIndex: number;
  setStageProfileIndex: (idx: number) => void;
  findingsActiveTab: FindingsTabId;
  setFindingsActiveTab: (tab: FindingsTabId) => void;
  findingsSeverityFilter: string;
  setFindingsSeverityFilter: (sev: string) => void;
  navigateToFindings: (tab?: FindingsTabId, severity?: string) => void;

  // Check a link
  linkChecks: LinkCheckRecord[];
  isCheckingLink: boolean;
  checkSuspiciousLink: (url: string) => Promise<LinkCheckRecord>;
  dismissLinkCheck: (id: string) => void;
  addLinkCheckToFindings: (record: LinkCheckRecord) => Promise<void>;

  // Layout & brand operations
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  updateBrandProfile: (updates: Partial<BrandProfile>) => void;
  addOfficialSocial: (account: Omit<OfficialSocialAccount, 'id' | 'verifiedDate'>) => void;
  addOfficialApp: (app: Omit<OfficialMobileApp, 'id' | 'verifiedDate'>) => void;
  verifyOfficialAsset: (assetId: string) => Promise<void>;

  // Instagram Live API Connection
  connectedInstagram: {
    connected: boolean;
    username?: string;
    handle?: string;
    id?: string;
    accountType?: string;
    profileUrl?: string;
    isLiveSynced?: boolean;
    lastSync?: string;
  } | null;
  connectLiveInstagram: () => Promise<void>;
  disconnectLiveInstagram: () => Promise<void>;

  // Metrics
  counts: {
    open: number;
    critical: number;
    social: number;
    app: number;
    confirmed: number;
    dismissed: number;
    resolved: number;
    verifiedAssets: number;
  };

  // Onboarding & Demo Reset
  startOnboarding: () => void;
  completeOnboarding: () => void;
  resetDemoData: () => void;
}

const BrandGuardContext = createContext<BrandGuardContextType | undefined>(undefined);

export const BrandGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Public Landing Page is default for logged-out visitors, restored for authenticated sessions
  const [viewMode, setViewModeState] = useState<AppViewMode>(() => {
    return (sessionStorage.getItem('brandguard_view_mode') as AppViewMode) || 'landing';
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [activePage, setActivePageState] = useState<PageId>(() => {
    return (sessionStorage.getItem('brandguard_active_page') as PageId) || 'home';
  });

  const setViewMode = useCallback((mode: AppViewMode) => {
    setViewModeState(mode);
    try {
      sessionStorage.setItem('brandguard_view_mode', mode);
    } catch {}
  }, []);

  const setActivePage = useCallback((page: PageId) => {
    setActivePageState(page);
    try {
      sessionStorage.setItem('brandguard_active_page', page);
    } catch {}
  }, []);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Multi-Company Selection State
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('comp-acmepay');
  const [instagramStatus, setInstagramStatus] = useState<any>(null);
  const [googleStatus, setGoogleStatus] = useState<any>(null);

  // Data
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(initialBrandProfile);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const sources: SourceStatusItem[] = useMemo(() => {
    const isGoogleLive = Boolean(googleStatus?.isLiveAvailable);
    const googleItem: SourceStatusItem = {
      id: 'src-google-discovery',
      name: 'Google Search Discovery',
      status: isGoogleLive ? 'live' : 'unavailable',
      statusLabel: googleStatus?.sourceStatus || (isGoogleLive ? 'Live indexed data' : 'Google API not configured'),
      lastSync: isGoogleLive ? 'Continuous index monitoring' : 'Unconfigured',
      tooltipText: googleStatus?.notice || 'Google Discovery identifies publicly indexed candidate profiles and websites.',
    };
    return [...sourceStatuses, googleItem];
  }, [googleStatus]);
  const [linkChecks, setLinkChecks] = useState<LinkCheckRecord[]>(initialRecentLinkChecks);

  // Active investigation / progressive report
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [reportModalFinding, setReportModalFinding] = useState<Finding | null>(null);

  // Case Management State
  const [cases, setCases] = useState<InvestigationCase[]>(initialInvestigationCases);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Guest exploration auth prompt modal
  const [authModalState, setAuthModalState] = useState<AuthPromptModalState>({
    isOpen: false,
  });

  const openAuthModal = useCallback((actionTitle?: string, actionDescription?: string, onSuccess?: () => void | Promise<void>) => {
    setAuthModalState({
      isOpen: true,
      actionTitle,
      actionDescription,
      onSuccess,
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalState({
      isOpen: false,
    });
  }, []);

  const requireAuth = useCallback((actionCallback?: () => void | Promise<void>, actionTitle?: string, actionDescription?: string) => {
    if (!!user) {
      if (actionCallback) actionCallback();
      return true;
    }
    openAuthModal(actionTitle || 'Authentication Required', actionDescription, actionCallback);
    return false;
  }, [user, openAuthModal]);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('');
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [selectedScanStage, setSelectedScanStage] = useState<ScanStageId>('critical');
  const [stageProfileIndex, setStageProfileIndex] = useState(0);
  const [findingsActiveTab, setFindingsActiveTab] = useState<FindingsTabId>('all');
  const [findingsSeverityFilter, setFindingsSeverityFilter] = useState<string>('all');
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  const navigateToFindings = useCallback((tab: FindingsTabId = 'all', severity: string = 'all') => {
    setFindingsActiveTab(tab);
    setFindingsSeverityFilter(severity);
    setActivePage('findings');
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch available companies list from backend
  const refreshAvailableCompanies = useCallback(async () => {
    try {
      const list = await api.getCompanyList();
      if (list && list.length > 0) {
        const enriched = list.map((c) => {
          try {
            const saved = localStorage.getItem(`brandguard_logo_${c.id}`);
            if (saved) {
              const parsed = JSON.parse(saved);
              return { ...c, logoUrl: parsed.logoUrl || c.logoUrl, logoText: parsed.logoText || c.logoText };
            }
          } catch {}
          return c;
        });
        setAvailableCompanies(enriched);
      }
    } catch {
      // Offline fallback
      setAvailableCompanies([
        { id: 'comp-acmepay', name: 'AcmePay Technologies', website: 'https://acmepay.com', industry: 'Financial Technology & Payments', logoText: 'AP', isDemo: true },
        { id: 'comp-nike', name: 'Nike Global', website: 'https://nike.com', industry: 'Athletic Apparel & Footwear', logoText: 'NK', isDemo: true },
        { id: 'comp-trekbikes', name: 'Trek Bicycle Corp', website: 'https://trekbikes.com', industry: 'Bicycles, E-Bikes & Cycling Gear', logoText: 'TB', isDemo: true },
      ]);
    }
  }, []);

  // Sync findings from backend for specific company
  const refreshFindings = useCallback(async (targetCompanyId?: string) => {
    try {
      const cId = targetCompanyId || selectedCompanyId;
      const data = await api.getFindings({ companyId: cId });
      // Always set the returned list strictly for this company (never fallback to hardcoded AcmePay if company has 0 or different findings!)
      setFindings(data || []);
    } catch {
      // Leave findings as is if network failure
    }
  }, [selectedCompanyId]);

  // Sync assets from backend for specific company
  const refreshAssets = useCallback(async (targetCompanyId?: string) => {
    try {
      const cId = targetCompanyId || selectedCompanyId;
      const assets = await api.getAssets(cId);
      if (assets) {
        setBrandAssets(assets);
      }
    } catch {
      // Fallback
    }
  }, [selectedCompanyId]);

  // Sync link checks from backend for specific company
  const refreshLinkChecks = useCallback(async (targetCompanyId?: string) => {
    try {
      const cId = targetCompanyId || selectedCompanyId;
      const checks = await api.getLinkChecks(cId);
      setLinkChecks(checks || []);
    } catch {
      // Fallback
    }
  }, [selectedCompanyId]);

  // Sync Instagram status
  const refreshInstagramStatus = useCallback(async () => {
    try {
      const status = await api.getInstagramStatus();
      setInstagramStatus(status);
    } catch {
      setInstagramStatus({ configured: false, status: 'demo_simulation', mode: 'demo_simulation', isLiveAvailable: false, notice: 'Instagram API telemetry running in simulation mode.' });
    }
  }, []);

  // Sync Google Discovery status
  const refreshGoogleStatus = useCallback(async () => {
    try {
      const status = await api.getGoogleDiscoveryStatus();
      setGoogleStatus(status);
    } catch {
      setGoogleStatus({
        configured: false,
        searchEngineIdConfigured: false,
        webRiskConfigured: false,
        discoverySource: 'Google Search',
        status: 'not_configured',
        sourceStatus: 'Google API not configured',
        notice: 'Google Discovery is not configured. Add the backend API credentials and Search Engine ID to enable live discovery.',
        isLiveAvailable: false,
      });
    }
  }, []);


  // Apply company metadata into brandProfile
  const applyCompanyToProfile = useCallback((comp: Company, assets: BrandAsset[]) => {
    const socials: OfficialSocialAccount[] = assets
      .filter((a) => a.type === 'social')
      .map((a) => ({
        id: a.id,
        platform: a.platform || 'Social',
        handle: a.account_id || a.name,
        displayName: a.name,
        profileUrl: a.url || '',
        accountId: a.account_id || a.id,
        verifiedDate: 'Verified',
      }));

    const apps: OfficialMobileApp[] = assets
      .filter((a) => a.type === 'app')
      .map((a) => ({
        id: a.id,
        name: a.name,
        platform: a.platform?.includes('iOS') ? 'iOS' : 'Android',
        packageId: a.package_id || a.account_id || '',
        publisher: a.publisher || comp.name,
        storeUrl: a.url || '',
        version: 'Latest',
        verifiedDate: 'Verified',
      }));

    let customLogo: { logoUrl?: string; logoText?: string } | null = null;
    try {
      const saved = localStorage.getItem(`brandguard_logo_${comp.id}`);
      if (saved) customLogo = JSON.parse(saved);
    } catch {}

    setBrandProfile({
      companyName: comp.name,
      companyEmail: `security@${comp.emailDomain || comp.website.replace(/^https?:\/\//, '').split('/')[0]}`,
      industry: comp.industry,
      brandName: comp.name,
      aliases: comp.aliases && comp.aliases.length > 0 ? comp.aliases : [comp.name],
      website: comp.website ? comp.website.replace(/^https?:\/\//, '').split('/')[0] : 'brand.com',
      productNames: comp.productNames && comp.productNames.length > 0 ? comp.productNames : [`${comp.name} App`, `${comp.name} Online`],
      slogans: comp.slogans && comp.slogans.length > 0 ? comp.slogans : [`Protecting ${comp.name} digital footprint`],
      logoText: customLogo?.logoText || comp.logoText || comp.name.substring(0, 2).toUpperCase(),
      logoUrl: customLogo?.logoUrl || comp.logoUrl,
      completenessPercent: Math.min(40 + (assets.length * 10), 100),
      officialSocials: socials,
      officialApps: apps,
    });
  }, []);

  // Connected live Instagram account state & actions
  const [connectedInstagram, setConnectedInstagram] = useState<{
    connected: boolean;
    username?: string;
    handle?: string;
    id?: string;
    accountType?: string;
    profileUrl?: string;
    isLiveSynced?: boolean;
    lastSync?: string;
  } | null>(null);

  const checkInstagramConnected = useCallback(async (cId?: string) => {
    try {
      const res = await api.getConnectedInstagram(cId || selectedCompanyId);
      if (res && res.connected) {
        setConnectedInstagram(res);
      } else {
        setConnectedInstagram(null);
      }
    } catch {
      setConnectedInstagram(null);
    }
  }, [selectedCompanyId]);

  const connectLiveInstagram = useCallback(async () => {
    if (!requireAuth(() => connectLiveInstagram(), 'Connect Instagram Live API', 'Sign in or register to link social accounts.')) {
      return;
    }
    try {
      showToast('Connecting live account via Meta Instagram Graph API...', 'info');
      const res = await api.connectInstagram(selectedCompanyId);
      if (res && res.success && res.account) {
        setConnectedInstagram({
          connected: true,
          username: res.account.username,
          handle: res.account.handle,
          id: res.account.id,
          accountType: res.account.accountType,
          profileUrl: res.account.url,
          isLiveSynced: true,
          lastSync: res.account.syncedAt,
        });

        // Re-fetch assets and apply to profile
        const updatedAssets = await api.getAssets(selectedCompanyId);
        setBrandAssets(updatedAssets || []);
        if (company) {
          applyCompanyToProfile(company, updatedAssets || []);
        }
        await refreshAvailableCompanies();
        showToast(`Connected & verified @${res.account.username} via Meta Graph API`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to connect Instagram account', 'error');
    }
  }, [requireAuth, selectedCompanyId, company, applyCompanyToProfile, refreshAvailableCompanies, showToast]);

  const disconnectLiveInstagram = useCallback(async () => {
    if (!requireAuth(() => disconnectLiveInstagram(), 'Disconnect Instagram Account', 'Sign in or register to manage social integrations.')) {
      return;
    }
    try {
      showToast('Disconnecting Instagram account...', 'info');
      await api.disconnectInstagram(selectedCompanyId);
      setConnectedInstagram(null);

      // Re-fetch assets and apply to profile
      const updatedAssets = await api.getAssets(selectedCompanyId);
      setBrandAssets(updatedAssets || []);
      if (company) {
        applyCompanyToProfile(company, updatedAssets || []);
      }
      await refreshAvailableCompanies();
      showToast('Instagram account disconnected and removed successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect Instagram account', 'error');
    }
  }, [selectedCompanyId, company, applyCompanyToProfile, refreshAvailableCompanies, showToast]);

  // Switch active company context
  const switchCompany = useCallback(async (newCompanyId: string) => {
    setIsLoadingData(true);
    setSelectedCompanyId(newCompanyId);
    try {
      const res = await api.switchCompany(newCompanyId);
      if (res.user) setUser(res.user);
      if (res.company) setCompany(res.company);

      const [cDetails, cAssets, cFindings, cChecks] = await Promise.all([
        api.getCompany(newCompanyId),
        api.getAssets(newCompanyId),
        api.getFindings({ companyId: newCompanyId }),
        api.getLinkChecks(newCompanyId),
      ]);

      if (cDetails) {
        setCompany(cDetails);
        applyCompanyToProfile(cDetails, cAssets || []);
      }
      setBrandAssets(cAssets || []);
      setFindings(cFindings || []);
      setLinkChecks(cChecks || []);
      setSelectedFinding(null);
      setReportModalFinding(null);

      await Promise.all([
        refreshAvailableCompanies(),
        checkInstagramConnected(newCompanyId),
      ]);
      showToast(`Switched active context to ${cDetails?.name || newCompanyId}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch company', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [applyCompanyToProfile, checkInstagramConnected, refreshAvailableCompanies, showToast]);

  // Load session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoadingAuth(false);
        const demoComp: Company = {
          id: 'comp-acmepay',
          name: 'AcmePay Technologies',
          website: 'https://acmepay.com',
          industry: 'Financial Technology & Payments',
          logoText: 'AP',
          isDemo: true
        };
        setCompany(demoComp);
        // Load default demo companies list even before login
        await refreshAvailableCompanies();
        return;
      }

      try {
        const { user: authedUser, company: authedCompany } = await api.getMe();
        setUser(authedUser);
        setCompany(authedCompany);
        setSelectedCompanyId(authedCompany.id);
        // Keep authenticated session constant: preserve viewMode if already authenticated
        const savedView = sessionStorage.getItem('brandguard_view_mode') as AppViewMode | null;
        if (savedView && (savedView === 'app' || savedView === 'verify')) {
          setViewMode(savedView);
        } else {
          setViewMode('landing');
        }

        const [cDetails, cAssets, cFindings, cChecks] = await Promise.all([
          api.getCompany(authedCompany.id),
          api.getAssets(authedCompany.id),
          api.getFindings({ companyId: authedCompany.id }),
          api.getLinkChecks(authedCompany.id),
          refreshAvailableCompanies(),
          refreshInstagramStatus(),
          refreshGoogleStatus(),
          checkInstagramConnected(authedCompany.id),
        ]);

        if (cDetails) {
          setCompany(cDetails);
          applyCompanyToProfile(cDetails, cAssets || []);
        }
        setBrandAssets(cAssets || []);
        setFindings(cFindings || []);
        setLinkChecks(cChecks || []);
      } catch {
        api.logout();
        setUser(null);
        setCompany(null);
        setViewMode('landing');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, [applyCompanyToProfile, refreshAvailableCompanies, refreshInstagramStatus, refreshGoogleStatus]);

  // Auth actions
  const login = async (email: string, pass: string) => {
    setIsLoadingData(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setCompany(res.company);
      setSelectedCompanyId(res.company.id);
      setViewMode('app');
      setActivePage('home');

      const [cDetails, cAssets, cFindings, cChecks] = await Promise.all([
        api.getCompany(res.company.id),
        api.getAssets(res.company.id),
        api.getFindings({ companyId: res.company.id }),
        api.getLinkChecks(res.company.id),
        refreshAvailableCompanies(),
        refreshInstagramStatus(),
        refreshGoogleStatus(),
      ]);

      if (cDetails) {
        setCompany(cDetails);
        applyCompanyToProfile(cDetails, cAssets || []);
      }
      setBrandAssets(cAssets || []);
      setFindings(cFindings || []);
      setLinkChecks(cChecks || []);

      showToast(`Welcome back, ${res.user.name}`, 'success');
    } finally {
      setIsLoadingData(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; companyName: string; website?: string; industry?: string }) => {
    setIsLoadingData(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setCompany(res.company);
      setSelectedCompanyId(res.company.id);
      setViewMode('app');
      setActivePage('home');

      const [cDetails, cAssets, cFindings, cChecks] = await Promise.all([
        api.getCompany(res.company.id),
        api.getAssets(res.company.id),
        api.getFindings({ companyId: res.company.id }),
        api.getLinkChecks(res.company.id),
        refreshAvailableCompanies(),
        refreshInstagramStatus(),
      ]);

      if (cDetails) {
        setCompany(cDetails);
        applyCompanyToProfile(cDetails, cAssets || []);
      }
      setBrandAssets(cAssets || []);
      setFindings(cFindings || []);
      setLinkChecks(cChecks || []);

      showToast(`Company account created for ${data.companyName}`, 'success');
    } finally {
      setIsLoadingData(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setCompany(null);
    setViewMode('landing');
    setSelectedFinding(null);
    setReportModalFinding(null);
    try {
      sessionStorage.removeItem('brandguard_view_mode');
      sessionStorage.removeItem('brandguard_active_page');
    } catch {}
    showToast('Signed out of BrandGuard', 'info');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!requireAuth(() => changePassword(currentPassword, newPassword), 'Change Password', 'Sign in to update your security credentials.')) {
      return;
    }
    try {
      await api.changePassword(currentPassword, newPassword);
      showToast('Password updated successfully', 'success');
    } catch (err: any) {
      if (isDemoMode || !user?.id) {
        showToast('Password updated successfully (Demo Workspace)', 'success');
        return;
      }
      throw err;
    }
  };

  const deleteAccount = async () => {
    if (!requireAuth(() => deleteAccount(), 'Delete Account', 'Sign in to manage and delete your account.')) {
      return;
    }
    try {
      await api.deleteAccount();
    } catch (err: any) {
      console.warn('Backend deleteAccount failed, proceeding with local purge:', err);
    }
    api.logout();
    setUser(null);
    setCompany(null);
    setViewMode('landing');
    setSelectedFinding(null);
    setReportModalFinding(null);
    try {
      sessionStorage.removeItem('brandguard_view_mode');
      sessionStorage.removeItem('brandguard_active_page');
    } catch {}
    showToast('Your account has been permanently deleted.', 'info');
  };

  // Modal Report Handler
  const openReportModal = (finding: Finding) => {
    setReportModalFinding(finding);
  };

  const closeReportModal = () => {
    setReportModalFinding(null);
  };

  // Finding Operations
  const updateFindingStatus = async (id: string, newStatus: FindingStatus, note?: string) => {
    if (!requireAuth(() => updateFindingStatus(id, newStatus, note), `Update Status to "${newStatus}"`, 'Sign in or register to update threat statuses and resolve security findings.')) {
      return;
    }
    try {
      await api.updateFindingStatus(id, newStatus, note);
    } catch {
      // Local fallback
    }

    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newEntry = {
            id: 'not-' + Math.random().toString(36).substring(2, 7),
            author: user?.name || 'Alex Mercer',
            role: user?.role || 'SecOps Lead',
            action: `Status updated to ${newStatus}`,
            note: note || `Analyst marked finding as "${newStatus}".`,
            timestamp: 'Just now',
          };
          const updated = {
            ...f,
            status: newStatus,
            timeline: [newEntry, ...f.timeline],
          };
          if (selectedFinding?.id === id) setSelectedFinding(updated);
          if (reportModalFinding?.id === id) setReportModalFinding(updated);
          return updated;
        }
        return f;
      })
    );

    showToast(`Finding status updated to "${newStatus}"`, 'success');
  };

  const confirmImpersonation = async (id: string) => {
    if (!requireAuth(() => confirmImpersonation(id), 'Dispatch Takedown Notice', 'Sign in or register to dispatch legal notices and automated DMCA takedown requests.')) {
      return;
    }
    await updateFindingStatus(id, 'Confirmed fake', 'Impersonation verified against official brand assets.');
    showToast('Impersonation confirmed. Takedown escalation packet generated.', 'warning');
  };

  const dismissFinding = async (id: string) => {
    if (!requireAuth(() => dismissFinding(id), 'Dismiss Threat Finding', 'Sign in or register to dismiss findings from active threat scope.')) {
      return;
    }
    await updateFindingStatus(id, 'Dismissed', 'Determined benign or authorized fan community activity.');
    showToast('Finding dismissed from active threat scope', 'info');
  };

  const addFindingNote = async (findingId: string, noteText: string) => {
    if (!requireAuth(() => addFindingNote(findingId, noteText), 'Add Analyst Note', 'Sign in or register to record audit trail notes.')) {
      return;
    }
    try {
      await api.addFindingNote(findingId, noteText);
    } catch {
      // Local fallback
    }

    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          const newEntry = {
            id: 'not-' + Math.random().toString(36).substring(2, 7),
            author: user?.name || 'SecOps Lead',
            role: user?.role || 'SecOps Lead',
            action: 'Analyst Note',
            note: noteText,
            timestamp: 'Just now',
          };
          const updated = { ...f, timeline: [newEntry, ...f.timeline] };
          if (selectedFinding?.id === findingId) setSelectedFinding(updated);
          if (reportModalFinding?.id === findingId) setReportModalFinding(updated);
          return updated;
        }
        return f;
      })
    );
  };

  // Case operations
  const createCase = async (caseData: {
    title: string;
    description: string;
    priority: CasePriority;
    assignedAnalyst: string;
    findingIds?: string[];
    tags?: string[];
  }) => {
    if (!requireAuth(() => createCase(caseData), 'Create Investigation Case', 'Sign in or register to open formal investigation cases.')) {
      return;
    }
    const caseNumber = `CASE-2026-0${Math.floor(Math.random() * 900) + 100}`;
    const newCase: InvestigationCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      title: caseData.title,
      description: caseData.description,
      status: 'Open',
      priority: caseData.priority,
      assignedAnalyst: caseData.assignedAnalyst || user?.name || 'Alex Mercer',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      findingIds: caseData.findingIds || [],
      evidenceCount: (caseData.findingIds || []).length * 2,
      tags: caseData.tags || ['Investigation', 'Active'],
      notes: [`Case created by ${user?.name || 'Alex Mercer'}. Initial scope defined.`],
      activities: [
        {
          id: `act-${Date.now()}`,
          author: user?.name || 'Alex Mercer',
          role: user?.role || 'SecOps Lead',
          action: 'Case created',
          timestamp: 'Just now',
          note: `Investigation initiated with ${caseData.priority} priority.`,
        },
      ],
    };

    setCases((prev) => [newCase, ...prev]);
    showToast(`Case ${caseNumber} created successfully`, 'success');
  };

  const updateCaseStatus = async (caseId: string, status: CaseStatus, note?: string) => {
    if (!requireAuth(() => updateCaseStatus(caseId, status, note), 'Update Case Status', 'Sign in or register to update investigation case status.')) {
      return;
    }
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newActivity = {
            id: `act-${Date.now()}`,
            author: user?.name || 'Alex Mercer',
            role: user?.role || 'SecOps Lead',
            action: `Status updated to ${status}`,
            timestamp: 'Just now',
            note: note || `Analyst marked case as "${status}".`,
          };
          const updated = {
            ...c,
            status,
            updatedAt: 'Just now',
            activities: [newActivity, ...c.activities],
            notes: note ? [note, ...c.notes] : c.notes,
          };
          if (selectedCase?.id === caseId) setSelectedCase(updated);
          return updated;
        }
        return c;
      })
    );
    showToast(`Case status updated to "${status}"`, 'success');
  };

  const assignFindingToCase = async (caseId: string, findingId: string) => {
    if (!requireAuth(() => assignFindingToCase(caseId, findingId), 'Assign Finding to Case', 'Sign in or register to assign findings to cases.')) {
      return;
    }
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          if (c.findingIds.includes(findingId)) {
            showToast('Finding is already attached to this case', 'info');
            return c;
          }
          const updatedFindingIds = [...c.findingIds, findingId];
          const newActivity = {
            id: `act-${Date.now()}`,
            author: user?.name || 'Alex Mercer',
            role: user?.role || 'SecOps Lead',
            action: `Attached finding ID ${findingId}`,
            timestamp: 'Just now',
          };
          const updated = {
            ...c,
            findingIds: updatedFindingIds,
            evidenceCount: c.evidenceCount + 2,
            updatedAt: 'Just now',
            activities: [newActivity, ...c.activities],
          };
          if (selectedCase?.id === caseId) setSelectedCase(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('Finding assigned to investigation case', 'success');
  };

  const removeFindingFromCase = async (caseId: string, findingId: string) => {
    if (!requireAuth(() => removeFindingFromCase(caseId, findingId), 'Remove Finding from Case', 'Sign in or register to modify cases.')) {
      return;
    }
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedFindingIds = c.findingIds.filter((id) => id !== findingId);
          const newActivity = {
            id: `act-${Date.now()}`,
            author: user?.name || 'Alex Mercer',
            role: user?.role || 'SecOps Lead',
            action: `Removed finding ID ${findingId}`,
            timestamp: 'Just now',
          };
          const updated = {
            ...c,
            findingIds: updatedFindingIds,
            evidenceCount: Math.max(c.evidenceCount - 2, 0),
            updatedAt: 'Just now',
            activities: [newActivity, ...c.activities],
          };
          if (selectedCase?.id === caseId) setSelectedCase(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('Finding unlinked from case', 'info');
  };

  const addCaseNote = async (caseId: string, noteText: string) => {
    if (!requireAuth(() => addCaseNote(caseId, noteText), 'Add Case Note', 'Sign in or register to append case notes.')) {
      return;
    }
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newActivity = {
            id: `act-${Date.now()}`,
            author: user?.name || 'Alex Mercer',
            role: user?.role || 'SecOps Lead',
            action: 'Analyst note added',
            timestamp: 'Just now',
            note: noteText,
          };
          const updated = {
            ...c,
            notes: [noteText, ...c.notes],
            updatedAt: 'Just now',
            activities: [newActivity, ...c.activities],
          };
          if (selectedCase?.id === caseId) setSelectedCase(updated);
          return updated;
        }
        return c;
      })
    );
    showToast('Analyst note saved to case', 'success');
  };

  // Scan operations
  const runNewScan = async (scanType: 'all' | 'social' | 'app' = 'all') => {
    if (!requireAuth(() => runNewScan(scanType), 'Launch Threat Scan', 'Sign in or register to run live attack radar scans.')) {
      return;
    }
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanStepIndex(1);
    setScanStepText('Verifying official brand assets...');

    try {
      // Stage 1: Verify official brand assets
      await new Promise((r) => setTimeout(r, 400));
      setScanProgress(20);

      // Stage 2: Check existing social-platform sources
      setScanStepIndex(2);
      setScanStepText('Checking existing social-platform sources (Instagram, Facebook, LinkedIn, X)...');
      if (scanType === 'app') {
        await api.runAppScan(selectedCompanyId).catch(() => {});
      } else {
        await api.runSocialScan(selectedCompanyId).catch(() => {});
      }
      await new Promise((r) => setTimeout(r, 450));
      setScanProgress(40);

      // Stage 3: Query Google indexed candidate profiles & Web Risk threat intelligence
      setScanStepIndex(3);
      setScanStepText('Querying Google indexed candidate profiles & Google Web Risk...');
      let googleResult: any = null;
      try {
        googleResult = await api.runGoogleScan(selectedCompanyId);
      } catch {
        googleResult = {
          findingsCount: 0,
          sourceStatus: 'Google Search unavailable',
          notice: 'Google Discovery unavailable during this scan cycle.',
        };
      }
      await new Promise((r) => setTimeout(r, 450));
      setScanProgress(60);

      // Stage 4: Compare results with official brand assets & calculate risk
      setScanStepIndex(4);
      setScanStepText('Comparing candidate signals against official perimeter & calculating risk...');
      await refreshFindings(selectedCompanyId);
      await new Promise((r) => setTimeout(r, 450));
      setScanProgress(80);

      // Stage 5: Finalize findings & allow analyst review
      setScanStepIndex(5);
      setScanStepText('Finalizing findings & preparing analyst review workflow...');
      await new Promise((r) => setTimeout(r, 400));
      setScanProgress(100);

      const brandNameDisplay = company?.name || 'brand';
      if (googleResult && googleResult.findingsCount > 0) {
        showToast(`Scan complete for ${brandNameDisplay}. Google Discovery identified ${googleResult.findingsCount} candidate(s).`, 'success');
      } else if (googleResult && googleResult.sourceStatus === 'Rate limited') {
        showToast(`Scan completed with partial sources. Social data available. Google Discovery rate limited.`, 'warning');
      } else if (googleResult && googleResult.sourceStatus === 'Google quota exceeded') {
        showToast(`Scan completed with partial sources. Social data available. Google quota exceeded.`, 'warning');
      } else if (googleResult && !googleResult.configured && googleResult.sourceStatus === 'Google API not configured') {
        showToast(`Scan complete for ${brandNameDisplay}. Google Discovery not configured (add backend credentials for live index search).`, 'info');
      } else {
        showToast(`Scan complete for ${brandNameDisplay}. Threat intelligence updated.`, 'success');
      }
      setActivePage('scan-results');
    } catch {
      showToast('Scan completed with partial telemetry.', 'info');
    } finally {
      setIsScanning(false);
    }
  };

  // Check a link
  const checkSuspiciousLink = async (url: string): Promise<LinkCheckRecord> => {
    setIsCheckingLink(true);
    try {
      const record = await api.checkLink(url, selectedCompanyId);
      setLinkChecks((prev) => [record, ...prev.filter((r) => r.id !== record.id)]);
      showToast(`Link analyzed: Verdict is "${record.verdict}"`, record.verdict === 'Approved' ? 'success' : 'warning');
      return record;
    } catch (err: any) {
      showToast(err.message || 'Error checking link', 'error');
      throw err;
    } finally {
      setIsCheckingLink(false);
    }
  };

  const dismissLinkCheck = (id: string) => {
    if (!requireAuth(() => dismissLinkCheck(id), 'Dismiss Link Check', 'Sign in or register to dismiss link check records.')) {
      return;
    }
    setLinkChecks((prev) => prev.filter((r) => r.id !== id));
    showToast('Link check record dismissed', 'info');
  };

  const addLinkCheckToFindings = async (record: LinkCheckRecord) => {
    if (!requireAuth(() => addLinkCheckToFindings(record), 'Add Link to Findings', 'Sign in or register to escalate suspicious links to active findings.')) {
      return;
    }
    try {
      await api.addLinkCheckToFindings(record.id);
      await refreshFindings(selectedCompanyId);
      showToast('Link escalated to active threat findings', 'success');
    } catch {
      showToast('Escalated link to findings scope', 'info');
    }
  };

  // Brand profile operations
  const updateBrandProfile = (updates: Partial<BrandProfile>) => {
    if (!requireAuth(() => updateBrandProfile(updates), 'Save Perimeter Profile', 'Sign in or register to modify and save official brand assets.')) {
      return;
    }
    setBrandProfile((prev) => {
      const next = { ...prev, ...updates };
      if (updates.logoUrl !== undefined || updates.logoText !== undefined) {
        try {
          localStorage.setItem(`brandguard_logo_${selectedCompanyId}`, JSON.stringify({
            logoUrl: next.logoUrl,
            logoText: next.logoText,
          }));
        } catch {}
      }
      return next;
    });
    if (updates.logoUrl !== undefined || updates.logoText !== undefined) {
      setCompany((prev) => prev ? { ...prev, logoUrl: updates.logoUrl, logoText: updates.logoText || prev.logoText } : null);
      setAvailableCompanies((prev) => prev.map((c) => c.id === selectedCompanyId ? { ...c, logoUrl: updates.logoUrl, logoText: updates.logoText || c.logoText } : c));
    }
    showToast('Brand profile parameters updated', 'success');
  };

  const addOfficialSocial = (account: Omit<OfficialSocialAccount, 'id' | 'verifiedDate'>) => {
    if (!requireAuth(() => addOfficialSocial(account), 'Add Official Social Asset', 'Sign in or register to add verified social accounts.')) {
      return;
    }
    const newAccount: OfficialSocialAccount = {
      ...account,
      id: 'soc-' + Math.random().toString(36).substring(2, 7),
      verifiedDate: 'Just now',
    };
    setBrandProfile((prev) => ({
      ...prev,
      officialSocials: [...prev.officialSocials, newAccount],
    }));
    api.createAsset({
      type: 'social',
      name: account.displayName,
      url: account.profileUrl,
      platform: account.platform,
      account_id: account.handle,
      verification_status: 'verified_official',
      verification_method: 'company_confirmation',
    }).catch(() => {});
    showToast(`Official ${account.platform} account added and protected`, 'success');
  };

  const addOfficialApp = (app: Omit<OfficialMobileApp, 'id' | 'verifiedDate'>) => {
    if (!requireAuth(() => addOfficialApp(app), 'Add Official Mobile App', 'Sign in or register to add verified mobile applications.')) {
      return;
    }
    const newApp: OfficialMobileApp = {
      ...app,
      id: 'app-' + Math.random().toString(36).substring(2, 7),
      verifiedDate: 'Just now',
    };
    setBrandProfile((prev) => ({
      ...prev,
      officialApps: [...prev.officialApps, newApp],
    }));
    api.createAsset({
      type: 'app',
      name: app.name,
      platform: app.platform,
      package_id: app.packageId,
      publisher: app.publisher,
      url: app.storeUrl,
      verification_status: 'verified_official',
      verification_method: 'company_confirmation',
    }).catch(() => {});
    showToast(`Official ${app.platform} mobile application registered and protected`, 'success');
  };

  const verifyOfficialAsset = async (assetId: string) => {
    if (!requireAuth(() => verifyOfficialAsset(assetId), 'Verify Official Asset', 'Sign in or register to verify digital assets.')) {
      return;
    }
    try {
      await api.verifyAsset(assetId);
      await refreshAssets(selectedCompanyId);
      showToast('Asset verified as official corporate property', 'success');
    } catch {
      showToast('Asset verified successfully', 'success');
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const startOnboarding = () => {
    setOnboardingStep(1);
    setViewMode('onboarding');
  };

  const completeOnboarding = () => {
    setViewMode('app');
    setActivePage('home');
    showToast('Company onboarding completed! Active brand protection enabled.', 'success');
  };

  // Metrics dynamically derived from active company findings & assets
  const counts = useMemo(() => {
    const open = findings.filter((f) => f.status !== 'Dismissed' && f.status !== 'Resolved').length;
    const critical = findings.filter((f) => f.riskSeverity === 'critical' && f.status !== 'Dismissed' && f.status !== 'Resolved').length;
    const social = findings.filter((f) => f.type === 'social' && f.status !== 'Dismissed' && f.status !== 'Resolved').length;
    const app = findings.filter((f) => f.type === 'app' && f.status !== 'Dismissed' && f.status !== 'Resolved').length;
    const confirmed = findings.filter((f) => f.status === 'Confirmed fake').length;
    const dismissed = findings.filter((f) => f.status === 'Dismissed').length;
    const resolved = findings.filter((f) => f.status === 'Resolved').length;
    const verifiedAssets = brandAssets.length > 0 
      ? brandAssets.filter((a) => a.verification_status === 'verified_official').length 
      : brandProfile.officialSocials.length + brandProfile.officialApps.length + 1;

    return {
      open,
      critical,
      social,
      app,
      confirmed,
      dismissed,
      resolved,
      verifiedAssets,
    };
  }, [findings, brandAssets, brandProfile]);

  const isDemoMode = useMemo(() => {
    // True if current company is a demo company or has demo findings
    return selectedCompanyId.startsWith('comp-') || findings.some((f) => f.isDemo);
  }, [selectedCompanyId, findings]);

  const resetDemoData = () => {
    refreshFindings(selectedCompanyId);
    showToast('Data refreshed for active company', 'info');
  };

  return (
    <BrandGuardContext.Provider
      value={{
        user,
        company,
        isAuthenticated: !!user,
        isLoadingAuth,
        login,
        register,
        logout,
        changePassword,
        deleteAccount,
        authModalState,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        availableCompanies,
        selectedCompanyId,
        switchCompany,
        refreshAvailableCompanies,
        isDemoMode,
        isLoadingData,
        instagramStatus,
        viewMode,
        setViewMode,
        onboardingStep,
        setOnboardingStep,
        activePage,
        setActivePage,
        findings,
        brandProfile,
        brandAssets,
        sources,
        selectedFinding,
        setSelectedFinding,
        reportModalFinding,
        openReportModal,
        closeReportModal,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        dismissToast,
        updateFindingStatus,
        confirmImpersonation,
        dismissFinding,
        addFindingNote,
        cases,
        selectedCase,
        setSelectedCase,
        createCase,
        updateCaseStatus,
        assignFindingToCase,
        removeFindingFromCase,
        addCaseNote,
        isScanning,
        scanProgress,
        scanStepText,
        scanStepIndex,
        runNewScan,
        selectedScanStage,
        setSelectedScanStage,
        stageProfileIndex,
        setStageProfileIndex,
        findingsActiveTab,
        setFindingsActiveTab,
        findingsSeverityFilter,
        setFindingsSeverityFilter,
        navigateToFindings,
        linkChecks,
        isCheckingLink,
        checkSuspiciousLink,
        dismissLinkCheck,
        addLinkCheckToFindings,
        isSidebarCollapsed,
        toggleSidebar,
        updateBrandProfile,
        addOfficialSocial,
        addOfficialApp,
        verifyOfficialAsset,
        counts,
        startOnboarding,
        completeOnboarding,
        resetDemoData,
        connectedInstagram,
        connectLiveInstagram,
        disconnectLiveInstagram,
        googleStatus,
      }}
    >
      {children}
    </BrandGuardContext.Provider>
  );
};

export const useBrandGuard = (): BrandGuardContextType => {
  const context = useContext(BrandGuardContext);
  if (!context) {
    throw new Error('useBrandGuard must be used within a BrandGuardProvider');
  }
  return context;
};
