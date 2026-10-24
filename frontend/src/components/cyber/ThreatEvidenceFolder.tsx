import React from 'react';
import { Folder, FileCheck2, ArrowUpRight } from 'lucide-react';

interface ThreatEvidenceFolderProps {
  count?: number;
  onExplore?: () => void;
  className?: string;
}

export const ThreatEvidenceFolder: React.FC<ThreatEvidenceFolderProps> = ({
  count = 24,
  onExplore,
  className = '',
}) => {
  return (
    <div 
      onClick={onExplore}
      className={`cyber-bento-card p-4 flex flex-col justify-between cursor-pointer group select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-200 tracking-wide font-sans">
          Threat Evidence
        </h3>
        <span className="p-1 rounded-lg text-slate-500 group-hover:text-[#00FFA3] group-hover:bg-[#00FFA3]/10 transition-all">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* 3D Cyber Folder Graphic */}
      <div className="relative my-auto flex items-center justify-between gap-4 py-2">
        {/* Sleek Folder Tab */}
        <div className="relative">
          <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-[#00E88F]/25 via-[#040C1D] to-[#00050B] border border-[#00FFA3]/40 p-2.5 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(0, 255, 163,0.12)] group-hover:border-[#00FFA3]/70 group-hover:shadow-[0_8px_25px_rgba(0, 255, 163,0.25)] transition-all">
            <div className="flex items-center justify-between">
              <Folder className="w-4 h-4 text-[#00FFA3]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block leading-tight">Files</span>
              <span className="text-sm font-bold font-mono text-white tracking-tight">{count}</span>
            </div>
          </div>

          {/* Layered behind folder flap */}
          <div className="absolute -top-1 -right-1 w-18 h-12 rounded-xl bg-slate-950/50 border border-cyan-900/40 -z-10 transform rotate-3" />
        </div>

        {/* Smooth Cyan Contour Waves */}
        <div className="flex-1 h-12 flex items-center overflow-hidden">
          <svg viewBox="0 0 120 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="folderWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00FFA3" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,25 Q 30,5 60,25 T 120,20 L 120,40 L 0,40 Z"
              fill="url(#folderWave)"
            />
            <path
              d="M 0,25 Q 30,5 60,25 T 120,20"
              fill="none"
              stroke="#00FFA3"
              strokeWidth="1.5"
            />
            <path
              d="M 0,32 Q 40,15 80,32 T 120,28"
              fill="none"
              stroke="rgba(0, 255, 163, 0.3)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-cyan-950/60">
        <span>Verified Hash Snapshots</span>
        <span className="text-[#00FFA3]">100% Immutable</span>
      </div>
    </div>
  );
};
