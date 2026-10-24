import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  HardDrive, 
  Radio, 
  Terminal, 
  Layers, 
  Globe2,
  TrendingUp,
  Server
} from 'lucide-react';

export const OperationsHudView: React.FC = () => {
  const topAttackTypes = [
    { rank: '01', name: 'Malware', count: '5,716', pct: 85, color: '#00FFA3' },
    { rank: '02', name: 'Phishing', count: '4,228', pct: 68, color: '#00E5FF' },
    { rank: '03', name: 'DoS Attack', count: '2,905', pct: 45, color: '#F59E0B' },
    { rank: '04', name: 'Brute Force', count: '1,141', pct: 28, color: '#00E88F' },
    { rank: '05', name: 'SQL Injection', count: '580', pct: 15, color: '#EF4444' },
    { rank: '06', name: 'Zero Day Vector', count: '94', pct: 8, color: '#8B5CF6' },
  ];

  const topAttackOrigins = [
    { country: 'United States', code: 'US', count: '4,512', status: 'CRIT' },
    { country: 'Russia', code: 'RU', count: '3,210', status: 'CRIT' },
    { country: 'China', code: 'CN', count: '2,845', status: 'HIGH' },
    { country: 'Germany', code: 'DE', count: '1,540', status: 'HIGH' },
    { country: 'Netherlands', code: 'NL', count: '1,230', status: 'LOW' },
    { country: 'Brazil', code: 'BR', count: '980', status: 'LOW' },
    { country: 'India', code: 'IN', count: '874', status: 'LOW' },
    { country: 'France', code: 'FR', count: '760', status: 'LOW' },
    { country: 'Singapore', code: 'SG', count: '543', status: 'LOW' },
  ];

  const vulnerabilityMatrix = [
    { server: 'WEB-SRV-01', crit: 7, high: 12, med: 15, low: 8, info: 3 },
    { server: 'DB-SRV-02', crit: 4, high: 8, med: 11, low: 5, info: 2 },
    { server: 'APP-SRV-03', crit: 5, high: 14, med: 9, low: 12, info: 4 },
    { server: 'FILE-SRV-04', crit: 2, high: 6, med: 13, low: 9, info: 7 },
  ];

  const liveEvents = [
    { time: '14:22:08', type: 'SQL_INJECTION', ip: '194.26.29.112', dest: 'DB-SRV-02:3306', sev: 'CRITICAL', status: 'MITIGATED' },
    { time: '14:21:45', type: 'BRUTE_FORCE_SSH', ip: '185.191.171.4', dest: 'AUTH-GATEWAY:22', sev: 'HIGH', status: 'IP_BANNED' },
    { time: '14:20:12', type: 'ROGUE_DOMAIN_HOST', ip: '91.240.118.82', dest: 'BRAND_PERIMETER', sev: 'HIGH', status: 'TAKEDOWN_REQ' },
    { time: '14:18:59', type: 'API_CRED_STUFFING', ip: '45.154.255.67', dest: 'API-SRV-01:443', sev: 'CRITICAL', status: 'TOKEN_REVOKED' },
    { time: '14:17:30', type: 'PHISHING_KIT_UPLOAD', ip: '103.151.125.10', dest: 'S3-PUBLIC-BUCKET', sev: 'MEDIUM', status: 'QUARANTINED' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Top HUD Telemetry Banner (Video 2 signature) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="cyber-bento-card p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">TOTAL SCANS</span>
            <span className="text-xl font-bold font-mono text-white">24.26K</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
        </div>

        <div className="cyber-bento-card p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">SYSTEM HEALTH</span>
            <span className="text-xl font-bold font-mono text-[#00FFA3]">98.4%</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="cyber-bento-card p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">ACTIVE NODES</span>
            <span className="text-xl font-bold font-mono text-white">10,987</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
        </div>

        <div className="cyber-bento-card p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">DATA EXFIL</span>
            <span className="text-xl font-bold font-mono text-slate-200">4.04TB</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#00E88F]/15 border border-[#00E88F]/30 text-[#00E5FF] flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Attack Types, Attack Origins & Vulnerability Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Attack Types */}
        <div className="cyber-bento-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <h4 className="text-xs font-bold font-mono text-[#00FFA3] tracking-wider uppercase flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              TOP ATTACK TYPES
            </h4>
            <span className="text-[10px] font-mono text-slate-500">LEVEL 20</span>
          </div>

          <div className="space-y-2">
            {topAttackTypes.map((atk) => (
              <div key={atk.rank} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300">
                    <span className="text-slate-500 mr-2">{atk.rank}</span>
                    {atk.name}
                  </span>
                  <span className="text-white font-bold">{atk.count}</span>
                </div>
                <div className="h-1.5 w-full bg-[#060D1A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00E88F] to-[#00FFA3] rounded-full transition-all duration-500"
                    style={{ width: `${atk.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Attack Origins */}
        <div className="cyber-bento-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <h4 className="text-xs font-bold font-mono text-[#00FFA3] tracking-wider uppercase flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5" />
              TOP ATTACK ORIGINS
            </h4>
            <div className="flex items-center gap-2 text-[9px] font-mono">
              <span className="text-rose-400">&bull; CRIT</span>
              <span className="text-amber-400">&bull; HIGH</span>
              <span className="text-cyan-400">&bull; LOW</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-[11px] pr-1">
            {topAttackOrigins.map((orig, i) => (
              <div key={i} className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] w-5">{orig.code}</span>
                  <span className="text-slate-200">{orig.country}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-white font-bold">{orig.count}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    orig.status === 'CRIT' ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]' :
                    orig.status === 'HIGH' ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' :
                    'bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerability Heatmap Matrix */}
        <div className="cyber-bento-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <h4 className="text-xs font-bold font-mono text-[#00FFA3] tracking-wider uppercase flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              VULNERABILITY HEATMAP
            </h4>
            <span className="text-[10px] font-mono text-slate-500">SEVERITY 1-5</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-mono text-center">
              <thead>
                <tr className="text-slate-500 border-b border-cyan-950/60 pb-1">
                  <th className="text-left font-normal py-1">TARGET</th>
                  <th className="font-normal text-rose-400">CRIT</th>
                  <th className="font-normal text-amber-400">HIGH</th>
                  <th className="font-normal text-sky-400">MED</th>
                  <th className="font-normal text-cyan-400">LOW</th>
                  <th className="font-normal text-slate-400">INFO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-950/40">
                {vulnerabilityMatrix.map((vm, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="text-left py-2 font-bold text-slate-300">{vm.server}</td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                        {vm.crit}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {vm.high}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                        {vm.med}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        {vm.low}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400">{vm.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Live Security Events Table */}
      <div className="cyber-bento-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
          <h4 className="text-xs font-bold font-mono text-[#00FFA3] tracking-wider uppercase flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            LIVE SECURITY EVENTS STREAM
          </h4>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            REALTIME INTERCEPT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-slate-500 border-b border-cyan-950/60 pb-2 text-left">
                <th className="py-1">TIMESTAMP</th>
                <th className="py-1">THREAT VECTOR</th>
                <th className="py-1">SOURCE IP</th>
                <th className="py-1">TARGET ASSET</th>
                <th className="py-1">SEVERITY</th>
                <th className="py-1 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/40">
              {liveEvents.map((ev, i) => (
                <tr key={i} className="hover:bg-white/[0.02] text-slate-300">
                  <td className="py-2.5 text-slate-500">{ev.time}</td>
                  <td className="py-2.5 font-bold text-white">{ev.type}</td>
                  <td className="py-2.5 text-slate-400">{ev.ip}</td>
                  <td className="py-2.5 text-[#00FFA3]">{ev.dest}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      ev.sev === 'CRITICAL' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                      ev.sev === 'HIGH' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                      'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    }`}>
                      {ev.sev}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#00FFA3]">{ev.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
