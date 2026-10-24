import React from 'react';
import { OfficialSocialAccount, OfficialMobileApp } from '../../types';
import { ShieldCheck, ExternalLink, Edit3, Trash2, Smartphone, Share2 } from 'lucide-react';
import { SpotlightCard } from '../common/SpotlightCard';
import { PlatformBadge } from '../common/PlatformBadge';

interface SocialAssetCardProps {
  type: 'social';
  asset: OfficialSocialAccount;
  onEdit?: (asset: OfficialSocialAccount) => void;
}

interface AppAssetCardProps {
  type: 'app';
  asset: OfficialMobileApp;
  onEdit?: (asset: OfficialMobileApp) => void;
}

type OfficialAssetCardProps = SocialAssetCardProps | AppAssetCardProps;

export const OfficialAssetCard: React.FC<OfficialAssetCardProps> = (props) => {
  if (props.type === 'social') {
    const { asset, onEdit } = props;
    return (
      <SpotlightCard
        spotlightColor="rgba(6, 182, 212, 0.15)"
        className="p-4 rounded-xl unlumen-card border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <PlatformBadge platform={asset.platform} size="xs" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 shadow-[0_0_12px_rgba(0,255,163,0.3)]">
              <ShieldCheck className="w-3 h-3" />
              VERIFIED
            </span>
          </div>

          <div className="space-y-1 mb-3">
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{asset.displayName}</h4>
            <p className="text-xs text-cyan-400 font-mono">{asset.handle}</p>
          </div>

          <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500 font-mono text-[11px]">Account ID:</span>
              <span className="font-mono text-slate-300 text-[11px]">{asset.accountId}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500 font-mono text-[11px]">Profile URL:</span>
              <a 
                href={asset.profileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:underline truncate max-w-[150px] inline-flex items-center gap-1 font-mono text-[11px]"
              >
                <span>{asset.profileUrl.replace('https://', '')}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            {asset.followers && (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500 font-mono text-[11px]">Audience:</span>
                <span className="text-slate-300 font-medium text-[11px]">{asset.followers} followers</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">Verified: {asset.verifiedDate}</span>
          <button
            onClick={() => onEdit?.(asset)}
            className="text-xs font-medium text-slate-400 hover:text-cyan-300 flex items-center gap-1 p-1 btn-smooth"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>
      </SpotlightCard>
    );
  }

  const { asset, onEdit } = props;
  return (
    <SpotlightCard
      spotlightColor="rgba(245, 158, 11, 0.15)"
      className="p-4 rounded-xl unlumen-card border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-sm"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PlatformBadge platform={asset.platform} size="xs" />
            <span className="text-xs font-bold text-white font-mono truncate max-w-[150px]">{asset.name}</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 shadow-[0_0_12px_rgba(0,255,163,0.3)]">
            <ShieldCheck className="w-3 h-3" />
            VERIFIED
          </span>
        </div>

        <div className="space-y-1 mb-3">
          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{asset.platform} App</h4>
          <p className="text-xs text-amber-400 font-mono truncate">{asset.packageId}</p>
        </div>

        <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500 font-mono text-[11px]">Official Publisher:</span>
            <span className="text-slate-200 font-medium text-[11px]">{asset.publisher}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500 font-mono text-[11px]">Version:</span>
            <span className="font-mono text-slate-300 text-[11px]">{asset.version}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500 font-mono text-[11px]">Store Listing:</span>
            <a 
              href={asset.storeUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-cyan-400 hover:underline truncate max-w-[150px] inline-flex items-center gap-1 font-mono text-[11px]"
            >
              <span>Verified Store</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">Verified: {asset.verifiedDate}</span>
        <button
          onClick={() => onEdit?.(asset)}
          className="text-xs font-medium text-slate-400 hover:text-cyan-300 flex items-center gap-1 p-1 btn-smooth"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>
    </SpotlightCard>
  );
};
