import React, { useState, useMemo } from 'react';
import { Finding, RiskSeverity } from '../../types';
import { getRiskSimulatorSignals } from '../../data/mockData';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

interface RiskScoreSimulatorProps {
  finding: Finding;
}

export const RiskScoreSimulator: React.FC<RiskScoreSimulatorProps> = ({ finding }) => {
  const initialSignals = useMemo(() => getRiskSimulatorSignals(finding), [finding]);
  const [signals, setSignals] = useState(initialSignals);

  const toggleSignal = (id: string) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateWeight = (id: string, weight: number) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, weight } : s))
    );
  };

  const handleReset = () => {
    setSignals(getRiskSimulatorSignals(finding));
  };

  // Recompute simulated risk score
  const simulatedScore = useMemo(() => {
    const rawSum = signals.reduce((acc, s) => acc + (s.enabled ? s.weight : 0), 0);
    return Math.min(Math.max(rawSum, 0), 100);
  }, [signals]);

  const simulatedSeverity: RiskSeverity = useMemo(() => {
    if (simulatedScore >= 85) return 'critical';
    if (simulatedScore >= 70) return 'high';
    if (simulatedScore >= 50) return 'medium';
    return 'low';
  }, [simulatedScore]);

  const getSeverityBadge = (sev: RiskSeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'low':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/20">
              HEURISTIC_SIMULATOR
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Demo data
            </span>
          </div>
          <h3 className="text-sm font-bold text-white font-mono mt-1">
            Dynamic Risk Score Simulator
          </h3>
          <p className="text-xs text-slate-400">
            Simulate how enabling or disabling individual risk signals impacts the threat scoring algorithm.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="btn-smooth px-3 py-1.5 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] text-xs font-mono flex items-center gap-1.5 border border-white/[0.08] self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Simulator Score Display Card */}
      <div className="unlumen-card p-5 bg-[#030917]/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          
          {/* Baseline vs Simulated */}
          <div className="p-4 rounded-xl bg-[#020713] border border-cyan-500/20 text-center space-y-1 shadow-inner">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              Simulated Risk Score
            </span>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {simulatedScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${getSeverityBadge(simulatedSeverity)}`}>
              {simulatedSeverity} Risk
            </span>
          </div>

          <div className="sm:col-span-2 space-y-2 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Baseline Score: {finding.riskScore}%</span>
              <span className="text-cyan-400 font-bold">
                Delta: {simulatedScore >= finding.riskScore ? `+${simulatedScore - finding.riskScore}` : `${simulatedScore - finding.riskScore}`}%
              </span>
            </div>

            {/* Simulated Score Bar */}
            <div className="w-full bg-[#020713] rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  simulatedScore >= 85 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                    : simulatedScore >= 70 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                    : 'bg-gradient-to-r from-cyan-500 to-amber-500'
                }`}
                style={{ width: `${simulatedScore}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 font-sans italic pt-1">
              {simulatedScore >= 85 ? 'Heuristics trigger automated takedown packet recommendation.' : simulatedScore >= 70 ? 'Heuristics trigger active analyst review advisory.' : 'Heuristics suggest monitoring status.'}
            </p>
          </div>

        </div>

        {/* Mandatory User Requirement Note */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-300 font-mono block">
              Simulation Disclaimer
            </span>
            <p className="text-xs text-amber-200/90 italic font-mono">
              &ldquo;This is a demo simulation and is not absolute proof.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Signal Toggles Matrix */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono block">
          Contributing Threat Signals ({signals.filter(s => s.enabled).length}/{signals.length} Active)
        </span>

        <div className="space-y-2.5">
          {signals.map((sig) => (
            <div
              key={sig.id}
              className={`p-3.5 rounded-xl border transition-all ${
                sig.enabled 
                  ? 'bg-[#030917] border-cyan-500/30' 
                  : 'bg-[#020611]/60 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={sig.enabled}
                    onChange={() => toggleSignal(sig.id)}
                    className="w-4 h-4 rounded mt-0.5 border-slate-700 text-[#00FFA3] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">
                      {sig.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {sig.description}
                    </p>
                  </div>
                </div>

                {/* Weight Controller */}
                <div className="flex items-center gap-3 font-mono self-end sm:self-auto">
                  <span className="text-xs text-slate-400 text-[11px]">Weight:</span>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={sig.weight}
                    disabled={!sig.enabled}
                    onChange={(e) => updateWeight(sig.id, Number(e.target.value))}
                    className="w-24 accent-[#00FFA3] cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-xs font-bold text-cyan-300 w-10 text-right">
                    +{sig.weight}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
