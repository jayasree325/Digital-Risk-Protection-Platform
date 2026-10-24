import React, { useState, useMemo } from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { Finding, ScanStageId } from '../../types';
import { DonutChart } from '../charts/DonutChart';
import { SourceBarChart } from '../charts/SourceBarChart';
import { TrendLineChart } from '../charts/TrendLineChart';
import { OfficialAssetsChart } from '../charts/OfficialAssetsChart';
import { PlatformBadge } from '../common/PlatformBadge';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight,
  Radar,
  Share2,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Check,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Layers,
  FileText
} from 'lucide-react';

export const ScanResultsView: React.FC = () => {
  const { 
    findings, 
    linkChecks,
    openReportModal, 
    updateFindingStatus, 
    runNewScan,
    isScanning,
    setActivePage,
    navigateToFindings,
    selectedScanStage,
    setSelectedScanStage,
    stageProfileIndex,
    setStageProfileIndex,
    brandProfile,
    company,
    showToast
  } = useBrandGuard();

  // Skipped IDs for the current session
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // Detailed Evidence Chart Tab
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'donut' | 'source' | 'trend' | 'assets'>('donut');

  // Stages configuration
  const stages: Array<{
    id: ScanStageId;
    stepNumber: number;
    title: string;
    subtitle: string;
    color: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
  }> = [
    {
      id: 'critical',
      stepNumber: 1,
      title: 'Critical findings',
      subtitle: 'Profiles with immediate credential theft or malicious APK signals.',
      color: '#FF5878',
      badgeBg: 'bg-[#FF5878]/15',
      badgeText: 'text-[#FF5878]',
      borderColor: 'border-[#FF5878]/30',
    },
    {
      id: 'high',
      stepNumber: 2,
      title: 'High-risk findings',
      subtitle: 'Look-alike accounts mimicking support channels with external links.',
      color: '#f97316',
      badgeBg: 'bg-orange-500/15',
      badgeText: 'text-orange-400',
      borderColor: 'border-orange-500/30',
    },
    {
      id: 'medium',
      stepNumber: 3,
      title: 'Medium-risk findings',
      subtitle: 'Typosquatting variations and unauthorized brand name usage.',
      color: '#FFBD69',
      badgeBg: 'bg-[#FFBD69]/15',
      badgeText: 'text-[#FFBD69]',
      borderColor: 'border-[#FFBD69]/30',
    },
    {
      id: 'low',
      stepNumber: 4,
      title: 'Low-risk findings',
      subtitle: 'Generic bots, community groups, and redirect test links.',
      color: '#94a3b8',
      badgeBg: 'bg-slate-500/15',
      badgeText: 'text-slate-400',
      borderColor: 'border-slate-500/30',
    },
  ];

  // Group findings by severity
  const findingsByStage = useMemo(() => {
    return {
      critical: findings.filter((f) => f.riskSeverity === 'critical'),
      high: findings.filter((f) => f.riskSeverity === 'high'),
      medium: findings.filter((f) => f.riskSeverity === 'medium'),
      low: findings.filter((f) => f.riskSeverity === 'low'),
    };
  }, [findings]);

  // Current stage findings
  const currentStageFindings = findingsByStage[selectedScanStage] || [];
  const currentFinding: Finding | undefined = currentStageFindings[stageProfileIndex] || currentStageFindings[0];

  // Counts
  const totalFindings = findings.length;
  const criticalCount = findingsByStage.critical.length;
  const highCount = findingsByStage.high.length;
  const mediumCount = findingsByStage.medium.length;
  const lowCount = findingsByStage.low.length;

  const socialCount = findings.filter((f) => f.type === 'social').length;
  const appCount = findings.filter((f) => f.type === 'app').length;
  const linkCount = linkChecks.filter((l) => l.verdict !== 'Approved').length || 3;

  // Donut chart data
  const severityDonutSegments = useMemo(() => {
    const total = totalFindings || 1;
    return [
      { label: 'Critical Risk', count: criticalCount, pct: Math.round((criticalCount / total) * 100), color: '#FF5878' },
      { label: 'High Risk', count: highCount, pct: Math.round((highCount / total) * 100), color: '#f97316' },
      { label: 'Medium Risk', count: mediumCount, pct: Math.round((mediumCount / total) * 100), color: '#FFBD69' },
      { label: 'Low Risk', count: lowCount, pct: Math.round((lowCount / total) * 100), color: '#94a3b8' },
    ];
  }, [totalFindings, criticalCount, highCount, mediumCount, lowCount]);

  // Stage navigation
  const handleNextProfile = () => {
    if (stageProfileIndex < currentStageFindings.length - 1) {
      setStageProfileIndex(stageProfileIndex + 1);
    } else {
      const currentIndex = stages.findIndex((s) => s.id === selectedScanStage);
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1].id;
        setSelectedScanStage(nextStage);
        setStageProfileIndex(0);
        showToast(`Moving to Stage ${currentIndex + 2}: ${stages[currentIndex + 1].title}`, 'info');
      }
    }
  };

  const handlePrevProfile = () => {
    if (stageProfileIndex > 0) {
      setStageProfileIndex(stageProfileIndex - 1);
    }
  };

  const handleConfirmImpersonation = async (finding: Finding) => {
    await updateFindingStatus(finding.id, 'Confirmed fake', 'Confirmed fake via scan-results triage review.');
    showToast(`Marked "${finding.title}" as Confirmed fake`, 'success');
    handleNextProfile();
  };

  const handleSkipFinding = (finding: Finding) => {
    setSkippedIds((prev) => new Set(prev).add(finding.id));
    showToast(`Skipped for now: Preserved in ${selectedScanStage} queue`, 'info');
    handleNextProfile();
  };

  const handleSelectStage = (stageId: ScanStageId) => {
    setSelectedScanStage(stageId);
    setStageProfileIndex(0);
  };

  // Check if all stages are reviewed
  const isAllStagesReviewed = useMemo(() => {
    const activeLeft = findings.filter((f) => f.status === 'New' || f.status === 'Investigating');
    return activeLeft.length === 0;
  }, [findings]);

  const currentStageConfig = stages.find((s) => s.id === selectedScanStage) || stages[0];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20 text-xs animate-in fade-in duration-200">
      
      {/* =========================================================================
          SECTION 1: SCAN COMPLETION STATUS
          ========================================================================= */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#020713]/90 border border-[#00E5FF]/20 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/40 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00FFA3] px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/30">
                <CheckCircle2 className="w-4 h-4 text-[#00FFA3]" />
                <span>Scan complete</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Target: {brandProfile.brandName || company?.name || 'AcmePay'} Brand Perimeter
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight font-mono">
              Scan Results & Priority Triage
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              We identified suspicious digital assets across social channels, app repositories, and candidate domains. Review findings below in prioritized risk stages.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => runNewScan('all')}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111B30] hover:bg-[#17223B] text-slate-200 border border-[#24324D] transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Run new scan</span>
            </button>

            <button
              onClick={() => navigateToFindings('all')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] hover:opacity-90 text-[#00050B] shadow-[0_0_15px_rgba(0, 255, 163,0.3)] transition-all flex items-center justify-center gap-2 font-mono"
            >
              <span>View all in Findings</span>
              <ArrowRight className="w-4 h-4 text-[#00050B]" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: TOTAL FINDINGS
          ========================================================================= */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00FFA3]" />
          <span>Total Findings Summary</span>
        </h2>

        <div 
          onClick={() => navigateToFindings('all')}
          className="p-6 rounded-2xl bg-[#020713]/85 border border-[#00FFA3]/30 hover:border-[#00FFA3]/60 transition-all cursor-pointer group shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="font-mono text-xs uppercase font-bold text-[#00FFA3]">Comprehensive Perimeter Audit</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Total potential impersonations, lookalikes, and unverified assets currently tracked across public channels.
            </p>
          </div>

          <div className="flex items-center gap-6 self-start sm:self-center">
            <div className="text-right">
              <div className="text-4xl font-black text-white font-mono group-hover:text-[#00FFA3] transition-colors">
                {totalFindings}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Total Findings</span>
            </div>

            <div className="p-3 rounded-xl bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTIONS 3-6: RISK STAGES (Critical, High, Medium, Low)
          Arranged vertically, one below another
          ========================================================================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Prioritized Risk Stages</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a stage below to inspect individual suspect profiles one at a time.
          </p>
        </div>

        {/* Vertical Stack of the 4 Stages */}
        <div className="space-y-3">
          {stages.map((st) => {
            const isSelected = selectedScanStage === st.id;
            const count = findingsByStage[st.id].length;

            return (
              <div key={st.id} className="space-y-3">
                {/* Stage Header Card */}
                <div
                  onClick={() => handleSelectStage(st.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? `bg-[#020713] border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.15)] ring-1 ring-cyan-400/40`
                      : 'bg-[#00050B]/80 border-slate-800 hover:bg-[#020713] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <span 
                      className="w-3 h-3 rounded-full mt-1 sm:mt-0 flex-shrink-0"
                      style={{ backgroundColor: st.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          Stage {st.stepNumber}: {st.title}
                        </h3>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${st.badgeBg} ${st.badgeText}`}>
                          {count} {count === 1 ? 'profile' : 'profiles'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {st.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-semibold text-slate-300">
                      {isSelected ? 'Active Review Stage' : 'Select Stage'}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
                  </div>
                </div>

                {/* Expanded Profile Review Card (shown directly below the selected stage) */}
                {isSelected && (
                  <div className="p-6 rounded-2xl bg-[#020713]/95 border border-cyan-500/30 shadow-xl space-y-5 animate-in fade-in duration-150">
                    {currentStageFindings.length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white">No {st.title.toLowerCase()} found</h4>
                        <p className="text-xs text-slate-400">All findings in this risk tier have been reviewed or dismissed.</p>
                      </div>
                    ) : currentFinding ? (
                      <div className="space-y-4">
                        {/* Profile Header & Pagination Counter */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                          <div>
                            <span className="text-[11px] font-mono text-cyan-400 font-semibold block mb-0.5">
                              PROFILE {stageProfileIndex + 1} OF {currentStageFindings.length} IN THIS STAGE
                            </span>
                            <h4 className="text-base font-bold text-white">
                              {currentFinding.title}
                            </h4>
                          </div>

                          <span className={`self-start sm:self-auto text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${st.badgeBg} ${st.badgeText} ${st.borderColor}`}>
                            Risk Score: {currentFinding.riskScore}/100 ({currentFinding.confidence} Confidence)
                          </span>
                        </div>

                        {/* Finding Metadata & Reason */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                            <PlatformBadge platform={currentFinding.platform} type={currentFinding.type} size="xs" />
                            <span>&bull;</span>
                            <span className="font-mono text-slate-300">{currentFinding.usernameOrPackage}</span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-200 leading-relaxed">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Why flagged:</span>
                            {currentFinding.mainReason || currentFinding.detailedReason}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => openReportModal(currentFinding)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] hover:opacity-90 text-[#00050B] font-bold text-xs transition-opacity flex items-center gap-1.5 shadow-md"
                          >
                            <span>Review details</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#00050B]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirmImpersonation(currentFinding)}
                            className="px-4 py-2 rounded-xl bg-[#FF5878]/15 hover:bg-[#FF5878]/25 text-[#FF5878] border border-[#FF5878]/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Confirm impersonation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSkipFinding(currentFinding)}
                            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] text-xs font-medium transition-colors"
                          >
                            <span>Skip for now</span>
                          </button>
                        </div>

                        {/* Step Navigation Controls */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handlePrevProfile}
                              disabled={stageProfileIndex === 0}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Back</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleNextProfile}
                              disabled={stageProfileIndex >= currentStageFindings.length - 1}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <span>Next profile</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigateToFindings('all', selectedScanStage)}
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>View all {selectedScanStage} findings</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: DETAILED EVIDENCE
          Rule: Supporting charts in clean tabs, full width, 1 chart at a time
          ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00FFA3]" />
              <span>Detailed Evidence & Analytics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Information collected to support this scan, distributed across sources and timelines.
            </p>
          </div>

          {/* Clean Evidence Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#020713] border border-white/[0.08] overflow-x-auto">
            <button
              onClick={() => setActiveEvidenceTab('donut')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeEvidenceTab === 'donut'
                  ? 'bg-[#00FFA3] text-[#00050B] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk Level Matrix
            </button>

            <button
              onClick={() => setActiveEvidenceTab('source')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeEvidenceTab === 'source'
                  ? 'bg-[#00FFA3] text-[#00050B] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Findings by Source
            </button>

            <button
              onClick={() => setActiveEvidenceTab('trend')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeEvidenceTab === 'trend'
                  ? 'bg-[#00FFA3] text-[#00050B] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Activity Over Time
            </button>

            <button
              onClick={() => setActiveEvidenceTab('assets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeEvidenceTab === 'assets'
                  ? 'bg-[#00FFA3] text-[#00050B] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Official Assets
            </button>
          </div>
        </div>

        {/* Full-width container rendering exactly 1 selected chart */}
        <div className="p-6 rounded-2xl bg-[#020713]/85 border border-[#00FFA3]/20 shadow-xl">
          {activeEvidenceTab === 'donut' && (
            <DonutChart
              title="Findings by risk level"
              total={totalFindings}
              segments={severityDonutSegments}
              textSummary="Distribution of findings by severity. Click any tier to jump directly into that stage."
              onSelectSegment={(seg) => {
                if (seg.label.includes('Critical')) handleSelectStage('critical');
                else if (seg.label.includes('High')) handleSelectStage('high');
                else if (seg.label.includes('Medium')) handleSelectStage('medium');
                else if (seg.label.includes('Low')) handleSelectStage('low');
              }}
            />
          )}

          {activeEvidenceTab === 'source' && (
            <SourceBarChart
              socialCount={socialCount}
              appCount={appCount}
              linkCount={linkCount}
              onSelectSource={(source) => {
                if (source === 'social') navigateToFindings('social');
                else if (source === 'app') navigateToFindings('app');
                else setActivePage('check-link');
              }}
            />
          )}

          {activeEvidenceTab === 'trend' && (
            <TrendLineChart />
          )}

          {activeEvidenceTab === 'assets' && (
            <OfficialAssetsChart />
          )}
        </div>
      </section>

      {/* Review completion state */}
      {isAllStagesReviewed && (
        <section className="p-6 rounded-2xl bg-[#020713]/90 border border-emerald-500/30 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">All stages reviewed</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            You reviewed all scan stages. You can reopen any finding from the Findings repository.
          </p>
          <button
            onClick={() => navigateToFindings('all')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <span>View all findings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

    </div>
  );
};
