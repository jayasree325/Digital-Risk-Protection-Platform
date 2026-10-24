import React, { useState, useEffect, useRef } from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  Search, 
  Terminal, 
  ShieldAlert, 
  Compass, 
  Share2, 
  Smartphone, 
  Globe, 
  Scan, 
  Sliders, 
  FileText, 
  Building2, 
  CheckCircle2, 
  X,
  CornerDownLeft,
  ArrowRight
} from 'lucide-react';
import { PageId } from '../../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const { 
    setActivePage, 
    findings, 
    setSelectedFinding, 
    runNewScan, 
    availableCompanies, 
    switchCompany,
    selectedCompanyId,
    showToast
  } = useBrandGuard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navItems: { id: PageId; label: string; group: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Command Center & 3D Threat Radar', group: 'Navigation', icon: <Compass className="w-4 h-4 text-[#00FFA3]" /> },
    { id: 'findings', label: 'Threat Findings & Intelligence Matrix', group: 'Navigation', icon: <ShieldAlert className="w-4 h-4 text-[#00FFA3]" /> },
    { id: 'check-link', label: 'Scan Suspicious URL / Typosquatting', group: 'Tools', icon: <Globe className="w-4 h-4 text-[#00E5FF]" /> },
    { id: 'brand-profile', label: 'Asset Perimeter & Brand Registry', group: 'Management', icon: <Building2 className="w-4 h-4 text-[#00FFA3]" /> },
    { id: 'watchlist', label: 'Pre-emptive Domain Watchlist', group: 'Surveillance', icon: <Scan className="w-4 h-4 text-[#00E5FF]" /> },
    { id: 'scam-analyzer', label: 'Scam Script Linguistic NLP Analyzer', group: 'Labs', icon: <FileText className="w-4 h-4 text-purple-400" /> },
    { id: 'unicode-xray', label: 'Unicode & Homoglyph X-Ray Scanner', group: 'Labs', icon: <Terminal className="w-4 h-4 text-amber-400" /> },
    { id: 'board-report', label: 'Executive Board Intelligence Briefing', group: 'Executive', icon: <FileText className="w-4 h-4 text-[#00FFA3]" /> },
    { id: 'alert-preview', label: 'Customer Warning Kit & Alerts', group: 'Advisories', icon: <Share2 className="w-4 h-4 text-[#00E5FF]" /> },
    { id: 'settings', label: 'Enterprise Security Settings & API Keys', group: 'Management', icon: <Sliders className="w-4 h-4 text-slate-400" /> },
  ];

  // Filter navigation items
  const filteredNav = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter findings matching search query
  const matchingFindings = searchQuery.trim().length > 1
    ? findings.filter(f => 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.candidateUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.platform.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const allResults = [
    ...filteredNav.map(item => ({ type: 'nav' as const, data: item })),
    ...matchingFindings.map(item => ({ type: 'finding' as const, data: item })),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (allResults.length || 1)) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = allResults[selectedIndex];
      if (selected) {
        if (selected.type === 'nav') {
          setActivePage(selected.data.id);
          onClose();
        } else if (selected.type === 'finding') {
          setSelectedFinding(selected.data);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Blurred Obsidian Backdrop */}
      <div 
        className="fixed inset-0 bg-[#00050B]/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Cyber Command Palette Container */}
      <div className="relative w-full max-w-2xl bg-[#040C1D]/98 border border-[#00FFA3]/40 rounded-2xl shadow-[0_0_60px_rgba(0,255,163,0.25)] overflow-hidden font-mono text-xs z-10 cyber-corners animate-in zoom-in-95 duration-150">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FFA3]/80 to-transparent" />

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#00FFA3]/20 bg-[#00050B]/60">
          <Search className="w-4 h-4 text-[#00FFA3] shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a route, threat domain, tool, or press Escape..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs font-mono focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#060D1A] border border-[#00FFA3]/30 text-[10px] text-[#00FFA3] font-bold">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#00FFA3]" />
              <p>No matching commands or threat entities found.</p>
            </div>
          ) : (
            allResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.type === 'nav') {
                      setActivePage(item.data.id);
                      onClose();
                    } else if (item.type === 'finding') {
                      setSelectedFinding(item.data);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#00FFA3]/15 border border-[#00FFA3]/40 text-white shadow-[0_0_12px_rgba(0,255,163,0.25)]' 
                      : 'text-slate-300 hover:bg-[#060D1A] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {item.type === 'nav' ? (
                      item.data.icon
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="font-semibold truncate">
                      {item.type === 'nav' ? item.data.label : item.data.title}
                    </span>
                    {item.type === 'finding' && (
                      <span className="text-[10px] text-[#00E5FF] px-1.5 py-0.2 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20 truncate">
                        {item.data.platform}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {item.type === 'nav' ? item.data.group : `Risk: ${item.data.riskScore}/100`}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#00FFA3]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#00050B] border-t border-[#00FFA3]/15 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="text-[#00FFA3]">↑</kbd> <kbd className="text-[#00FFA3]">↓</kbd> to navigate</span>
            <span><kbd className="text-[#00FFA3]">↵</kbd> to select</span>
            <span><kbd className="text-[#00FFA3]">ESC</kbd> to close</span>
          </div>
          <span className="text-[#00FFA3]">[BRANDGUARD SOC COMMAND MATRIX]</span>
        </div>
      </div>
    </div>
  );
};
