import React, { useState } from 'react';
import { Finding, TriageRecommendation, TriageActionType, TriageActionStatus } from '../../types';
import { getTriageRecommendationForFinding } from '../../data/mockData';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  Compass, 
  ShieldAlert, 
  Send, 
  FileCheck2, 
  AlertTriangle, 
  Eye, 
  FolderPlus, 
  ArrowUpRight, 
  CheckCircle2, 
  HelpCircle,
  X,
  Lock
} from 'lucide-react';
import { PlatformBadge } from '../common/PlatformBadge';

interface TriageRecommendationPanelProps {
  finding: Finding;
  onOpenReportModal?: () => void;
}

export const TriageRecommendationPanel: React.FC<TriageRecommendationPanelProps> = ({ 
  finding,
  onOpenReportModal 
}) => {
  const { cases, assignFindingToCase, showToast, addFindingNote } = useBrandGuard();
  const initialRec = getTriageRecommendationForFinding(finding);
  
  const [recommendation, setRecommendation] = useState<TriageRecommendation>(initialRec);
  const [selectedCaseToJoin, setSelectedCaseToJoin] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<TriageActionType | null>(null);

  const getActionIcon = (action: TriageActionType) => {
    switch (action) {
      case 'Escalate':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'Contact Platform':
        return <Send className="w-5 h-5 text-purple-400" />;
      case 'Verify Ownership':
        return <FileCheck2 className="w-5 h-5 text-cyan-400" />;
      case 'Capture Evidence':
        return <Lock className="w-5 h-5 text-emerald-400" />;
      case 'Warn Customers':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'Add to Case':
        return <FolderPlus className="w-5 h-5 text-[#00FFA3]" />;
      case 'Monitor Changes':
      default:
        return <Eye className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority: TriageRecommendation['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-950/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Low':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const handleInitiateAction = (action: TriageActionType) => {
    setPendingAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    setRecommendation((prev) => ({
      ...prev,
      status: 'Completed',
    }));

    addFindingNote(
      finding.id,
      `Executed triage recommendation: "${pendingAction}". Workflow confirmed by analyst.`
    );

    showToast(`Triage action "${pendingAction}" executed successfully`, 'success');
    setIsConfirmModalOpen(false);
  };

  const handleAttachToCase = () => {
    if (!selectedCaseToJoin) return;
    assignFindingToCase(selectedCaseToJoin, finding.id);
    setSelectedCaseToJoin('');
  };

  return (
    <div className="unlumen-card p-5 bg-gradient-to-b from-[#061226] to-[#020713] border border-[#00FFA3]/35 rounded-2xl space-y-4 shadow-xl font-sans relative overflow-hidden">
      {/* Glow Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#00FFA3]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#00FFA3] uppercase tracking-widest bg-[#00FFA3]/15 px-2.5 py-0.5 rounded border border-[#00FFA3]/30">
              TRIAGE_ADVISOR
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getPriorityBadge(recommendation.priority)}`}>
              {recommendation.priority} Priority
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Demo data
            </span>
          </div>
          <h3 className="text-sm font-bold text-white font-mono mt-1 flex items-center gap-2">
            <span>Recommended Next Action:</span>
            <span className="text-[#00FFA3] underline underline-offset-4 font-black">
              {recommendation.action}
            </span>
          </h3>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">Action Status:</span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            recommendation.status === 'Completed'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
          }`}>
            {recommendation.status}
          </span>
        </div>
      </div>

      {/* Rationale & Reasoning */}
      <div className="space-y-2 text-xs">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
          Recommendation Rationale:
        </span>
        <p className="text-slate-200 leading-relaxed bg-[#020611] p-3 rounded-xl border border-slate-800/80 font-sans">
          {recommendation.reason}
        </p>
      </div>

      {/* Suggested Workflow */}
      <div className="space-y-1.5 text-xs font-mono">
        <span className="text-[11px] text-[#00FFA3] uppercase tracking-wider block font-bold">
          Suggested Action Workflow:
        </span>
        <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
          {recommendation.suggestedWorkflow}
        </div>
      </div>

      {/* Interactive Action Controls */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        
        {/* Quick Assign to Case */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCaseToJoin}
            onChange={(e) => setSelectedCaseToJoin(e.target.value)}
            className="bg-[#020713] border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none max-w-[190px]"
          >
            <option value="">Add finding to case...</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.title.slice(0, 24)}...
              </option>
            ))}
          </select>
          <button
            onClick={handleAttachToCase}
            disabled={!selectedCaseToJoin}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold disabled:opacity-40"
          >
            Attach
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleInitiateAction(recommendation.action)}
            disabled={recommendation.status === 'Completed'}
            className="btn-smooth px-4 py-2 rounded-xl bg-[#00FFA3] text-[#00050B] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0, 255, 163,0.3)] hover:bg-[#00E5FF] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {getActionIcon(recommendation.action)}
            <span>Execute &ldquo;{recommendation.action}&rdquo;</span>
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="unlumen-card w-full max-w-md bg-[#030A19] border border-[#00FFA3]/40 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Confirm Triage Action</span>
              </h3>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-300 leading-relaxed font-sans">
                You are about to execute the triage recommendation <strong className="text-white">&ldquo;{pendingAction}&rdquo;</strong> for:
              </p>
              <div className="p-3 rounded-xl bg-[#020713] border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Entity:</span>
                  <span className="text-white font-bold">{finding.title}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Platform:</span>
                  <PlatformBadge platform={finding.platform} size="xs" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Risk Score:</span>
                  <span className="text-red-400 font-bold">{finding.riskScore}%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-sans">
                Notice: External actions (e.g. takedown emails, legal notices) require explicit human confirmation. No external services are contacted automatically.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-[#00FFA3] text-[#00050B] font-bold shadow-md hover:bg-[#00E5FF]"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
