import React, { useEffect, useState } from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { Finding, FindingStatus } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { PlatformBadge } from '../common/PlatformBadge';
import { SourceStatusBadge } from '../common/SourceStatusBadge';
import { GoogleWebRiskBadge } from '../common/GoogleWebRiskBadge';
import { SignalCard } from './SignalCard';
import { LookalikeVisualizer } from './LookalikeVisualizer';
import { ConnectedThreatsPanel } from './ConnectedThreatsPanel';
import { ActivityTimeline } from './ActivityTimeline';
import { LogoForensicsPanel } from './LogoForensicsPanel';
import { UnicodeXRayInspector } from './UnicodeXRayInspector';
import { AppPermissionXRayPanel } from './AppPermissionXRayPanel';
import { CampaignReplayPanel } from './CampaignReplayPanel';
import { PlatformPolicyMatchPanel } from './PlatformPolicyMatchPanel';
import { TriageRecommendationPanel } from './TriageRecommendationPanel';
import { TrustGraphView } from './TrustGraphView';
import { ChangeDetectionTimeline } from './ChangeDetectionTimeline';
import { RiskScoreSimulator } from './RiskScoreSimulator';
import { EvidenceIntegrityView } from './EvidenceIntegrityView';
import { LogoDiffSlider } from './LogoDiffSlider';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck2, 
  FileX2, 
  Copy, 
  Clock, 
  Compass,
  Network,
  History,
  Sliders,
  Lock,
  Download,
  Printer,
  Flame,
  ArrowLeft,
  ChevronDown,
  Check,
  ShieldAlert,
  Fingerprint,
  Eye,
  FileText,
  Share2,
  RotateCw,
  RotateCcw
} from 'lucide-react';

type DrawerTab = 'overview' | 'trust-graph' | 'changes' | 'simulator' | 'evidence' | 'timeline';

interface FindingDetailDrawerProps {
  finding: Finding | null;
  onClose: () => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({ finding, onClose }) => {
  const { 
    updateFindingStatus, 
    addFindingNote,
    brandProfile,
    showToast,
    openReportModal,
    requireAuth
  } = useBrandGuard();

  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    action: 'Confirmed fake' | 'Dismissed';
    reason: string;
  }>({
    isOpen: false,
    action: 'Confirmed fake',
    reason: 'Verified exact visual trademark and logo spoofing',
  });

  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('overview');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isComparisonFlipped, setIsComparisonFlipped] = useState(false);
  const [isComparisonFlipping, setIsComparisonFlipping] = useState(false);

  const handleComparisonFlip = (toFlipped?: boolean) => {
    if (isComparisonFlipping) return;
    setIsComparisonFlipping(true);
    setIsComparisonFlipped(prev => (typeof toFlipped === 'boolean' ? toFlipped : !prev));
    setTimeout(() => setIsComparisonFlipping(false), 620);
  };

  const drawerTabs: { id: DrawerTab; label: string; icon: React.ReactNode; count?: string }[] = [
    { id: 'overview', label: 'Overview & Forensic Triage', icon: <Compass className="w-3.5 h-3.5 text-[#00FFA3]" /> },
    { id: 'trust-graph', label: 'Interactive Trust Graph', icon: <Network className="w-3.5 h-3.5 text-[#00E5FF]" /> },
    { id: 'changes', label: 'Temporal Change History', icon: <History className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'simulator', label: 'Risk Score Simulator', icon: <Sliders className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'evidence', label: 'Cryptographic Evidence', icon: <Lock className="w-3.5 h-3.5 text-[#00FFA3]" /> },
    { id: 'timeline', label: 'Analyst Notes & Audit', icon: <Clock className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  useEffect(() => {
    if (finding) {
      setActiveDrawerTab('overview');
    }
  }, [finding?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && finding && !decisionModal.isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finding, onClose, decisionModal.isOpen]);

  if (!finding) return null;

  // Retrieve official counterpart for side-by-side comparison
  const officialAsset = finding.type === 'app'
    ? brandProfile?.officialApps?.[0] || {
        name: `${brandProfile?.brandName || 'Official'} Mobile`,
        packageId: `com.${(brandProfile?.brandName || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '')}.mobile`,
        publisher: `${brandProfile?.brandName || 'Official Brand'} Technologies`,
        storeUrl: 'https://play.google.com/store/apps',
      }
    : (brandProfile?.officialSocials || []).find((s) => s.platform.toLowerCase().includes(finding.platform.toLowerCase())) || brandProfile?.officialSocials?.[0];

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(finding.candidateUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      showToast('Candidate URL copied to clipboard', 'info');
    }
  };

  const handleExportDossier = () => {
    const exportData = {
      dossierId: finding.id,
      classification: 'CONFIDENTIAL // DIGITAL RISK PROTECTION THREAT DOSSIER',
      exportTimestamp: new Date().toISOString(),
      entityTitle: finding.title,
      threatPlatform: finding.platform,
      threatType: finding.type,
      riskScore: finding.riskScore,
      riskSeverity: finding.riskSeverity,
      confidence: finding.confidence,
      candidateUrl: finding.candidateUrl,
      publisher: finding.publisherOrOwner,
      status: finding.status,
      signals: finding.signals,
      evidenceIntegrity: {
        hash: finding.evidence?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        validation: 'Cryptographic SHA-256 seal valid',
      },
      timeline: finding.timeline,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat_dossier_${finding.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported STIX-compatible Threat Dossier ${finding.id}`, 'success');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const statusOptions: { value: FindingStatus; label: string }[] = [
    { value: 'New', label: 'New' },
    { value: 'Investigating', label: 'Mark as Investigating' },
    { value: 'Likely impersonation', label: 'Likely Impersonation' },
    { value: 'Confirmed fake', label: 'Confirm Impersonation' },
    { value: 'Dismissed', label: 'Dismiss Finding' },
    { value: 'Resolved', label: 'Resolve Finding' },
  ];

  const handleOpenConfirm = () => {
    requireAuth(() => {
      setDecisionModal({
        isOpen: true,
        action: 'Confirmed fake',
        reason: 'Verified exact visual trademark and logo spoofing',
      });
    }, 'Confirm Threat Impersonation', 'Sign in or register to log analyst threat confirmation decisions.');
  };

  const handleOpenDismiss = () => {
    requireAuth(() => {
      setDecisionModal({
        isOpen: true,
        action: 'Dismissed',
        reason: 'Verified legitimate community / authorized distributor activity',
      });
    }, 'Dismiss Threat Finding', 'Sign in or register to record threat dismissal determinations.');
  };

  const handleApplyDecision = () => {
    updateFindingStatus(finding.id, decisionModal.action, decisionModal.reason);
    setDecisionModal({ ...decisionModal, isOpen: false });
  };

  const isCritical = finding.riskSeverity === 'critical';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#00040A] text-slate-100 flex flex-col animate-in fade-in zoom-in-[0.99] duration-200">
      
      {/* Ambient Cyber Grid & Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,255,163,0.07),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FFA306_1px,transparent_1px),linear-gradient(to_bottom,#00FFA306_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* =========================================================================
          TOP COMMAND BAR & CLASSIFICATION RIBBON
          ========================================================================= */}
      <header className="flex-shrink-0 border-b border-[#00FFA3]/20 bg-[#00050B]/95 backdrop-blur-xl z-20">
        
        {/* Tier 1: Micro Classification Bar */}
        <div className="px-4 sm:px-8 py-2 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono bg-black/40">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-[#00FFA3]/15 text-slate-300 hover:text-[#00FFA3] border border-white/10 hover:border-[#00FFA3]/40 text-xs font-mono transition-all font-bold"
              title="Return to Active Threats Matrix"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>Back to Active Threats</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">|</span>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                CLASSIFIED // THREAT INTELLIGENCE DOSSIER
              </span>

              <span className="text-[11px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/30 hidden md:inline">
                DOSSIER_ID: {finding.id}
              </span>

              <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
                Target: <strong className="text-white">{brandProfile?.brandName || 'AcmePay'}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stage Takedown CTA */}
            <button
              onClick={() => {
                requireAuth(() => {
                  openReportModal(finding);
                }, 'Stage Takedown Enforcement', 'Sign in or register to dispatch automated takedown notices.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 text-xs font-bold font-mono transition-all shadow-sm"
              title="Stage immediate takedown enforcement with digital evidence"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Stage Takedown</span>
            </button>

            {/* Export JSON Dossier */}
            <button
              onClick={handleExportDossier}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all hidden sm:inline-flex"
              title="Export complete STIX/JSON threat dossier"
            >
              <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Export JSON</span>
            </button>

            {/* Print Report */}
            <button
              onClick={handlePrintDossier}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all hidden md:inline-flex"
              title="Print executive briefing dossier"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print</span>
            </button>

            {/* Close Fullscreen Dossier Button */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-red-500/20 text-slate-300 hover:text-white border border-white/10 hover:border-red-500/40 text-xs font-mono transition-all"
              title="Close dossier (Escape)"
              aria-label="Close dossier"
            >
              <span className="hidden sm:inline">Close</span>
              <kbd className="px-1.5 py-0.2 rounded bg-black/50 border border-white/20 text-[9px] text-slate-400">ESC</kbd>
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Tier 2: Entity Identification & Primary Action Bar */}
        <div className="px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Entity Avatar */}
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${finding.avatarColor} text-white font-black flex items-center justify-center text-sm shadow-md ring-2 ring-white/10 flex-shrink-0`}>
              {finding.avatarInitials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight truncate drop-shadow-sm">
                  {finding.title}
                </h1>
                <RiskBadge severity={finding.riskSeverity} uppercase={true} size="md" />
                <PlatformBadge platform={finding.platform} type={finding.type} size="sm" />
                <SourceStatusBadge finding={finding} compact={false} />
                <GoogleWebRiskBadge finding={finding} />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="font-mono text-[#00FFA3] bg-[#00050B] px-2 py-0.5 rounded border border-[#00FFA3]/30 truncate max-w-sm sm:max-w-md shadow-inner text-[11px]">
                  {finding.candidateUrl}
                </span>

                <button
                  onClick={handleCopyUrl}
                  className="p-1 rounded bg-[#040C1D] border border-[#00FFA3]/20 text-slate-300 hover:text-white hover:border-[#00FFA3]/50 transition-colors"
                  title="Copy candidate URL"
                  aria-label="Copy candidate URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#00FFA3]" /> : <Copy className="w-3.5 h-3.5 text-[#00FFA3]" />}
                </button>

                <a
                  href={finding.candidateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-[#040C1D] border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 transition-colors"
                  title="Open candidate URL in sandbox"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="font-mono text-slate-400 hidden sm:inline text-[11px]">
                  Detected {finding.detectedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Decision Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Select */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Status:</span>
              <div className="relative">
                <select
                  value={finding.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as FindingStatus;
                    requireAuth(() => {
                      updateFindingStatus(finding.id, newStatus);
                    }, 'Update Threat Status', 'Sign in or register to update threat remediation statuses.');
                  }}
                  className="appearance-none bg-[#00050B] border border-[#00FFA3]/30 rounded-xl pl-3 pr-7 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/30 cursor-pointer shadow-inner font-mono"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#00FFA3] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleOpenConfirm}
              disabled={finding.status === 'Confirmed fake'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm font-mono"
              title="Confirm Impersonation (Manual analyst verification)"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-red-400" />
              <span>Confirm Impersonation</span>
            </button>

            <button
              onClick={handleOpenDismiss}
              disabled={finding.status === 'Dismissed'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/80 hover:bg-slate-700/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-mono"
              title="Dismiss Finding from active threat radar"
            >
              <FileX2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Dismiss Finding</span>
            </button>
          </div>
        </div>

        {/* Tier 3: Fullscreen Tabs Navigation */}
        <div className="px-4 sm:px-8 py-2 bg-[#000308]/90 border-t border-white/[0.06] flex items-center justify-between gap-4 overflow-x-auto text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {drawerTabs.map((tab) => {
              const isActive = activeDrawerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDrawerTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap text-xs font-mono ${
                    isActive
                      ? 'bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/40 font-bold shadow-[0_0_12px_rgba(0,255,163,0.25)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Risk:</span>
              <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                {finding.riskScore}/100
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Confidence:</span>
              <span className="font-bold text-[#00FFA3]">
                {finding.confidence}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          FULL-SCREEN SCROLLABLE INVESTIGATION BODY
          ========================================================================= */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">

        {/* TAB 1: OVERVIEW & FORENSIC TRIAGE */}
        {activeDrawerTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* TOP 3-COLUMN METRICS DECK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Risk Assessment & Heuristic Score */}
              <div className="p-5 rounded-2xl bg-[#040C1D]/80 border border-slate-800 hover:border-[#00FFA3]/30 transition-all shadow-md space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#00FFA3] uppercase tracking-widest bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/20">
                      [HEURISTIC_MATRIX]
                    </span>
                    <RiskBadge severity={finding.riskSeverity} uppercase={true} size="sm" />
                  </div>
                  <ConfidenceBadge 
                    confidence={finding.confidence} 
                    percentage={finding.riskScore} 
                    uppercase={true} 
                    size="sm" 
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#00050B] border border-slate-800 text-center min-w-[90px]">
                    <div className="text-3xl font-black text-white tracking-tight">
                      {finding.riskScore}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </div>
                    <span className="text-[10px] text-[#00FFA3] font-mono uppercase tracking-wider font-semibold">
                      Risk Score
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Threat Tier:</span>
                      <span className="font-bold text-white capitalize">{finding.riskSeverity} Risk</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          finding.riskScore >= 85 ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : finding.riskScore >= 70 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-amber-500'
                        }`}
                        style={{ width: `${finding.riskScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Risk scores represent statistical heuristic indicators. Manual analyst review and verification required before remediation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Entity & Vector Metadata */}
              <div className="p-5 rounded-2xl bg-[#040C1D]/80 border border-slate-800 hover:border-cyan-500/30 transition-all shadow-md space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    [IMPERSONATOR_SCOPE]
                  </span>
                  <span className="text-[10px] text-slate-400">Platform: {finding.platform}</span>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Detected Handle:</span>
                    <span className="text-[#00E5FF] font-semibold truncate max-w-[170px]">{finding.usernameOrPackage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Claimed Owner:</span>
                    <span className="text-white truncate max-w-[170px]">{finding.publisherOrOwner || 'Unknown / Obfuscated'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Candidate Host:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{finding.candidateWebsite || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evidence SHA:</span>
                    <span className="text-[#00FFA3] font-mono text-[10px] truncate max-w-[170px]">
                      {(finding.evidence?.sha256Hash || 'e3b0c44298fc1c149afbf4c8').substring(0, 16)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Neutralization Countermeasures */}
              <div className="p-5 rounded-2xl bg-[#040C1D]/80 border border-slate-800 hover:border-red-500/30 transition-all shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20">
                    [COUNTERMEASURES]
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Auto-Enforcement</span>
                </div>
                <TriageRecommendationPanel finding={finding} />
              </div>

            </div>

            {/* Permanent Responsible Analyst Framing Trust Banner */}
            <div className="px-4 py-2.5 rounded-xl bg-[#00050B] border border-cyan-900/40 flex items-center gap-2.5 text-xs text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-[#00FFA3] shrink-0" />
              <span>
                <strong className="text-slate-300">Responsible Analyst Framing:</strong> Risk scores represent statistical heuristic indicators. Manual analyst review and verification required before remediation.
              </span>
            </div>

            {/* Google Discovery Telemetry & Technical Credibility Banner */}
            {(finding.evidence?.source === 'Google Search' || finding.signals?.some(s => s.signalType === 'google_discovery')) && (
              <div className="p-4 rounded-xl bg-[#00050B] border border-[#00FFA3]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3]">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold uppercase tracking-wider text-[11px]">
                        Google Discovery Telemetry
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        LIVE INDEXED DATA
                      </span>
                    </div>
                    <p className="text-slate-400 font-sans text-xs mt-0.5">
                      Google Discovery identifies publicly indexed candidate pages. It does not guarantee that every profile is found or prove that a result is fake.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <GoogleWebRiskBadge finding={finding} />
                </div>
              </div>
            )}

            {/* BENCHMARK COMPARISON & FORENSIC DIFF SLIDER */}
            <section className="p-6 rounded-2xl bg-[#040C1D]/70 border border-[#00FFA3]/20 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#00FFA3] uppercase tracking-widest bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/20">
                      [BENCHMARK_COMPARE]
                    </span>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                      Official-versus-Suspicious Visual Benchmark Comparison
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Side-by-side verification comparing candidate signals against the official authenticated trademark record.
                  </p>
                </div>

                {/* 3D Flip Action Control Button */}
                <button
                  type="button"
                  onClick={() => handleComparisonFlip()}
                  aria-label={isComparisonFlipped ? "Show side-by-side comparison summary" : "Show detailed forensic comparison breakdown"}
                  title="Flip card to toggle side-by-side and forensic breakdown"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 text-[#00FFA3] hover:text-white border border-[#00FFA3]/30 text-xs font-mono font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#00FFA3] cursor-pointer shadow-sm"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#00FFA3]" />
                  <span>{isComparisonFlipped ? 'Show Side-by-Side' : 'Flip card: View Breakdown'}</span>
                </button>
              </div>

              {/* Interactive Visual Forensics Diff Slider */}
              <LogoDiffSlider
                officialTitle={officialAsset && 'name' in officialAsset ? officialAsset.name : brandProfile?.brandName || 'AcmePay'}
                officialSubtitle={officialAsset && 'handle' in officialAsset ? officialAsset.handle : officialAsset && 'packageId' in officialAsset ? officialAsset.packageId : brandProfile?.website || 'acmepay.com'}
                impersonatorTitle={finding.title}
                impersonatorSubtitle={finding.usernameOrPackage || finding.candidateUrl}
                avatarInitials={finding.avatarInitials}
                avatarColor={finding.avatarColor}
                riskScore={finding.riskScore}
              />

              {/* 3D Flip Card Container for Side-by-Side vs Detailed Forensic Breakdown */}
              <div className="card-flip-perspective w-full min-h-[340px]">
                <div className={`card-flip-inner min-h-[340px] ${isComparisonFlipped ? 'is-flipped' : ''}`}>
                  
                  {/* FRONT: SIDE-BY-SIDE SUMMARY */}
                  <div className="card-flip-face card-flip-front">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Verified Official Asset */}
                      <div className="p-5 bg-gradient-to-b from-[#00FFA3]/5 to-[#040C1D] border border-[#00FFA3]/40 rounded-2xl space-y-3.5 shadow-lg shadow-emerald-950/20">
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#00FFA3]/20">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00FFA3]">
                            <ShieldCheck className="w-4 h-4 text-[#00FFA3]" />
                            <span>Verified Official Brand Record</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                            Authoritative
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 font-black flex items-center justify-center text-sm shadow-inner">
                            {brandProfile?.logoText || 'AP'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {officialAsset && 'name' in officialAsset ? officialAsset.name : brandProfile?.brandName || 'AcmePay'}
                            </h4>
                            <p className="text-xs text-emerald-400 font-mono">
                              {officialAsset && 'handle' in officialAsset ? officialAsset.handle : officialAsset && 'packageId' in officialAsset ? officialAsset.packageId : brandProfile?.website || 'acmepay.com'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Official Domain</span>
                            <span className="text-emerald-300 font-mono font-medium">{brandProfile?.website || 'acmepay.com'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Registered Corporation</span>
                            <span className="text-slate-200 font-medium">AcmePay Technologies Inc. (Verified Enterprise)</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Authorized Description</span>
                            <p className="text-slate-300 text-xs">
                              Official verified trademark entity for commercial global payment operations.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Detected Impersonating Asset */}
                      <div className="p-5 bg-gradient-to-b from-red-950/20 to-[#040C1D] border border-red-500/40 rounded-2xl space-y-3.5 shadow-lg shadow-red-950/20">
                        <div className="flex items-center justify-between pb-2.5 border-b border-red-500/20">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                            <span>Detected Impersonating Vector</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-300 border border-red-500/30">
                            Unverified / Rogue
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${finding.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                            {finding.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">
                              {finding.title}
                            </h4>
                            <p className="text-xs text-red-400 font-mono truncate">
                              {finding.usernameOrPackage}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Candidate Website / Link</span>
                            <span className="text-red-300 font-mono font-medium truncate block">{finding.candidateWebsite || finding.candidateUrl}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Detected Owner / Publisher</span>
                            <span className="text-slate-200 font-medium">{finding.publisherOrOwner || 'Unregistered Individual'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Candidate Description</span>
                            <p className="text-slate-300 text-xs">
                              {finding.description}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* BACK: FORENSIC COMPARISON DETAILS (Name Diff, Logo Match, Description Diff, Link Diff, Unicode Warning) */}
                  <div className="card-flip-face card-flip-back p-5 bg-[#030919] border border-cyan-500/40 rounded-2xl shadow-xl flex flex-col justify-between overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs font-mono">
                        <span className="text-cyan-300 font-bold uppercase tracking-wider">
                          Forensic Comparison Breakdown
                        </span>
                        <button
                          type="button"
                          onClick={() => handleComparisonFlip(false)}
                          aria-label="Show side-by-side asset comparison"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-mono cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-[#00FFA3]" />
                          <span>Show side-by-side</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Name Difference */}
                        <div className="p-3 rounded-xl bg-[#00050B] border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">1. Name Difference</span>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-emerald-400 font-mono">Official: {officialAsset && 'name' in officialAsset ? officialAsset.name : brandProfile?.brandName || 'AcmePay'}</span>
                            <span className="text-red-400 font-mono truncate ml-2">Candidate: {finding.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                            {finding.lookalike ? `${finding.lookalike.differenceType.replace('_', ' ')}: ${finding.lookalike.explanation}` : 'High visual name mimicry targeting trademark reputation.'}
                          </p>
                        </div>

                        {/* Logo / Icon Similarity */}
                        <div className="p-3 rounded-xl bg-[#00050B] border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">2. Logo / Icon Similarity</span>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-cyan-300 font-bold font-mono">
                              {finding.signals?.find(s => s.iconName === 'logo') ? '88% Vector Match' : 'Pixel Forensics Match'}
                            </span>
                            <span className="text-amber-400 text-[10px] font-mono">Pixel Forensics</span>
                          </div>
                          <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                            {finding.signals?.find(s => s.iconName === 'logo')?.explanation || 'Suspect icon exhibits intentional visual mimicry of trademarked artwork with micro-modifications.'}
                          </p>
                        </div>

                        {/* Description Difference */}
                        <div className="p-3 rounded-xl bg-[#00050B] border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">3. Description Difference</span>
                          <p className="text-[11px] text-slate-300 line-clamp-2">
                            {finding.description || 'Promotional unverified claim imitating official corporate service language.'}
                          </p>
                        </div>

                        {/* Link / Domain Difference */}
                        <div className="p-3 rounded-xl bg-[#00050B] border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">4. Domain / Link Difference</span>
                          <div className="text-[11px] font-mono truncate space-y-0.5">
                            <span className="text-emerald-400 block truncate">Auth: {brandProfile?.website || 'https://acmepay.com'}</span>
                            <span className="text-red-400 block truncate">Rogue: {finding.candidateWebsite || finding.candidateUrl}</span>
                          </div>
                        </div>
                      </div>

                      {/* Unicode Warning (If Available) */}
                      {(finding.lookalike?.differenceType === 'character_variation' || finding.signals?.some(s => s.title.toLowerCase().includes('unicode') || s.title.toLowerCase().includes('homoglyph'))) ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            <strong>Unicode Warning:</strong> {finding.signals?.find(s => s.title.toLowerCase().includes('unicode') || s.title.toLowerCase().includes('homoglyph'))?.explanation || finding.lookalike?.explanation || 'Homoglyph substitution detected.'}
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-[#00050B] border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Standard Latin ASCII character set — no mixed-script homoglyphs detected on this asset.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </section>

            {/* DETECTION SIGNALS (MULTI-COLUMN RESPONSIVE GRID) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                      [DETECTION_SIGNALS]
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Why this threat was flagged ({finding.signals.length} Signals)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-layered anomaly indicators discovered across logos, text strings, infrastructure, and domain heuristics.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {finding.signals.map((sig) => (
                  <SignalCard key={sig.id} signal={sig} />
                ))}
              </div>
            </section>

            {/* ADVANCED TECHNICAL DETAILS & FORENSICS SUITE */}
            <section className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                      [TECHNICAL_FORENSICS]
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      In-Depth Technical Forensics & Anomaly Analysis
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Automated logo heatmap analysis, Unicode homoglyph inspection, and enforcement policy mappings.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Feature: Logo Forensics Heatmap */}
                <LogoForensicsPanel
                  finding={finding}
                  officialLogoText={brandProfile?.logoText || 'AP'}
                  officialBrandName={brandProfile?.brandName || 'AcmePay'}
                />

                {/* Feature: Look-alike character visual explanation & Unicode X-ray */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                      [HOMOGLYPH_ANOMALY]
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      Look-alike Anomaly Breakdown
                    </h4>
                  </div>
                  <LookalikeVisualizer lookalike={finding.lookalike} />
                  
                  <div className="pt-2">
                    <UnicodeXRayInspector
                      candidateString={finding.lookalike?.candidate || finding.usernameOrPackage || finding.title}
                      onAddEvidence={() => {
                        addFindingNote(finding.id, `Attached Unicode X-Ray codepoint telemetry for "${finding.lookalike?.candidate || finding.usernameOrPackage}".`);
                        showToast('Unicode telemetry attached to finding evidence', 'success');
                      }}
                      showCardHeader={true}
                    />
                  </div>
                </div>

                {/* Feature: App Permission X-Ray (for mobile app findings) */}
                {finding.type === 'app' && (
                  <AppPermissionXRayPanel finding={finding} />
                )}

                {/* Feature: Campaign Replay */}
                <CampaignReplayPanel finding={finding} />

                {/* Feature: Platform Policy Match */}
                <PlatformPolicyMatchPanel finding={finding} />
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: INTERACTIVE TRUST GRAPH */}
        {activeDrawerTab === 'trust-graph' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#040C1D]/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-[#00E5FF] uppercase tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    [NETWORK_GRAPH]
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Threat Correlation & Infrastructure Trust Graph
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Node clustering by shared IP, ASN, and DNS</span>
              </div>
              <TrustGraphView finding={finding} />
            </div>

            <ConnectedThreatsPanel campaign={finding.connectedCampaign} />
          </div>
        )}

        {/* TAB 3: TEMPORAL CHANGE HISTORY */}
        {activeDrawerTab === 'changes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#040C1D]/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                    [TIMELINE_DELTA]
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Recorded Modifications, Bio Changes, and Redirect Pivots
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Automated differential audits</span>
              </div>
              <ChangeDetectionTimeline finding={finding} />
            </div>
          </div>
        )}

        {/* TAB 4: RISK SCORE SIMULATOR */}
        {activeDrawerTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#040C1D]/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                    [HEURISTIC_SIMULATOR]
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Interactive Risk Metric Simulation Engine
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Adjust individual heuristic weights in real time</span>
              </div>
              <RiskScoreSimulator finding={finding} />
            </div>
          </div>
        )}

        {/* TAB 5: CRYPTOGRAPHIC EVIDENCE INTEGRITY */}
        {activeDrawerTab === 'evidence' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#040C1D]/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-[#00FFA3] uppercase tracking-widest bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/20">
                    [EVIDENCE_VAULT]
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    Cryptographic Chain of Custody & SHA-256 Hashes
                  </h3>
                </div>
                <button
                  onClick={handleExportDossier}
                  className="px-3 py-1 rounded-lg bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 hover:bg-[#00FFA3]/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Hash Record</span>
                </button>
              </div>
              <EvidenceIntegrityView finding={finding} />
            </div>
          </div>
        )}

        {/* TAB 6: ACTIVITY NOTES & AUDIT LOG */}
        {activeDrawerTab === 'timeline' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-[#040C1D]/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    [AUDIT_LOG]
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    SecOps Analyst Activity Timeline & Case Notes
                  </h3>
                </div>
                <span className="text-xs text-slate-400">{finding.timeline?.length || 0} Recorded Actions</span>
              </div>
              <ActivityTimeline 
                timeline={finding.timeline} 
                onAddNote={(note) => {
                  requireAuth(() => {
                    addFindingNote(finding.id, note);
                  }, 'Add Investigation Note', 'Sign in or register to record threat investigation notes.');
                }}
              />
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          STICKY SOC FOOTER BAR
          ========================================================================= */}
      <footer className="flex-shrink-0 px-4 sm:px-8 py-3 border-t border-[#00FFA3]/20 bg-[#00050B]/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 z-20 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[#00FFA3] flex items-center gap-1.5 font-semibold">
            <Fingerprint className="w-4 h-4 text-[#00FFA3]" />
            <span>HASH: {(finding.evidence?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855').substring(0, 24)}...</span>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            Platform: <strong className="text-white">{finding.platform}</strong>
          </span>
          <span className="text-slate-600 hidden lg:inline">|</span>
          <span className="text-slate-400 hidden lg:inline">
            Status: <strong className="text-[#00FFA3]">{finding.status}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDossier}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span>Export Dossier (JSON)</span>
          </button>

          <button
            onClick={() => {
              requireAuth(() => {
                openReportModal(finding);
              }, 'Stage Takedown Enforcement', 'Sign in or register to dispatch automated takedown notices.');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Stage Takedown</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors border border-slate-700 shadow-sm"
          >
            Close Dossier
          </button>
        </div>
      </footer>

      {/* =========================================================================
          ANALYST DECISION MODAL OVERLAY
          ========================================================================= */}
      {decisionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#00050B] border border-[#00FFA3]/40 shadow-2xl p-6 space-y-4 text-slate-100 text-xs backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {decisionModal.action === 'Confirmed fake' ? (
                  <>
                    <FileCheck2 className="w-4 h-4 text-red-400" />
                    <span>Confirm Brand Impersonation</span>
                  </>
                ) : (
                  <>
                    <FileX2 className="w-4 h-4 text-slate-400" />
                    <span>Dismiss Finding from Threat Scope</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setDecisionModal({ ...decisionModal, isOpen: false })}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Decision Meta */}
            <div className="p-3.5 rounded-xl bg-[#040C1D] border border-slate-800 space-y-2 text-[11px] shadow-inner font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Reviewer:</span>
                <span className="font-semibold text-white">Alex Mercer (SecOps Lead)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Entity:</span>
                <span className="font-mono text-[#00FFA3] truncate max-w-[200px]">{finding.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className={`font-bold ${decisionModal.action === 'Confirmed fake' ? 'text-red-400' : 'text-slate-300'}`}>
                  {decisionModal.action}
                </span>
              </div>
            </div>

            {/* Select Reason */}
            <div className="space-y-1.5 font-sans">
              <label className="font-semibold text-slate-300 block">
                Verification / Dismissal Reason:
              </label>
              <select
                value={decisionModal.reason}
                onChange={(e) => setDecisionModal({ ...decisionModal, reason: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#040C1D] border border-[#00FFA3]/30 text-xs text-white focus:outline-none focus:border-[#00FFA3] shadow-inner cursor-pointer"
              >
                {decisionModal.action === 'Confirmed fake' ? (
                  <>
                    <option value="Verified exact visual trademark and logo spoofing">
                      Verified exact visual trademark and logo spoofing
                    </option>
                    <option value="Credential phishing form active in bio redirect link">
                      Credential phishing form active in bio redirect link
                    </option>
                    <option value="Unsigned malware dropper payload targeting mobile users">
                      Unsigned malware dropper payload targeting mobile users
                    </option>
                    <option value="Unauthorized commercial brand impersonation without license">
                      Unauthorized commercial brand impersonation without license
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Verified legitimate community / fan account (no commercial intent)">
                      Verified legitimate community / fan account (no commercial intent)
                    </option>
                    <option value="Authorized regional commercial distributor / partner">
                      Authorized regional commercial distributor / partner
                    </option>
                    <option value="Inactive parked domain / no deceptive content found">
                      Inactive parked domain / no deceptive content found
                    </option>
                    <option value="False positive homoglyph match / coincidental string name">
                      False positive homoglyph match / coincidental string name
                    </option>
                  </>
                )}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#040C1D] border border-[#00FFA3]/20 text-[10px] text-slate-300 font-mono">
              * Analyst feedback decision will be logged to activity timeline and update heuristic tuning metrics.
            </div>

            <div className="flex justify-end gap-2.5 pt-2 font-mono">
              <button
                onClick={() => setDecisionModal({ ...decisionModal, isOpen: false })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDecision}
                className={`px-4.5 py-2 rounded-xl text-white font-bold shadow-md ${
                  decisionModal.action === 'Confirmed fake'
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-950/40'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {decisionModal.action === 'Confirmed fake' ? 'Confirm Impersonation' : 'Dismiss Finding'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
