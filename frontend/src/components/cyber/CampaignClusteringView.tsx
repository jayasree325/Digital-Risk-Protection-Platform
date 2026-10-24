import React, { useState, useMemo } from 'react';
import { Finding } from '../../types';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  Network, 
  ShieldAlert, 
  Server, 
  Globe, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Download, 
  ChevronRight,
  Layers,
  Search,
  Lock,
  Cpu
} from 'lucide-react';

interface CampaignClusteringViewProps {
  findings: Finding[];
  onOpenFinding?: (finding: Finding) => void;
}

interface CampaignGroup {
  id: string;
  name: string;
  threatLevel: 'critical' | 'high' | 'medium';
  infrastructure: {
    subnet: string;
    asn: string;
    registrar: string;
    sslIssuer: string;
  };
  homoglyphPattern: string;
  description: string;
  findings: Finding[];
  mitigationStatus: 'ACTIVE_EXPLOIT' | 'UNDER_MITIGATION' | 'TAKEDOWN_ISSUED';
}

export const CampaignClusteringView: React.FC<CampaignClusteringViewProps> = ({
  findings,
  onOpenFinding,
}) => {
  const { updateFindingStatus, showToast } = useBrandGuard();
  const [searchQuery, setSearchQuery] = useState('');
  const [takedownProcessingId, setTakedownProcessingId] = useState<string | null>(null);

  // Group findings into intelligent infrastructure campaigns
  const campaigns = useMemo<CampaignGroup[]>(() => {
    // Campaign 1: Operation ShadowPay (Payment/Checkout & high risk domains)
    const shadowPayFindings = findings.filter(f => 
      f.connectedCampaign?.campaignName?.toLowerCase().includes('shadow') ||
      f.title.toLowerCase().includes('pay') ||
      f.title.toLowerCase().includes('checkout') ||
      f.candidateUrl?.toLowerCase().includes('pay')
    );

    // Campaign 2: Rogue APK & Mobile Fleet
    const mobileFleetFindings = findings.filter(f => 
      f.type === 'app' ||
      f.platform === 'Google Play' || 
      f.platform === 'Apple App Store' ||
      f.platform === 'Third-party APK' ||
      f.connectedCampaign?.campaignName?.toLowerCase().includes('mobile') ||
      f.title.toLowerCase().includes('apk') ||
      f.title.toLowerCase().includes('app')
    );

    // Campaign 3: Cyrillic Homoglyph & Typosquat Ring
    const homoglyphFindings = findings.filter(f => 
      f.type === 'link' ||
      f.platform === 'Web Domain' ||
      f.lookalike?.differenceType === 'character_variation' ||
      f.lookalike?.differenceType === 'typosquat' ||
      f.title.toLowerCase().includes('login') ||
      f.title.toLowerCase().includes('secure')
    );

    // Campaign 4: Social Impersonation & Direct Scam Wave
    const socialFindings = findings.filter(f => 
      f.type === 'social' ||
      f.platform === 'X' || 
      f.platform === 'Facebook' || 
      f.platform === 'Instagram' ||
      f.platform === 'Telegram' ||
      f.platform === 'LinkedIn'
    );

    // Any remaining items fallback into Syndicate Zero
    const allGroupedIds = new Set([
      ...shadowPayFindings.map(f => f.id),
      ...mobileFleetFindings.map(f => f.id),
      ...homoglyphFindings.map(f => f.id),
      ...socialFindings.map(f => f.id),
    ]);
    const remainder = findings.filter(f => !allGroupedIds.has(f.id));

    const list: CampaignGroup[] = [
      {
        id: 'CMP-7749-SHDW',
        name: 'Operation ShadowPay Syndicate',
        threatLevel: 'critical',
        infrastructure: {
          subnet: '185.220.101.0/24 (M247 Host)',
          asn: 'AS206238 (FlokiNET ISP)',
          registrar: 'NameCheap Inc. / Porkbun LLC',
          sslIssuer: "Let's Encrypt E6 Authority",
        },
        homoglyphPattern: 'Latin/Cyrillic "a" / "o" substitution targeting checkout auth',
        description: 'Coordinated credential harvest network mimicking enterprise checkout gateways with automated OTP siphon scripts.',
        findings: shadowPayFindings.length > 0 ? shadowPayFindings : findings.slice(0, 3),
        mitigationStatus: 'ACTIVE_EXPLOIT',
      },
      {
        id: 'CMP-8812-MBL',
        name: 'DarkDroid Rogue APK Fleet',
        threatLevel: 'critical',
        infrastructure: {
          subnet: '45.154.255.0/24 (Stark Industries)',
          asn: 'AS44050 (CyberHost Global)',
          registrar: 'Tucows Domains Inc.',
          sslIssuer: 'Sectigo RSA Domain Validation',
        },
        homoglyphPattern: 'Altered Android package namespace: com.acmepay.app -> com.acmepay.quick',
        description: 'Trojanized APK binaries distributing unauthorized accessibility service keyloggers on off-market APK mirrors.',
        findings: mobileFleetFindings.length > 0 ? mobileFleetFindings : findings.slice(2, 5),
        mitigationStatus: 'UNDER_MITIGATION',
      },
      {
        id: 'CMP-9041-HMG',
        name: 'Cyrillic Lookalike Mesh (Punycode)',
        threatLevel: 'high',
        infrastructure: {
          subnet: '194.36.191.0/24 (Inferno SRL)',
          asn: 'AS60117 (Hostinger International)',
          registrar: 'PublicDomainRegistry',
          sslIssuer: 'ZeroSSL ECC Intermediate',
        },
        homoglyphPattern: 'xn--acmepy-r0a.com -> Cyrillic small letter a (U+0430)',
        description: 'Automated Punycode registration wave deploying zero-day clone templates matching brand CSS styles.',
        findings: homoglyphFindings.length > 0 ? homoglyphFindings : findings.slice(1, 4),
        mitigationStatus: 'ACTIVE_EXPLOIT',
      },
      {
        id: 'CMP-3401-SOC',
        name: 'VIP Executive Clone Wave',
        threatLevel: 'medium',
        infrastructure: {
          subnet: 'Residential VPN Gateway Array',
          asn: 'AS15169 / Multi-CDN Proxy',
          registrar: 'Direct Social API Hijack',
          sslIssuer: 'Platform Edge TLS',
        },
        homoglyphPattern: 'Underscore suffix and bio metadata scraping: @acmepay_support_team',
        description: 'Bot-driven social media customer support fraud directing compromised users to fraudulent Telegram helpdesks.',
        findings: socialFindings.length > 0 ? socialFindings : remainder.slice(0, 3),
        mitigationStatus: 'TAKEDOWN_ISSUED',
      },
    ];

    return list;
  }, [findings]);

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.infrastructure.subnet.toLowerCase().includes(q) ||
      c.infrastructure.asn.toLowerCase().includes(q) ||
      c.infrastructure.registrar.toLowerCase().includes(q) ||
      c.findings.some(f => f.title.toLowerCase().includes(q))
    );
  }, [campaigns, searchQuery]);

  const handleBatchTakedown = (campaign: CampaignGroup) => {
    setTakedownProcessingId(campaign.id);
    const ticket = `CMP-TKD-${Math.floor(1000 + Math.random() * 9000)}-BULK`;

    setTimeout(() => {
      campaign.findings.forEach(f => {
        updateFindingStatus(f.id, 'Confirmed fake', `Batch Takedown dispatched via ${campaign.name} [${ticket}]`);
      });
      setTakedownProcessingId(null);
      showToast(`Batch takedown packet transmitted for ${campaign.name}! Ticket: #${ticket}`, 'success');
    }, 900);
  };

  const handleExportSTIX = (campaign: CampaignGroup) => {
    const stixDossier = {
      type: 'bundle',
      id: `bundle--${campaign.id}`,
      spec_version: '2.1',
      campaign: {
        name: campaign.name,
        threat_level: campaign.threatLevel,
        infrastructure: campaign.infrastructure,
        homoglyph_pattern: campaign.homoglyphPattern,
        iocs: campaign.findings.map(f => ({
          indicator: f.candidateUrl || f.candidateWebsite || f.usernameOrPackage,
          platform: f.platform,
          risk_score: f.riskScore,
        }))
      }
    };

    const blob = new Blob([JSON.stringify(stixDossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_${campaign.id}_STIX2.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported STIX 2.1 Threat Dossier for ${campaign.id}`, 'info');
  };

  return (
    <div className="space-y-4">
      {/* Correlation Telemetry Header */}
      <div className="cyber-bento-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/40 flex items-center justify-center text-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.25)]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/30">
                HEURISTIC_CLUSTERING_ENGINE // v4.2
              </span>
              <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Campaign Infrastructure Correlation Matrix</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({campaigns.length} Active Threat Clusters Correlated)
              </span>
            </h2>
          </div>
        </div>

        {/* Search within campaigns */}
        <div className="relative w-full md:w-72 font-mono">
          <Search className="w-3.5 h-3.5 text-[#00FFA3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ASN, subnet, campaign..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#00050B] border border-[#00FFA3]/30 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]"
          />
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredCampaigns.map((campaign) => (
          <div 
            key={campaign.id}
            className="cyber-bento-card p-5 flex flex-col justify-between border border-[#00FFA3]/25 hover:border-[#00FFA3]/60 transition-all duration-200 group"
          >
            <div>
              {/* Campaign Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#00FFA3] bg-[#00050B] px-2 py-0.5 rounded border border-[#00FFA3]/30">
                      {campaign.id}
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                      campaign.threatLevel === 'critical'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : campaign.threatLevel === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/40'
                    }`}>
                      DEFCON {campaign.threatLevel === 'critical' ? '1' : campaign.threatLevel === 'high' ? '2' : '3'} • {campaign.threatLevel.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00FFA3] transition-colors">
                    {campaign.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleExportSTIX(campaign)}
                    className="p-1.5 rounded-lg bg-[#00050B] hover:bg-[#040C1D] text-slate-300 hover:text-[#00FFA3] border border-slate-800 hover:border-[#00FFA3]/40 transition-colors"
                    title="Export STIX 2.1 Threat Intel"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleBatchTakedown(campaign)}
                    disabled={takedownProcessingId === campaign.id}
                    className="px-3 py-1.5 rounded-lg bg-[#00FFA3] hover:bg-[#00E88F] text-[#00050B] font-mono font-bold text-[11px] flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,163,0.3)] transition-all disabled:opacity-50"
                  >
                    {takedownProcessingId === campaign.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-[#00050B] border-t-transparent rounded-full animate-spin" />
                        <span>DISPATCHING...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>1-CLICK TAKEDOWN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-3.5 leading-relaxed font-sans">
                {campaign.description}
              </p>

              {/* Infrastructure Footprint Bento Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#00050B]/90 border border-[#00FFA3]/15 text-[11px] font-mono mb-4">
                <div>
                  <span className="text-slate-500 block text-[10px]">CORRELATED SUBNET:</span>
                  <span className="text-slate-200 font-semibold truncate block">{campaign.infrastructure.subnet}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TARGET ASN:</span>
                  <span className="text-slate-200 font-semibold truncate block">{campaign.infrastructure.asn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">REGISTRAR / HOST:</span>
                  <span className="text-slate-200 font-semibold truncate block">{campaign.infrastructure.registrar}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SSL AUTHORITY:</span>
                  <span className="text-slate-200 font-semibold truncate block">{campaign.infrastructure.sslIssuer}</span>
                </div>
              </div>

              {/* Homoglyph Syntax Pattern */}
              <div className="p-2.5 rounded-lg bg-[#040C1D] border border-cyan-950 text-xs font-mono flex items-center gap-2 mb-4">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 truncate">
                  <span className="text-[#00FFA3]">SYNTAX VECTOR: </span>
                  {campaign.homoglyphPattern}
                </span>
              </div>
            </div>

            {/* Correlated Threats Sub-List */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800 pb-1">
                <span>Correlated Threat Signals ({campaign.findings.length})</span>
                <span className="text-[#00FFA3]">Click to inspect</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {campaign.findings.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => onOpenFinding && onOpenFinding(f)}
                    className="p-2 rounded-lg bg-[#00050B] hover:bg-[#020713] border border-slate-800/80 hover:border-[#00FFA3]/40 cursor-pointer flex items-center justify-between transition-all group/item"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {f.platform}
                      </span>
                      <span className="text-xs text-white group-hover/item:text-[#00FFA3] truncate font-medium">
                        {f.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#00FFA3]">
                        {f.riskScore}%
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-[#00FFA3] transition-transform group-hover/item:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
