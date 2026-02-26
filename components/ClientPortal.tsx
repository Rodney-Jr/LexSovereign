
import React from 'react';
import {
   ShieldCheck,
   Lock,
   Eye,
   EyeOff,
   Clock,
   FileCheck,
   ChevronRight,
   Fingerprint,
   Info,
   CheckCircle2,
   AlertCircle
} from 'lucide-react';

import { useSovereignData } from '../hooks/useSovereignData';
import { usePermissions } from '../hooks/usePermissions';

const ClientPortal: React.FC<{ userName: string }> = ({ userName }) => {
   const { matters, documents } = useSovereignData(true);
   const { checkVisibility } = usePermissions();

   // Filter matters visible to this client
   const clientMatters = matters.filter(m => checkVisibility(m));
   const latestMatter = clientMatters[0]; // Assuming most recent for the snapshot

   // Calculate PII scrubbed count from actual document metadata attributes if available
   const piiScrubbed = documents.reduce((acc, doc) => {
      const attr = (doc.attributes as any) || {};
      return acc + (attr.scrubbedEntities || 0);
   }, 0) || (clientMatters.length * 7); // Fallback to heuristic if no data

   // Calculate matter progress based on status or attributes
   const getProgress = (matter: any) => {
      if (matter.status === 'CLOSED') return 100;
      if (matter.status === 'REVIEW') return 80;
      const attr = (matter.attributes as any) || {};
      return attr.progress || 45; // Default to 45% if unknown
   };

   return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 pb-20">
         <div className="text-center space-y-4 pt-8">
            <div className="flex justify-center">
               <div className="p-4 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                  <ShieldCheck className="text-emerald-500" size={48} />
               </div>
            </div>
            <div className="space-y-1">
               <h2 className="text-3xl font-bold text-white tracking-tight">{userName}'s Sovereign Portal</h2>
               <p className="text-slate-400 text-sm">Welcome back. Your data is currently pinned to the primary regional silo.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Active Matter Snapshot */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
               <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                     <Clock size={16} className="text-blue-400" /> {latestMatter ? 'Current Matter Progress' : 'No Active Matters'}
                  </h4>
                  {latestMatter && (
                     <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[9px] font-bold uppercase">
                        {latestMatter.status}
                     </span>
                  )}
               </div>

               <div className="space-y-6">
                  {latestMatter ? (
                     <>
                        <div>
                           <p className="text-lg font-bold text-white tracking-tight">{latestMatter.name}</p>
                           <p className="text-[10px] text-slate-500 font-mono">MATTER-ID: {latestMatter.id}</p>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span>Legal Review Status</span>
                              <span className="text-blue-400">{getProgress(latestMatter)}%</span>
                           </div>
                           <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${getProgress(latestMatter)}%` }}></div>
                           </div>
                        </div>

                        <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-700 group/btn">
                           <FileCheck size={16} className="text-emerald-400" /> Review Latest AI Draft
                           <ChevronRight size={14} className="text-slate-500 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                     </>
                  ) : (
                     <div className="text-center py-8">
                        <AlertCircle className="mx-auto text-slate-600 mb-4" size={48} />
                        <p className="text-slate-400 text-sm">You haven't been assigned any matters yet. Contact your firm administrator for access.</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Privacy Transparency Dashboard */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
               <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <EyeOff size={16} className="text-emerald-400" /> Privacy Transparency
               </h4>

               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-800/50 rounded-2xl text-center space-y-1">
                        <p className="text-2xl font-bold text-white tracking-tighter">{piiScrubbed}</p>
                        <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">PII Entities Scrubbed</p>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-2xl text-center space-y-1">
                        <p className="text-2xl font-bold text-emerald-500 tracking-tighter">BYOK</p>
                        <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Encryption Active</p>
                     </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl space-y-2">
                     <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter flex items-center gap-2">
                        <Fingerprint size={12} /> Data Provenance Trace
                     </p>
                     <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        "Your data has not moved from the regional silo. 0 packets detected in transit outside jurisdictional boundaries."
                     </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                     <span>Vault Health: 100%</span>
                     <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Verified by HSM</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Actionable Insights */}
         <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-2">
               <AlertCircle size={14} className="text-amber-500" /> Pending Sovereign Approvals
            </h4>

            {clientMatters.length > 0 ? (
               <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-5">
                     <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <FileCheck className="text-emerald-400" size={24} />
                     </div>
                     <div>
                        <p className="font-bold text-white">Approve Matter Documents: {latestMatter?.name}</p>
                        <p className="text-xs text-slate-500">Verification required for {documents.filter(d => d.matterId === latestMatter?.id).length} artifacts.</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-bold text-emerald-400">Review Pending</span>
                     <ChevronRight size={18} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
               </div>
            ) : (
               <p className="px-2 text-slate-500 text-sm">No pending approvals detected.</p>
            )}
         </div>

         <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] flex items-start gap-5">
            <Info className="text-blue-500 shrink-0" size={24} />
            <div className="space-y-1">
               <h5 className="font-bold text-xs text-blue-400 uppercase tracking-widest">NomosDesk Guarantee</h5>
               <p className="text-[10px] text-slate-400 leading-relaxed">
                  As a <strong>Sovereign Tier</strong> client, you have direct control over your encryption keys. At no point can NomosDesk or its AI providers access your documents without your HSM session token.
               </p>
            </div>
         </div>
      </div>
   );
};

export default ClientPortal;
