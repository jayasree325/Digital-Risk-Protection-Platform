import React from 'react';
import { ConnectedCampaign } from '../../types';
import { Network, Globe, Smartphone, User, Server, AlertOctagon } from 'lucide-react';

interface ConnectedThreatsPanelProps {
  campaign?: ConnectedCampaign;
}

export const ConnectedThreatsPanel: React.FC<ConnectedThreatsPanelProps> = ({ campaign }) => {
  if (!campaign) {
    return (
      <div className="p-4 rounded-xl bg-[#020713] border border-slate-800 text-xs text-slate-400">
        No coordinated threat cluster detected. Candidate appears to be an isolated entity.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#020713] border border-[#00FFA3]/30 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#00FFA3]" />
          <span className="text-xs font-bold text-white tracking-tight">
            Possible connected campaign
          </span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
          {campaign.threatLevel}
        </span>
      </div>

      <p className="text-xs text-slate-300 font-medium">
        Campaign Cluster: <span className="text-white font-bold">{campaign.campaignName}</span>
      </p>

      {/* Node relationships list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-[#00050B] border border-[#00FFA3]/15 flex items-start gap-2.5">
          <User className="w-3.5 h-3.5 text-[#00FFA3] mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Social Candidate</span>
            <span className="text-slate-200 font-mono truncate block">{campaign.candidateProfile}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#00050B] border border-[#00FFA3]/15 flex items-start gap-2.5">
          <Globe className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Suspicious Domain</span>
            <span className="text-slate-200 font-mono truncate block">{campaign.suspiciousDomain}</span>
          </div>
        </div>

        {campaign.relatedMobileApp && (
          <div className="p-2.5 rounded-lg bg-[#00050B] border border-[#00FFA3]/15 flex items-start gap-2.5">
            <Smartphone className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Related Mobile App</span>
              <span className="text-slate-200 font-mono truncate block">{campaign.relatedMobileApp}</span>
            </div>
          </div>
        )}

        <div className="p-2.5 rounded-lg bg-[#00050B] border border-[#00FFA3]/15 flex items-start gap-2.5">
          <Server className="w-3.5 h-3.5 text-[#00E5FF] mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Shared Infrastructure</span>
            <span className="text-slate-200 font-mono truncate block">{campaign.sharedInfrastructure}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
