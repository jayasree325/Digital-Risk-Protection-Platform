import React, { useState, useMemo } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { FilterBar, FilterState } from '../components/findings/FilterBar';
import { FindingRow } from '../components/findings/FindingRow';
import { FindingCard } from '../components/findings/FindingCard';
import { EmptyState } from '../components/common/EmptyState';
import { DetectionFeedbackPanel } from '../components/findings/DetectionFeedbackPanel';
import { CaseManagementView } from '../components/findings/CaseManagementView';
import { Finding } from '../types';
import { PlatformLogo, PlatformBadge } from '../components/common/PlatformBadge';
import { 
  ShieldAlert, 
  LayoutGrid, 
  List, 
  Search, 
  Radar, 
  FileCheck2, 
  FileX2, 
  Clock, 
  Share2, 
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Download,
  Terminal,
  Crosshair,
  Filter,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Cpu,
  FolderLock,
  Network,
  Layers,
  Globe
} from 'lucide-react';
import { BulkActionFloatingBar } from '../components/findings/BulkActionFloatingBar';
import { CampaignClusteringView } from '../components/cyber/CampaignClusteringView';

type TabType = 'all' | 'social' | 'app' | 'confirmed' | 'dismissed' | 'resolved' | 'cases';

export const FindingsPage: React.FC = () => {
  const { 
    findings, 
    cases,
    company,
    brandProfile,
    isDemoMode,
    setSelectedFinding, 
    openReportModal, 
    runNewScan, 
    isScanning,
    searchQuery,
    findingsActiveTab,
    setFindingsActiveTab,
    findingsSeverityFilter,
    setActivePage,
    showToast
  } = useBrandGuard();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'platform' | 'campaigns' | 'table'>('cards');
  const [localSearch, setLocalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(true);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const itemsPerPage = 8;

  const handleToggleSelectFinding = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFindingIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredList: Finding[]) => {
    if (selectedFindingIds.length === filteredList.length) {
      setSelectedFindingIds([]);
    } else {
      setSelectedFindingIds(filteredList.map(f => f.id));
    }
  };

  const [filters, setFilters] = useState<FilterState>({
    severity: 'all',
    confidence: 'all',
    type: 'all',
    platform: 'all',
    status: 'all',
    source: 'all',
  });

  React.useEffect(() => {
    if (findingsActiveTab) {
      setActiveTab(findingsActiveTab as TabType);
    }
  }, [findingsActiveTab]);

  React.useEffect(() => {
    if (findingsSeverityFilter && findingsSeverityFilter !== 'all') {
      setFilters((prev: FilterState) => ({ ...prev, severity: findingsSeverityFilter }));
    }
  }, [findingsSeverityFilter]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev: FilterState) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      severity: 'all',
      confidence: 'all',
      type: 'all',
      platform: 'all',
      status: 'all',
      source: 'all',
    });
    setLocalSearch('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: findings.length,
    social: findings.filter((f: Finding) => f.type === 'social').length,
    app: findings.filter((f: Finding) => f.type === 'app').length,
    confirmed: findings.filter((f: Finding) => f.status === 'Confirmed fake').length,
    dismissed: findings.filter((f: Finding) => f.status === 'Dismissed').length,
    resolved: findings.filter((f: Finding) => f.status === 'Resolved').length,
  }), [findings]);

  // Severity distribution counts
  const counts = useMemo(() => ({
    critical: findings.filter((f: Finding) => f.riskSeverity === 'critical').length,
    high: findings.filter((f: Finding) => f.riskSeverity === 'high').length,
    medium: findings.filter((f: Finding) => f.riskSeverity === 'medium').length,
    low: findings.filter((f: Finding) => f.riskSeverity === 'low').length,
  }), [findings]);

  // Platform distribution counts
  const platformStats = useMemo(() => {
    const list: Record<string, number> = {};
    findings.forEach(f => {
      list[f.platform] = (list[f.platform] || 0) + 1;
    });
    return list;
  }, [findings]);

  // Filtered findings with deterministic Triage Severity Hierarchy (CRITICAL -> HIGH -> MEDIUM -> LOW -> RESOLVED/DISMISSED)
  const filteredFindings = useMemo(() => {
    const activeSearch = (localSearch || searchQuery).toLowerCase().trim();

    const results = findings.filter((f: Finding) => {
      // Tab matching
      if (activeTab === 'social' && f.type !== 'social') return false;
      if (activeTab === 'app' && f.type !== 'app') return false;
      if (activeTab === 'confirmed' && f.status !== 'Confirmed fake') return false;
      if (activeTab === 'dismissed' && f.status !== 'Dismissed') return false;
      if (activeTab === 'resolved' && f.status !== 'Resolved') return false;

      // Filter bar matching
      if (filters.severity !== 'all' && f.riskSeverity !== filters.severity) return false;
      if (filters.confidence !== 'all' && f.confidence !== filters.confidence) return false;
      if (filters.type !== 'all' && f.type !== filters.type) return false;
      if (filters.platform !== 'all' && f.platform !== filters.platform) return false;
      if (filters.status !== 'all' && f.status !== filters.status) return false;

      // Detection source filter
      if (filters.source === 'google') {
        const isGoogle = f.evidence?.source === 'Google Search' || f.signals?.some(s => s.signalType === 'google_discovery') || f.id.startsWith('find-goog');
        if (!isGoogle) return false;
      }
      if (filters.source === 'live') {
        const isLive = !f.isDemo || f.evidence?.source === 'Google Search' || !f.id.startsWith('finding-');
        if (!isLive) return false;
      }
      if (filters.source === 'simulated') {
        if (!f.isDemo && f.evidence?.source === 'Google Search') return false;
        if (!f.id.startsWith('finding-')) return false;
      }

      // Search matching
      if (activeSearch) {
        const matchesTitle = f.title.toLowerCase().includes(activeSearch);
        const matchesHandle = f.usernameOrPackage.toLowerCase().includes(activeSearch);
        const matchesReason = f.mainReason.toLowerCase().includes(activeSearch);
        const matchesDomain = f.candidateWebsite ? f.candidateWebsite.toLowerCase().includes(activeSearch) : false;
        if (!matchesTitle && !matchesHandle && !matchesReason && !matchesDomain) return false;
      }

      return true;
    });

    // Severity priority: CRITICAL (4) -> HIGH (3) -> MEDIUM (2) -> LOW (1) -> RESOLVED / DISMISSED
    const severityWeight: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const isClosedStatus = (status: string) => {
      const s = (status || '').toLowerCase();
      return s.includes('resolved') || s.includes('dismissed');
    };

    return [...results].sort((a, b) => {
      const aClosed = isClosedStatus(a.status);
      const bClosed = isClosedStatus(b.status);
      if (aClosed && !bClosed) return 1;
      if (!aClosed && bClosed) return -1;

      const weightA = severityWeight[a.riskSeverity?.toLowerCase()] || 0;
      const weightB = severityWeight[b.riskSeverity?.toLowerCase()] || 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }

      return (b.riskScore || 0) - (a.riskScore || 0);
    });
  }, [findings, activeTab, filters, localSearch, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredFindings.length / itemsPerPage) || 1;
  const paginatedFindings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFindings.slice(start, start + itemsPerPage);
  }, [filteredFindings, currentPage]);

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: 'all', label: 'All Signals', count: tabCounts.all },
    { id: 'cases', label: 'Investigation Cases', count: cases.length },
    { id: 'social', label: 'Social Profiles', count: tabCounts.social },
    { id: 'app', label: 'Mobile Apps', count: tabCounts.app },
    { id: 'confirmed', label: 'Confirmed Fake', count: tabCounts.confirmed },
    { id: 'dismissed', label: 'Dismissed', count: tabCounts.dismissed },
    { id: 'resolved', label: 'Resolved / Neutralized', count: tabCounts.resolved },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Title,Platform,Handle,Severity,RiskScore,Confidence,Status,DetectedTime"]
      .concat(filteredFindings.map((f: Finding) => `"${f.title}","${f.platform}","${f.usernameOrPackage}","${f.riskSeverity}",${f.riskScore},"${f.confidence}","${f.status}","${f.detectedTime}"`))
      .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brandguard_threat_feed_${brandProfile.brandName || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Threat intelligence feed exported to CSV', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* 1. Threat Investigation Explorer Command Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#040C1D]/90 backdrop-blur-2xl border border-[#00FFA3]/30 relative overflow-hidden shadow-2xl cyber-corners">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00FFA3]/15 via-[#00E88F]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/60 text-red-300 border border-red-500/30 flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>[DEFCON 1] • INVESTIGATION WORKSPACE</span>
              </span>
              <span className="text-[11px] text-[#00FFA3] px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/30 backdrop-blur-md">
                TARGET: {brandProfile.brandName || company?.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Threat Investigation Explorer</span>
              <span className="text-sm text-[#00FFA3] font-normal">
                ({filteredFindings.length} Active Records)
              </span>
            </h1>

            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-sans">
              Triage, analyze, and escalate suspicious profiles, domain lookalikes, and unauthorized APK mirrors targeting {brandProfile.brandName || company?.name || 'your enterprise'}.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap font-mono">
            <button
              onClick={() => setShowFeedbackPanel(!showFeedbackPanel)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border backdrop-blur-md ${
                showFeedbackPanel
                  ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 shadow-[0_0_15px_rgba(0, 255, 163,0.2)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]'
              }`}
              title="Toggle Analyst Detection Feedback Loop Panel"
            >
              <Cpu className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>Feedback Loop ({tabCounts.confirmed} confirmed)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#00050B] hover:bg-[#040C1D] text-slate-200 border border-cyan-950 hover:border-[#00FFA3]/40 transition-all flex items-center gap-1.5 shadow-sm backdrop-blur-md"
              title="Export filtered IOCs and findings as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => runNewScan('all')}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(0, 255, 163,0.3)]"
            >
              <Radar className={`w-4 h-4 text-[#00050B] ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Feeds...' : 'Rescan Perimeter'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature 6: Analyst Feedback Loop Panel */}
      {showFeedbackPanel && (
        <DetectionFeedbackPanel />
      )}

      {/* Active Threats Telemetry Bento Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono section-smooth-enter">
        {/* Bento 1: Critical Impersonations */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between hover-lift-subtle">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Critical Threat Vectors</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 pt-1">
            {counts.critical} <span className="text-xs text-slate-400 font-normal">Active Vectors</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span>High Severity Impersonation</span>
          </div>
        </div>

        {/* Bento 2: Takedowns Confirmed */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Takedowns Staged</span>
            <CheckCircle2 className="w-4 h-4 text-[#00FFA3]" />
          </div>
          <div className="text-2xl font-black text-[#00FFA3] pt-1">
            {tabCounts.confirmed} <span className="text-xs text-slate-400 font-normal">Enforced</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#00FFA3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span>Remediation Dispatched</span>
          </div>
        </div>

        {/* Bento 3: Coordinated Campaigns */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Campaign Clusters</span>
            <Network className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="text-2xl font-black text-white pt-1">
            4 <span className="text-xs text-slate-400 font-normal">Syndicates</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#00E5FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
            <span>Operation ShadowPay Correlated</span>
          </div>
        </div>

        {/* Bento 4: Heuristic Confidence */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Triage Accuracy</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white pt-1">
            96.8% <span className="text-xs text-slate-400 font-normal">Score</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero False Positive Goal</span>
          </div>
        </div>
      </div>

      {/* 2. Status Category Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-950 pb-3 font-mono">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00E88F] to-[#00FFA3] text-[#00050B] font-bold shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.id === 'cases' && <FolderLock className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-black/30 text-[#00050B] font-black' : 'bg-white/[0.06] text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Switcher: Cards vs By Platform vs Campaigns vs Table */}
        {activeTab !== 'cases' && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#040C1D]/90 border border-[#00FFA3]/20 self-end sm:self-auto flex-shrink-0 backdrop-blur-md">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
                viewMode === 'cards' ? 'bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
              title="Visual Bento Threat Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[10px]">CARDS</span>
            </button>
            <button
              onClick={() => setViewMode('platform')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
                viewMode === 'platform' ? 'bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
              title="Group by Platform Threat Decks"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[10px]">BY PLATFORM</span>
            </button>
            <button
              onClick={() => setViewMode('campaigns')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
                viewMode === 'campaigns' ? 'bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
              title="Group by Campaign & Infrastructure Clusters"
            >
              <Network className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[10px]">CAMPAIGNS</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
                viewMode === 'table' ? 'bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-slate-400 hover:text-white'
              }`}
              title="Dense SOC Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono text-[10px]">TABLE</span>
            </button>
          </div>
        )}
      </div>

      {/* Conditionally Render Case Management OR Findings Dossiers */}
      {activeTab === 'cases' ? (
        <CaseManagementView />
      ) : (
        <>
          {/* Interactive Threat Search & Filter Matrix */}
          <section className="space-y-3 font-mono">
            {/* Visual Threat Surface Breakdown Ribbon */}
            <div className="p-4 rounded-2xl bg-[#040C1D]/80 border border-[#00FFA3]/20 shadow-lg font-mono backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#00FFA3] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Radar className="w-3.5 h-3.5 text-[#00FFA3]" /> Threat Landscape Distribution
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                  <span>FILTER SEVERITY:</span>
                  <button
                    onClick={() => handleFilterChange('severity', 'critical')}
                    className="text-red-400 font-bold hover:underline"
                  >
                    CRIT ({counts.critical})
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => handleFilterChange('severity', 'high')}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    HIGH ({counts.high})
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => handleFilterChange('severity', 'medium')}
                    className="text-[#00FFA3] font-bold hover:underline"
                  >
                    MED ({counts.medium})
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={handleResetFilters}
                    className="text-slate-400 hover:text-white hover:underline"
                  >
                    RESET
                  </button>
                </div>
              </div>

              {/* Visual segmented multi-color telemetry bar */}
              <div className="w-full h-2 rounded-full bg-[#00050B] overflow-hidden flex border border-[#00FFA3]/15">
                {findings.length > 0 && (
                  <>
                    <div 
                      style={{ width: `${(counts.critical / findings.length) * 100}%` }}
                      className="bg-red-500 hover:opacity-80 transition-all cursor-pointer"
                      title={`Critical: ${counts.critical} (${Math.round((counts.critical / findings.length) * 100)}%)`}
                      onClick={() => handleFilterChange('severity', 'critical')}
                    />
                    <div 
                      style={{ width: `${(counts.high / findings.length) * 100}%` }}
                      className="bg-amber-400 hover:opacity-80 transition-all cursor-pointer"
                      title={`High: ${counts.high} (${Math.round((counts.high / findings.length) * 100)}%)`}
                      onClick={() => handleFilterChange('severity', 'high')}
                    />
                    <div 
                      style={{ width: `${(counts.medium / findings.length) * 100}%` }}
                      className="bg-[#00FFA3] hover:opacity-80 transition-all cursor-pointer"
                      title={`Medium: ${counts.medium} (${Math.round((counts.medium / findings.length) * 100)}%)`}
                      onClick={() => handleFilterChange('severity', 'medium')}
                    />
                    <div 
                      style={{ width: `${(counts.low / findings.length) * 100}%` }}
                      className="bg-slate-600 hover:opacity-80 transition-all cursor-pointer"
                      title={`Low: ${counts.low} (${Math.round((counts.low / findings.length) * 100)}%)`}
                      onClick={() => handleFilterChange('severity', 'low')}
                    />
                  </>
                )}
              </div>
            </div>
            {/* Search Bar with Terminal Syntax Hint */}
            <div className="relative group">
              <Search className="w-4 h-4 text-[#00FFA3] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by suspicious handle (@nike_deals), package name, candidate domain, or flagged reason..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#040C1D]/90 border border-[#00FFA3]/20 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#00FFA3] focus:ring-2 focus:ring-[#00FFA3]/20 shadow-xl backdrop-blur-md transition-all"
              />
            </div>

            {/* Filter Bar with Enterprise Selector and Source Filter */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </section>

          {/* Threat Findings Display: Table, Grid or Campaign Clusters */}
          {filteredFindings.length === 0 ? (
            <EmptyState
              title="No suspicious findings detected"
              description="No suspicious findings detected. Connect a platform or run a perimeter scan to begin monitoring."
              actionText={localSearch || filters.severity !== 'all' || filters.platform !== 'all' ? "Reset All Filters" : "Run Perimeter Scan"}
              onAction={localSearch || filters.severity !== 'all' || filters.platform !== 'all' ? handleResetFilters : () => runNewScan('all')}
            />
          ) : viewMode === 'campaigns' ? (
            /* Infrastructure Campaign Correlation Engine View */
            <CampaignClusteringView
              findings={filteredFindings}
              onOpenFinding={setSelectedFinding}
            />
          ) : viewMode === 'table' ? (
            /* High-Density SOC Table View */
            <div className="rounded-2xl bg-[#040C1D]/80 backdrop-blur-2xl border border-[#00FFA3]/20 overflow-hidden shadow-glass relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/40 to-transparent pointer-events-none" />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#00050B]/90 border-b border-[#00FFA3]/15 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <th className="py-3 pl-4 pr-1 w-10">
                        <input
                          type="checkbox"
                          checked={paginatedFindings.length > 0 && paginatedFindings.every(f => selectedFindingIds.includes(f.id))}
                          onChange={() => handleSelectAll(paginatedFindings)}
                          className="w-4 h-4 rounded bg-[#00050B] border border-[#00FFA3]/40 text-[#00FFA3] focus:ring-[#00FFA3] focus:ring-offset-0 cursor-pointer accent-[#00FFA3]"
                          title="Select all on this page"
                        />
                      </th>
                      <th className="py-3 px-3 font-bold">Threat Target / Impersonator</th>
                      <th className="py-3 px-4 font-bold">Platform</th>
                      <th className="py-3 px-4 font-bold">Risk Score</th>
                      <th className="py-3 px-4 font-bold">Confidence</th>
                      <th className="py-3 px-4 font-bold">Flagged Reason</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold">Detected</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00FFA3]/10">
                    {paginatedFindings.map((finding: Finding) => (
                      <FindingRow
                        key={finding.id}
                        finding={finding}
                        isSelected={selectedFindingIds.includes(finding.id)}
                        onToggleSelect={handleToggleSelectFinding}
                        onSelect={setSelectedFinding}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : viewMode === 'platform' ? (
            /* Grouped Intelligence Decks by Platform */
            <div className="space-y-6 font-mono">
              {['Instagram', 'Twitter', 'Telegram', 'Play', 'Store', 'Web'].map(platKey => {
                const groupItems = filteredFindings.filter(f => {
                  if (platKey === 'Twitter') return f.platform.toLowerCase().includes('twitter') || f.platform.toLowerCase().includes('x');
                  if (platKey === 'Play') return f.platform.toLowerCase().includes('play') || f.platform.toLowerCase().includes('android');
                  if (platKey === 'Store') return f.platform.toLowerCase().includes('apple') || f.platform.toLowerCase().includes('app');
                  if (platKey === 'Web') return !['instagram', 'twitter', 'x', 'telegram', 'play', 'android', 'apple', 'app'].some(p => f.platform.toLowerCase().includes(p));
                  return f.platform.toLowerCase().includes(platKey.toLowerCase());
                });

                if (groupItems.length === 0) return null;

                const displayName = 
                  platKey === 'Play' ? 'Google Play & Android APKs' :
                  platKey === 'Store' ? 'Apple App Store Mirrors' :
                  platKey === 'Twitter' ? 'X / Twitter Profiles' :
                  platKey === 'Web' ? 'Impersonating Domains & Web Portals' :
                  `${platKey} Surface`;

                return (
                  <div key={platKey} className="rounded-2xl bg-[#040C1D]/80 border border-[#00FFA3]/20 p-5 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between border-b border-[#00FFA3]/15 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#00050B] border border-[#00FFA3]/30 flex items-center justify-center shadow-sm">
                          <PlatformLogo platform={platKey} size="md" />
                        </span>
                        <h3 className="text-sm font-black text-white tracking-wide">
                          {displayName.toUpperCase()}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                          {groupItems.length} Identified Threats
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                      {groupItems.map((finding: Finding) => (
                        <FindingCard
                          key={finding.id}
                          finding={finding}
                          onSelect={setSelectedFinding}
                          onQuickReport={openReportModal}
                          isSelected={selectedFindingIds.includes(finding.id)}
                          onToggleSelect={handleToggleSelectFinding}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Visual Evidence Card Grid (Default) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 section-smooth-enter">
              {paginatedFindings.map((finding: Finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onSelect={setSelectedFinding}
                  onQuickReport={openReportModal}
                  isSelected={selectedFindingIds.includes(finding.id)}
                  onToggleSelect={handleToggleSelectFinding}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 5. Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#00FFA3]/15 text-xs text-slate-400 font-mono">
          <div>
            Showing <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(currentPage * itemsPerPage, filteredFindings.length)}</strong> of{' '}
            <strong className="text-white">{filteredFindings.length}</strong> findings
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[#00050B] border border-[#00FFA3]/20 text-slate-300 hover:text-white hover:border-[#00FFA3]/50 hover:shadow-[0_0_12px_rgba(0,255,163,0.3)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 rounded-xl bg-[#040C1D] border border-[#00FFA3]/40 text-[#00FFA3] font-bold">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[#00050B] border border-[#00FFA3]/20 text-slate-300 hover:text-white hover:border-[#00FFA3]/50 hover:shadow-[0_0_12px_rgba(0,255,163,0.3)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Threat Triage Floating Action Drawer */}
      <BulkActionFloatingBar
        selectedIds={selectedFindingIds}
        findings={filteredFindings}
        onClearSelection={() => setSelectedFindingIds([])}
      />
    </div>
  );
};
