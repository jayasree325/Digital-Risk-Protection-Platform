import React, { useState, useMemo } from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { InvestigationCase, CaseStatus, CasePriority, Finding } from '../../types';
import { 
  FolderLock, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Share2, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  ArrowUpRight, 
  Trash2, 
  MessageSquare, 
  Layers, 
  ChevronRight, 
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const CaseManagementView: React.FC = () => {
  const { 
    cases, 
    findings, 
    selectedCase, 
    setSelectedCase, 
    createCase, 
    updateCaseStatus, 
    assignFindingToCase, 
    removeFindingFromCase, 
    addCaseNote,
    setSelectedFinding,
    showToast
  } = useBrandGuard();

  const [activeStatusFilter, setActiveStatusFilter] = useState<'All' | CaseStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedFindingToAttach, setSelectedFindingToAttach] = useState('');

  // New Case Form State
  const [newCaseForm, setNewCaseForm] = useState<{
    title: string;
    description: string;
    priority: CasePriority;
    assignedAnalyst: string;
    selectedFindingIds: string[];
    tags: string;
  }>({
    title: '',
    description: '',
    priority: 'High',
    assignedAnalyst: 'Alex Mercer (SecOps Lead)',
    selectedFindingIds: [],
    tags: 'Active Threat, Impersonation',
  });

  const analysts = [
    'Alex Mercer (SecOps Lead)',
    'Sarah Jenkins (Mobile Threat Analyst)',
    'Elena Rostova (Threat Intelligence)',
    'Devon Vance (Legal & Compliance)',
  ];

  const statusOptions: CaseStatus[] = ['Open', 'Investigating', 'Escalated', 'Resolved', 'Closed'];
  const priorityOptions: CasePriority[] = ['Critical', 'High', 'Medium', 'Low'];

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (activeStatusFilter !== 'All' && c.status !== activeStatusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesNumber = c.caseNumber.toLowerCase().includes(q);
        const matchesAnalyst = c.assignedAnalyst.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNumber && !matchesAnalyst) return false;
      }
      return true;
    });
  }, [cases, activeStatusFilter, searchQuery]);

  const activeCase = selectedCase || (cases.length > 0 ? cases[0] : null);

  const getPriorityBadge = (priority: CasePriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Low':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      case 'Investigating':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'Escalated':
        return 'bg-red-500/15 text-red-300 border-red-500/40';
      case 'Resolved':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'Closed':
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-600/40';
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseForm.title.trim()) {
      showToast('Please provide a title for the investigation case', 'warning');
      return;
    }

    createCase({
      title: newCaseForm.title.trim(),
      description: newCaseForm.description.trim() || 'No description provided.',
      priority: newCaseForm.priority,
      assignedAnalyst: newCaseForm.assignedAnalyst,
      findingIds: newCaseForm.selectedFindingIds,
      tags: newCaseForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setIsCreateModalOpen(false);
    setNewCaseForm({
      title: '',
      description: '',
      priority: 'High',
      assignedAnalyst: 'Alex Mercer (SecOps Lead)',
      selectedFindingIds: [],
      tags: 'Active Threat, Impersonation',
    });
  };

  const handleAddNote = () => {
    if (!activeCase || !newNoteText.trim()) return;
    addCaseNote(activeCase.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleAttachFinding = () => {
    if (!activeCase || !selectedFindingToAttach) return;
    assignFindingToCase(activeCase.id, selectedFindingToAttach);
    setSelectedFindingToAttach('');
  };

  // Resolve linked findings for the active case
  const linkedFindings = useMemo(() => {
    if (!activeCase) return [];
    return activeCase.findingIds
      .map((id) => findings.find((f) => f.id === id))
      .filter((f): f is Finding => !!f);
  }, [activeCase, findings]);

  // Unlinked findings available to attach
  const availableFindingsToAttach = useMemo(() => {
    if (!activeCase) return [];
    return findings.filter((f) => !activeCase.findingIds.includes(f.id));
  }, [activeCase, findings]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#040C1D]/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#00FFA3] uppercase tracking-widest bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/30">
              UNIFIED_INVESTIGATIONS
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Demo data
            </span>
          </div>
          <h2 className="text-lg font-bold text-white font-mono mt-1">
            Investigation Cases ({cases.length})
          </h2>
          <p className="text-xs text-slate-400">
            Group related findings across social profiles, scam messages, mobile apps, and infrastructure.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-smooth px-4 py-2 rounded-xl bg-[#00FFA3] text-[#00050B] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0, 255, 163,0.3)] hover:bg-[#00E5FF] font-mono self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Case</span>
        </button>
      </div>

      {/* Main Split Layout: Left Cases List, Right Active Case Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Cases List (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters & Search */}
          <div className="space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case #, title, or analyst..."
                className="w-full bg-[#020713] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#00FFA3]"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {(['All', ...statusOptions] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    activeStatusFilter === st
                      ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 font-bold'
                      : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Cases Cards */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#061226] border-[#00FFA3]/50 shadow-[0_0_20px_rgba(0, 255, 163,0.1)]'
                      : 'bg-[#030917]/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-[#00FFA3] font-bold">{c.caseNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1 mb-1 font-mono">
                    {c.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800/60 pt-2">
                    <span className={`px-1.5 py-0.5 rounded border ${getPriorityBadge(c.priority)}`}>
                      {c.priority} Priority
                    </span>
                    <span>{c.findingIds.length} Findings Attached</span>
                    <span>{c.updatedAt}</span>
                  </div>
                </div>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="p-8 text-center bg-[#020713] rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
                No investigation cases match the selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Case Workspace (7 cols) */}
        {activeCase ? (
          <div className="lg:col-span-7 space-y-6">
            
            {/* Case Dossier Header Card */}
            <div className="unlumen-card p-6 bg-[#040D20]/90 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#00FFA3]">
                      {activeCase.caseNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-semibold ${getPriorityBadge(activeCase.priority)}`}>
                      {activeCase.priority} Priority
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight">
                    {activeCase.title}
                  </h1>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-slate-400">Status:</span>
                  <div className="relative">
                    <select
                      value={activeCase.status}
                      onChange={(e) => updateCaseStatus(activeCase.id, e.target.value as CaseStatus)}
                      className="appearance-none bg-[#020713] border border-cyan-500/40 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Case Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#020713] border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Assigned Analyst</span>
                  <span className="text-white font-semibold truncate block mt-0.5">{activeCase.assignedAnalyst}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#020713] border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Created</span>
                  <span className="text-slate-300 block mt-0.5">{activeCase.createdAt}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#020713] border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Last Activity</span>
                  <span className="text-[#00FFA3] block mt-0.5">{activeCase.updatedAt}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#020713] border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Evidence Artifacts</span>
                  <span className="text-white font-bold block mt-0.5">{activeCase.evidenceCount} Files</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#020713]/60 p-3 rounded-xl border border-slate-800/80">
                {activeCase.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeCase.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-500/25">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Linked Findings Section */}
            <div className="unlumen-card p-6 bg-[#040D20]/90 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00FFA3]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Grouped Threat Findings ({linkedFindings.length})
                  </h3>
                </div>

                {/* Attach finding dropdown */}
                {availableFindingsToAttach.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedFindingToAttach}
                      onChange={(e) => setSelectedFindingToAttach(e.target.value)}
                      className="bg-[#020713] border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 font-mono focus:outline-none max-w-[200px]"
                    >
                      <option value="">Attach another finding...</option>
                      {availableFindingsToAttach.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title} ({f.platform})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAttachFinding}
                      disabled={!selectedFindingToAttach}
                      className="px-2.5 py-1 rounded-lg bg-[#00FFA3] text-[#00050B] font-bold text-xs disabled:opacity-40 font-mono"
                    >
                      Attach
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                {linkedFindings.map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl bg-[#020713] border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-white/[0.04] text-[#00FFA3] flex-shrink-0">
                        {f.type === 'app' ? <Smartphone className="w-4 h-4 text-purple-400" /> : <Share2 className="w-4 h-4 text-[#00FFA3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono truncate">{f.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-500/15 text-red-300 border border-red-500/30">
                            {f.riskScore}%
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono truncate block">
                          {f.candidateUrl}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono flex-shrink-0">
                      <button
                        onClick={() => setSelectedFinding(f)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] text-[11px] flex items-center gap-1 border border-white/[0.08]"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFindingFromCase(activeCase.id, f.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                        title="Unlink from case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {linkedFindings.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    No findings linked to this case yet. Use the dropdown above to attach detected threats.
                  </div>
                )}
              </div>
            </div>

            {/* Scam Message Snippets (if present) */}
            {activeCase.scamMessageSnippets && activeCase.scamMessageSnippets.length > 0 && (
              <div className="unlumen-card p-5 bg-[#040D20]/90 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Intercepted Scam Message Evidence</span>
                </div>
                <div className="space-y-2">
                  {activeCase.scamMessageSnippets.map((msg, i) => (
                    <div key={i} className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-amber-200/90 italic font-mono">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyst Notes & Activity History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Analyst Notes */}
              <div className="unlumen-card p-5 bg-[#040D20]/90 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white font-mono">
                  <FileText className="w-4 h-4 text-[#00FFA3]" />
                  <span>Case Notes ({activeCase.notes.length})</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {activeCase.notes.map((n, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#020713] border border-slate-800/80 text-slate-300">
                      {n}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add an analyst note..."
                    className="flex-1 bg-[#020713] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#00FFA3]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#00FFA3] text-[#00050B] font-bold text-xs disabled:opacity-40 font-mono"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Activity History */}
              <div className="unlumen-card p-5 bg-[#040D20]/90 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white font-mono">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Activity History</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-[11px] font-mono">
                  {activeCase.activities.map((act) => (
                    <div key={act.id} className="p-2.5 rounded-lg bg-[#020713] border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-white font-semibold">{act.author}</span>
                        <span className="text-slate-500 text-[10px]">{act.timestamp}</span>
                      </div>
                      <p className="text-slate-300">{act.action}</p>
                      {act.note && <p className="text-cyan-400/90 italic text-[10px]">{act.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-12 bg-[#020713] rounded-2xl border border-slate-800 text-center space-y-2 text-xs text-slate-400 font-mono">
            <FolderLock className="w-8 h-8 text-slate-600 mb-2" />
            <span className="text-white font-bold">No Case Selected</span>
            <p>Select a case from the list on the left or create a new case.</p>
          </div>
        )}

      </div>

      {/* Create New Case Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="unlumen-card w-full max-w-lg bg-[#030A19] border border-[#00FFA3]/40 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-[#00FFA3]" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Create Investigation Case
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Case Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCaseForm.title}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, title: e.target.value })}
                  placeholder="e.g. Credential Phishing via Lookalike Telegram Channel"
                  className="w-full bg-[#020713] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFA3]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newCaseForm.description}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, description: e.target.value })}
                  placeholder="Summarize the threat scope, attack pattern, and targets..."
                  className="w-full bg-[#020713] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFA3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                    Priority
                  </label>
                  <select
                    value={newCaseForm.priority}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, priority: e.target.value as CasePriority })}
                    className="w-full bg-[#020713] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {priorityOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                    Assigned Analyst
                  </label>
                  <select
                    value={newCaseForm.assignedAnalyst}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, assignedAnalyst: e.target.value })}
                    className="w-full bg-[#020713] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {analysts.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCaseForm.tags}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, tags: e.target.value })}
                  className="w-full bg-[#020713] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FFA3]"
                />
              </div>

              {/* Finding Selection */}
              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                  Initial Findings to Attach ({newCaseForm.selectedFindingIds.length} selected)
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1 bg-[#020713] p-2 rounded-xl border border-slate-800">
                  {findings.map((f) => {
                    const isChecked = newCaseForm.selectedFindingIds.includes(f.id);
                    return (
                      <label key={f.id} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white py-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewCaseForm({
                                ...newCaseForm,
                                selectedFindingIds: [...newCaseForm.selectedFindingIds, f.id],
                              });
                            } else {
                              setNewCaseForm({
                                ...newCaseForm,
                                selectedFindingIds: newCaseForm.selectedFindingIds.filter((id) => id !== f.id),
                              });
                            }
                          }}
                          className="rounded border-slate-700 text-[#00FFA3] focus:ring-0"
                        />
                        <span className="truncate">{f.title} ({f.platform})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00FFA3] text-[#00050B] font-bold shadow-md hover:bg-[#00E5FF]"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
