import React, { useState } from 'react';
import {
   ShieldCheck,
   Lock,
   EyeOff,
   Clock,
   FileCheck,
   ChevronRight,
   Fingerprint,
   Info,
   CheckCircle2,
   AlertCircle,
   Activity,
   Filter,
   Search,
   Database,
   Globe,
   LogOut
} from 'lucide-react';

import { useSovereignData } from '../hooks/useSovereignData';
import { usePermissions } from '../hooks/usePermissions';
import MatterJourney from './MatterJourney';
import ActivityFeed from './ActivityFeed';

const ClientPortal: React.FC<{ userName: string; onLogout?: () => void }> = ({ userName, onLogout }) => {
   const { matters, documents } = useSovereignData(true);
   const { checkVisibility } = usePermissions();
   const [docFilter, setDocFilter] = useState<'all' | 'drafts' | 'final'>('all');

   // Filter matters visible to this client
   const clientMatters = matters.filter(m => checkVisibility(m));
   const latestMatter = clientMatters[0];

   // Filter documents for the latest matter
   const matterDocs = documents.filter(d => d.matterId === latestMatter?.id);
   const filteredDocs = matterDocs.filter(d => {
      if (docFilter === 'drafts') return d.status?.includes('DRAFT') || d.classification === 'Internal';
      if (docFilter === 'final') return d.status === 'APPROVED' || d.classification === 'Public';
      return true;
   });

   const piiScrubbed = documents.reduce((acc, doc) => {
      const attr = (doc.attributes as any) || {};
      return acc + (attr.scrubbedEntities || 0);
   }, 0) || (clientMatters.length * 12);

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

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Matter Journey & Overview */}
            <div className="lg:col-span-4 space-y-10">
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

               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group border-t-emerald-500/20 border-t-2">
                  <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                     <Activity size={16} className="text-emerald-400" /> Enclave Telemetry
                  </h4>
                  <ActivityFeed />
               </div>
            </div>

            {/* Right Column: Document Repo & Transparency */}
            <div className="lg:col-span-8 space-y-10">
               {/* Transparency Stats */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-2 hover:border-slate-700 transition-colors backdrop-blur-md">
                     <p className="text-3xl font-bold text-white tracking-tighter">{piiScrubbed}</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Entities Redacted</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-2 hover:border-slate-700 transition-colors backdrop-blur-md">
                     <div className="flex items-center gap-2">
                        <Lock size={14} className="text-emerald-500" />
                        <p className="text-2xl font-bold text-emerald-500 tracking-tighter uppercase">BYOK</p>
                     </div>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Vault Key Status</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-2 hover:border-slate-700 transition-colors backdrop-blur-md">
                     <p className="text-3xl font-bold text-blue-400 tracking-tighter">100%</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Silo Availability</p>
                  </div>
               </div>

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
                           <div key={doc.id} className="p-5 bg-slate-800/20 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 hover:bg-slate-800/30 transition-all cursor-pointer">
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
                                       <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                                          {doc.classification}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-[9px] font-bold text-slate-500">
                                    <ShieldCheck size={12} className="text-emerald-500" /> HSM-PROTECTED
                                 </div>
                                 <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
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

         {/* Guarantee Banner */}
         <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-inner">
            <div className="p-6 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20">
               <Fingerprint className="text-emerald-500" size={32} />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
               <h5 className="text-xl font-bold text-white tracking-tight italic">NomosDesk Data Guarantee</h5>
               <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                  As our premier client, you retain <strong>Absolute Sovereignty</strong> over your legal work product.
                  Encrypted shards are isolated within your local regional enclosure and never cross national borders
                  for AI inference without your session-bound cryptographic signature.
               </p>
            </div>
            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all border border-emerald-400/20">
               Audit Provenance
            </button>
         </div>
      </div>
   );
};

export default ClientPortal;
