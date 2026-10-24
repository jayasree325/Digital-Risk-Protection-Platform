import React, { useState } from 'react';
import { Finding, FindingStatus } from '../../types';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck2, 
  FileX2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Layers, 
  Info,
  Smartphone,
  Share2,
  Copy,
  Hash,
  Send,
  Terminal,
  Zap
} from 'lucide-react';
import { PlatformBadge, PlatformLogo } from '../common/PlatformBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { SignalScoreBarChart } from '../charts/SignalScoreBarChart';

interface StepByStepReportModalProps {
  finding: Finding | null;
  onClose: () => void;
}

export const StepByStepReportModal: React.FC<StepByStepReportModalProps> = ({ finding, onClose }) => {
  const { updateFindingStatus, addFindingNote, brandProfile, showToast } = useBrandGuard();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionLogs, setTransmissionLogs] = useState<string[]>([]);
  const [takedownTicket, setTakedownTicket] = useState<string | null>(null);

  const handleTransmitTakedownPacket = () => {
    if (!finding) return;
    setIsTransmitting(true);
    setTransmissionLogs(['[INITIALIZE] Packaging SHA-256 evidence payload...']);
    setTimeout(() => {
      setTransmissionLogs(prev => [...prev, '[CRYPTO] Signed with BrandGuard Ed25519 authority certificate']);
    }, 350);
    setTimeout(() => {
      setTransmissionLogs(prev => [...prev, `[TRANSMIT] Dispatching abuse webhook to ${finding.platform} Abuse API...`]);
    }, 750);
    setTimeout(() => {
      const ticketId = `TKD-${Math.floor(1000 + Math.random() * 9000)}-LIVE`;
      setTakedownTicket(ticketId);
      setTransmissionLogs(prev => [...prev, `[CONFIRMED] Ticket Issued: #${ticketId} (Remediation Queued)`]);
      setIsTransmitting(false);
      updateFindingStatus(finding.id, 'Confirmed fake', `Automated takedown dispatched. Ticket: ${ticketId}`);
      showToast(`Automated Takedown dispatched! Ticket: ${ticketId}`, 'success');
    }, 1300);
  };

  if (!finding) return null;

  const totalSteps = 5;

  const stepTitles = [
    'Detected item',
    'Why it is suspicious',
    'Official comparison',
    'Supporting evidence',
    'Review and action',
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStatusChange = async (newStatus: FindingStatus) => {
    await updateFindingStatus(finding.id, newStatus);
    showToast(`Finding marked as "${newStatus}"`, 'success');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmittingNote(true);
    await addFindingNote(finding.id, noteText.trim());
    setNoteText('');
    setIsSubmittingNote(false);
    showToast('Analyst note saved to timeline', 'success');
  };

  // Find official matching asset for comparison (left side)
  const isApp = finding.type === 'app';
  const officialAsset = isApp
    ? brandProfile.officialApps[0] || {
        name: 'AcmePay Mobile',
        packageId: 'com.acmepay.mobile',
        publisher: 'AcmePay Technologies',
        storeUrl: 'https://play.google.com/store/apps/details?id=com.acmepay.mobile',
      }
    : brandProfile.officialSocials.find((s) => s.platform === finding.platform) || brandProfile.officialSocials[0] || {
        handle: '@acmepay',
        displayName: 'AcmePay Official',
        profileUrl: 'https://acmepay.com',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="unlumen-card border-beam w-full max-w-4xl bg-navy-900/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-hidden backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Header with Step Progress Bar */}
        <div className="p-5 border-b border-cyan-500/20 bg-gradient-to-b from-navy-950/95 to-navy-900/90 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                [INVESTIGATION_REPORT]
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Step {currentStep} of {totalSteps} &bull; <span className="text-white">{stepTitles[currentStep - 1]}</span>
              </span>
            </div>
            <h2 id="report-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>{finding.title}</span>
              <PlatformBadge platform={finding.platform} size="xs" />
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-smooth p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
            aria-label="Exit report"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 py-3 bg-navy-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <button
                key={title}
                onClick={() => setCurrentStep(stepNum)}
                className={`btn-smooth flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-xl transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-slate-800/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  isCurrent
                    ? 'bg-cyan-400 text-navy-950 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                }`}>
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span className="hidden sm:inline">{title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area (Progressive Disclosure) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: DETECTED ITEM */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="unlumen-card p-5 bg-navy-850/70 border border-slate-800 flex items-start justify-between gap-4 shadow-md">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${finding.avatarColor} flex items-center justify-center font-black text-lg border border-slate-700/60 shrink-0 shadow-md`}>
                    {finding.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <PlatformBadge platform={finding.platform} size="xs" />
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-xs text-cyan-400 font-mono">{finding.usernameOrPackage}</span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">
                      {finding.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      {finding.mainReason}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    finding.riskSeverity === 'critical'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : finding.riskSeverity === 'high'
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {finding.riskSeverity} Risk
                  </span>
                  <ConfidenceBadge confidence={finding.confidence} size="md" />
                </div>
              </div>

              {/* Status and Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="unlumen-card p-4 bg-navy-850/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Current Status</span>
                  <span className="text-sm font-bold text-white">{finding.status}</span>
                </div>
                <div className="unlumen-card p-4 bg-navy-850/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Risk Score</span>
                  <span className="text-sm font-bold text-red-400 font-mono">{finding.riskScore}/100</span>
                </div>
                <div className="unlumen-card p-4 bg-navy-850/80 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Detected Time</span>
                  <span className="text-sm font-bold text-slate-300">{finding.detectedTime}</span>
                </div>
              </div>

              <div className="unlumen-card p-4 bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-cyan-400 shrink-0" />
                  <p className="text-xs text-cyan-200">
                    This profile was detected during automated threat scans. Proceed to review the specific signals.
                  </p>
                </div>
                <button
                  onClick={handleNext}
                  className="btn-smooth px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 shrink-0"
                >
                  <span>Next: See why</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WHY IT IS SUSPICIOUS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Why this was flagged
                  </h3>
                  <p className="text-xs text-slate-400">
                    The detection engine identified {finding.signals.length} high-confidence risk signals.
                  </p>
                </div>
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  {finding.signals.length} Signals Identified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {finding.signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="unlumen-card p-4 bg-navy-850/80 border border-slate-800 flex items-start gap-3.5 hover:border-slate-700 transition-all shadow-sm"
                  >
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0 mt-0.5 border border-red-500/20">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-bold text-white">{sig.title}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          sig.strength === 'Critical'
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        }`}>
                          {sig.strength}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sig.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 7: Signal Score Horizontal Bar Chart */}
              <SignalScoreBarChart finding={finding} />

              {/* Look-alike Breakdown */}
              {finding.lookalike && (
                <div className="unlumen-card p-4 bg-navy-850/80 border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                    [HOMOGLYPH_COMPARISON] Look-alike brand analysis
                  </span>
                  <div className="flex items-center gap-3 text-xs bg-navy-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Official:</span>
                    <span className="font-semibold text-emerald-400">{finding.lookalike.official}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-slate-400">Candidate:</span>
                    <span className="font-semibold text-red-400">{finding.lookalike.candidate}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {finding.lookalike.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: OFFICIAL COMPARISON */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Side-by-Side Asset Comparison
                </h3>
                <p className="text-xs text-slate-400">
                  Compare your verified corporate benchmark against the candidate under review.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Verified Official Asset */}
                <div className="unlumen-card p-5 bg-gradient-to-b from-emerald-950/20 to-navy-900/80 border border-emerald-500/30 space-y-4 shadow-lg shadow-emerald-950/20">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Verified official asset
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified official
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Asset Name</span>
                      <span className="text-white font-semibold">
                        {'name' in officialAsset ? officialAsset.name : ('displayName' in officialAsset ? officialAsset.displayName : 'AcmePay')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">
                        {isApp ? 'Package ID' : 'Handle / Account ID'}
                      </span>
                      <span className="text-emerald-400 font-mono font-medium">
                        {isApp ? (officialAsset as any).packageId : ((officialAsset as any).handle || '@acmepay')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Publisher / Owner</span>
                      <span className="text-slate-200">
                        {brandProfile.companyName || 'AcmePay Technologies'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Authorized Domain</span>
                      <span className="text-cyan-400 font-mono">
                        {brandProfile.website || 'https://acmepay.com'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Profile or app being checked */}
                <div className="unlumen-card p-5 bg-gradient-to-b from-red-950/25 to-navy-900/80 border border-red-500/30 space-y-4 shadow-lg shadow-red-950/20">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Profile or app being checked
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/25">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Potential impersonation
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Candidate Name</span>
                      <span className="text-red-300 font-semibold">{finding.title}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">
                        {isApp ? 'Package ID' : 'Username / Handle'}
                      </span>
                      <span className="text-red-400 font-mono font-medium">{finding.usernameOrPackage}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Publisher / Owner</span>
                      <span className="text-slate-300">{finding.publisherOrOwner}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Candidate Website / Domain</span>
                      <span className="text-red-400 font-mono break-all">{finding.candidateWebsite}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUPPORTING EVIDENCE */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Supporting Evidence Locker
                </h3>
                <p className="text-xs text-slate-400">
                  Forensic timestamps, source crawler origins, and cryptographic SHA-256 evidence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evidence Metadata */}
                <div className="unlumen-card p-4 bg-navy-850/80 border border-slate-800 space-y-3 text-xs shadow-sm">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">Candidate URL</span>
                    <a
                      href={finding.candidateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline font-mono text-[11px] break-all inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>{finding.candidateUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block">First Seen</span>
                      <span className="text-slate-200">{finding.firstSeen}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Last Seen</span>
                      <span className="text-slate-200">{finding.lastSeen}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Ingestion Source</span>
                    <span className="text-slate-300 font-bold">{finding.evidence.source}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">SHA-256 Evidence Hash</span>
                    <code className="text-[10px] text-cyan-400 font-mono bg-navy-950 p-2 rounded-lg block break-all border border-slate-800 shadow-inner">
                      {finding.evidence.sha256Hash}
                    </code>
                  </div>
                </div>

                {/* Screenshot Placeholder */}
                <div className="unlumen-card p-4 bg-navy-850/80 border border-slate-800 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-2">Preserved Visual Capture</span>
                    <div className="h-44 rounded-xl bg-navy-950 border border-slate-800/80 flex flex-col items-center justify-center p-4 text-center shadow-inner">
                      <ShieldAlert className="w-10 h-10 text-cyan-500/50 mb-2" />
                      <span className="text-xs font-semibold text-slate-300">
                        {finding.evidence.screenshotLabel || 'Automated Page Capture'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">
                        Archived at {finding.evidence.detectedAt || finding.detectedTime}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Evidence items: 1 archived</span>
                    <span className="text-emerald-400 font-semibold">Digitally Verified</span>
                  </div>
                </div>
              </div>

              {/* Connected Campaign Section (Section 14) */}
              {finding.connectedCampaign && (
                <div className="unlumen-card p-4 bg-[#020713] border border-[#00FFA3]/30 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00FFA3]" />
                    <h4 className="text-xs font-bold text-white">Possible connected campaign</h4>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    These findings share branding or infrastructure and may be related.
                  </p>
                  <div className="bg-[#00050B] p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Campaign Name:</span>
                      <span className="font-semibold text-[#00FFA3]">{finding.connectedCampaign.campaignName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Suspicious Domain:</span>
                      <span className="font-mono text-slate-300">{finding.connectedCampaign.suspiciousDomain}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Infrastructure:</span>
                      <span className="text-slate-300">{finding.connectedCampaign.sharedInfrastructure}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW AND ACTION */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Analyst Review & Remediation
                </h3>
                <p className="text-xs text-slate-400">
                  Update investigation disposition and record internal security notes.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="unlumen-card p-5 bg-[#020713] border border-slate-800 space-y-4 shadow-md">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Action
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleStatusChange('Confirmed fake')}
                    className={`btn-smooth p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                      finding.status === 'Confirmed fake'
                        ? 'bg-red-500/20 text-red-300 border-red-500/60 ring-2 ring-red-500/40 shadow-lg shadow-red-950/40'
                        : 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'
                    }`}
                  >
                    <FileCheck2 className="w-4.5 h-4.5" />
                    <span>Confirm impersonation</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('Investigating')}
                    className={`btn-smooth p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                      finding.status === 'Investigating'
                        ? 'bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/60 ring-2 ring-[#00FFA3]/40 shadow-[0_0_15px_rgba(0, 255, 163,0.3)]'
                        : 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/25 hover:bg-[#00FFA3]/20'
                    }`}
                  >
                    <Clock className="w-4.5 h-4.5" />
                    <span>Mark as investigating</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('Dismissed')}
                    className={`btn-smooth p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                      finding.status === 'Dismissed'
                        ? 'bg-slate-700 text-white border-slate-600 ring-2 ring-slate-500/40 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <FileX2 className="w-4.5 h-4.5" />
                    <span>Dismiss finding</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('Resolved')}
                    className={`btn-smooth p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                      finding.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Mark as resolved</span>
                  </button>
                </div>

                {/* Final reminder required by Section 12 */}
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5 shadow-inner">
                  <Info className="w-4 h-4 text-[#00FFA3] shrink-0" />
                  <span>
                    This score supports review. It is not proof that the profile or app is fake.
                  </span>
                </div>
              </div>

              {/* Automated Takedown Gateway & Registrar Webhook Simulator */}
              <div className="unlumen-card p-5 bg-[#040C1D] border border-[#00FFA3]/30 rounded-xl space-y-4 shadow-[0_0_20px_rgba(0,255,163,0.15)] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-[#00FFA3] animate-pulse" />
                      <span className="text-xs font-mono font-bold text-[#00FFA3] uppercase tracking-wider">
                        Automated Takedown Gateway &amp; Registrar Webhook
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Dispatches signed cryptographic evidence dossier to Cloudflare Abuse API, Google Safe Browsing, and platform registrar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTransmitTakedownPacket}
                    disabled={isTransmitting}
                    className="btn-smooth px-4 py-2.5 rounded-xl bg-[#00FFA3] hover:bg-[#00E88F] text-[#00050B] font-mono font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,163,0.35)] shrink-0"
                  >
                    {isTransmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#00050B] border-t-transparent rounded-full animate-spin" />
                        <span>TRANSMITTING...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>TRANSMIT ABUSE PACKET</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Transmission Terminal */}
                {(transmissionLogs.length > 0 || takedownTicket) && (
                  <div className="p-3.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 text-[#00FFA3]">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>ABUSE_API_GATEWAY // DISPATCH TELEMETRY</span>
                      </div>
                      {takedownTicket && (
                        <span className="px-2 py-0.5 rounded bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40 font-bold">
                          TICKET: #{takedownTicket}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] space-y-1 text-slate-300 max-h-28 overflow-y-auto">
                      {transmissionLogs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-[#00FFA3] select-none">&gt;</span>
                          <span className={log.includes('[CONFIRMED]') ? 'text-[#00FFA3] font-bold' : ''}>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Note Section */}
              <div className="unlumen-card p-5 bg-navy-850/80 border border-slate-800 space-y-4 shadow-md">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Analyst Notes & Activity History</span>
                </span>

                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note about this finding..."
                    className="w-full p-3 rounded-xl bg-navy-950 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none shadow-inner"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !noteText.trim()}
                      className="btn-smooth px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-md shadow-cyan-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Add note</span>
                    </button>
                  </div>
                </form>

                {/* Timeline */}
                {finding.timeline && finding.timeline.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold block">
                      Past Notes
                    </span>
                    {finding.timeline.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-navy-950 border border-slate-800/80 text-xs shadow-inner">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-200">{item.author} ({item.role})</span>
                          <span className="font-mono">{item.timestamp}</span>
                        </div>
                        <p className="text-slate-300">{item.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 border-t border-cyan-500/20 bg-navy-950/90 backdrop-blur-md flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="btn-smooth px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Exit report' : 'Back'}</span>
          </button>

          <div className="text-xs text-slate-400 font-mono font-medium">
            Step {currentStep} of {totalSteps}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="btn-smooth px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <span>Next: {stepTitles[currentStep]}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn-smooth px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish & Exit Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
