
import React, { useState, useEffect } from 'react';
import { AppMode, TimeEntry, LegalProfessional, DocumentMetadata } from '../types';
import {
  FileText,
  Clock,
  AlertCircle,
  TrendingUp,
  History,
  User,
  ChevronRight,
  CheckCircle2,
  Activity,
  MessageSquare,
  PlusCircle,
  Send,
  MoreVertical,
  UserPlus,
  Play,
  Pause,
  Save,
  ShieldCheck,
  Zap,
  Trash2,
  RefreshCw,
  Sparkles,
  FileSignature
} from 'lucide-react';
import { LexGeminiService } from '../services/geminiService';

interface MatterIntelligenceProps {
  mode: AppMode;
  onBack: () => void;
  documents: DocumentMetadata[];
}

const MatterIntelligence: React.FC<MatterIntelligenceProps> = ({ mode, onBack, documents }) => {
  const gemini = new LexGeminiService();
  const isFirm = mode === AppMode.LAW_FIRM;

  // State for Executive Briefing
  const [isBriefing, setIsBriefing] = useState(false);
  const [briefingText, setBriefingText] = useState<string | null>(null);

  // State for Submission
  const [isSubmittingSilo, setIsSubmittingSilo] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State for Collaboration
  const [noteInput, setNoteInput] = useState('');

  // State for Legal Team
  const [team] = useState<LegalProfessional[]>([
    { id: 'u1', name: 'Senior Partner', role: 'Lead Counsel' },
    { id: 'u2', name: 'Associate Counsel', role: 'Associate' },
    { id: 'u4', name: 'Legal Counsel', role: 'Internal Counsel' }
  ]);

  // State for Time Recording
  const [timerActive, setTimerActive] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const [rawTimeNotes, setRawTimeNotes] = useState('');
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: 'te-1',
      matterId: 'MAT-ORG-001',
      lawyerId: 'u1',
      lawyerName: 'Senior Partner',
      activityType: 'Research',
      startTime: '2024-05-20T09:00:00Z',
      durationMinutes: 45,
      description: 'Systemic review of jurisdictional regulatory requirements.',
      isBillable: true,
      status: 'Approved'
    }
  ]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeInSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const handleGenerateBrief = async () => {
    setIsBriefing(true);
    try {
      const result = await gemini.generateExecutiveBriefing('SOV-MAT-001', documents);
      setBriefingText(result);
    } catch (e) {
      setBriefingText("Sovereign Briefing Enclave: Synthesis Timeout.");
    } finally {
      setIsBriefing(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptimiseEntry = async () => {
    if (!rawTimeNotes) return;
    setIsAiOptimizing(true);
    try {
      const optimized = await gemini.generateBillingDescription(rawTimeNotes);
      setRawTimeNotes(optimized);
      const validation = await gemini.validateTimeEntry({ description: optimized });
      if (!validation.isSafe) {
        console.warn(`AI Warning: ${validation.feedback}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  const handleSaveEntry = () => {
    const newEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      matterId: 'MAT-ORG-001',
      lawyerId: 'u1',
      lawyerName: 'Senior Partner',
      activityType: 'Drafting',
      startTime: new Date().toISOString(),
      durationMinutes: Math.ceil(timeInSeconds / 60),
      description: rawTimeNotes || "Legal services rendered.",
      isBillable: true,
      status: 'Draft'
    };
    setTimeEntries([newEntry, ...timeEntries]);
    setTimeInSeconds(0);
    setTimerActive(false);
    setRawTimeNotes('');
  };

  const handleSubmitToSilo = async () => {
    setIsSubmittingSilo(true);
    try {
      // Simulate Sovereign Silo Handshake
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      // Optional: Auto-back or show success
      setTimeout(() => onBack(), 1500);
    } catch (e) {
      console.error("Silo submission failed", e);
    } finally {
      setIsSubmittingSilo(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header Section */}
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
            <h3 className="text-2xl font-bold text-brand-text tracking-tight">SOV-MAT-001: Systemic Asset Review</h3>
            <p className="text-brand-muted text-sm">Managing Entity: <span className="text-brand-primary font-semibold uppercase">Jurisdictional Silo</span></p>
          </div>
        </div>
        <div className="flex gap-3">
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
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${isSubmitted ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-brand-primary hover:opacity-90 text-brand-bg shadow-brand-primary/20'
              }`}
          >
            {isSubmittingSilo ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : isSubmitted ? (
              <ShieldCheck size={16} />
            ) : (
              <FileSignature size={16} />
            )}
            {isSubmittingSilo ? 'Submitting...' : isSubmitted ? 'Silo Secured' : 'Submit to Silo'}
          </button>
        </div>
      </div>

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
            <button
              title="Dismiss Briefing"
              onClick={() => setBriefingText(null)}
              className="text-brand-muted hover:text-brand-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="prose prose-invert max-w-none text-brand-text/90 leading-relaxed text-sm whitespace-pre-wrap">
            {briefingText}
          </div>
          <div className="mt-8 pt-6 border-t border-brand-border flex items-center gap-4">
            <span className="text-[10px] font-mono text-brand-secondary font-bold uppercase">PRODUCED VIA GEMINI-3-PRO THINKING ENGINE</span>
            <div className="h-4 w-[1px] bg-brand-border"></div>
            <span className="text-[10px] text-brand-muted italic">Redacted artifacts used as context.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Team & Stats) */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl space-y-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
                <UserPlus size={16} className="text-brand-secondary" /> Legal Team
              </h4>
              <button title="Add Team Member" className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-muted">
                <PlusCircle size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {team.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-brand-bg/30 rounded-2xl border border-brand-border/50 hover:border-brand-secondary/30 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-brand-sidebar flex items-center justify-center text-[11px] font-bold text-brand-text border border-brand-border">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-brand-text truncate">{member.name}</p>
                    <p className="text-[10px] text-brand-muted uppercase tracking-tighter">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl space-y-6 shadow-xl backdrop-blur-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
              <Clock size={16} /> Matter Velocity
            </h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-brand-muted">Doc Cycle Time</span>
                  <span className="text-brand-primary font-bold">Optimal</span>
                </div>
                <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary w-[65%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column (AI Intel & Timeline) */}
        <div className="lg:col-span-6 space-y-8">
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
                  className={`p-4 rounded-2xl transition-all shadow-lg ${timerActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-primary text-brand-bg shadow-brand-primary/20'
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
                placeholder="Briefly describe legal activities for AI narrative synthesis..."
                className="w-full bg-brand-bg border border-brand-border rounded-3xl p-6 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all h-32 resize-none placeholder:text-brand-muted/40"
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handleOptimiseEntry}
                    disabled={!rawTimeNotes || isAiOptimizing}
                    className="px-4 py-2 bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/20 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2"
                  >
                    {isAiOptimizing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    AI Narrate
                  </button>
                </div>
                <button
                  onClick={handleSaveEntry}
                  disabled={timeInSeconds < 5 && !rawTimeNotes}
                  className="bg-brand-primary hover:opacity-90 disabled:bg-brand-bg text-brand-bg px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-brand-primary/30 transition-all active:scale-95"
                >
                  Commit to Ledger
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Matter Activity Ledger</h4>
              <span className="text-[10px] text-brand-muted/70 font-mono">14.5 Total Hours</span>
            </div>
            <div className="space-y-3">
              {timeEntries.map(entry => (
                <div key={entry.id} className="bg-brand-sidebar border border-brand-border p-5 rounded-3xl hover:border-brand-primary/30 transition-all flex items-start gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-2xl bg-brand-bg flex items-center justify-center text-brand-primary shrink-0 border border-brand-border">
                    <History size={20} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-text">{entry.lawyerName}</span>
                      <span className="text-[10px] font-mono text-brand-muted">{entry.durationMinutes}m</span>
                    </div>
                    <p className="text-[11px] text-brand-muted leading-relaxed italic">"{entry.description}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Collaboration Hub) */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-brand-sidebar border border-brand-border p-6 rounded-3xl space-y-6 shadow-xl backdrop-blur-sm transition-all duration-500">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-secondary" /> Collaboration
            </h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
              <Note author="Associate Counsel" time="15m ago" text="Regulatory risk identified in active clause set." />
              <Note author="Senior Partner" time="1h ago" text="Verified. Adjust duration to match jurisdictional guidelines." />
            </div>
            <div className="relative">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Matter update..."
                className="w-full bg-brand-bg border border-brand-border rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-secondary transition-all resize-none h-20 placeholder:text-brand-muted/40 text-brand-text"
              />
              <button title="Send Message" className="absolute bottom-3 right-3 p-1.5 bg-brand-secondary hover:opacity-90 rounded-lg text-brand-bg transition-all shadow-lg active:scale-95">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NoteProps {
  author: string;
  time: string;
  text: string;
}

const Note: React.FC<NoteProps> = ({ author, time, text }) => (
  <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-2xl space-y-1 hover:border-slate-700 transition-colors">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-200">{author}</span>
      <span className="text-[8px] text-slate-600">{time}</span>
    </div>
    <p className="text-[10px] text-slate-400 leading-tight">"{text}"</p>
  </div>
);

interface XProps {
  size: number;
  className?: string;
}

const X: React.FC<XProps> = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

export default MatterIntelligence;
