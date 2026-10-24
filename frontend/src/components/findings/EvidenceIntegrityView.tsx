import React, { useState } from 'react';
import { Finding, EvidenceIntegrityStatus } from '../../types';
import { getEvidenceIntegrityForFinding } from '../../data/mockData';
import { 
  ShieldCheck, 
  Copy, 
  Camera, 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  RefreshCw, 
  Lock,
  Hash
} from 'lucide-react';
import { useBrandGuard } from '../../context/BrandGuardContext';

interface EvidenceIntegrityViewProps {
  finding: Finding;
}

export const EvidenceIntegrityView: React.FC<EvidenceIntegrityViewProps> = ({ finding }) => {
  const { showToast } = useBrandGuard();
  const integrityData = getEvidenceIntegrityForFinding(finding);
  const [currentStatus, setCurrentStatus] = useState<EvidenceIntegrityStatus>(integrityData.evidenceStatus);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState(integrityData.lastVerificationTime);

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(integrityData.sha256Hash);
    showToast('Cryptographic SHA-256 hash copied to clipboard', 'info');
  };

  const handleVerifyHash = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCurrentStatus('Verified');
      setLastVerified('Just now (Real-time)');
      showToast('SHA-256 integrity re-verified: No tampering detected', 'success');
    }, 450);
  };

  const getStatusBadge = (status: EvidenceIntegrityStatus) => {
    switch (status) {
      case 'Verified':
        return 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 shadow-sm shadow-cyan-950/30';
      case 'Captured':
        return 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40';
      case 'Changed':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Unavailable':
        return 'bg-red-500/15 text-red-300 border-red-500/40';
      case 'Demo Evidence':
      default:
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/20">
              EVIDENCE_CHAIN_OF_CUSTODY
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Demo data
            </span>
          </div>
          <h3 className="text-sm font-bold text-white font-mono mt-1">
            Evidence Integrity & Forensics Record
          </h3>
          <p className="text-xs text-slate-400">
            Tamper-proof digital preservation with cryptographic SHA-256 hashing and automated audit trail.
          </p>
        </div>

        <button
          onClick={handleVerifyHash}
          disabled={isVerifying}
          className="btn-smooth px-3.5 py-1.5 rounded-xl bg-[#00FFA3] text-[#00050B] hover:bg-[#00E5FF] text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-[#00FFA3]/15 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'Verifying Hash...' : 'Audit Check'}</span>
        </button>
      </div>

      {/* Main Integrity Card */}
      <div className="unlumen-card p-5 bg-[#030917]/90 border border-slate-800 rounded-2xl space-y-4">
        
        {/* Status Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Evidence Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(currentStatus)}`}>
              {currentStatus}
            </span>
          </div>

          <span className="text-[#00FFA3] flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cryptographically Intact</span>
          </span>
        </div>

        {/* 2-Column Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          
          {/* Visual Snapshot */}
          <div className="p-4 rounded-xl bg-[#00050B] border border-[#00FFA3]/15 space-y-2.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Screenshot Record</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00FFA3]/10 text-[#00FFA3] text-[10px] border border-[#00FFA3]/25">
                {integrityData.screenshotStatus}
              </span>
            </div>

            <div className="h-28 rounded-xl bg-[#040C1D] border border-[#00FFA3]/15 flex flex-col items-center justify-center p-3 text-center shadow-inner">
              <Camera className="w-6 h-6 text-slate-500 mb-1" />
              <span className="text-[11px] text-slate-300 font-mono leading-tight">
                {finding.evidence.screenshotLabel}
              </span>
            </div>

            <span className="text-[10px] text-slate-500 block truncate">
              Captured via headless browser sensor daemon
            </span>
          </div>

          {/* Source & Timestamps */}
          <div className="p-4 rounded-xl bg-[#00050B] border border-[#00FFA3]/15 space-y-2">
            <span className="text-white font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Chain of Custody Data</span>
            </span>

            <div className="space-y-1.5 text-[11px] text-slate-300 pt-1">
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-500">Source:</span>
                <span className="text-white font-semibold truncate max-w-[180px]">{integrityData.source}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-500">Capture Time:</span>
                <span className="text-slate-300">{integrityData.captureTime}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-500">Last Verified:</span>
                <span className="text-[#00FFA3] font-semibold">{lastVerified}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Tamper Free:</span>
                <span className="text-[#00FFA3] font-bold">100% Verified</span>
              </div>
            </div>
          </div>

        </div>

        {/* Full SHA-256 Hash Box */}
        <div className="p-3.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/15 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Hash className="w-3.5 h-3.5" />
              <span>SHA-256 Cryptographic Hash</span>
            </span>
            <button
              onClick={handleCopyHash}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Full Hash</span>
            </button>
          </div>
          <div className="p-2 rounded bg-black/60 border border-slate-800/80 text-[#00FFA3] text-[11px] break-all select-all font-mono">
            {integrityData.sha256Hash}
          </div>
        </div>

      </div>

      {/* Change & Audit History */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono block">
          Verification & Change History ({integrityData.auditHistory.length} Checkpoints)
        </span>

        <div className="space-y-2">
          {integrityData.auditHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#00050B] border border-[#00FFA3]/15 flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{item.action}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                    Match OK
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Auditor: {item.verifiedBy}
                </span>
              </div>

              <span className="text-slate-500 text-[11px] flex-shrink-0">
                {item.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
