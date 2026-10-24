import React, { useState } from 'react';
import { Finding } from '../../types';
import { ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';

interface GoogleWebRiskBadgeProps {
  finding?: Partial<Finding>;
  threatLabel?: string;
  threatMatch?: boolean;
  className?: string;
  compact?: boolean;
}

export function resolveWebRiskStatus(finding?: Partial<Finding>, explicitLabel?: string, explicitMatch?: boolean) {
  if (explicitLabel) {
    const isMatch = Boolean(explicitMatch || explicitLabel.toLowerCase().includes('threat') || explicitLabel.toLowerCase().includes('danger') || explicitLabel.toLowerCase().includes('malware') || explicitLabel.toLowerCase().includes('phishing'));
    return {
      threatMatch: isMatch,
      label: isMatch ? 'KNOWN THREAT' : explicitLabel.toUpperCase().includes('NO KNOWN') ? 'NO KNOWN THREAT MATCH' : explicitLabel.toUpperCase(),
      detailedText: isMatch
        ? 'Google threat intelligence returned a known threat match.'
        : explicitLabel,
    };
  }

  // Look inside signals
  if (finding?.signals) {
    const wrSig = finding.signals.find(
      (s) => s.iconName === 'redirect' && (s.title.toLowerCase().includes('google') || s.title.toLowerCase().includes('threat') || s.title.toLowerCase().includes('web risk'))
    ) || finding.signals.find(
      (s) => s.title.toLowerCase().includes('google threat intelligence') || s.title.toLowerCase().includes('web risk')
    );

    if (wrSig) {
      const lowerTitle = wrSig.title.toLowerCase();
      const isMatch = lowerTitle.includes('known threat match') || lowerTitle.includes('danger') || lowerTitle.includes('malware') || lowerTitle.includes('phishing') || wrSig.strength === 'Critical';
      return {
        threatMatch: isMatch,
        label: isMatch ? 'KNOWN THREAT' : 'NO KNOWN THREAT MATCH',
        detailedText: isMatch
          ? 'Google threat intelligence returned a known threat match.'
          : 'No known Google threat match in public threat intelligence databases (does not prove URL is safe or original).',
      };
    }
  }

  // Look in evidence description
  if (finding?.evidence?.description?.includes('Web Risk:')) {
    const desc = finding.evidence.description;
    const isMatch = desc.includes('Known phishing') || desc.includes('Known malware') || desc.includes('Known dangerous') || desc.includes('Known unwanted');
    return {
      threatMatch: isMatch,
      label: isMatch ? 'KNOWN THREAT' : 'NO KNOWN THREAT MATCH',
      detailedText: isMatch
        ? 'Google threat intelligence returned a known threat match.'
        : 'No known Google threat match.',
    };
  }

  return null;
}

export const GoogleWebRiskBadge: React.FC<GoogleWebRiskBadgeProps> = ({
  finding,
  threatLabel,
  threatMatch,
  className = '',
  compact = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const resolved = resolveWebRiskStatus(finding, threatLabel, threatMatch);

  if (!resolved) return null;

  const isThreat = resolved.threatMatch;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider cursor-help transition-all ${
          isThreat
            ? 'bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        role="status"
        aria-label={`Google Web Risk: ${resolved.label}`}
      >
        {isThreat ? (
          <ShieldAlert className="w-2.5 h-2.5 text-red-400 shrink-0" />
        ) : (
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
        )}
        <span>GOOGLE WEB RISK • {resolved.label}</span>
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-60 p-2.5 bg-[#00050B] border border-[#00FFA3]/40 rounded-xl shadow-2xl text-[11px] text-slate-200 pointer-events-none animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="font-semibold text-white mb-0.5 flex items-center justify-between font-mono text-[10px]">
            <span className={isThreat ? 'text-red-400' : 'text-[#00FFA3]'}>
              GOOGLE WEB RISK
            </span>
            <span className="text-slate-400 text-[9px]">{resolved.label}</span>
          </div>
          <p className="text-slate-300 leading-snug font-sans text-[11px]">
            {resolved.detailedText}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            *Google threat intelligence signal only. BrandGuard performs final risk triage.
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#00050B]" />
        </div>
      )}
    </div>
  );
};
