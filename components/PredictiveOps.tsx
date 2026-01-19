
import React, { useState } from 'react';
import {
   TrendingUp,
   AlertCircle,
   Clock,
   DollarSign,
   ShieldCheck,
   ArrowUpRight,
   BarChart3,
   Gavel,
   CheckCircle2,
   XCircle,
   BrainCircuit,
   Filter
} from 'lucide-react';
import { AppMode, PredictiveRisk, BillingEntry } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
   { name: 'Mon', risk: 20, cycle: 12 },
   { name: 'Tue', risk: 35, cycle: 15 },
   { name: 'Wed', risk: 65, cycle: 22 },
   { name: 'Thu', risk: 45, cycle: 18 },
   { name: 'Fri', risk: 80, cycle: 28 },
   { name: 'Sat', risk: 55, cycle: 20 },
   { name: 'Sun', risk: 30, cycle: 14 },
];

const PredictiveOps: React.FC<{ mode: AppMode }> = ({ mode }) => {
   const isFirm = mode === AppMode.LAW_FIRM;

   const [risks] = useState<PredictiveRisk[]>([
      { id: 'r1', matterId: 'MT-772', type: 'SLA', probability: 0.85, impact: 'High', description: 'Predicted 48h delay in GBA filing due to counsel bottleneck.' },
      { id: 'r2', matterId: 'ENT-991', type: 'COMPLIANCE', probability: 0.62, impact: 'Med', description: 'Updated EU Data act requires re-review of clause 14.b.' }
   ]);

   const [billing] = useState<BillingEntry[]>([
      { id: 'b1', matterId: 'MT-772', lawyer: 'K. Mensah', hours: 4.5, rate: 450, description: 'Research on land title litigation procedures.', status: 'CLEAN' },
      { id: 'b2', matterId: 'MT-772', lawyer: 'A. Serwaa', hours: 2.0, rate: 300, description: 'Formatting shareholder annex.', status: 'FLAGGED', auditReason: 'Non-billable clerical task flagged by OCG Rule 4.' }
   ]);

   return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h3 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                     <BrainCircuit className="text-purple-400" size={24} />
                  </div>
                  Phase 5: Predictive Legal Ops
               </h3>
               <p className="text-slate-400 text-sm">AI-driven SLA forecasting and autonomous billing audits.</p>
            </div>
            <div className="flex gap-2">
               <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck size={14} /> Forensic Audit Active
               </span>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SLA Forecast */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                     <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-400" /> Matter Latency Forecast
                     </h4>
                     <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Volatility</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Cycle Time</div>
                     </div>
                  </div>

                  <div className="h-[280px] w-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                     <p>Forecasting System Offline</p>
                     {/*
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCycle" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Area type="monotone" dataKey="risk" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={3} />
                      <Area type="monotone" dataKey="cycle" stroke="#10b981" fillOpacity={1} fill="url(#colorCycle)" strokeWidth={3} />
                   </AreaChart>
                </ResponsiveContainer>
                */}
                  </div>
               </div>

               {/* Predictive Risk List */}
               <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2 flex items-center gap-2">
                     <AlertCircle size={14} className="text-amber-500" /> Critical Foresight Alerts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {risks.map(risk => (
                        <div key={risk.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-amber-500/30 transition-all group cursor-pointer">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{risk.matterId} / {risk.type}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${risk.impact === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                 }`}>
                                 {risk.impact} Impact
                              </span>
                           </div>
                           <p className="text-xs text-slate-200 font-medium leading-relaxed">{risk.description}</p>
                           <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${risk.probability * 100}%` }}></div>
                                 </div>
                                 <span className="text-[10px] font-mono text-slate-500">{Math.round(risk.probability * 100)}% Confidence</span>
                              </div>
                              <ArrowUpRight size={16} className="text-slate-600 group-hover:text-amber-500 transition-all" />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Billing Audit Hub */}
            <div className="space-y-6">
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                     <DollarSign size={16} className="text-emerald-400" /> {isFirm ? 'Revenue Intelligence' : 'Spend Intelligence'}
                  </h4>

                  <div className="space-y-6">
                     <div className="text-center space-y-1 py-4 border-b border-slate-800">
                        <p className="text-4xl font-bold text-white tracking-tighter">
                           {isFirm ? '$14.2k' : '$42.8k'}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                           <CheckCircle2 size={12} /> {isFirm ? 'Leakage Prevented' : 'Non-Compliant Recovered'}
                        </p>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Audit Adjustments</p>
                        <div className="space-y-3">
                           {billing.map(entry => (
                              <div key={entry.id} className={`p-4 rounded-2xl border transition-all ${entry.status === 'CLEAN' ? 'bg-slate-950/50 border-slate-800' : 'bg-red-500/5 border-red-500/20'
                                 }`}>
                                 <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400">{entry.lawyer}</span>
                                    <span className={`text-[10px] font-mono ${entry.status === 'CLEAN' ? 'text-emerald-500' : 'text-red-400'}`}>
                                       {entry.status}
                                    </span>
                                 </div>
                                 <p className="text-[11px] text-slate-300 leading-tight mb-2">"{entry.description}"</p>
                                 {entry.auditReason && (
                                    <p className="text-[9px] text-red-400/80 italic flex items-center gap-1">
                                       <AlertCircle size={10} /> {entry.auditReason}
                                    </p>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>

                     <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-700">
                        <BarChart3 size={14} /> Run Full Department Audit
                     </button>
                  </div>
               </div>

               <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2">
                     <Filter className="text-blue-400" size={16} />
                     <h5 className="font-bold text-xs text-blue-300 uppercase tracking-widest">Cross-Silo Conflict Search</h5>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                     Zero-Knowledge search active. Currently scanning <strong className="text-slate-200">West Africa</strong> and <strong className="text-slate-200">EU-Germany</strong> silos for party name collisions without un-pinning data.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500">
                     <CheckCircle2 size={12} /> 0 Conflicts Detected
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PredictiveOps;
