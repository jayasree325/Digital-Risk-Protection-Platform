import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  Code2, 
  HelpCircle,
  CornerDownRight
} from 'lucide-react';
import { RiskSeverity } from '../../types';

export interface CharAnalysis {
  char: string;
  codePoint: string;
  decimalCode: number;
  scriptName: string;
  isSuspicious: boolean;
  suspicionType?: 'Cyrillic Homoglyph' | 'Greek Homoglyph' | 'Zero-width Invisible' | 'Full-width Latin' | 'Digit Substitution' | 'Confusable Symbol';
  asciiEquivalent?: string;
  description: string;
}

export interface UnicodeAnalysisResult {
  candidateString: string;
  safeAsciiString: string;
  riskSeverity: RiskSeverity;
  riskScore: number;
  hasMixedScripts: boolean;
  detectedScripts: string[];
  suspiciousCharCount: number;
  characters: CharAnalysis[];
}

// Comprehensive Unicode & Confusables Analyzer
export const analyzeUnicodeString = (input: string): UnicodeAnalysisResult => {
  const chars = Array.from(input);
  const detectedScriptsSet = new Set<string>();
  let suspiciousCount = 0;
  let maxRiskScore = 15;

  const analyzedChars: CharAnalysis[] = chars.map((char) => {
    const code = char.codePointAt(0) || 0;
    const hex = 'U+' + code.toString(16).toUpperCase().padStart(4, '0');
    let script = 'Basic Latin';
    let isSuspicious = false;
    let suspicionType: CharAnalysis['suspicionType'];
    let asciiEquivalent = char;
    let desc = 'Standard Latin ASCII character';

    // Zero-width & invisible characters
    if (code === 0x200B || code === 0x200C || code === 0x200D || code === 0xFEFF || code === 0x00A0 || code === 0x2060) {
      script = 'Invisible / Format';
      isSuspicious = true;
      suspicionType = 'Zero-width Invisible';
      asciiEquivalent = '';
      desc = `Zero-width invisible character (${hex}) used to bypass string filters.`;
      suspiciousCount++;
      maxRiskScore = Math.max(maxRiskScore, 95);
    }
    // Cyrillic Look-alikes (homoglyphs)
    else if ((code >= 0x0400 && code <= 0x04FF) || (code >= 0x0500 && code <= 0x052F)) {
      script = 'Cyrillic';
      detectedScriptsSet.add('Cyrillic');
      isSuspicious = true;
      suspicionType = 'Cyrillic Homoglyph';
      suspiciousCount++;
      maxRiskScore = Math.max(maxRiskScore, 98);

      const cyrillicMap: Record<number, string> = {
        0x0430: 'a', // Cyrillic а
        0x0441: 'c', // Cyrillic с
        0x0435: 'e', // Cyrillic е
        0x043E: 'o', // Cyrillic о
        0x0440: 'p', // Cyrillic р
        0x0445: 'x', // Cyrillic х
        0x0443: 'y', // Cyrillic у
        0x0456: 'i', // Cyrillic і
        0x0458: 'j', // Cyrillic ј
        0x0406: 'I', // Cyrillic І
        0x0410: 'A', // Cyrillic А
        0x0412: 'B', // Cyrillic В
        0x0415: 'E', // Cyrillic Е
        0x041E: 'O', // Cyrillic О
        0x0420: 'P', // Cyrillic Р
        0x0421: 'C', // Cyrillic С
        0x0422: 'T', // Cyrillic Т
      };
      asciiEquivalent = cyrillicMap[code] || '?';
      desc = `Cyrillic homoglyph visually identical to Latin '${asciiEquivalent}'.`;
    }
    // Greek Look-alikes
    else if (code >= 0x0370 && code <= 0x03FF) {
      script = 'Greek';
      detectedScriptsSet.add('Greek');
      isSuspicious = true;
      suspicionType = 'Greek Homoglyph';
      suspiciousCount++;
      maxRiskScore = Math.max(maxRiskScore, 90);

      const greekMap: Record<number, string> = {
        0x03B1: 'a', // alpha
        0x03BF: 'o', // omicron
        0x03BD: 'v', // nu
        0x03C1: 'p', // rho
        0x03B9: 'i', // iota
        0x0391: 'A',
        0x0392: 'B',
        0x0395: 'E',
        0x039F: 'O',
      };
      asciiEquivalent = greekMap[code] || '?';
      desc = `Greek script character mimicking Latin '${asciiEquivalent}'.`;
    }
    // Full-width Latin
    else if (code >= 0xFF01 && code <= 0xFF5E) {
      script = 'Full-width Latin';
      detectedScriptsSet.add('Full-width');
      isSuspicious = true;
      suspicionType = 'Full-width Latin';
      asciiEquivalent = String.fromCharCode(code - 0xFEE0);
      desc = `Full-width character (${hex}) rendered wide to defeat exact URL matches.`;
      suspiciousCount++;
      maxRiskScore = Math.max(maxRiskScore, 85);
    }
    // Digit substitutions in alphanumeric name (e.g. 0 for O, 1 for l, 5 for S)
    else if (/[0-9]/.test(char) && /[a-zA-Z]/.test(input)) {
      script = 'ASCII Digit';
      detectedScriptsSet.add('ASCII Digit');
      const digitMap: Record<string, string> = { '0': 'o', '1': 'l', '5': 's', '3': 'e', '8': 'B' };
      if (digitMap[char]) {
        isSuspicious = true;
        suspicionType = 'Digit Substitution';
        asciiEquivalent = digitMap[char];
        desc = `Digit '${char}' substituted for letter '${digitMap[char]}' in brand string.`;
        suspiciousCount++;
        maxRiskScore = Math.max(maxRiskScore, 70);
      }
    }
    // Basic Latin
    else {
      detectedScriptsSet.add('Basic Latin');
      desc = 'Standard Latin alphanumeric ASCII character.';
    }

    return {
      char,
      codePoint: hex,
      decimalCode: code,
      scriptName: script,
      isSuspicious,
      suspicionType,
      asciiEquivalent,
      description: desc,
    };
  });

  const hasMixedScripts = detectedScriptsSet.size > 1 && (detectedScriptsSet.has('Cyrillic') || detectedScriptsSet.has('Greek') || detectedScriptsSet.has('Full-width'));
  if (hasMixedScripts) {
    maxRiskScore = Math.max(maxRiskScore, 92);
  }

  let severity: RiskSeverity = 'low';
  if (maxRiskScore >= 85) severity = 'critical';
  else if (maxRiskScore >= 70) severity = 'high';
  else if (maxRiskScore >= 50) severity = 'medium';

  const safeAscii = analyzedChars.map(c => c.asciiEquivalent).join('');

  return {
    candidateString: input,
    safeAsciiString: safeAscii,
    riskSeverity: severity,
    riskScore: maxRiskScore,
    hasMixedScripts,
    detectedScripts: Array.from(detectedScriptsSet),
    suspiciousCharCount: suspiciousCount,
    characters: analyzedChars,
  };
};

interface UnicodeXRayInspectorProps {
  candidateString: string;
  onAddEvidence?: () => void;
  showCardHeader?: boolean;
}

export const UnicodeXRayInspector: React.FC<UnicodeXRayInspectorProps> = ({
  candidateString,
  onAddEvidence,
  showCardHeader = true,
}) => {
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(null);
  const [copiedSafe, setCopiedSafe] = useState(false);

  const analysis = useMemo(() => {
    return analyzeUnicodeString(candidateString || '');
  }, [candidateString]);

  const handleCopySafe = () => {
    navigator.clipboard?.writeText(analysis.safeAsciiString);
    setCopiedSafe(true);
    setTimeout(() => setCopiedSafe(false), 2500);
  };

  const selectedChar = selectedCharIndex !== null ? analysis.characters[selectedCharIndex] : null;

  return (
    <div className={`p-5 rounded-2xl bg-[#020713] border border-[#00FFA3]/20 space-y-4 font-sans text-xs`}>
      {showCardHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                <Code2 className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Unicode X-Ray & Homoglyph Detector
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Demo data
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deep character-by-character codepoint inspection uncovering invisible spoofing and mixed-script attacks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              analysis.riskSeverity === 'critical'
                ? 'bg-red-500/15 text-red-300 border-red-500/30'
                : analysis.riskSeverity === 'high'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/30'
            }`}>
              Unicode Risk: {analysis.riskSeverity.toUpperCase()} ({analysis.riskScore}/100)
            </span>
          </div>
        </div>
      )}

      {/* Interactive Character Sequence Tiles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Interactive Codepoint Inspector (Click any character):</span>
          <span className="text-slate-500">Length: {analysis.characters.length} characters</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-[#00050B] border border-[#00FFA3]/15 animate-in fade-in duration-300">
          {analysis.characters.map((ch, idx) => {
            const isSelected = selectedCharIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => setSelectedCharIndex(idx)}
                className={`flex flex-col items-center justify-center min-w-[38px] h-14 px-1.5 rounded-lg font-mono transition-all duration-300 border focus-visible:ring-2 focus-visible:ring-[#00FFA3] focus:outline-none ${
                  ch.isSuspicious
                    ? isSelected
                      ? 'bg-red-500/30 border-red-400 text-red-200 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-red-500/20 border-red-500/50 text-red-300 animate-unicode-glow'
                    : isSelected
                    ? 'bg-[#00FFA3]/20 border-[#00FFA3] text-[#00FFA3] ring-2 ring-[#00FFA3]/40'
                    : 'bg-[#020713] border-slate-800 text-slate-300 hover:border-[#00FFA3]/40'
                }`}
                title={`${ch.codePoint} - ${ch.scriptName} (${ch.description})`}
              >
                <span className="text-base font-bold leading-none">
                  {ch.char.trim() === '' ? '·' : ch.char}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 leading-none">
                  {ch.codePoint.replace('U+', '')}
                </span>
                {ch.isSuspicious && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-0.5 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Character Deep Dive Card (Code and explanation fade in smoothly) */}
      {selectedChar ? (
        <div className="p-3.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/20 space-y-2 section-smooth-enter">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black px-2 py-0.5 rounded bg-[#020713] border border-slate-800 text-white">
                {selectedChar.char}
              </span>
              <div>
                <span className="text-xs font-bold text-white font-mono">
                  {selectedChar.codePoint} (Decimal {selectedChar.decimalCode})
                </span>
                <p className="text-[11px] text-slate-400">
                  Script Family: <strong className="text-[#00FFA3]">{selectedChar.scriptName}</strong>
                </p>
              </div>
            </div>

            {selectedChar.isSuspicious ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                {selectedChar.suspicionType}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                Normal ASCII
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed bg-[#020713]/80 p-2 rounded-lg border border-slate-800">
            {selectedChar.description}
          </p>

          {selectedChar.asciiEquivalent && selectedChar.asciiEquivalent !== selectedChar.char && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <CornerDownRight className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>Safe ASCII Latin Equivalent: </span>
              <strong className="text-[#00FFA3] font-mono text-xs">{selectedChar.asciiEquivalent}</strong>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#00050B] border border-slate-800 text-slate-400 text-[11px] flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-[#00FFA3] flex-shrink-0" />
          <span>Click any character tile above to inspect its exact Unicode hex codepoint and homoglyph mapping.</span>
        </div>
      )}

      {/* Summary Findings & Action Buttons */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Normalized Safe String:</span>
            <span className="font-mono text-[#00FFA3] font-bold bg-[#00050B] px-2 py-0.5 rounded border border-[#00FFA3]/30">
              {analysis.safeAsciiString}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            {analysis.suspiciousCharCount} anomalous codepoints detected across {analysis.detectedScripts.join(', ')}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopySafe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copiedSafe ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FFA3]" />
                <span className="text-[#00FFA3]">Copied Safe ASCII!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Safe Version</span>
              </>
            )}
          </button>

          {onAddEvidence && (
            <button
              onClick={onAddEvidence}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#00E5FF] hover:opacity-90 text-black text-xs font-bold transition-opacity shadow-[0_0_12px_rgba(0, 255, 163,0.3)]"
            >
              <FileCheck className="w-3.5 h-3.5 text-black" />
              <span>Add Evidence to Finding</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
