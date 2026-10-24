import React, { useState } from 'react';
import { Finding } from '../../types';
import { 
  Scale, 
  FileCheck, 
  Copy, 
  ExternalLink, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  BookOpen, 
  FileText, 
  X,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { PlatformBadge } from '../common/PlatformBadge';

interface PlatformPolicyMatchPanelProps {
  finding: Finding;
}

export const PlatformPolicyMatchPanel: React.FC<PlatformPolicyMatchPanelProps> = ({ finding }) => {
  const { showToast, brandProfile, company } = useBrandGuard();

  const brandName = brandProfile.brandName || company?.name || 'AcmePay';

  // Interactive Checklist Items
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'brand-proof': true,
    'candidate-url': true,
    'screenshot': true,
    'copied-logo': true,
    'suspicious-domain': true,
    'analyst-confirm': finding.status === 'Confirmed fake',
  });

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [copiedEvidence, setCopiedEvidence] = useState(false);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const totalChecklistCount = Object.keys(checklist).length;
  const completenessPercent = Math.round((completedChecklistCount / totalChecklistCount) * 100);

  // Platform and Policy mapping
  const platform = finding.platform || 'Instagram';
  const policyInfo = {
    platform,
    policyArea: platform === 'Google Play'
      ? 'Google Play Developer Policy &bull; Impersonation & Intellectual Property (§ 3.4)'
      : platform === 'Apple App Store'
      ? 'App Store Review Guidelines &bull; Safety, Trademark & Intellectual Property (§ 5.2)'
      : platform === 'Web Domain'
      ? 'ICANN Uniform Domain-Name Dispute-Resolution Policy (UDRP) & ICANN Phishing Spec'
      : platform === 'Telegram'
      ? 'Telegram Terms of Service & Scam / Impersonation Bot Enforcement (§ 6)'
      : 'Meta Community Standards & Commercial Impersonation / Trademark Policy (§ 4.2)',
    takedownLikelihoodPercent: finding.riskScore >= 85 ? 94 : 78,
    policyExcerpt: `Under ${platform} intellectual property guidelines, accounts or apps that utilize authentic registered logos, misrepresent affiliation with financial institutions, or replicate corporate trademarks without authorization are subject to expedited removal upon receipt of a complete evidentiary notice.`,
  };

  const handleCopyEvidence = () => {
    const docket = `TAKEDOWN EVIDENCE DOCKET (DEMO ESTIMATE)
Target Entity: ${finding.title} (${finding.platform})
Candidate URL: ${finding.candidateUrl}
Protected Brand: ${brandName} (Official domain: ${brandProfile.website})
Risk Score: ${finding.riskScore}/100 | Severity: ${finding.riskSeverity.toUpperCase()}
Policy Violated: ${policyInfo.policyArea}

Evidentiary Checklist (${completenessPercent}% Complete):
- Official Brand Proof: ${checklist['brand-proof'] ? 'VERIFIED' : 'PENDING'}
- Candidate URL Log: ${checklist['candidate-url'] ? 'ATTACHED' : 'PENDING'}
- Forensic Screenshot Hash: ${checklist['screenshot'] ? `ATTACHED (${finding.evidence.sha256Hash.slice(0, 16)}...)` : 'PENDING'}
- Copied Logo Forensics: ${checklist['copied-logo'] ? 'ATTACHED (88.4% Delta Match)' : 'PENDING'}
- Phishing Domain Telemetry: ${checklist['suspicious-domain'] ? 'ATTACHED' : 'PENDING'}
- Analyst Confirmation: ${checklist['analyst-confirm'] ? 'CONFIRMED' : 'PENDING'}`;

    navigator.clipboard?.writeText(docket);
    setCopiedEvidence(true);
    showToast('Takedown evidence docket copied to clipboard', 'success');
    setTimeout(() => setCopiedEvidence(false), 2500);
  };

  return (
    <section className="p-5 rounded-2xl bg-navy-850/90 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Scale className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform Policy Match & Takedown Docket
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Demo data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maps detected evidence against host platform legal terms for expedited abuse escalation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PlatformBadge platform={platform} size="sm" />
        </div>
      </div>

      {/* Main Grid: Policy Area & Takedown Likelihood */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left: Policy & Matching Evidence (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Applicable Platform Policy Area
            </span>
            <p className="text-xs font-bold text-white leading-snug">
              {policyInfo.policyArea}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed italic pt-1 border-t border-slate-800/80">
              &ldquo;{policyInfo.policyExcerpt}&rdquo;
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Matching Evidentiary Triggers
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Trademark Exact Match:</strong> Name contains protected term &ldquo;{brandName}&rdquo; without authorized developer certificate.
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Deceptive Commercial Intent:</strong> Bio redirects visitors to external unapproved authentication form ({finding.candidateWebsite}).
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Unlicensed Logo Asset:</strong> Pixel forensics confirm vector mimicry of official corporate emblem.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Likelihood & Checklist (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          {/* Takedown Likelihood Gauge */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Takedown Likelihood</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {policyInfo.takedownLikelihoodPercent}% High
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${policyInfo.takedownLikelihoodPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-amber-300/90 italic leading-snug">
              Demo estimate — not a guarantee of platform action. Never submit a real takedown request.
            </p>
          </div>

          {/* Interactive Report Checklist */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Abuse Report Checklist
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                {completedChecklistCount}/{totalChecklistCount} ({completenessPercent}%)
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { id: 'brand-proof', label: 'Official brand proof & trademark registration' },
                { id: 'candidate-url', label: 'Candidate profile / package URL link' },
                { id: 'screenshot', label: 'Forensic screenshot & SHA-256 hash' },
                { id: 'copied-logo', label: 'Copied logo delta comparison' },
                { id: 'suspicious-domain', label: 'Suspicious domain WHOIS telemetry' },
                { id: 'analyst-confirm', label: 'Analyst confirmation sign-off' },
              ].map((item) => {
                const isChecked = !!checklist[item.id];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="w-full flex items-center gap-2 p-1 rounded hover:bg-slate-900 text-left transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <span className={`text-[11px] truncate ${isChecked ? 'text-slate-200' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyEvidence}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            {copiedEvidence ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied Evidence!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Report Evidence</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsPolicyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 hover:bg-slate-800 text-slate-300 font-medium border border-slate-800 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>View Platform Policy</span>
          </button>
        </div>

        <button
          onClick={() => setIsDraftModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Prepare Report Draft</span>
        </button>
      </div>

      {/* Policy Modal */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-navy-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>{platform} Abuse Policy Reference</span>
              </h3>
              <button onClick={() => setIsPolicyModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-white">{policyInfo.policyArea}</p>
              <p>{policyInfo.policyExcerpt}</p>
              <p className="text-[11px] text-slate-400">
                Applicable platform channels accept formal infringement notices from verified brand owners. Estimated typical platform SLA response time: 24&ndash;72 hours.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Draft Modal */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-navy-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Formal Abuse & Impersonation Takedown Draft
                </h3>
              </div>
              <button onClick={() => setIsDraftModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
{`TO: ${platform} Trust & Safety Enforcement Desk
SUBJECT: Urgent Trademark Infringement & Impersonation Report - ${brandName}

I am an authorized digital brand security representative for ${brandName}.
We have verified an unauthorized asset impersonating our corporate identity:

Infringing Candidate: ${finding.title}
Platform Location: ${finding.candidateUrl}
Detected Threat Level: ${finding.riskSeverity.toUpperCase()} (Score: ${finding.riskScore}/100)

VIOLATIONS:
1. Unauthorized utilization of ${brandName} registered trademarks.
2. Deployment of deceptive credential harvesting links in bio.
3. Exploitation of official logo artwork to deceive general consumers.

We respectfully request immediate termination of this asset under ${policyInfo.policyArea}.
Cryptographic evidence docket is attached.`}
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Simulation only: No real takedown request will ever be sent to {platform}.</span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`TO: ${platform} Trust & Safety Enforcement Desk\nSUBJECT: Urgent Trademark Infringement - ${brandName}\nTarget: ${finding.candidateUrl}`);
                  showToast('Draft notice copied to clipboard', 'success');
                  setIsDraftModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Copy Report Draft
              </button>
              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
