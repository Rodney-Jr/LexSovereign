
import React, { useState } from 'react';
import { 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Plus, 
  BarChart3,
  Building2,
  Lock,
  Globe,
  RefreshCw,
  TrendingUp,
  Receipt,
  Download,
  AlertCircle
} from 'lucide-react';
import { SaaSPlan } from '../types';

const SovereignBilling: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Usage Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={150} />
          </div>
          
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">Resource Utilization Ledger</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Real-time SaaS telemetry</p>
            </div>
            <button 
              onClick={handleSync}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-400 transition-all"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <UsageMeter label="AI Credits (Inference)" current={4200} max={10000} color="emerald" sub="~840 Document Summaries" />
             <UsageMeter label="Vault Storage (Pinned)" current={4.2} max={10} unit="TB" color="blue" sub="GH-ACC-1 Residency Limit" />
             <UsageMeter label="Active Team Slots" current={14} max={50} color="purple" sub="Sovereign Chambers Tier" />
          </div>

          <div className="mt-12 p-6 bg-slate-950/80 border border-slate-800 rounded-[2rem] flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Burn Rate</p>
                   <p className="text-xl font-bold text-white tracking-tight">42.2 Credits <span className="text-slate-600 text-xs">/ hr</span></p>
                </div>
                <div className="w-[1px] h-10 bg-slate-800"></div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projected Overage</p>
                   <p className="text-xl font-bold text-emerald-500 tracking-tight">$0.00</p>
                </div>
             </div>
             <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center gap-2">
                <Plus size={16}/> Allocate Credits
             </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* Active Subscription Status */}
           <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <ShieldCheck size={100} />
              </div>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                       <Building2 size={24}/>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Plan</p>
                       <h4 className="text-lg font-bold text-white uppercase tracking-tighter">Sovereign Chambers</h4>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <PlanFeature label="Logical Ghana Silo (Pinned)" />
                    <PlanFeature label="GBA Ethics Guardrails" />
                    <PlanFeature label="BYOK Encryption (HSM)" />
                    <PlanFeature label="FIPS-140 Decision Trace" />
                 </div>
              </div>
              <div className="space-y-3 relative z-10 pt-8 mt-8 border-t border-slate-800">
                 <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-slate-700">
                    Plan Settings
                 </button>
                 <p className="text-[9px] text-slate-500 text-center font-medium italic">Next renewal: June 01, 2024 via Bank Transfer</p>
              </div>
           </div>
        </div>
      </div>

      {/* Invoice Ledger */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Receipt size={14} className="text-blue-400"/> Cryptographic Billing Trace
            </h4>
            <span className="text-[10px] font-mono text-slate-600">FIPS 140-2 Ledger: SYNCED</span>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
               <thead className="bg-slate-800/50 border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                     <th className="px-8 py-5">Statement Cycle</th>
                     <th className="px-8 py-5">Resource Delta</th>
                     <th className="px-8 py-5">Amount (GHS/USD)</th>
                     <th className="px-8 py-5 text-right">Artifacts</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50 text-xs">
                  <InvoiceRow cycle="May 2024 (Current)" delta="+12.4k Credits" amount="$499.00" status="DRAFT" />
                  <InvoiceRow cycle="April 2024" delta="+10.0k Credits" amount="$499.00" status="PAID" />
                  <InvoiceRow cycle="March 2024" delta="+15.2k Credits" amount="$582.40" status="PAID" />
               </tbody>
            </table>
         </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-[2.5rem] flex items-start gap-6">
         <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
           <AlertCircle className="text-amber-500" size={24} />
         </div>
         <div className="space-y-1">
            <h5 className="font-bold text-xs text-amber-400 uppercase tracking-widest">Predictive Quota Alert</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Based on current matter velocity (Phase 2), you will consume your allocated <strong>10,000 Credits</strong> by June 12th. Autonomous credit top-up is currently <strong className="text-slate-200">DISABLED</strong> per organization policy.
            </p>
         </div>
      </div>
    </div>
  );
};

const UsageMeter = ({ label, current, max, unit = "", color, sub }: any) => {
  const pct = Math.round((current / max) * 100);
  return (
    <div className="space-y-4">
       <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className="text-2xl font-bold text-white tabular-nums">{current}{unit}</p>
             <p className="text-[10px] text-slate-500 font-mono">/ {max}{unit}</p>
          </div>
       </div>
       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(var(--color-rgb),0.4)] transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
       </div>
       <p className="text-[9px] text-slate-600 italic font-medium">{sub}</p>
    </div>
  );
};

const PlanFeature = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 text-[11px] text-slate-300 group/feat">
    <CheckCircle2 size={12} className="text-emerald-500 transition-transform group-hover/feat:scale-125" />
    {label}
  </div>
);

const InvoiceRow = ({ cycle, delta, amount, status }: any) => (
  <tr className="hover:bg-slate-800/20 transition-all group">
     <td className="px-8 py-5 font-bold text-slate-200">{cycle}</td>
     <td className="px-8 py-5 font-mono text-slate-500">{delta}</td>
     <td className="px-8 py-5 font-bold text-white">{amount}</td>
     <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-3">
           <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
             status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
           }`}>
             {status}
           </span>
           <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-600 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100">
             <Download size={14} />
           </button>
        </div>
     </td>
  </tr>
);

export default SovereignBilling;
