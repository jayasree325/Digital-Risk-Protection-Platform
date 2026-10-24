import React, { useState, useMemo } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Check, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Globe, 
  AlertTriangle, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  LayoutGrid,
  List,
  Radar,
  Flame,
  Fingerprint,
  Radio,
  CheckCircle2,
  Lock,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskSeverity } from '../types';

export interface WatchlistVariation {
  id: string;
  name: string;
  variationType: 'Character Swap' | 'Added Word' | 'Repeated Char' | 'Hyphen/Spacing' | 'Auth/Support Word' | 'Unicode Homoglyph';
  existsStatus: 'Active Phishing' | 'Registered Recently' | 'DNS Parked' | 'Unregistered / Available';
  riskSeverity: RiskSeverity;
  riskScore: number;
  reason: string;
  isWatched: boolean;
  relatedFindingId?: string;
}

export const WatchlistPage: React.FC = () => {
  const { brandProfile, company, findings, setSelectedFinding, setActivePage, showToast, requireAuth } = useBrandGuard();

  const brandName = brandProfile.brandName || company?.name || 'AcmePay';
  const cleanBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const [inputBrand, setInputBrand] = useState(brandName);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [activeRiskFilter, setActiveRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'grouped' | 'table'>('cards');
  const [copiedDomainId, setCopiedDomainId] = useState<string | null>(null);

  const [watchedList, setWatchedList] = useState<Record<string, boolean>>({
    'var-1': true,
    'var-5': true,
    'var-8': true,
    'var-14': true,
  });

  // Generator function producing realistic lookalike namespace variations
  const generatedVariations = useMemo<WatchlistVariation[]>(() => {
    const base = inputBrand.toLowerCase().replace(/[^a-z0-9]/g, '') || cleanBrand;
    
    return [
      // 1. Support / Auth / Login / Security / Rewards Words
      {
        id: 'var-1',
        name: `${base}-login.com`,
        variationType: 'Auth/Support Word',
        existsStatus: 'Active Phishing',
        riskSeverity: 'critical',
        riskScore: 96,
        reason: 'High-credential harvesting vector targeting customer sign-in portals.',
        isWatched: !!watchedList['var-1'],
        relatedFindingId: findings[0]?.id,
      },
      {
        id: 'var-2',
        name: `${base}-security.support`,
        variationType: 'Auth/Support Word',
        existsStatus: 'Registered Recently',
        riskSeverity: 'critical',
        riskScore: 92,
        reason: 'Uses security authority keyword to coerce victims into OTP disclosure.',
        isWatched: !!watchedList['var-2'],
      },
      {
        id: 'var-3',
        name: `${base}-rewards-bonus.net`,
        variationType: 'Auth/Support Word',
        existsStatus: 'Active Phishing',
        riskSeverity: 'high',
        riskScore: 84,
        reason: 'Exploits fake promotion & cashback scheme for financial fraud.',
        isWatched: !!watchedList['var-3'],
      },
      {
        id: 'var-4',
        name: `support-${base}.help`,
        variationType: 'Auth/Support Word',
        existsStatus: 'DNS Parked',
        riskSeverity: 'high',
        riskScore: 78,
        reason: 'Impersonates official corporate customer care helpdesk.',
        isWatched: !!watchedList['var-4'],
      },

      // 2. Character Swaps
      {
        id: 'var-5',
        name: base.length > 3 ? `${base.slice(0, 2)}${base[3]}${base[2]}${base.slice(4)}.com` : `${base}x.com`,
        variationType: 'Character Swap',
        existsStatus: 'Registered Recently',
        riskSeverity: 'high',
        riskScore: 81,
        reason: 'Transposed adjacent letters designed to catch fast-typing users on mobile.',
        isWatched: !!watchedList['var-5'],
        relatedFindingId: findings[1]?.id,
      },
      {
        id: 'var-6',
        name: base.length > 4 ? `${base.slice(0, 1)}${base[2]}${base[1]}${base.slice(3)}.io` : `my${base}.io`,
        variationType: 'Character Swap',
        existsStatus: 'Unregistered / Available',
        riskSeverity: 'medium',
        riskScore: 65,
        reason: 'Typosquat candidate prone to speculative adversary registration.',
        isWatched: !!watchedList['var-6'],
      },

      // 3. Added or Removed Words
      {
        id: 'var-7',
        name: `get-${base}-app.org`,
        variationType: 'Added Word',
        existsStatus: 'Active Phishing',
        riskSeverity: 'critical',
        riskScore: 91,
        reason: 'Distributes malicious APK downloader claiming to be the mobile client.',
        isWatched: !!watchedList['var-7'],
        relatedFindingId: findings.find(f => f.type === 'app')?.id,
      },
      {
        id: 'var-8',
        name: `official-${base}.com`,
        variationType: 'Added Word',
        existsStatus: 'Registered Recently',
        riskSeverity: 'high',
        riskScore: 87,
        reason: 'Pretends to be primary corporate brand authority site.',
        isWatched: !!watchedList['var-8'],
      },
      {
        id: 'var-9',
        name: `${base}-global-portal.net`,
        variationType: 'Added Word',
        existsStatus: 'DNS Parked',
        riskSeverity: 'medium',
        riskScore: 68,
        reason: 'Corporate prefix squatted by domain registrar speculator.',
        isWatched: !!watchedList['var-9'],
      },

      // 4. Repeated Characters
      {
        id: 'var-10',
        name: `${base.slice(0, 2)}${base[1] || 'a'}${base.slice(2)}.com`,
        variationType: 'Repeated Char',
        existsStatus: 'Registered Recently',
        riskSeverity: 'high',
        riskScore: 75,
        reason: 'Double character stutter typosquatting high mobile touch input variance.',
        isWatched: !!watchedList['var-10'],
      },
      {
        id: 'var-11',
        name: `${base}${base[base.length - 1] || 's'}.org`,
        variationType: 'Repeated Char',
        existsStatus: 'Unregistered / Available',
        riskSeverity: 'medium',
        riskScore: 59,
        reason: 'Trailing letter duplication variant.',
        isWatched: !!watchedList['var-11'],
      },

      // 5. Spacing and Hyphen Changes
      {
        id: 'var-12',
        name: base.length > 4 ? `${base.slice(0, 4)}-${base.slice(4)}.com` : `${base}-online.com`,
        variationType: 'Hyphen/Spacing',
        existsStatus: 'Active Phishing',
        riskSeverity: 'high',
        riskScore: 86,
        reason: 'Hyphenated brand name mimicking corporate sub-brand architecture.',
        isWatched: !!watchedList['var-12'],
      },
      {
        id: 'var-13',
        name: `${base}_portal.xyz`,
        variationType: 'Hyphen/Spacing',
        existsStatus: 'Unregistered / Available',
        riskSeverity: 'medium',
        riskScore: 62,
        reason: 'Underscore variation used in deceptive email sub-domains.',
        isWatched: !!watchedList['var-13'],
      },

      // 6. Similar Unicode Characters (Homoglyphs)
      {
        id: 'var-14',
        name: `\u0430${base.slice(1)}.com`, // Cyrillic 'а' (U+0430)
        variationType: 'Unicode Homoglyph',
        existsStatus: 'Active Phishing',
        riskSeverity: 'critical',
        riskScore: 98,
        reason: 'Cyrillic Small Letter A (U+0430) homoglyph spoofing authentic Latin visual rendering.',
        isWatched: !!watchedList['var-14'],
        relatedFindingId: findings.find(f => f.lookalike)?.id,
      },
      {
        id: 'var-15',
        name: `${base.slice(0, -1)}\u0443.net`, // Cyrillic 'у' (U+0443)
        variationType: 'Unicode Homoglyph',
        existsStatus: 'Registered Recently',
        riskSeverity: 'critical',
        riskScore: 94,
        reason: 'Greek or Cyrillic homoglyph substitution in internationalized domain (IDN).',
        isWatched: !!watchedList['var-15'],
      },
      {
        id: 'var-16',
        name: `${base.slice(0, 2)}\u0435${base.slice(3)}.com`, // Cyrillic 'е' (U+0435)
        variationType: 'Unicode Homoglyph',
        existsStatus: 'Unregistered / Available',
        riskSeverity: 'high',
        riskScore: 82,
        reason: 'Cyrillic "e" substitution. Extremely difficult for consumers to distinguish in address bars.',
        isWatched: !!watchedList['var-16'],
      },
    ];
  }, [inputBrand, cleanBrand, watchedList, findings]);

  // Surveillance Telemetry Metrics
  const stats = useMemo(() => {
    const total = generatedVariations.length;
    const activePhishing = generatedVariations.filter(v => v.existsStatus === 'Active Phishing').length;
    const homoglyphs = generatedVariations.filter(v => v.variationType === 'Unicode Homoglyph').length;
    const available = generatedVariations.filter(v => v.existsStatus === 'Unregistered / Available').length;
    const critical = generatedVariations.filter(v => v.riskSeverity === 'critical').length;
    const watched = Object.values(watchedList).filter(Boolean).length;
    const defensivePreemptionRate = Math.round((available / total) * 100);

    return { total, activePhishing, homoglyphs, available, critical, watched, defensivePreemptionRate };
  }, [generatedVariations, watchedList]);

  const toggleWatch = (id: string, name: string) => {
    if (!requireAuth(() => toggleWatch(id, name), 'Update Pre-emptive Watchlist', 'Sign in or register to add domains to your proactive defensive surveillance queue.')) {
      return;
    }
    setWatchedList((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        showToast(`Added "${name}" to proactive defensive surveillance`, 'success');
      } else {
        showToast(`Removed "${name}" from watchlist`, 'info');
      }
      return next;
    });
  };

  const handleCopyWatchlist = () => {
    const list = generatedVariations
      .filter((v) => watchedList[v.id])
      .map((v) => `${v.name} [${v.variationType}] - Risk: ${v.riskSeverity.toUpperCase()} (${v.riskScore}/100)`)
      .join('\n');
    navigator.clipboard?.writeText(list || 'No watched items.');
    showToast('Watchlist copied to clipboard', 'info');
  };

  const handleCopySingleDomain = (name: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(name);
    setCopiedDomainId(id);
    showToast(`Copied ${name} to clipboard`, 'info');
    setTimeout(() => setCopiedDomainId(null), 2000);
  };

  const filteredVariations = useMemo(() => {
    return generatedVariations.filter((v) => {
      const matchesType = activeTypeFilter === 'all' || v.variationType === activeTypeFilter;
      const matchesRisk = activeRiskFilter === 'all' || v.riskSeverity === activeRiskFilter;
      const matchesSearch = !searchQuery || 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesRisk && matchesSearch;
    });
  }, [generatedVariations, activeTypeFilter, activeRiskFilter, searchQuery]);

  // Grouped variations by attack vector category
  const groupedVariations = useMemo(() => {
    const groups: Record<string, WatchlistVariation[]> = {};
    filteredVariations.forEach(v => {
      if (!groups[v.variationType]) groups[v.variationType] = [];
      groups[v.variationType].push(v);
    });
    return groups;
  }, [filteredVariations]);

  return (
    <div className="space-y-6">
      {/* 1. Executive Top Banner with Matrix Emerald Styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 sm:p-7 rounded-3xl bg-[#040C1D]/90 border border-[#00FFA3]/25 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FFA3]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/50 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2.5 rounded-xl bg-[#00050B] text-[#00FFA3] border border-[#00FFA3]/40 shadow-[0_0_15px_rgba(0,255,163,0.3)]">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pre-emptive Threat Radar & Watchlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
              HEURISTIC_PREDICT_ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Predictive domain and handle risk intelligence. Synthesizes attack vectors across Unicode IDN homoglyphs, auth keywords, character swaps, and typosquats before malicious actors deploy phishing infrastructure.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 flex-wrap self-start md:self-auto font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-[#00050B] border border-[#00FFA3]/30 text-xs shadow-inner">
            <span className="text-slate-400">SURVEILLANCE: </span>
            <span className="text-[#00FFA3] font-bold">{stats.watched} / {stats.total} TARGETS</span>
          </div>
          <button
            onClick={handleCopyWatchlist}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] font-bold text-xs transition-all shadow-[0_0_20px_rgba(0,255,163,0.3)]"
          >
            <Copy className="w-3.5 h-3.5 text-[#00050B]" />
            <span>Copy Watchlist</span>
          </button>
        </div>
      </div>

      {/* 2. Top Predictive Surveillance Bento KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
        {/* Metric 1: Surveilled Targets */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Simulated Variations</span>
            <Radar className="w-4 h-4 text-[#00FFA3] animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="text-2xl font-black text-white pt-1">
            {stats.total} <span className="text-xs text-[#00FFA3] font-normal">Vectors</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#00FFA3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span>{stats.watched} Actively Monitored</span>
          </div>
        </div>

        {/* Metric 2: Weaponized Phishing Traps */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Weaponized Traps</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 pt-1">
            {stats.activePhishing} <span className="text-xs text-slate-400 font-normal">Active Phish</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span>Live Phishing Detected</span>
          </div>
        </div>

        {/* Metric 3: Unicode Homoglyphs */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Unicode Homoglyphs</span>
            <Fingerprint className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="text-2xl font-black text-[#00E5FF] pt-1">
            {stats.homoglyphs} <span className="text-xs text-slate-400 font-normal">IDN Spoofs</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#00E5FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
            <span>X-Ray Inspection Enabled</span>
          </div>
        </div>

        {/* Metric 4: Defensive Pre-emption Window */}
        <div className="cyber-bento-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-sans text-slate-400 font-semibold">Defensive Window</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 pt-1">
            {stats.available} <span className="text-xs text-slate-400 font-normal">Claimable</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{stats.defensivePreemptionRate}% Unregistered / Available</span>
          </div>
        </div>
      </div>

      {/* 3. Brand Simulation Control Bar & Search */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#040C1D]/90 border border-[#00FFA3]/20 flex flex-col md:flex-row items-center gap-3 justify-between shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1 group">
            <Globe className="w-4 h-4 text-[#00FFA3] absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              type="text"
              value={inputBrand}
              onChange={(e) => setInputBrand(e.target.value)}
              placeholder="Enter brand name to simulate permutations..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/25 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FFA3] focus:ring-2 focus:ring-[#00FFA3]/20 transition-all"
            />
          </div>
          <button
            onClick={() => {
              showToast(`Synthesized predictive namespace models for "${inputBrand}"`, 'success');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#00FFA3] hover:bg-[#00E5FF] text-[#00050B] text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)] flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00050B]" />
            <span>Simulate</span>
          </button>
        </div>

        {/* Search within variations */}
        <div className="relative w-full md:w-72 group font-mono">
          <Search className="w-3.5 h-3.5 text-[#00FFA3] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search predicted domains..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/25 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FFA3] transition-colors"
          />
        </div>
      </div>

      {/* 4. Filter Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        {/* Variation Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#00FFA3]" /> Category:
          </span>
          {[
            { id: 'all', label: 'All Permutations' },
            { id: 'Auth/Support Word', label: 'Auth & Support' },
            { id: 'Unicode Homoglyph', label: 'Unicode Homoglyphs' },
            { id: 'Character Swap', label: 'Character Swaps' },
            { id: 'Added Word', label: 'Added Words' },
            { id: 'Repeated Char', label: 'Repeated Chars' },
            { id: 'Hyphen/Spacing', label: 'Hyphens' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] ${
                activeTypeFilter === tab.id
                  ? 'bg-gradient-to-r from-[#00E88F] to-[#00FFA3] text-[#00050B] shadow-[0_0_12px_rgba(0,255,163,0.3)]'
                  : 'bg-[#040C1D] text-slate-300 hover:text-white border border-[#00FFA3]/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher: Bento Cards vs Grouped Decks vs Dense SOC Table */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#040C1D] border border-[#00FFA3]/25 self-end sm:self-auto flex-shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
              viewMode === 'cards' ? 'bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-slate-400 hover:text-white'
            }`}
            title="Visual Bento Radar Cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">RADAR CARDS</span>
          </button>
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
              viewMode === 'grouped' ? 'bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-slate-400 hover:text-white'
            }`}
            title="Grouped Attack Vector Decks"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">BY VECTOR</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
              viewMode === 'table' ? 'bg-[#00FFA3] text-[#00050B] font-bold shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-slate-400 hover:text-white'
            }`}
            title="Dense SOC Table"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">SOC TABLE</span>
          </button>
        </div>
      </div>

      {/* 5. Variations Representation Area */}
      {filteredVariations.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl bg-[#040C1D] border border-[#00FFA3]/20 font-mono">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-white font-bold">No predicted permutations match the filter criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing search keywords.</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* ==================== 5A. BENTO RADAR CARDS VIEW (DEFAULT) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVariations.map((v) => {
            const isWatched = !!watchedList[v.id];
            const isCritical = v.riskSeverity === 'critical';
            const isHigh = v.riskSeverity === 'high';

            const meterColor = isCritical 
              ? 'from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
              : isHigh 
              ? 'from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
              : 'from-[#00FFA3] to-[#00E5FF] shadow-[0_0_12px_rgba(0,255,163,0.5)]';

            return (
              <div
                key={v.id}
                className="cyber-bento-card p-5 flex flex-col justify-between group transition-all duration-300 hover:border-[#00FFA3]/60 hover:shadow-[0_0_25px_rgba(0,255,163,0.2)] relative overflow-hidden font-mono"
              >
                {/* Top accent cyber line */}
                <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${
                  isCritical 
                    ? 'from-transparent via-red-500 to-transparent group-hover:via-red-400' 
                    : 'from-transparent via-[#00FFA3]/40 to-transparent group-hover:via-[#00FFA3]'
                } transition-all`} />

                <div>
                  {/* Top row: Category tag & Status pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00050B] text-slate-300 border border-[#00FFA3]/20">
                      {v.variationType}
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      v.existsStatus === 'Active Phishing'
                        ? 'bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                        : v.existsStatus === 'Registered Recently'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                        : v.existsStatus === 'DNS Parked'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        v.existsStatus === 'Active Phishing' ? 'bg-red-400 animate-pulse' :
                        v.existsStatus === 'Registered Recently' ? 'bg-amber-400' :
                        v.existsStatus === 'DNS Parked' ? 'bg-blue-400' : 'bg-emerald-400'
                      }`} />
                      <span>{v.existsStatus}</span>
                    </span>
                  </div>

                  {/* Domain Title with Copy button and X-Ray Tag */}
                  <div className="flex items-center justify-between gap-2 mb-2 p-2.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/20 group-hover:border-[#00FFA3]/40 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-black text-white group-hover:text-[#00FFA3] transition-colors truncate">
                        {v.name}
                      </span>
                      {v.variationType === 'Unicode Homoglyph' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40 flex-shrink-0 animate-pulse">
                          IDN X-RAY
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleCopySingleDomain(v.name, v.id, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#00FFA3] hover:bg-[#00FFA3]/10 transition-colors flex-shrink-0"
                      title="Copy domain to clipboard"
                    >
                      {copiedDomainId === v.id ? (
                        <Check className="w-3.5 h-3.5 text-[#00FFA3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Risk Score Dial & Visual Gauge */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px]">RISK SEVERITY</span>
                      <div className="flex items-center gap-1.5">
                        <RiskBadge severity={v.riskSeverity} size="sm" />
                        <span className={`text-[11px] font-bold ${
                          isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-[#00FFA3]'
                        }`}>
                          {v.riskScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#00050B] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full bg-gradient-to-r ${meterColor} rounded-full transition-all duration-500`}
                        style={{ width: `${v.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Threat Vector Rationale Container */}
                  <div className="p-3 rounded-xl bg-[#00050B] border border-[#00FFA3]/15 mb-3.5 text-xs text-slate-300 leading-relaxed font-sans shadow-inner">
                    <span className="text-[#00FFA3] font-mono text-[10px] uppercase font-bold block mb-0.5">
                      Threat Vector Analysis:
                    </span>
                    <p className="line-clamp-2 text-slate-300 text-xs">
                      {v.reason}
                    </p>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-[#00FFA3]/15 flex items-center justify-between text-xs">
                  {v.relatedFindingId ? (
                    <button
                      onClick={() => {
                        const f = findings.find((item) => item.id === v.relatedFindingId);
                        if (f) setSelectedFinding(f);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#00050B] border border-[#00FFA3]/30 hover:border-[#00FFA3] text-[#00FFA3] text-[11px] font-bold flex items-center gap-1 transition-all"
                      title="Inspect active threat dossier"
                    >
                      <span>FINDING</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      REF: {v.id.toUpperCase()}
                    </span>
                  )}

                  <button
                    onClick={() => toggleWatch(v.id, v.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isWatched
                        ? 'bg-[#00FFA3] text-[#00050B] shadow-[0_0_15px_rgba(0,255,163,0.4)]'
                        : 'bg-[#00050B] hover:bg-[#00FFA3]/10 text-slate-300 hover:text-white border border-[#00FFA3]/30'
                    }`}
                  >
                    {isWatched ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00050B]" />
                        <span>WATCHING</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-[#00FFA3]" />
                        <span>WATCH</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grouped' ? (
        /* ==================== 5B. GROUPED ATTACK VECTOR DECKS ==================== */
        <div className="space-y-6">
          {Object.entries(groupedVariations).map(([category, items]) => (
            <div key={category} className="rounded-2xl bg-[#040C1D]/80 border border-[#00FFA3]/20 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-[#00FFA3]/15 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#00050B] text-[#00FFA3] border border-[#00FFA3]/30">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-black text-white tracking-wide font-mono">
                    {category.toUpperCase()}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                    {items.length} Permutations
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {items.map((v) => {
                  const isWatched = !!watchedList[v.id];
                  return (
                    <div
                      key={v.id}
                      className="p-4 rounded-xl bg-[#00050B] border border-[#00FFA3]/15 hover:border-[#00FFA3]/40 transition-all font-mono flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-xs font-bold text-white truncate">
                            {v.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                            v.existsStatus === 'Active Phishing'
                              ? 'bg-red-500/15 text-red-300 border-red-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {v.existsStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans line-clamp-2 mb-3">
                          {v.reason}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#00FFA3]/10">
                        <RiskBadge severity={v.riskSeverity} size="sm" />
                        <button
                          onClick={() => toggleWatch(v.id, v.name)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isWatched
                              ? 'bg-[#00FFA3] text-[#00050B]'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isWatched ? 'WATCHING' : '+ WATCH'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ==================== 5C. HIGH-DENSITY SOC TABLE ==================== */
        <div className="rounded-2xl bg-[#040C1D]/80 border border-[#00FFA3]/20 overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#00050B]/90 border-b border-[#00FFA3]/20 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Predicted Candidate Domain</th>
                  <th className="py-3 px-4">Variation Vector</th>
                  <th className="py-3 px-4">Infrastructure Status</th>
                  <th className="py-3 px-4">Risk Severity</th>
                  <th className="py-3 px-4 font-sans">Attack Rationale</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00FFA3]/10">
                {filteredVariations.map((v) => {
                  const isWatched = !!watchedList[v.id];

                  return (
                    <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white bg-[#00050B] px-2.5 py-1 rounded-lg border border-[#00FFA3]/25">
                            {v.name}
                          </span>
                          {v.variationType === 'Unicode Homoglyph' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40">
                              X-RAY
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#00050B] text-slate-300 border border-[#00FFA3]/20">
                          {v.variationType}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          v.existsStatus === 'Active Phishing'
                            ? 'bg-red-500/15 text-red-300 border-red-500/40 animate-pulse'
                            : v.existsStatus === 'Registered Recently'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : v.existsStatus === 'DNS Parked'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {v.existsStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <RiskBadge severity={v.riskSeverity} size="sm" />
                          <span className="text-[11px] text-slate-300 font-bold">
                            {v.riskScore}/100
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs font-sans text-slate-300 text-xs">
                        <p className="truncate" title={v.reason}>
                          {v.reason}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {v.relatedFindingId && (
                            <button
                              onClick={() => {
                                const f = findings.find((item) => item.id === v.relatedFindingId);
                                if (f) setSelectedFinding(f);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#00050B] border border-[#00FFA3]/30 hover:border-[#00FFA3] text-[#00FFA3] text-[11px] font-bold flex items-center gap-1 transition-all"
                              title="View connected active finding dossier"
                            >
                              <span>Dossier</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => toggleWatch(v.id, v.name)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              isWatched
                                ? 'bg-[#00FFA3] text-[#00050B] shadow-[0_0_10px_rgba(0,255,163,0.3)]'
                                : 'bg-[#00050B] hover:bg-[#00FFA3]/10 text-slate-300 border border-[#00FFA3]/30'
                            }`}
                          >
                            {isWatched ? (
                              <>
                                <Check className="w-3 h-3 text-[#00050B]" />
                                <span>Watching</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Watch</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer telemetry */}
      <div className="p-4 rounded-xl bg-[#040C1D] border border-[#00FFA3]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <span>Surveillance Model: Heuristic permutation matching across 6 attack vectors</span>
        <span className="text-[#00FFA3]">Real-time telemetry updated</span>
      </div>
    </div>
  );
};
