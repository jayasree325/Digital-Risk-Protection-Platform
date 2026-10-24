import React, { useState } from 'react';
import { Finding, TrustNode, TrustEdge } from '../../types';
import { getTrustGraphForFinding } from '../../data/mockData';
import { 
  Network, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  Smartphone, 
  Share2, 
  Server, 
  Building2, 
  ArrowRight, 
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface TrustGraphViewProps {
  finding: Finding;
}

export const TrustGraphView: React.FC<TrustGraphViewProps> = ({ finding }) => {
  const graphData = getTrustGraphForFinding(finding);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-finding-target');

  const selectedNode = graphData.nodes.find((n) => n.id === selectedNodeId) || graphData.nodes[1];

  const getNodeIcon = (type: TrustNode['type']) => {
    switch (type) {
      case 'official':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'suspicious_profile':
        return <Share2 className="w-5 h-5 text-red-400" />;
      case 'mobile_app':
        return <Smartphone className="w-5 h-5 text-purple-400" />;
      case 'suspicious_domain':
        return <Globe className="w-5 h-5 text-amber-400" />;
      case 'publisher':
        return <Building2 className="w-5 h-5 text-cyan-400" />;
      case 'infrastructure':
        return <Server className="w-5 h-5 text-rose-400" />;
      default:
        return <Network className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNodeColor = (node: TrustNode, isSelected: boolean) => {
    if (node.type === 'official') {
      return isSelected 
        ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
        : 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500/80';
    }
    if (node.riskLevel === 'critical' || node.riskLevel === 'high') {
      return isSelected 
        ? 'border-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
        : 'border-red-500/40 bg-red-950/20 hover:border-red-500/80';
    }
    return isSelected 
      ? 'border-cyan-500 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
      : 'border-slate-700 bg-[#060E20] hover:border-slate-500';
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/20">
              TRUST_GRAPH_CORRELATION
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Demo data
            </span>
          </div>
          <h3 className="text-sm font-bold text-white font-mono mt-1">
            Threat & Asset Relationship Graph
          </h3>
          <p className="text-xs text-slate-400">
            Clear visual connections linking the official brand asset to detected imposter profiles, domains, and shared infrastructure.
          </p>
        </div>
      </div>

      {/* Visual Relationship Flow */}
      <div className="unlumen-card p-5 bg-[#030917]/90 border border-slate-800 rounded-2xl space-y-6">
        
        {/* Node Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          
          {/* Column 1: Authoritative Anchor */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
              01 &bull; Authoritative Asset
            </span>
            {graphData.nodes.filter((n) => n.type === 'official').map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${getNodeColor(node, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      Safe Anchor
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    {node.label}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {node.detail}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Column 2: Candidate Target & Imposter Profile */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 block font-bold">
              02 &bull; Candidate Threat Entity
            </span>
            {graphData.nodes.filter((n) => n.type === 'suspicious_profile' || n.type === 'mobile_app').map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${getNodeColor(node, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/30">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 font-bold border border-red-500/40 uppercase">
                      {node.riskLevel || 'High'} Risk
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    {node.label}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {node.detail}
                  </span>
                </div>
              );
            })}

            {/* Candidate Domain */}
            {graphData.nodes.filter((n) => n.type === 'suspicious_domain').map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 mt-2 ${getNodeColor(node, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 uppercase">
                      Redirect Link
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    {node.label}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {node.detail}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Column 3: Publisher & Infrastructure Backends */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-bold">
              03 &bull; Linked Infrastructure
            </span>
            {graphData.nodes.filter((n) => n.type === 'publisher' || n.type === 'infrastructure').map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${getNodeColor(node, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 uppercase">
                      {node.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    {node.label}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {node.detail}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Explicit Connection Reasons List */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono block">
            Verified Connection Rationale ({graphData.edges.length} Links Detected)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {graphData.edges.map((edge) => {
              const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
              const targetNode = graphData.nodes.find((n) => n.id === edge.target);
              return (
                <div
                  key={edge.id}
                  className="p-3 rounded-xl bg-[#020713] border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase">
                      Reason: {edge.reason}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400">
                      Confidence: {edge.confidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="truncate text-white font-medium">{sourceNode?.label.split(':')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00FFA3] flex-shrink-0" />
                    <span className="truncate text-red-300 font-medium">{targetNode?.label.split(':')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Forensics Inspector */}
        {selectedNode && (
          <div className="p-4 rounded-xl bg-[#020713] border border-cyan-500/30 space-y-2 text-xs font-mono animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Selected Entity Inspection: {selectedNode.label}</span>
              </span>
              <span className="text-[10px] text-slate-500">NODE_ID: {selectedNode.id}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 block">Classification:</span>
                <span className="text-white capitalize">{selectedNode.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Identifier / Domain:</span>
                <span className="text-slate-200">{selectedNode.detail || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Risk Evaluation:</span>
                <span className="text-red-400 font-bold uppercase">{selectedNode.riskLevel || 'Safe'}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
