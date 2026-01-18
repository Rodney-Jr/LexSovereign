
import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  Box, 
  Globe, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Target,
  Activity,
  Layers,
  Sparkles,
  // Added missing icons
  Coins,
  ShieldAlert
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const revenueData = [
  { phase: 'Phase 1', rev: 450, margin: 40, ltv: 1200, label: 'Logical SaaS' },
  { phase: 'Phase 2', rev: 820, margin: 55, ltv: 2800, label: 'Omnichannel' },
  { phase: 'Phase 3', rev: 1650, margin: 75, ltv: 8500, label: 'Physical Enclave' },
  { phase: 'Phase 4', rev: 2900, margin: 82, ltv: 18000, label: 'Predictive ROI' },
];

const MonetizationStrategy: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 tracking-tight text-white">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <TrendingUp className="text-emerald-400" size={28} />
            </div>
            Sovereign Value Projection
          </h3>
          <p className="text-slate-400 text-sm">Mapping Phase-specific technical enablers to Revenue and LTV Capture.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Engine: Value-Based Pricing</span>
           </div>
        </div>
      </div>

      {/* Feature to Revenue Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <RevenuePhaseCard 
            phase="01" 
            title="Logical Isolation" 
            revenue="SaaS Subscription"
            margin="40%"
            features={['Multi-tenant Silos', 'Cloud-KMS Handshake', 'Base RRE Rules']}
            color="blue"
            icon={<Layers size={20}/>}
         />
         <RevenuePhaseCard 
            phase="02" 
            title="Secure Bridge" 
            revenue="Premium Egress"
            margin="55%"
            features={['WhatsApp DAS Proxy', 'OIDC Federated Auth', 'Mobile PII Scrubbing']}
            color="emerald"
            icon={<Zap size={20}/>}
         />
         <RevenuePhaseCard 
            phase="03" 
            title="Physical Silo" 
            revenue="HaaS Infrastructure"
            margin="75%"
            features={['Air-Gap Enclaves', 'Local LLM Hosting', 'BYOK Keys-on-Prem']}
            color="purple"
            icon={<Box size={20}/>}
         />
         <RevenuePhaseCard 
            phase="04" 
            title="Predictive Intel" 
            revenue="Outcome Fees"
            margin="82%"
            features={['Leakage Recovery %', 'SLA Success Fees', 'Predictive Ops License']}
            color="amber"
            icon={<Target size={20}/>}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LTV Growth Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
              <Sparkles size={150} />
           </div>
           
           <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Activity size={16} className="text-emerald-400"/> LTV Capture Velocity
              </h4>
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Lifetime Value ($)</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Gross Margin (%)</span>
              </div>
           </div>

           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorLtv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="ltv" stroke="#10b981" fillOpacity={1} fill="url(#colorLtv)" strokeWidth={4} />
                    <Area type="monotone" dataKey="margin" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMargin)" strokeWidth={2} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* ROI Breakdown */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group">
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Coins size={16} className="text-amber-400"/> ROI Multiplier
              </h4>
              
              <div className="space-y-8">
                 <RoiMetric label="Drafting Velocity" multiplier="4.2x" sub="Phase 1 Enabler" />
                 <RoiMetric label="Leakage Prevention" multiplier="12%" sub="Phase 4 Outcome" />
                 <RoiMetric label="Infrastructure Cost" multiplier="-35%" sub="Air-Gap Hybrid Model" />
                 
                 <div className="pt-6 border-t border-slate-800">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                       <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                         <ShieldCheck size={14} /> Value-Add Logic
                       </p>
                       <p className="text-[10px] text-slate-400 leading-relaxed italic">
                         "Revenue scales as we move from 'Software as a Service' to 'Compliance as an Outcome'."
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2.5rem] flex items-start gap-4">
              <ShieldAlert className="text-blue-400 shrink-0" size={24} />
              <div className="space-y-1">
                 <h5 className="font-bold text-xs text-blue-300 uppercase tracking-widest">Sovereign Upsell Path</h5>
                 <p className="text-[10px] text-slate-400 leading-relaxed">
                   Transitioning a client from <strong>Phase 1 (Logical)</strong> to <strong>Phase 3 (Physical)</strong> increases ARR by 240% due to infrastructure hardware margins.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const RevenuePhaseCard = ({ phase, title, revenue, margin, features, color, icon }: any) => (
  <div className={`bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-${color}-500/40 transition-all group relative overflow-hidden shadow-xl h-full`}>
     <div className="space-y-6">
        <div className="flex items-center justify-between">
           <div className={`p-3 bg-${color}-500/10 rounded-2xl border border-${color}-500/20 text-${color}-400 group-hover:scale-110 transition-transform`}>
              {icon}
           </div>
           <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">{phase}</span>
        </div>
        <div className="space-y-1">
           <h4 className="text-lg font-bold text-white tracking-tight">{title}</h4>
           <p className={`text-[10px] font-bold uppercase tracking-widest text-${color}-400`}>{revenue}</p>
        </div>
        <div className="space-y-3">
           {features.map((f: string, i: number) => (
             <div key={i} className="flex items-center gap-3 text-[10px] text-slate-400">
                <CheckCircle2 size={12} className={`text-${color}-500/50`} /> {f}
             </div>
           ))}
        </div>
     </div>
     <div className="pt-8 mt-8 border-t border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Gross Margin</p>
           <p className="text-xl font-black text-white">{margin}</p>
        </div>
        <ArrowRight size={20} className={`text-${color}-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
     </div>
  </div>
);

const RoiMetric = ({ label, multiplier, sub }: any) => (
  <div className="flex items-center justify-between">
     <div className="space-y-0.5">
        <p className="text-xs font-bold text-slate-200">{label}</p>
        <p className="text-[9px] text-slate-500 uppercase tracking-tighter">{sub}</p>
     </div>
     <div className="text-right">
        <p className="text-xl font-black text-emerald-400 tracking-tighter">{multiplier}</p>
        <div className="flex justify-end"><TrendingUp size={10} className="text-emerald-500" /></div>
     </div>
  </div>
);

export default MonetizationStrategy;
