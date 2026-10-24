import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { 
  Settings, 
  RotateCcw, 
  BellRing, 
  Sliders, 
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  X,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  checksum: string;
}

export const SettingsPage: React.FC = () => {
  const { resetDemoData, showToast, changePassword, deleteAccount, user } = useBrandGuard();

  const [scanFrequency, setScanFrequency] = useState('15m');
  const [minConfidenceThreshold, setMinConfidenceThreshold] = useState('Medium');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [autoTriageCritical, setAutoTriageCritical] = useState(true);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Immutable SOC Audit Log entries
  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'AUD-9012',
      timestamp: '2026-10-20 18:42:15 UTC',
      user: 'alex.mercer@acmepay.com',
      role: 'SOC Analyst',
      action: 'BULK_TAKEDOWN_DISPATCH',
      target: 'Operation ShadowPay (3 Domains)',
      checksum: 'sha256:8f4c...3e1a',
    },
    {
      id: 'AUD-8974',
      timestamp: '2026-10-20 18:15:02 UTC',
      user: 'sarah.jenkins@acmepay.com',
      role: 'Legal / Compliance',
      action: 'DMCA_REGISTRAR_PACKET',
      target: 'acmepay-auth.com',
      checksum: 'sha256:7b1e...990d',
    },
    {
      id: 'AUD-8851',
      timestamp: '2026-10-20 17:30:44 UTC',
      user: 'AUTOMATED_CRON_GATEWAY',
      role: 'System Daemon',
      action: 'SCHEDULED_PERIMETER_SCAN',
      target: 'Perimeter: 8 Monitored Assets',
      checksum: 'sha256:3a91...55c2',
    },
    {
      id: 'AUD-8740',
      timestamp: '2026-10-20 16:55:10 UTC',
      user: 'alex.mercer@acmepay.com',
      role: 'SOC Analyst',
      action: 'TRIAGE_STATUS_UPDATE',
      target: '@acmepay_support_official (Twitter)',
      checksum: 'sha256:0d2f...aa74',
    },
    {
      id: 'AUD-8619',
      timestamp: '2026-10-20 15:20:18 UTC',
      user: 'david.chen@acmepay.com',
      role: 'Admin',
      action: 'DETECTION_THRESHOLD_ALTER',
      target: 'Global Risk Sensitivity -> High',
      checksum: 'sha256:4f89...12b0',
    },
  ]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform configuration saved successfully', 'success');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password successfully updated. Your new credentials are active.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (err: any) {
      showToast(err.message || 'Error deleting account.', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-xs">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Settings &amp; Account Governance
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
            <Settings className="w-3 h-3" />
            [ENGINE_CONFIG]
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Fine-tune automated scanning cadences, alert notification thresholds, password security, and account governance.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Ingestion & Scan Frequency */}
        <section className="p-6 rounded-2xl unlumen-card border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Detection Engine Cadence</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 font-mono text-[11px]">
                Registry &amp; Stream Scan Frequency
              </label>
              <select
                value={scanFrequency}
                onChange={(e) => setScanFrequency(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
              >
                <option value="5m">Every 5 minutes (Real-time telemetry)</option>
                <option value="15m">Every 15 minutes (Standard recommendation)</option>
                <option value="1h">Every 1 hour (Low bandwidth)</option>
                <option value="24h">Daily batch audit</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 font-mono text-[11px]">
                Minimum Alert Confidence Filter
              </label>
              <select
                value={minConfidenceThreshold}
                onChange={(e) => setMinConfidenceThreshold(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
              >
                <option value="Low">Low Confidence (Catch all potential signals)</option>
                <option value="Medium">Medium Confidence (Balanced precision)</option>
                <option value="High">High Confidence (Verified matches only)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoTriageCritical}
                onChange={(e) => setAutoTriageCritical(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="font-sans text-xs">Automatically escalate Critical findings to priority triage queue</span>
            </label>
          </div>
        </section>

        {/* Section 2: Notification Dispatch */}
        <section className="p-6 rounded-2xl unlumen-card border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <BellRing className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Security Alerts &amp; Webhooks</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 text-slate-300 cursor-pointer p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-white block">Email Incident Dispatch</span>
                <span className="text-[11px] text-slate-400">
                  Notify {user?.email || 'alex.mercer@acmepay.com'} immediately when a High or Critical impersonation is flagged.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 text-slate-300 cursor-pointer p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={(e) => setSlackAlerts(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-white block">Slack SecOps Channel Integration</span>
                <span className="text-[11px] text-slate-400">
                  Post instant JSON takedown cards to #brand-security-alerts.
                </span>
              </div>
            </label>
          </div>
        </section>

        {/* Submit Platform Configuration */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold font-mono bg-[#00FFA3] hover:bg-[#00E88F] text-[#00050B] shadow-[0_0_20px_rgba(0,255,163,0.35)] transition-all flex items-center gap-2 btn-smooth cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#00050B]" />
            <span>SAVE PLATFORM CONFIGURATION</span>
          </button>
        </div>
      </form>

      {/* =========================================================================
          SECTION 3: ACCOUNT SECURITY & CHANGE PASSWORD
          ========================================================================= */}
      <section className="p-6 rounded-2xl cyber-bento-card border border-[#00FFA3]/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#00FFA3]/20">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#00FFA3]" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Account Security &amp; Password Management
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/30 px-2 py-0.5 rounded">
            AES-256 ENCRYPTED
          </span>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Update your SecOps account credentials. Ensure your password is at least 8 characters long and contains a combination of letters, numbers, and symbols.
        </p>

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-[#00FFA3]/30 flex items-center gap-2.5 text-xs text-[#00FFA3] animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-[#00FFA3] shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 font-mono text-[11px]">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full bg-[#00050B] border border-slate-700/80 rounded-xl py-2.5 pl-3.5 pr-10 text-slate-100 font-mono text-xs focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 font-mono text-[11px]">
                New Password (Min 8 chars)
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-[#00050B] border border-slate-700/80 rounded-xl py-2.5 pl-3.5 pr-10 text-slate-100 font-mono text-xs focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 font-mono text-[11px]">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-[#00050B] border border-slate-700/80 rounded-xl py-2.5 pl-3.5 pr-10 text-slate-100 font-mono text-xs focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Password changes take effect immediately across all active sessions.
            </span>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isChangingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Section 4: Demo Mode Controls */}
      <section className="p-6 rounded-2xl unlumen-card border border-cyan-500/25 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Demo Mode Environment</h3>
          </div>
          <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-md bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
            ACTIVE SESSION
          </span>
        </div>

        <p className="text-slate-300 leading-relaxed text-xs">
          You are operating in BrandGuard Demo Mode with preloaded synthetic threats targeting AcmePay. No external live network requests or takedown actions are sent to registrars.
        </p>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div>
            <h4 className="font-bold text-white mb-0.5">Reset Demo Data</h4>
            <p className="text-[11px] text-slate-400">
              Restore all findings, analyst notes, and brand profile values to the initial presentation state.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDemoData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-1.5 self-start sm:self-auto btn-smooth shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset demo state</span>
          </button>
        </div>
      </section>

      {/* Section 5: Immutable SOC Audit Log & RBAC Trail */}
      <section className="p-6 rounded-2xl cyber-bento-card border border-[#00FFA3]/20 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#00FFA3]/20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00FFA3]" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Immutable SOC Audit Log &amp; RBAC Trail
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/30 px-2 py-0.5 rounded">
              BLOCK_HEIGHT: #9012 // ED25519 VERIFIED
            </span>
          </div>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Cryptographically signed, append-only ledger recording all security analyst decisions, triage transitions, automated abuse packet transmissions, and policy adjustments.
        </p>

        <div className="rounded-xl bg-[#00050B] border border-[#00FFA3]/15 overflow-x-auto shadow-inner">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-[#020713] border-b border-[#00FFA3]/15 text-[10px] uppercase text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Log ID / Time</th>
                <th className="py-2.5 px-3">Operator / Persona</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3">Integrity Digest</th>
                <th className="py-2.5 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00FFA3]/10">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#040C1D] transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[#00FFA3] font-bold block">{log.id}</span>
                    <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-slate-200 block">{log.user}</span>
                    <span className="text-[10px] text-slate-400 font-sans">({log.role})</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-[200px] truncate">
                    {log.target}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                    {log.checksum}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#00FFA3]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>IMMUTABLE</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DANGER ZONE & ACCOUNT DELETION
          ========================================================================= */}
      <section className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-red-200 font-mono uppercase tracking-wider">
              Danger Zone &bull; Account Deletion
            </h3>
          </div>
          <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-500/30 px-2.5 py-0.5 rounded uppercase font-semibold">
            IRREVERSIBLE ACTION
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#00050B] border border-red-500/20">
          <div>
            <h4 className="font-bold text-white text-xs mb-0.5">Delete User Account</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
              Permanently delete your SecOps account credentials, active telemetry sessions, and personalized analyst presets. All associated authorization tokens will be immediately invalidated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteModal(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold font-mono bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>DELETE ACCOUNT</span>
          </button>
        </div>
      </section>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#040C1D] border border-red-500/40 shadow-2xl overflow-hidden text-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-red-950/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    Confirm Account Deletion
                  </h3>
                  <span className="text-[10px] text-red-300/80 font-mono">
                    Permanent &bull; Cannot Be Undone
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete your account for{' '}
                <strong className="text-white font-mono">{user?.email || 'alex.mercer@acmepay.com'}</strong>?
              </p>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 leading-relaxed space-y-1">
                <p>&bull; Your login credentials will be permanently erased.</p>
                <p>&bull; All active sessions will be terminated immediately.</p>
                <p>&bull; You will be returned to the BrandGuard landing page.</p>
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] font-mono mb-1.5">
                  Type <strong className="text-red-400">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#00050B] border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-400"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#00050B] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold font-mono bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting ? 'DELETING...' : 'CONFIRM DELETION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
