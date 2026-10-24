import React from 'react';
import { Finding, FindingStatus } from '../../types';
import { 
  CheckSquare, 
  FileCheck2, 
  FileX2, 
  Download, 
  X, 
  ShieldAlert,
  Terminal
} from 'lucide-react';
import { useBrandGuard } from '../../context/BrandGuardContext';

interface BulkActionFloatingBarProps {
  selectedIds: string[];
  findings: Finding[];
  onClearSelection: () => void;
}

export const BulkActionFloatingBar: React.FC<BulkActionFloatingBarProps> = ({
  selectedIds,
  findings,
  onClearSelection
}) => {
  const { updateFindingStatus, showToast } = useBrandGuard();

  if (selectedIds.length === 0) return null;

  const handleBulkConfirm = () => {
    selectedIds.forEach(id => {
      updateFindingStatus(id, 'Confirmed fake', 'Bulk verified impersonation campaign');
    });
    showToast(`Successfully confirmed ${selectedIds.length} threats as Confirmed Fake`, 'success');
    onClearSelection();
  };

  const handleBulkDismiss = () => {
    selectedIds.forEach(id => {
      updateFindingStatus(id, 'Dismissed', 'Bulk dismissed as authorized/legitimate');
    });
    showToast(`Dismissed ${selectedIds.length} findings as non-malicious`, 'info');
    onClearSelection();
  };

  const handleBulkExport = () => {
    const selectedFindings = findings.filter(f => selectedIds.includes(f.id));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedFindings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `brandguard_evidence_dossier_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${selectedIds.length} threat dossiers to JSON`, 'success');
  };

  return (
    <div className="fixed bottom-8 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-200">
      <div className="pointer-events-auto flex flex-wrap items-center gap-3 px-5 py-3 rounded-2xl bg-[#040C1D]/95 border border-[#00FFA3]/50 shadow-[0_0_35px_rgba(0,255,163,0.3)] backdrop-blur-2xl text-xs font-mono text-white cyber-corners">
        <div className="flex items-center gap-2 pr-3 border-r border-[#00FFA3]/30">
          <CheckSquare className="w-4 h-4 text-[#00FFA3]" />
          <span className="font-bold text-[#00FFA3] tracking-wide">
            {selectedIds.length} {selectedIds.length === 1 ? 'Threat' : 'Threats'} Selected
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkConfirm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 hover:border-red-500/60 font-semibold transition-all shadow-sm"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-red-400" />
            <span>Confirm Fake ({selectedIds.length})</span>
          </button>

          <button
            onClick={handleBulkDismiss}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80 font-semibold transition-all"
          >
            <FileX2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Dismiss</span>
          </button>

          <button
            onClick={handleBulkExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FFA3]/15 text-[#00FFA3] hover:bg-[#00FFA3]/25 border border-[#00FFA3]/40 font-semibold transition-all shadow-[0_0_12px_rgba(0,255,163,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Dossier (JSON)</span>
          </button>
        </div>

        <button
          onClick={onClearSelection}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors ml-2"
          title="Deselect All"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
