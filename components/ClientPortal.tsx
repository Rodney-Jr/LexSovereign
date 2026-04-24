import React, { useState } from 'react';
import {
   ShieldCheck,
   Lock,
   EyeOff,
   Clock,
   FileCheck,
   ChevronRight,
   Fingerprint,
   Activity,
   Search,
   Database,
   Globe,
   LogOut,
   Download,
   CheckCircle,
   Receipt,
   CheckCircle2,
   Eye,
   MessageSquare,
   Send,
   History,
   Plus,
   X,
   Paperclip,
   File
} from 'lucide-react';

import { useSovereignData } from '../hooks/useSovereignData';
import { usePermissions } from '../hooks/usePermissions';
import MatterJourney from './MatterJourney';
import ClientInvoicesRecord from './ClientInvoicesRecord';
import DocumentPreviewModal from './DocumentPreviewModal';
import { ClientTrustLedger } from './ClientTrustLedger';
import { getSavedSession } from '../utils/api';
import { LexGeminiService } from '../services/geminiService';
import { useSovereign } from '../contexts/SovereignContext';
import { useMatterStream } from '../hooks/useMatterStream';

const gemini = new LexGeminiService();

const ClientPortal: React.FC<{ userName: string; onLogout?: () => void }> = ({ userName, onLogout }) => {
   const { matters, documents, isLoaded } = useSovereignData(true);
   const { checkVisibility } = usePermissions();
   const { session } = useSovereign();
   const [docFilter, setDocFilter] = useState<'all' | 'drafts' | 'final'>('all');
   const [activeTab, setActiveTab] = useState<'overview' | 'billing'>('overview');
   const [localDocs, setLocalDocs] = useState<any[]>([]);
   const [previewDocId, setPreviewDocId] = useState<string | null>(null);
   const [notes, setNotes] = useState<any[]>([]);
   const [noteInput, setNoteInput] = useState('');
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [isSendingNote, setIsSendingNote] = useState(false);
   const [unreadCount, setUnreadCount] = useState(0);
   const fileInputRef = React.useRef<HTMLInputElement>(null);

   React.useEffect(() => {
      setLocalDocs(documents);
   }, [documents]);

   // Filter matters visible to this client, excluding mock/constants IDs
   const clientMatters = matters
      .filter(m => checkVisibility(m))
      .filter(m => !/^(MAT-|MT-)/.test(m.id)); // Exclude hardcoded mock IDs
   const latestMatter = isLoaded ? clientMatters[0] : undefined;

   // Initial load of notes history on matter change
   React.useEffect(() => {
      const fetchNotes = async () => {
         if (!latestMatter?.id) return;
         // Guard: skip hardcoded mock matter IDs (e.g. 'MAT-GEN-001', 'MT-GENERAL')
         const isMockId = /^(MAT-|MT-)/.test(latestMatter.id);
         if (isMockId) return;
         try {
            const newNotes = await gemini.getMatterNotes(latestMatter.id);
            setNotes(newNotes);
            const session = getSavedSession();
            const unread = newNotes.filter(n => !n.isRead && n.authorId !== session?.user?.id).length;
            setUnreadCount(unread);
         } catch (err) {
            console.error(err);
         }
      };
      fetchNotes();
   }, [latestMatter?.id]);

   // Live SSE — append incoming messages instantly (no polling)
   useMatterStream(latestMatter?.id, (incomingNote) => {
      setNotes(prev => {
         // Avoid duplicate if we already have this note (from optimistic update)
         if (prev.some(n => n.id === incomingNote.id)) return prev;
         setUnreadCount(c => c + 1);
         return [incomingNote, ...prev];
      });
   });

   // Filter documents for the latest matter
   const matterDocs = localDocs.filter(d => d.matterId === latestMatter?.id);
   const filteredDocs = matterDocs.filter(d => {
      if (docFilter === 'drafts') return d.status?.includes('DRAFT') || d.classification === 'Internal';
      if (docFilter === 'final') return d.status === 'APPROVED' || d.classification === 'Public';
      return true;
   });

   const handleDownload = async (id: string, name: string, ext: string = 'pdf') => {
      try {
         const session = getSavedSession();
         const url = `/api/export/${id}/export`;

         const r = await fetch(url, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${session?.token || ''}`
            },
            body: JSON.stringify({ format: ext.toUpperCase() })
         });

         if (!r.ok) throw new Error("Download failed");

         const blob = await r.blob();
         const dUrl = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = dUrl;
         a.download = `${name}.${ext}`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         window.URL.revokeObjectURL(dUrl);
      } catch (err) {
         console.error(err);
         alert("Failed to securely export document.");
      }
   };

   const handleApprove = async (id: string) => {
      try {
         const session = getSavedSession();
         const r = await fetch(`/api/documents/${id}/status`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${session?.token || ''}`
            },
            body: JSON.stringify({ status: 'APPROVED' })
         });
         if (!r.ok) throw new Error();

         // Optimistic UI update
         setLocalDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'APPROVED' } : d));
      } catch (e) {
         console.error("Failed to approve", e);
         alert("Could not process approval.");
      }
   };

   const handleSendNote = async () => {
      const text = noteInput.trim();
      if (!text && !selectedFile) return;
      if (!latestMatter) return;
      setIsSendingNote(true);
      try {
         const note = await gemini.addMatterNote(latestMatter.id, text, selectedFile || undefined);
         setNotes(prev => [note, ...prev]);
         setNoteInput('');
         setSelectedFile(null);
         setUnreadCount(0); // Sending a message implies you've seen the others
      } catch (e) {
         console.error('Note send failed', e);
         alert("Failed to send message.");
      } finally {
         setIsSendingNote(false);
      }
   };

   const relativeTime = (isoDate: string) => {
      const diff = Date.now() - new Date(isoDate).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}M AGO`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}H AGO`;
      return `${Math.floor(hrs / 24)}D AGO`;
   };

   const getProgress = (matter: any) => {
      if (matter.status === 'CLOSED') return 100;
      if (matter.status === 'REVIEW') return 80;
      const attr = (matter.attributes as any) || {};
      return attr.progress || 45;
   };

   return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 px-6 lg:px-0">
         {/* Enclave Loading State */}
         {!isLoaded && (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
               <div className="p-6 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                  <ShieldCheck className="text-emerald-500 animate-pulse" size={56} />
               </div>
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Synchronizing Sovereign Enclave</p>
                  <p className="text-slate-500 text-sm">Establishing secure channel to your matter vault...</p>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" />
               </div>
            </div>
         )}
         {isLoaded && (
         <>
         {/* Hero Header */}
         <div className="flex flex-col lg:flex-row items-center gap-8 pt-10">
            <div className="relative">
               <div className="p-6 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 animate-pulse-slow">
                  <ShieldCheck className="text-emerald-500" size={56} />
               </div>
               <div className="absolute -bottom-2 -right-2 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
                  <Fingerprint className="text-emerald-400" size={20} />
               </div>
            </div>
            <div className="text-center lg:text-left space-y-2">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 animate-in fade-in slide-in-from-left-4 duration-1000">
                  Partnering with {session?.tenantName || 'LexSovereign Enclave'}
               </p>
               <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                  <span className="text-slate-500">Welcome,</span> {userName}
               </h2>
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                     <Database size={14} className="text-blue-400" /> Regional Silo: <span className="text-blue-300 font-mono">GH_ACC_1</span>
                  </p>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800 hidden lg:block" />
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                     <Globe size={14} className="text-emerald-400" /> Sovereignty Mode: <span className="text-emerald-300 font-bold">TOTAL_ISOLATION</span>
                  </p>
               </div>
            </div>

            <div className="flex-1" />

            <button
               onClick={onLogout}
               className="flex items-center gap-3 px-6 py-3 bg-slate-900/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-2xl border border-slate-800 hover:border-red-500/30 transition-all group shadow-xl"
            >
               <div className="p-2 bg-slate-800 group-hover:bg-red-500/20 rounded-xl transition-colors">
                  <LogOut size={16} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
            </button>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-4 border-b border-slate-800 pb-2 px-2">
            <button
               onClick={() => setActiveTab('overview')}
               className={`pb-2 px-4 transition-all uppercase tracking-widest font-bold text-xs border-b-2 ${activeTab === 'overview' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
            >
               Matter Overview
            </button>
            <button
               onClick={() => setActiveTab('billing')}
               className={`pb-2 px-4 transition-all uppercase tracking-widest font-bold text-xs border-b-2 ${activeTab === 'billing' ? 'text-amber-400 border-amber-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
            >
               Billing & Invoices
            </button>
         </div>

         {activeTab === 'overview' && (
            <div className="space-y-10">
               {/* Top Section: Matter Journey & Overview (Full Width) */}
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-t-blue-500/20 border-t-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                     <div className="space-y-2">
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                           <Activity size={16} className="text-blue-400" /> Active Mandate Journey
                        </h4>
                        {latestMatter && (
                           <div>
                              <p className="text-2xl font-bold text-white tracking-tight">{latestMatter.name}</p>
                              <div className="flex items-center gap-4 mt-1">
                                 <p className="text-[10px] text-slate-500 font-mono opacity-60">SRN-V3-{latestMatter.id}</p>
                                 <div className="w-1 h-1 rounded-full bg-slate-700" />
                                 <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{latestMatter.type}</span>
                              </div>
                           </div>
                        )}
                     </div>
                     {latestMatter && (
                        <div className="flex items-center gap-4">
                           <div className="text-right hidden md:block">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Status</p>
                              <p className="text-xs font-bold text-white uppercase tracking-tighter">{latestMatter.status}</p>
                           </div>
                           <div className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/10">
                              {latestMatter.status}
                           </div>
                        </div>
                     )}
                  </div>

                  {latestMatter ? (
                     <div className="py-2">
                        <MatterJourney currentStatus={latestMatter.status} />
                     </div>
                  ) : (
                     <div className="text-center py-12 opacity-40">
                        <Clock className="mx-auto text-slate-600 mb-4" size={48} />
                        <p className="text-slate-400 text-sm italic">Synchronizing Active Mandates...</p>
                     </div>
                  )}
               </div>

               {/* Bottom Section: Repository and Collaboration Side-by-Side */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                  {/* Left Plane: Shared Access Repository */}
                  <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl h-full min-h-[600px]">
                     <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900/50 backdrop-blur-xl">
                        <div className="space-y-1">
                           <h4 className="text-lg font-bold text-white flex items-center gap-3">
                              <FileCheck className="text-blue-400" /> Shared Access Repository
                           </h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verified Work Product Scoped to Ghana Enclave</p>
                        </div>
                        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                           {['all', 'drafts', 'final'].map((filter) => (
                              <button
                                 key={filter}
                                 onClick={() => setDocFilter(filter as any)}
                                 className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${docFilter === filter
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                                 title={`Show ${filter}`}
                              >
                                 {filter}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="p-6 space-y-4 max-h-[700px] overflow-y-auto scrollbar-hide">
                        {filteredDocs.length > 0 ? (
                           filteredDocs.map(doc => (
                              <div key={doc.id} onClick={() => setPreviewDocId(doc.id)} className="p-5 bg-slate-800/20 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 hover:bg-slate-800/30 transition-all cursor-pointer">
                                 <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                                       <FileCheck className="text-slate-500 group-hover:text-blue-400" size={20} />
                                    </div>
                                    <div className="space-y-1">
                                       <p className="font-bold text-white tracking-tight">{doc.name}</p>
                                       <div className="flex items-center gap-3">
                                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                                             {new Date(doc.uploadedAt || '').toLocaleDateString()}
                                          </span>
                                          <div className="w-1 h-1 rounded-full bg-slate-700" />
                                          <span className={`text-[9px] font-bold uppercase tracking-widest ${doc.status === 'APPROVED' ? 'text-emerald-400' : doc.status?.includes('DRAFT') ? 'text-amber-400' : 'text-blue-500'}`}>
                                             {doc.status || doc.classification}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-[9px] font-bold text-slate-500">
                                       <ShieldCheck size={12} className="text-emerald-500" /> HSM-PROTECTED
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <button
                                          onClick={(e) => { e.stopPropagation(); setPreviewDocId(doc.id); }}
                                          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-xl transition-all"
                                          title="View Secure Artifact"
                                       >
                                          <Eye size={16} />
                                       </button>
                                       {doc.status !== 'APPROVED' && (doc.status?.includes('DRAFT') || doc.status === 'REVIEW') && (
                                          <button
                                             onClick={(e) => { e.stopPropagation(); handleApprove(doc.id); }}
                                             className="p-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                                             title="Approve Document"
                                          >
                                             <CheckCircle2 size={16} />
                                          </button>
                                       )}
                                       <button
                                          onClick={(e) => { e.stopPropagation(); handleDownload(doc.id, doc.name); }}
                                          className="p-2 bg-slate-800 hover:bg-blue-500 hover:text-white border border-slate-700 text-slate-400 rounded-xl transition-all"
                                          title="Download PDF"
                                       >
                                          <Download size={16} />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-20 opacity-30">
                              <Search className="mx-auto text-slate-600 mb-4" size={48} />
                              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No matching records found in vault.</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Right Plane: Collaboration Hub */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden group h-full">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h4 className="text-lg font-bold text-white flex items-center gap-3">
                              <MessageSquare className="text-blue-400" /> Collaboration Hub
                           </h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Encrypted Signal Channel</p>
                        </div>
                        <div className="flex items-center gap-3">
                           {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full animate-bounce shadow-lg shadow-red-500/20">
                                 {unreadCount} NEW
                              </span>
                           )}
                           <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400 rounded-lg">{notes.length} Signals</span>
                        </div>
                     </div>

                     <div className="space-y-4 h-[400px] overflow-y-auto scrollbar-hide pr-2 flex flex-col-reverse">
                        {notes.length === 0 ? (
                           <div className="py-20 text-center opacity-30">
                              <p className="text-[10px] uppercase tracking-widest font-bold">No active signals in this enclave.</p>
                           </div>
                        ) : (
                           notes.map(note => {
                              const isClient = note.author?.role === 'CLIENT';
                              return (
                                 <div key={note.id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'} gap-1 mb-2`}>
                                    <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${isClient ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'}`}>
                                       <div className="flex items-center justify-between gap-4 mb-2">
                                          <span className={`text-[9px] font-black uppercase tracking-widest ${isClient ? 'text-blue-100' : 'text-blue-400'}`}>
                                             {note.author?.name || 'Practitioner'}
                                          </span>
                                       </div>
                                       {note.text && <p className="text-[12px] leading-relaxed mb-3">{note.text}</p>}

                                       {note.attachmentUrl && (
                                          <a
                                             href={note.attachmentUrl}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isClient ? 'bg-blue-700/50 border-blue-500/30 hover:bg-blue-700' : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900'}`}
                                          >
                                             <div className={`p-2 rounded-xl ${isClient ? 'bg-blue-500' : 'bg-blue-600/20'}`}>
                                                <File size={16} className={isClient ? 'text-white' : 'text-blue-400'} />
                                             </div>
                                             <div className="overflow-hidden">
                                                <p className="text-[10px] font-bold truncate">{note.attachmentName || 'Attachment'}</p>
                                                <p className="text-[8px] opacity-60 uppercase tracking-widest">Secure Artifact</p>
                                             </div>
                                          </a>
                                       )}

                                       <div className={`flex flex-col gap-0.5 text-[8px] font-mono mt-2 uppercase opacity-40 ${isClient ? 'items-end text-right' : 'items-start text-left'}`}>
                                          <span>{new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}</span>
                                          <span>({relativeTime(note.createdAt)})</span>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>

                     <div className="relative pt-4 border-t border-slate-800 space-y-3">
                        {selectedFile && (
                           <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-blue-500/30 rounded-2xl animate-in zoom-in-95 duration-200">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-blue-500/20 rounded-xl">
                                    <File size={14} className="text-blue-400" />
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{selectedFile.name}</span>
                              </div>
                              <button onClick={() => setSelectedFile(null)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Remove attachment">
                                 <X size={14} />
                              </button>
                           </div>
                        )}
                        <div className="relative">
                           <textarea
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendNote();
                                 }
                              }}
                              placeholder="Add message or feedback..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-4 pr-24 text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 h-28 resize-none transition-all shadow-inner"
                              title="Chat message"
                           />
                           <div className="absolute bottom-4 right-4 flex items-center gap-2">
                              <input
                                 type="file"
                                 ref={fileInputRef}
                                 className="hidden"
                                 onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              />
                              <button
                                 onClick={() => fileInputRef.current?.click()}
                                 title="Attach Artifact"
                                 className="p-3 text-slate-500 hover:text-blue-400 hover:bg-slate-900 rounded-full transition-all"
                              >
                                 <Paperclip size={18} />
                              </button>
                              <button
                                 onClick={handleSendNote}
                                 disabled={isSendingNote || (!noteInput.trim() && !selectedFile)}
                                 title="Send Signal"
                                 className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-90"
                              >
                                 <Send size={18} />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'billing' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-6 flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-bold flex items-center gap-3 text-white"><Receipt className="text-amber-400" /> Financial Intelligence Ledger</h3>
                     <p className="text-slate-500 text-sm">View and manage your outstanding invoices securely via the platform enclave.</p>
                  </div>
               </div>
               
               {latestMatter?.clientId && (
                  <div className="mb-10">
                     <ClientTrustLedger clientId={latestMatter.clientId} />
                  </div>
               )}

               {/* Reuse existing component, isolated for client context */}
               <ClientInvoicesRecord />
            </div>
         )}

         {previewDocId && (
            <DocumentPreviewModal
               documentId={previewDocId}
               onClose={() => setPreviewDocId(null)}
            />
         )}
         </> /* end isLoaded */
         )}
      </div>
   );
};

export default ClientPortal;
