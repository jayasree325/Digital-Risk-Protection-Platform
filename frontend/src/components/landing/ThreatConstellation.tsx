import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  Globe, 
  Code2, 
  FileCheck2, 
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Radio,
  Lock
} from 'lucide-react';

interface ThreatNode {
  id: string;
  type: 'official' | 'suspicious' | 'app' | 'domain' | 'unicode' | 'evidence';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  glowColor: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number; // percentage in visualization
  y: number;
  lineColor: string;
}

interface ThreatConstellationProps {
  brandName?: string;
  className?: string;
}

export const ThreatConstellation: React.FC<ThreatConstellationProps> = ({ 
  brandName = 'AcmePay',
  className = '' 
}) => {
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  // Six outer nodes positioned strategically in an elliptical orbit around center (50, 50)
  const nodes: ThreatNode[] = [
    {
      id: 'official',
      type: 'official',
      title: 'Official Account',
      subtitle: `@${brandName.toLowerCase()} (Verified HQ)`,
      badge: '100% Match • Verified',
      badgeColor: 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30',
      borderColor: 'border-[#00FFA3]/40 hover:border-[#00FFA3]',
      glowColor: 'rgba(0, 255, 163, 0.25)',
      icon: CheckCircle2,
      x: 18,
      y: 16,
      lineColor: '#00FFA3',
    },
    {
      id: 'suspicious',
      type: 'suspicious',
      title: 'Suspicious Profile',
      subtitle: `@${brandName.toLowerCase()}_support_desk`,
      badge: '94% Risk • Phishing Bot',
      badgeColor: 'bg-[#FF5878]/15 text-[#FF5878] border-[#FF5878]/30',
      borderColor: 'border-[#FF5878]/50 hover:border-[#FF5878]',
      glowColor: 'rgba(255, 88, 120, 0.25)',
      icon: AlertTriangle,
      x: 82,
      y: 16,
      lineColor: '#FF5878',
    },
    {
      id: 'app',
      type: 'app',
      title: 'Fake App Listing',
      subtitle: `com.${brandName.toLowerCase()}.wallet.apk`,
      badge: '91% Risk • Trojan Signal',
      badgeColor: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
      borderColor: 'border-[#F59E0B]/50 hover:border-[#F59E0B]',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      icon: Smartphone,
      x: 86,
      y: 52,
      lineColor: '#F59E0B',
    },
    {
      id: 'evidence',
      type: 'evidence',
      title: 'Supporting Evidence',
      subtitle: 'SHA-256: 8f4a...9b21 Hash',
      badge: 'Cryptographically Archived',
      badgeColor: 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/30',
      borderColor: 'border-[#00FFA3]/40 hover:border-[#00FFA3]',
      glowColor: 'rgba(0, 255, 163, 0.25)',
      icon: FileCheck2,
      x: 80,
      y: 84,
      lineColor: '#00FFA3',
    },
    {
      id: 'unicode',
      type: 'unicode',
      title: 'Unicode Impersonation',
      subtitle: `\u0430${brandName.slice(1).toLowerCase()}.com (U+0430 Cyrillic)`,
      badge: 'Codepoint Anomaly',
      badgeColor: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30',
      borderColor: 'border-[#00E5FF]/40 hover:border-[#00E5FF]',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      icon: Code2,
      x: 18,
      y: 84,
      lineColor: '#00E5FF',
    },
    {
      id: 'domain',
      type: 'domain',
      title: 'Predicted Name',
      subtitle: `${brandName.toLowerCase()}-verify-login.com`,
      badge: 'Lookalike Domain Radar',
      badgeColor: 'bg-[#00E88F]/15 text-[#00E5FF] border-[#00E88F]/30',
      borderColor: 'border-[#00E88F]/40 hover:border-[#00E88F]',
      glowColor: 'rgba(0, 102, 255, 0.25)',
      icon: Globe,
      x: 14,
      y: 52,
      lineColor: '#00E88F',
    },
  ];

  return (
    <div className={`relative w-full max-w-2xl mx-auto aspect-[16/11] select-none ${className}`}>
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-[#00FFA3]/15 via-[#00E88F]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-[#00FFA3]/10 blur-2xl pointer-events-none" />

      {/* SVG Connecting Constellation Lines & Orbital Rings */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle line glow filter */}
          <filter id="constellation-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients for connecting beams */}
          <linearGradient id="beam-center-emerald" x1="50%" y1="50%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00E88F" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Concentric Orbital Defense Rings */}
        <circle 
          cx="50" 
          cy="50" 
          r="26" 
          fill="none" 
          stroke="rgba(0, 255, 163, 0.2)" 
          strokeWidth="0.3" 
          strokeDasharray="1.5 2"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="38" 
          fill="none" 
          stroke="rgba(0, 102, 255, 0.15)" 
          strokeWidth="0.25" 
          strokeDasharray="2 3"
        />

        {/* Dynamic connecting lines from center (50, 50) to each card node */}
        {nodes.map((node) => {
          const isHovered = activeHoverId === node.id;
          return (
            <g key={node.id}>
              {/* Subtle background track line */}
              <line 
                x1="50" 
                y1="50" 
                x2={node.x} 
                y2={node.y} 
                stroke={node.lineColor}
                strokeOpacity={isHovered ? 0.7 : 0.22}
                strokeWidth={isHovered ? 0.6 : 0.35}
                strokeDasharray={isHovered ? "none" : "1.5 1.5"}
                filter="url(#constellation-glow)"
                className="transition-all duration-300"
              />

              {/* Pulsing connection node at node anchor */}
              <circle 
                cx={node.x} 
                cy={node.y} 
                r={isHovered ? 1.4 : 0.9} 
                fill={node.lineColor}
                fillOpacity={isHovered ? 1 : 0.7}
                className="transition-all duration-300"
              />

              {/* Animated particle pulse traveling along line when active */}
              {isHovered && (
                <circle 
                  cx={(50 + node.x) / 2} 
                  cy={(50 + node.y) / 2} 
                  r="0.8" 
                  fill="#F5F7FF"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* CENTRAL CORE: Protected Brand Node */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center"
      >
        {/* Pulsing Orbital Halo */}
        <div className="absolute w-28 h-28 rounded-full border border-[#00FFA3]/40 animate-ping opacity-20 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full border border-[#00E88F]/30 animate-pulse pointer-events-none" />

        {/* Center Shield Core */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#040C1D] to-[#00050B] border border-[#00FFA3]/60 shadow-[0_0_35px_rgba(0, 255, 163,0.35)] flex flex-col items-center justify-center p-2 backdrop-blur-xl group cursor-pointer transition-transform duration-300 hover:scale-105">
          <div className="w-8 h-8 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/40 flex items-center justify-center text-[#00FFA3] shadow-inner mb-1">
            <ShieldCheck className="w-4.5 h-4.5 text-[#00FFA3]" />
          </div>
          <span className="text-[10px] font-black tracking-tight text-white uppercase text-center leading-tight">
            {brandName}
          </span>
          <span className="text-[8px] font-mono text-[#00FFA3] tracking-widest uppercase font-bold">
            PROTECTED
          </span>

          {/* Active status pulse badge */}
          <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-[#00050B] border border-[#00FFA3]/50 text-[7px] font-mono font-bold text-[#00FFA3] shadow-sm flex items-center gap-1 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
            <span>BRANDGUARD CORE</span>
          </div>
        </div>
      </div>

      {/* SURROUNDING CONNECTED NODES / CARDS */}
      {nodes.map((node) => {
        const Icon = node.icon;
        const isHovered = activeHoverId === node.id;

        return (
          <div
            key={node.id}
            onMouseEnter={() => setActiveHoverId(node.id)}
            onMouseLeave={() => setActiveHoverId(null)}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute z-30 transition-all duration-300 cursor-pointer ${
              isHovered ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            <div 
              className={`p-2.5 sm:p-3 rounded-xl bg-[#040C1D]/90 border ${node.borderColor} shadow-xl backdrop-blur-md transition-all duration-300 max-w-[170px] sm:max-w-[195px]`}
              style={{
                boxShadow: isHovered 
                  ? `0 10px 25px -3px ${node.glowColor}, 0 0 15px ${node.glowColor}`
                  : '0 8px 20px -4px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-md bg-[#060D1A] border border-cyan-950/80 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 text-[#F5F7FF]" />
                  </div>
                  <h4 className="text-[11px] font-bold text-[#F5F7FF] tracking-tight truncate">
                    {node.title}
                  </h4>
                </div>
              </div>

              <p className="text-[9.5px] font-mono text-[#A6B3CD] truncate mb-1.5 leading-tight">
                {node.subtitle}
              </p>

              <div className="flex items-center justify-between">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold uppercase tracking-wider border ${node.badgeColor}`}>
                  {node.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
