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
   X
} from 'lucide-react';

import { useSovereignData } from '../hooks/useSovereignData';
import { usePermissions } from '../hooks/usePermissions';
import MatterJourney from './MatterJourney';
import ClientInvoicesRecord from './ClientInvoicesRecord';
import DocumentPreviewModal from './DocumentPreviewModal';
import { getSavedSession } from '../utils/api';
import { LexGeminiService } from '../services/geminiService';

const gemini = new LexGeminiService();

const ClientPortal: React.FC<{ userName: string; onLogout?: () => void }> = ({ userName, onLogout }) => {
   const { matters, documents } = useSovereignData(true);
   const { checkVisibility } = usePermissions();
   const [docFilter, setDocFilter] = useState<'all' | 'drafts' | 'final'>('all');
   const [activeTab, setActiveTab] = useState<'overview' | 'billing'>('overview');
   const [localDocs, setLocalDocs] = useState<any[]>([]);
   const [previewDocId, setPreviewDocId] = useState<string | null>(null);
   const [notes, setNotes] = useState<any[]>([]);
   const [noteInput, setNoteInput] = useState('');
   const [isSendingNote, setIsSendingNote] = useState(false);

   React.useEffect(() => {
      setLocalDocs(documents);
   }, [documents]);

   // Filter matters visible to this client
   const clientMatters = matters.filter(m => checkVisibility(m));
   const latestMatter = clientMatters[0];

   React.useEffect(() => {
      if (latestMatter?.id) {
         gemini.getMatterNotes(latestMatter.id).then(setNotes).catch(console.error);
      }
   }, [latestMatter?.id]);

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
      if (!text || !latestMatter) return;
      setIsSendingNote(true);
      try {
         const note = await gemini.addMatterNote(latestMatter.id, text);
         setNotes(prev => [note, ...prev]);
         setNoteInput('');
      } catch (e) {
         console.error('Note send failed', e);
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               {/* Left Column: Matter Journey & Overview */}
               <div className="lg:col-span-4">
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group border-t-blue-500/20 border-t-2">
                     <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                           <Activity size={16} className="text-blue-400" /> Matter Journey
                        </h4>
                        {latestMatter && (
                           <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {latestMatter.status}
                           </span>
                        )}
                     </div>

                     {latestMatter ? (
                        <div className="space-y-8">
                           <div>
                              <p className="text-xl font-bold text-white tracking-tight">{latestMatter.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-1 opacity-60">SRN-V3-{latestMatter.id}</p>
                           </div>
                           <MatterJourney currentStatus={latestMatter.status} />
                        </div>
                     ) : (
                        <div className="text-center py-12 opacity-40">
                           <Clock className="mx-auto text-slate-600 mb-4" size={48} />
                           <p className="text-slate-400 text-sm italic">Synchronizing Active Mandates...</p>
                        </div>
                     )}
                  </div>

                  {/* Collaboration Hub */}
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
                     <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                           <MessageSquare size={16} className="text-blue-400" /> Collaboration Hub
                        </h4>
                        <span className="text-[9px] font-mono text-slate-600">{notes.length} Signals</span>
                     </div>

                     <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                        {notes.length === 0 ? (
                           <div className="py-10 text-center opacity-30">
                              <p className="text-[10px] uppercase tracking-widest font-bold">No active signals in this enclave.</p>
                           </div>
                        ) : (
                           notes.map(note => (
                              <div key={note.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-2">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-400">{note.author?.name || 'Practitioner'}</span>
                                    <span className="text-[8px] text-slate-600 uppercase font-mono">{relativeTime(note.createdAt)}</span>
                                 </div>
                                 <p className="text-[11px] text-slate-300 leading-relaxed italic">"{note.text}"</p>
                              </div>
                           ))
                        )}
                     </div>

                     <div className="relative pt-4 border-t border-slate-800">
                        <textarea
                           value={noteInput}
                           onChange={(e) => setNoteInput(e.target.value)}
                           onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendNote(); } }}
                           placeholder="Add comment or feedback..."
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none transition-all"
                        />
                        <button
                           onClick={handleSendNote}
                           disabled={isSendingNote || !noteInput.trim()}
                           title="Send Signal"
                           className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl shadow-lg transition-all active:scale-95"
                        >
                           <Send size={16} />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right Column: Document Repo */}
               <div className="lg:col-span-8">
                  {/* Document Repository */}
                  <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
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
                              >
                                 {filter}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="p-4 sm:p-8 space-y-4">
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
      </div>
   );
};

export default ClientPortal;
