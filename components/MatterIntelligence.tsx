
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, DocumentMetadata, Region, PrivilegeStatus } from '../types';
import {
  Clock,
  History,
  ChevronRight,
  Activity,
  MessageSquare,
  PlusCircle,
  Send,
  UserPlus,
  Play,
  Pause,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sparkles,
  FileSignature,
  AlertTriangle,
  Users,
  Edit3,
  Trash
} from 'lucide-react';
import { LexGeminiService } from '../services/geminiService';
import DocumentTemplateMarketplace from './DocumentTemplateMarketplace';
import DraftingStudio from './DraftingStudio';

interface MatterIntelligenceProps {
  matterId: string;
  mode: AppMode;
  onBack: () => void;
  documents: DocumentMetadata[];
  onDocumentDoubleClick?: (docId: string) => void;
  onCreateDocument?: (docData: Partial<DocumentMetadata>) => Promise<any> | void;
}

interface TeamMember {
  id: string;
  name: string;
  roleString: string;
  isOnLeave?: boolean;
}

interface CollabNote {
  id: string;
  text: string;
  createdAt: string;
  author: { name: string };
}

interface LiveTimeEntry {
  id: string;
  lawyerName?: string;
  durationMinutes: number;
  description: string;
  status: string;
  user?: { name: string };
  startTime: string;
}

const gemini = new LexGeminiService();

const MatterIntelligence: React.FC<MatterIntelligenceProps> = ({ matterId, mode, onBack, documents, onDocumentDoubleClick, onCreateDocument }) => {
  const isFirm = mode === AppMode.LAW_FIRM;

  // ---------- State ----------
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [matterName, setMatterName] = useState('');
  const [matterClient, setMatterClient] = useState('');
  const [matterDept, setMatterDept] = useState('');
  const [internalCounselId, setInternalCounselId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [timeEntries, setTimeEntries] = useState<LiveTimeEntry[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [docCycleMs, setDocCycleMs] = useState(0);

  const [notes, setNotes] = useState<CollabNote[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [isSendingNote, setIsSendingNote] = useState(false);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const [rawTimeNotes, setRawTimeNotes] = useState('');
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  // Briefing state
  const [isBriefing, setIsBriefing] = useState(false);
  const [briefingText, setBriefingText] = useState<string | null>(null);

  // Submit to Silo
  const [isSubmittingSilo, setIsSubmittingSilo] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ---------- Fetch intelligence ----------
  const fetchIntelligence = useCallback(async () => {
    if (!matterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await gemini.getMatterIntelligence(matterId);
      setMatterName(data.matter.name);
      setMatterClient(data.matter.client);
      setMatterDept(data.matter.department || '');
      setInternalCounselId(data.matter.internalCounselId);
      setTeam(data.team);
      setTimeEntries(data.matter.timeEntries || []);
      setTotalHours(data.metrics.totalHours);
      setDocCycleMs(data.metrics.docCycleTime);

      const available = await gemini.getAvailableTeamMembers(matterId);
      setAvailableUsers(available);
    } catch (e: any) {
      setError('Unable to load matter intelligence. Check server connection.');
    } finally {
      setIsLoading(false);
    }
  }, [matterId]);

  const fetchNotes = useCallback(async () => {
    if (!matterId) return;
    try {
      const data = await gemini.getMatterNotes(matterId);
      setNotes(data);
    } catch (_) { }
  }, [matterId]);

  useEffect(() => {
    fetchIntelligence();
    fetchNotes();
  }, [fetchIntelligence, fetchNotes]);

  // ---------- Timer ----------
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timerActive) {
      interval = setInterval(() => setTimeInSeconds(s => s + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timerActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatCycleTime = (ms: number) => {
    if (ms === 0) return 'No docs yet';
    const hours = Math.round(ms / 3600000);
    if (hours < 24) return `${hours}h avg`;
    return `${Math.round(hours / 24)}d avg`;
  };

  // Velocity bar: lower cycle time = better. Clamp 0-100%.
  const velocityPct = docCycleMs === 0
    ? 100
    : Math.max(0, Math.min(100, 100 - (docCycleMs / (7 * 24 * 3600 * 1000)) * 100));

  // ---------- Actions ----------
  const handleAiNarrate = async () => {
    if (!rawTimeNotes) return;
    setIsAiOptimizing(true);
    try {
      const optimized = await gemini.generateBillingDescription(rawTimeNotes);
      setRawTimeNotes(optimized);
    } catch (e) { console.error(e); }
    finally { setIsAiOptimizing(false); }
  };

  const handleSaveEntry = async () => {
    if (!matterId || (timeInSeconds < 5 && !rawTimeNotes)) return;
    setIsSavingEntry(true);
    try {
      const entry = await gemini.addTimeEntry(matterId, {
        description: rawTimeNotes || 'Legal services rendered.',
        durationMinutes: Math.max(1, Math.ceil(timeInSeconds / 60)),
        startTime: new Date().toISOString() as any,
        isBillable: true
      });
      setTimeEntries(prev => [{ ...entry, user: entry.user }, ...prev]);
      setTotalHours(prev => prev + (entry.durationMinutes / 60));
      setTimeInSeconds(0);
      setTimerActive(false);
      setRawTimeNotes('');
    } catch (e) {
      console.error('Time entry save failed', e);
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleSendNote = async () => {
    const text = noteInput.trim();
    if (!text || !matterId) return;
    setIsSendingNote(true);
    try {
      const note = await gemini.addMatterNote(matterId, text);
      setNotes(prev => [note, ...prev]);
      setNoteInput('');
    } catch (e) {
      console.error('Note send failed', e);
    } finally {
      setIsSendingNote(false);
    }
  };

  const handleGenerateBrief = async () => {
    setIsBriefing(true);
    try {
      const result = await gemini.generateExecutiveBriefing(matterId, documents);
      setBriefingText(result);
    } catch (e) {
      setBriefingText('Sovereign Briefing Enclave: Synthesis Timeout.');
    } finally {
      setIsBriefing(false);
    }
  };

  const handleSelfAssign = async () => {
    if (!matterId) return;
    setIsAssigning(true);
    try {
      const updatedMatter = await gemini.assignMatter(matterId);
      setInternalCounselId(updatedMatter.internalCounselId);
      // Refresh intelligence to update team list and metrics
      await fetchIntelligence();
    } catch (e: any) {
      console.error('Self-assignment failed', e);
      alert('Failed to claim matter: ' + (e.message || 'Unknown error'));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!matterId || !selectedUserId) return;
    setIsAddingMember(true);
    try {
      await gemini.addMatterTeamMember(matterId, selectedUserId);
      setSelectedUserId('');
      await fetchIntelligence();
    } catch (e: any) {
      console.error('Failed to add team member', e);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!matterId) return;
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await gemini.removeMatterTeamMember(matterId, userId);
      await fetchIntelligence();
    } catch (e: any) {
      console.error('Failed to remove team member', e);
    }
  };

  const handleSubmitToSilo = async () => {
    setIsSubmittingSilo(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      setTimeout(() => onBack(), 1500);
    } finally {
      setIsSubmittingSilo(false);
    }
  };

  const relativeTime = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Combine and sort activities
  const activities = [
    ...timeEntries.map(t => ({
      id: t.id,
      type: 'TIME' as const,
      title: t.user?.name || t.lawyerName || 'Counsel',
      description: t.description,
      timestamp: t.startTime || new Date().toISOString(), // Use startTime or fallback
      duration: `${t.durationMinutes}m`,
      status: t.status
    })),
    ...documents.filter(d => d.matterId === matterId).map(d => ({
      id: d.id,
      type: 'DOCUMENT' as const,
      title: d.name,
      description: `Sovereign Artifact • ${d.classification}`,
      timestamp: d.uploadedAt || new Date().toISOString(),
      duration: d.size || 'Unknown Size',
      status: d.status || 'COMMITTED'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // ---------- Render ----------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCw size={32} className="animate-spin text-brand-primary" />
        <p className="text-brand-muted text-sm font-mono">Loading live vault signals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle size={32} className="text-red-500" />
        <p className="text-brand-muted text-sm">{error}</p>
        <button onClick={fetchIntelligence} className="text-xs text-brand-primary underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            title="Go Back"
            className="p-2 hover:bg-brand-sidebar rounded-lg text-brand-muted transition-colors"
          >
            <History size={20} className="rotate-180" />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-brand-text tracking-tight">
              {matterName || matterId}
            </h3>
            <p className="text-brand-muted text-sm">
              Client: <span className="text-brand-primary font-semibold">{matterClient}</span>
              {matterDept && <> · <span className="text-brand-secondary">{matterDept}</span></>}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMarketplace(true)}
            className="bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-brand-primary/10"
          >
            <Edit3 size={14} />
            Drafting Studio
          </button>
          <button
            onClick={handleGenerateBrief}
            disabled={isBriefing}
            className="bg-brand-secondary/10 hover:bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-brand-secondary/10"
          >
            {isBriefing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Autonomous Briefing
          </button>
          <button
            onClick={handleSubmitToSilo}
            disabled={isSubmittingSilo || isSubmitted}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${isSubmitted
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
              : 'bg-brand-primary hover:opacity-90 text-brand-bg shadow-brand-primary/20'
              }`}
          >
            {isSubmittingSilo ? <RefreshCw size={16} className="animate-spin" /> : isSubmitted ? <ShieldCheck size={16} /> : <FileSignature size={16} />}
            {isSubmittingSilo ? 'Submitting…' : isSubmitted ? 'Silo Secured' : 'Submit to Silo'}
          </button>
        </div>
      </div>

      <DocumentTemplateMarketplace
          isOpen={showMarketplace}
          onClose={() => setShowMarketplace(false)}
          onSelect={(id) => {
              setSelectedTemplateId(id);
              setShowMarketplace(false);
          }}
      />

      {selectedTemplateId && (
          <DraftingStudio
              templateId={selectedTemplateId}
              matterId={matterId}
              onClose={() => setSelectedTemplateId(null)}
              onSave={(name, content) => {
                  if (onCreateDocument) {
                      onCreateDocument({
                          id: `DOC-GEN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                          name,
                          type: 'Draft',
                          size: `${(new Blob([content]).size / 1024).toFixed(1)} KB`,
                          uploadedBy: 'Sovereign AI',
                          uploadedAt: new Date().toLocaleString(),
                          region: Region.PRIMARY,
                          matterId: matterId,
                          privilege: PrivilegeStatus.PRIVILEGED,
                          classification: 'Confidential',
                          encryption: 'DAS',
                          content: content
                      });
                  }
                  setSelectedTemplateId(null);
              }}
          />
      )}

      {/* Executive Briefing */}
      {briefingText && (
        <div className="bg-brand-sidebar border border-brand-secondary/30 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles size={150} />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-secondary/10 rounded-xl border border-brand-secondary/20 text-brand-secondary">
                <Activity size={20} />
              </div>
              <h4 className="text-sm font-bold text-brand-text uppercase tracking-widest">Sovereign Executive Briefing</h4>
            </div>
            <button onClick={() => setBriefingText(null)} className="text-brand-muted hover:text-brand-text transition-colors text-xs">✕</button>
          </div>
          <div className="prose prose-invert max-w-none text-brand-text/90 leading-relaxed text-sm whitespace-pre-wrap">{briefingText}</div>
          <div className="mt-8 pt-6 border-t border-brand-border flex items-center gap-4">
            <span className="text-[10px] font-mono text-brand-secondary font-bold uppercase">Produced via Gemini Thinking Engine</span>
            <div className="h-4 w-[1px] bg-brand-border" />
            <span className="text-[10px] text-brand-muted italic">Redacted artifacts used as context.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Legal Team + Matter Velocity */}
        <div className="lg:col-span-3 space-y-8">
          {/* Legal Team */}
          <div className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl space-y-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
                <UserPlus size={16} className="text-brand-secondary" /> Legal Team
              </h4>
              <span className="text-[10px] font-mono text-brand-muted">{team.length} member{team.length !== 1 ? 's' : ''}</span>
            </div>

            {team.length === 0 && !internalCounselId ? (
              <div className="flex flex-col items-center py-8 gap-4 text-brand-muted text-center">
                <Users size={24} className="opacity-40" />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-tight">Matter Unassigned</p>
                  <p className="text-[9px] italic opacity-60">High Priority Candidate for Enclave Inception</p>
                </div>
                <button
                  onClick={handleSelfAssign}
                  disabled={isAssigning}
                  className="w-full bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-2"
                >
                  {isAssigning ? <RefreshCw size={12} className="animate-spin" /> : <UserPlus size={12} />}
                  Claim Matter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {team.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-brand-bg/30 rounded-2xl border border-brand-border/50 hover:border-brand-secondary/30 transition-all">
                    <div className="w-8 h-8 rounded-full bg-brand-sidebar flex items-center justify-center text-[11px] font-bold text-brand-text border border-brand-border">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-brand-text truncate">{member.name}</p>
                        {member.isOnLeave && (
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-bold uppercase rounded border border-red-500/20">
                            OOO
                          </span>
                        )}
                        {member.id === internalCounselId && (
                          <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] font-bold uppercase rounded border border-brand-primary/20">
                            Lead
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-secondary uppercase tracking-tighter">{(member.roleString||'').replace(/_/g, ' ')}</p>
                    </div>
                    {member.id !== internalCounselId && (
                      <button title="Remove Member" onClick={() => handleRemoveTeamMember(member.id)} className="text-brand-muted hover:text-red-400 p-1 transition-colors">
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Member Dropdown */}
                <div className="mt-4 pt-4 border-t border-brand-border space-y-2">
                  <div className="flex gap-2">
                    <select
                      title="Select new user to add"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="flex-1 bg-brand-bg border border-brand-border rounded-xl text-xs px-2 py-1.5 text-brand-text outline-none focus:border-brand-primary"
                    >
                      <option value="">Select new member...</option>
                      {availableUsers.filter(u => !team.some(t => t.id === u.id)).map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.roleString})</option>
                      ))}
                    </select>
                    <button
                      title="Add Team Member"
                      onClick={handleAddTeamMember}
                      disabled={!selectedUserId || isAddingMember}
                      className="bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isAddingMember ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                    </button>
                  </div>
                </div>

                {!internalCounselId && (
                  <button
                    onClick={handleSelfAssign}
                    disabled={isAssigning}
                    className="w-full mt-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary px-4 py-2 rounded-xl font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-2"
                  >
                    {isAssigning ? <RefreshCw size={12} className="animate-spin" /> : <UserPlus size={12} />}
                    Self-Assign as Lead
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Matter Velocity */}
          <div className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl space-y-6 shadow-xl backdrop-blur-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
              <Clock size={16} /> Matter Velocity
            </h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-muted">Doc Cycle Time</span>
                  <span className={`font-bold ${velocityPct > 65 ? 'text-brand-primary' : velocityPct > 35 ? 'text-amber-400' : 'text-red-400'}`}>
                    {formatCycleTime(docCycleMs)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${velocityPct > 65 ? 'bg-brand-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]' : velocityPct > 35 ? 'bg-amber-400' : 'bg-red-500'}`}
                    style={{ width: `${velocityPct}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">Total Hours Logged</span>
                <span className="font-bold text-brand-text">{totalHours.toFixed(1)}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column — Time Tracker + Activity Ledger */}
        <div className="lg:col-span-6 space-y-8">
          {/* Sovereign Time Tracker */}
          <div className="bg-brand-sidebar border border-brand-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
                  <Zap size={16} className="text-brand-primary" /> Sovereign Time Tracker
                </h4>
                <p className="text-[10px] text-brand-muted/70 font-mono">FORENSIC RECORDING ACTIVE</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-mono font-bold text-brand-text tracking-tighter">
                  {formatTime(timeInSeconds)}
                </div>
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`p-4 rounded-2xl transition-all shadow-lg ${timerActive
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'bg-brand-primary text-brand-bg shadow-brand-primary/20'
                    }`}
                >
                  {timerActive ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={rawTimeNotes}
                onChange={(e) => setRawTimeNotes(e.target.value)}
                placeholder="Briefly describe legal activities for AI narrative synthesis…"
                className="w-full bg-brand-bg border border-brand-border rounded-3xl p-6 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all h-32 resize-none placeholder:text-brand-muted/40"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleAiNarrate}
                  disabled={!rawTimeNotes || isAiOptimizing}
                  className="px-4 py-2 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/20 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2 disabled:opacity-40"
                >
                  {isAiOptimizing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  AI Narrate
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={isSavingEntry || (timeInSeconds < 5 && !rawTimeNotes)}
                  className="bg-brand-primary hover:opacity-90 disabled:opacity-40 text-brand-bg px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-brand-primary/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSavingEntry ? <RefreshCw size={16} className="animate-spin" /> : null}
                  {isSavingEntry ? 'Saving…' : 'Commit to Ledger'}
                </button>
              </div>
            </div>
          </div>

          {/* Matter Activity Ledger */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Matter Activity Ledger</h4>
              <span className="text-[10px] text-brand-muted/70 font-mono">{totalHours.toFixed(1)} Total Hours</span>
            </div>

            {activities.length === 0 ? (
              <div className="bg-brand-sidebar border border-dashed border-brand-border p-8 rounded-3xl flex flex-col items-center gap-3 text-brand-muted">
                <Activity size={24} className="opacity-30" />
                <p className="text-xs">No activity logged yet. Commencing ledger tracking...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(activity => (
                  <div
                    key={activity.id}
                    onDoubleClick={() => activity.type === 'DOCUMENT' && onDocumentDoubleClick?.(activity.id)}
                    className={`bg-brand-sidebar border border-brand-border p-5 rounded-3xl transition-all flex items-start gap-4 group cursor-default ${activity.type === 'DOCUMENT' ? 'hover:border-brand-secondary/40 cursor-pointer active:scale-[0.99]' : 'hover:border-brand-primary/30'}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl bg-brand-bg flex items-center justify-center shrink-0 border border-brand-border ${activity.type === 'DOCUMENT' ? 'text-brand-secondary' : 'text-brand-primary'}`}>
                      {activity.type === 'DOCUMENT' ? <FileSignature size={20} /> : <History size={20} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-text">
                          {activity.title}
                        </span>
                        <span className="text-[10px] font-mono text-brand-muted">{activity.duration}</span>
                      </div>
                      <p className="text-[11px] text-brand-muted leading-relaxed italic">"{activity.description}"</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${activity.status === 'Approved' || activity.status === 'COMMITTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {activity.status}
                        </span>
                        <span className="text-[9px] text-brand-muted/50 font-mono">{relativeTime(activity.timestamp)}</span>
                      </div>
                    </div>
                    {activity.type === 'DOCUMENT' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onDocumentDoubleClick) {
                              onDocumentDoubleClick(activity.id);
                            }
                          }}
                          className="text-[8px] font-bold text-brand-secondary uppercase tracking-widest bg-brand-secondary/20 hover:bg-brand-secondary/30 px-3 py-1.5 rounded-lg border border-brand-secondary/40 transition-all active:scale-95 cursor-pointer z-10"
                          title="Open in Legal Drafting Studio"
                        >
                          Edit Artifact
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Collaboration Hub */}
        <div className="lg:col-span-3">
          <div className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl space-y-6 shadow-xl backdrop-blur-sm h-full flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-secondary" /> Collaboration
            </h4>

            <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2 text-brand-muted">
                  <MessageSquare size={22} className="opacity-30" />
                  <p className="text-[11px] text-center">No collaboration notes yet. Post the first signal.</p>
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="p-3 bg-slate-800/30 border border-slate-800 rounded-2xl space-y-1 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-200">{note.author.name}</span>
                      <span className="text-[8px] text-slate-600">{relativeTime(note.createdAt)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">"{note.text}"</p>
                  </div>
                ))
              )}
            </div>

            <div className="relative">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendNote(); } }}
                placeholder="Matter update…"
                className="w-full bg-brand-bg border border-brand-border rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-all resize-none h-20 placeholder:text-brand-muted/40 text-brand-text pr-10"
              />
              <button
                title="Send Note"
                onClick={handleSendNote}
                disabled={isSendingNote || !noteInput.trim()}
                className="absolute bottom-3 right-3 p-1.5 bg-brand-secondary hover:opacity-90 disabled:opacity-40 rounded-lg text-brand-bg transition-all shadow-lg active:scale-95"
              >
                {isSendingNote ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatterIntelligence;
