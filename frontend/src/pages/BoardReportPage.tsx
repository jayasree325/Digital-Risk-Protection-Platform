import React from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { 
  FileText, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  CheckCircle2, 
  Building2, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const BoardReportPage: React.FC = () => {
  const { brandProfile, company, findings, counts, brandAssets, requireAuth } = useBrandGuard();

  const brandName = company?.name || brandProfile.brandName || 'AcmePay Technologies';
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const criticalAndHighCount = findings.filter(f => f.riskSeverity === 'critical' || f.riskSeverity === 'high').length;
  const topThreats = findings.slice(0, 4);

  // Brand Safety Score calculation: 100 - (critical * 8 + high * 4) capped at 40 min
  const brandSafetyScore = Math.max(100 - (counts.critical * 8 + (criticalAndHighCount - counts.critical) * 4), 45);

  const handlePrint = () => {
    if (!requireAuth(() => window.print(), 'Export Executive Board Briefing', 'Sign in or register to export board-level compliance reports.')) {
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans print:p-0 print:m-0 print:max-w-none">
      {/* Print stylesheet override for flawless executive PDF output */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          nav, header, aside, .print\\:hidden {
            display: none !important;
          }
          .board-print-canvas {
            background: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .print-card {
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl cyber-bento-card border border-[#00FFA3]/20 print:hidden shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">
              Executive Board & Audit Security Report
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 uppercase tracking-wider">
              [AUDIT_CERTIFIED]
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Quarterly brand integrity posture, MTTR velocity, and commercial risk exposure summary.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00FFA3] hover:bg-[#00E88F] text-[#00050B] text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)] self-start sm:self-auto btn-smooth"
        >
          <Printer className="w-4 h-4 text-[#00050B]" />
          <span>Generate Board Briefing (PDF)</span>
        </button>
      </div>

      {/* Main Board Document Canvas */}
      <div className="board-print-canvas p-8 sm:p-12 rounded-3xl cyber-bento-card border border-[#00FFA3]/20 shadow-2xl space-y-8 text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#00FFA3]/20 print:border-slate-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/40 flex items-center justify-center font-black text-sm print:border-slate-800 print:text-black shadow-sm">
                {brandProfile.logoText || 'BG'}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white print:text-black">
                  {brandName}
                </h2>
                <span className="text-xs font-mono text-[#00FFA3] print:text-slate-600 uppercase tracking-wider font-semibold">
                  Board Cybersecurity & Brand Protection Brief
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs text-slate-400 print:text-slate-700">
            <div className="flex sm:justify-end items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>Report Date: <strong className="text-white print:text-black font-mono">{currentDate}</strong></span>
            </div>
            <div className="flex sm:justify-end items-center gap-1.5">
              <span>Prepared by: <strong className="text-slate-200 print:text-black">SecOps Threat Intelligence</strong></span>
            </div>
            <div className="text-[10px] text-amber-400/90 print:text-slate-600 italic font-mono">
              * Audit summary generated for corporate executive governance.
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics Strip (Including MTTR & Averted Loss) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Brand Safety Score */}
          <div className="print-card p-4 sm:p-5 rounded-2xl bg-[#00050B] border border-[#00FFA3]/20 print:border-slate-300 print:bg-slate-50 space-y-1 shadow-inner">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 print:text-slate-600 block">
              Brand Safety Score
            </span>
            <div className="text-3xl font-black font-mono text-[#00FFA3] print:text-emerald-700">
              {brandSafetyScore}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-semibold block">
              Robust - Active Defense
            </span>
          </div>

          {/* MTTR Metric */}
          <div className="print-card p-4 sm:p-5 rounded-2xl bg-[#00050B] border border-[#00FFA3]/20 print:border-slate-300 print:bg-slate-50 space-y-1 shadow-inner">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 print:text-slate-600 block">
              Mean Time To Remediate (MTTR)
            </span>
            <div className="text-3xl font-black font-mono text-white print:text-black">
              4.2 <span className="text-sm font-normal text-slate-400">Hours</span>
            </div>
            <span className="text-[10px] text-[#00FFA3] print:text-emerald-700 font-medium block">
              &darr; 38% YoY Takedown Velocity
            </span>
          </div>

          {/* Critical / High Risk */}
          <div className="print-card p-4 sm:p-5 rounded-2xl bg-[#00050B] border border-[#00FFA3]/20 print:border-slate-300 print:bg-slate-50 space-y-1 shadow-inner">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 print:text-slate-600 block">
              Critical & High Threats
            </span>
            <div className="text-3xl font-black font-mono text-red-400 print:text-red-700">
              {criticalAndHighCount}
            </div>
            <span className="text-[10px] text-red-400/80 print:text-red-700 font-medium block">
              {counts.confirmed} Confirmed Neutralized
            </span>
          </div>

          {/* Fraud Exposure Estimate */}
          <div className="print-card p-4 sm:p-5 rounded-2xl bg-[#00050B] border border-[#00FFA3]/20 print:border-slate-300 print:bg-slate-50 space-y-1 shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600 block font-mono">
              Averted Commercial Capital
            </span>
            <div className="text-3xl font-black text-[#00FFA3] print:text-emerald-700 font-mono">
              $1.42M
            </div>
            <span className="text-[10px] text-slate-400 print:text-slate-600 font-medium block">
              Potential fraud prevented
            </span>
          </div>
        </div>

        {/* Threat Distribution & Platform Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Distribution Breakdown */}
          <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              Risk Distribution Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-700">Critical Severity ({counts.critical})</span>
                <span className="font-mono text-red-400 font-semibold">{Math.round((counts.critical / (findings.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 print:bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(counts.critical / (findings.length || 1)) * 100}%` }} />
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400 print:text-slate-700">High Severity ({criticalAndHighCount - counts.critical})</span>
                <span className="font-mono text-orange-400 font-semibold">{Math.round(((criticalAndHighCount - counts.critical) / (findings.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 print:bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${((criticalAndHighCount - counts.critical) / (findings.length || 1)) * 100}%` }} />
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400 print:text-slate-700">Medium & Low Severity ({findings.length - criticalAndHighCount})</span>
                <span className="font-mono text-amber-400 font-semibold">{Math.round(((findings.length - criticalAndHighCount) / (findings.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 print:bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${((findings.length - criticalAndHighCount) / (findings.length || 1)) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Official Asset Coverage & Source Breakdown */}
          <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              Monitored Channel & Official Coverage
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-900 print:bg-white border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Verified Assets</span>
                <span className="text-xl font-bold text-white print:text-black">
                  {counts.verifiedAssets} Assets
                </span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 block">94% Protection Rate</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-900 print:bg-white border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Social Impersonations</span>
                <span className="text-xl font-bold text-white print:text-black">
                  {counts.social} Profiles
                </span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Instagram, Telegram, X</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-900 print:bg-white border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Mobile App Threats</span>
                <span className="text-xl font-bold text-white print:text-black">
                  {counts.app} Applications
                </span>
                <span className="text-[10px] text-red-400 print:text-red-700 block">APK Repositories</span>
              </div>

              <div className="p-3 rounded-xl bg-navy-900 print:bg-white border border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Confirmed Fakes</span>
                <span className="text-xl font-bold text-white print:text-black">
                  {counts.confirmed} Escalated
                </span>
                <span className="text-[10px] text-cyan-400 print:text-blue-700 block">Takedowns Staged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Priority Threats Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
            Top Priority Commercial Threats
          </h3>

          <div className="rounded-xl bg-navy-950 border border-slate-800 print:border-slate-300 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-navy-900 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-[10px] uppercase font-bold text-slate-400 print:text-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Threat Candidate</th>
                  <th className="py-2.5 px-4">Platform</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Threat Mechanism</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {topThreats.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 px-4 font-semibold text-white print:text-black">
                      {t.title}
                    </td>
                    <td className="py-3 px-4 text-slate-400 print:text-slate-600">
                      {t.platform}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge severity={t.riskSeverity} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-300 print:text-slate-700 max-w-xs truncate">
                      {t.mainReason}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-cyan-300 print:text-blue-700">
                      {t.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Recommendations for the Board */}
        <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
            Strategic Recommendations for Executive Committee
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 print:bg-blue-100 print:text-blue-800">
                1
              </div>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                <strong>Accelerate Host Platform Escalation:</strong> Authorize expedited legal takedown bundles for the 2 critical APK mirrors distributing SMS overlay droppers.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 print:bg-blue-100 print:text-blue-800">
                2
              </div>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                <strong>Deploy Pre-emptive Customer Warning Kits:</strong> Publish automated SMS & social advisories notifying customers that {brandName} support never requests OTP passcodes.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 print:bg-blue-100 print:text-blue-800">
                3
              </div>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                <strong>Expand Defensive Watchlist Registration:</strong> Proactively register or monitor the top 6 predicted homoglyph permutations before speculative attackers stage lookalike sites.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 print:bg-blue-100 print:text-blue-800">
                4
              </div>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                <strong>Establish Public Brand Verification Link:</strong> Promote the public AEGIS verification portal across customer support and official billing emails.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Sign-off */}
        <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>AEGIS Enterprise Digital Risk Protection Platform</span>
          <span className="font-mono">Document Security Classification: CONFIDENTIAL &bull; BOARD LEVEL</span>
        </div>

      </div>
    </div>
  );
};
