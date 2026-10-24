import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { Finding } from '../types';
import { 
  Bell, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Smartphone, 
  ShieldAlert, 
  AlertTriangle,
  Layers,
  MessageSquare,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { PlatformBadge } from '../components/common/PlatformBadge';

export const AlertPreviewPage: React.FC = () => {
  const { findings, setSelectedFinding, showToast, brandProfile, company } = useBrandGuard();

  const [activePlatform, setActivePlatform] = useState<'slack' | 'teams'>('slack');
  const [selectedFindingId, setSelectedFindingId] = useState<string>(findings[0]?.id || '');
  const [copiedPayload, setCopiedPayload] = useState(false);

  const currentFinding: Finding = findings.find(f => f.id === selectedFindingId) || findings[0] || {
    id: 'f-sample',
    title: 'AcmePay Mobile FastPay',
    type: 'app',
    platform: 'Google Play',
    usernameOrPackage: 'com.acmepay.fastwallet.apk',
    candidateUrl: 'https://play.google.com/store/apps/details?id=com.acmepay.fastwallet',
    riskSeverity: 'critical',
    riskScore: 96,
    confidence: 'High',
    mainReason: 'Trojanized APK requesting SMS read permissions and overlay privileges.',
    detailedReason: 'Mimics official application and intercepts one-time authentication codes.',
    status: 'New',
    detectedTime: '12 minutes ago',
    firstSeen: 'Today',
    lastSeen: 'Now',
    publisherOrOwner: 'AcmePay Digital Studio (Unverified)',
    candidateWebsite: 'https://acmepay-fake.xyz',
    description: 'Deceptive mobile payment client.',
    avatarColor: 'from-red-600 to-rose-700',
    avatarInitials: 'AP',
    lookalike: { official: 'AcmePay', candidate: 'AcmePay FastPay', differenceType: 'added_words', highlightedParts: [], explanation: 'Added words' },
    signals: [],
    evidence: { evidenceCount: 4, source: 'Play Scraper', rawUrl: '', detectedAt: 'Today', firstSeen: 'Today', lastSeen: 'Today', sha256Hash: 'a7b8c9d0e1f2...', screenshotLabel: 'Fake App Screenshot' },
    timeline: [],
  };

  const handleCopyPayload = () => {
    let payload = {};
    if (activePlatform === 'slack') {
      payload = {
        text: `🚨 [CRITICAL ALERT] Brand Impersonation Threat Detected: ${currentFinding.title}`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `🚨 BrandGuard Incident Alert: ${currentFinding.title}` },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Platform:*\n${currentFinding.platform}` },
              { type: 'mrkdwn', text: `*Risk Score:*\n${currentFinding.riskScore}/100 (${currentFinding.riskSeverity.toUpperCase()})` },
              { type: 'mrkdwn', text: `*Confidence:*\n${currentFinding.confidence}` },
              { type: 'mrkdwn', text: `*Detected:*\n${currentFinding.detectedTime}` },
            ],
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `*Threat Vector:*\n${currentFinding.mainReason}\n\n*Candidate URL:*\n<${currentFinding.candidateUrl}|${currentFinding.candidateUrl}>` },
          },
        ],
      };
    } else {
      payload = {
        type: 'message',
        attachments: [
          {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
              type: 'AdaptiveCard',
              version: '1.4',
              body: [
                { type: 'TextBlock', text: `🚨 CRITICAL ALERT: ${currentFinding.title}`, weight: 'Bolder', size: 'Medium', color: 'Attention' },
                { type: 'TextBlock', text: `Detected on ${currentFinding.platform} &bull; Score: ${currentFinding.riskScore}/100 (${currentFinding.confidence} Confidence)` },
                { type: 'TextBlock', text: currentFinding.mainReason, wrap: true },
              ],
            },
          },
        ],
      };
    }

    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    showToast(`${activePlatform === 'slack' ? 'Slack BlockKit' : 'MS Teams AdaptiveCard'} payload copied`, 'success');
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-7 rounded-3xl unlumen-card border border-[#00FFA3]/30 shadow-2xl space-y-3 relative overflow-hidden bg-[#020713]/90">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FFA3]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 shadow-[0_0_15px_rgba(0, 255, 163,0.2)]">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Slack & Microsoft Teams Incident Alert Preview
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 uppercase tracking-wider">
              [WEBHOOK_SIMULATION]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPayload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00050B] hover:bg-[#020713] text-white text-xs font-semibold border border-[#00FFA3]/20 transition-all shadow-sm"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-[#00FFA3]" /> : <Copy className="w-3.5 h-3.5 text-[#00FFA3]" />}
              <span>{copiedPayload ? 'Copied Payload!' : 'Copy Alert Payload'}</span>
            </button>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-400 max-w-2xl leading-relaxed">
          Simulate how critical impersonation alarms and brand infringement notifications appear in enterprise Slack channels and Microsoft Teams SecOps rooms.
        </p>

        {/* Safety Notice Warning */}
        <div className="relative z-10 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-mono">Preview only — no active webhook dispatch has been executed to production channels.</span>
        </div>
      </div>

      {/* Control Bar: Finding Selector & Platform Toggles */}
      <div className="p-4 sm:p-5 rounded-2xl unlumen-card border border-[#00FFA3]/15 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg bg-[#020713]/80">
        {/* Finding Selector Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider flex-shrink-0">
            Target Finding:
          </span>
          <div className="relative flex-1 md:w-80">
            <select
              value={selectedFindingId}
              onChange={(e) => setSelectedFindingId(e.target.value)}
              className="w-full appearance-none bg-[#00050B] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00FFA3] pr-8 shadow-inner"
            >
              {findings.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.riskSeverity.toUpperCase()}] {f.title} ({f.platform})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Platform Toggle Buttons */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-[#00050B] p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActivePlatform('slack')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'slack'
                ? 'bg-[#00FFA3] text-black font-bold shadow-[0_0_15px_rgba(0, 255, 163,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Preview Slack Alert
          </button>
          <button
            onClick={() => setActivePlatform('teams')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'teams'
                ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Preview Teams Alert
          </button>
        </div>
      </div>

      {/* Slack Realistic Canvas Preview */}
      {activePlatform === 'slack' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#1A1D21] border border-slate-800 shadow-2xl text-slate-200 font-sans space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span className="font-bold text-[#E01E5A]">#</span> secops-brand-alerts &bull; Slack Bot Channel
            </span>
            <span>Today at 14:32</span>
          </div>

          {/* Bot Profile */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#00FFA3] to-[#00E5FF] text-black flex items-center justify-center font-black text-xs flex-shrink-0 shadow-[0_0_10px_rgba(0, 255, 163,0.3)]">
              BG
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">BrandGuard Bot</span>
                <span className="px-1 py-0.2 rounded bg-slate-700 text-[10px] text-slate-300 font-medium">APP</span>
                <span className="text-xs text-slate-400">Just now</span>
              </div>

              {/* Slack Card Block */}
              <div className="p-4 rounded-lg bg-[#222529] border-l-4 border-red-500 space-y-3 shadow-md">
                <div>
                  <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                    <span>🚨</span> [CRITICAL ALERT] Brand Impersonation Detected
                  </h3>
                  <h4 className="text-base font-extrabold text-white mt-1">
                    {currentFinding.title}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Platform</span>
                    <PlatformBadge platform={currentFinding.platform} size="xs" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                    <span className="text-red-400 font-bold font-mono">{currentFinding.riskScore}/100 (Critical)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
                    <span className="text-cyan-300 font-medium">{currentFinding.confidence}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Detection Time</span>
                    <span className="text-slate-300">{currentFinding.detectedTime}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs pt-1 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Threat Reason</span>
                  <p className="text-slate-300 leading-relaxed">
                    {currentFinding.mainReason}
                  </p>
                </div>

                <div className="text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate URL</span>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-cyan-400 underline font-mono truncate block">
                    {currentFinding.candidateUrl}
                  </a>
                </div>

                {/* Slack Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedFinding(currentFinding)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#007a5a] hover:bg-[#148567] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Review Finding
                  </button>
                  <button
                    onClick={() => showToast('Opening evidence link (simulation)', 'info')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
                  >
                    View Evidence
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Microsoft Teams Realistic Canvas Preview */}
      {activePlatform === 'teams' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#201F1F] border border-slate-800 shadow-2xl text-slate-200 font-sans space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span className="font-bold text-[#6264A7]">MS Teams</span> &bull; Security Operations Team &bull; Incident Channel
            </span>
            <span>14:32</span>
          </div>

          {/* Teams Adaptive Card Mockup */}
          <div className="rounded-xl bg-[#2B2B2B] border border-slate-700 shadow-lg overflow-hidden space-y-4 p-5">
            {/* Red Alert Banner */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#6264A7] text-white flex items-center justify-center font-bold text-xs">
                  BG
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">BrandGuard Connector</h4>
                  <span className="text-[10px] text-slate-400">Automated Webhook &bull; {currentFinding.detectedTime}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                CRITICAL THREAT
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                🚨 {currentFinding.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentFinding.mainReason}
              </p>
            </div>

            {/* Teams Metadata Table */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-[#201F1F] border border-slate-700 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Host Platform</span>
                <PlatformBadge platform={currentFinding.platform} size="xs" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Calculated Risk</span>
                <span className="font-mono font-bold text-red-400">{currentFinding.riskScore}/100</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Confidence Level</span>
                <span className="font-semibold text-cyan-300">{currentFinding.confidence}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Analyst Status</span>
                <span className="font-semibold text-slate-200">{currentFinding.status}</span>
              </div>
            </div>

            {/* Teams Interactive Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSelectedFinding(currentFinding)}
                className="px-4 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#4F52B2] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Review in BrandGuard
              </button>
              <button
                onClick={() => showToast('Opening evidence link in new tab (simulation)', 'info')}
                className="px-4 py-2 rounded-lg bg-[#3B3A3A] hover:bg-[#484646] text-white text-xs font-semibold transition-colors"
              >
                Evidence Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
