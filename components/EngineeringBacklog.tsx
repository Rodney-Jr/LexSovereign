
import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Cpu, 
  GitBranch, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  Zap, 
  Lock,
  GitCommit,
  Layers,
  Code2
} from 'lucide-react';

interface BacklogItem {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  effort: 'S' | 'M' | 'L' | 'XL';
  status: 'Done' | 'In Progress' | 'Blocked' | 'Backlog';
  category: 'Infrastructure' | 'Intelligence' | 'Governance';
  desc: string;
}

const Phase2Backlog: BacklogItem[] = [
  { id: 'SOV-201', title: 'OIDC Discovery Resolver', priority: 'P0', effort: 'M', status: 'In Progress', category: 'Infrastructure', desc: 'Dynamic mapping of email domains to tenant-specific IdPs for zero-discovery leaks.' },
  { id: 'SOV-202', title: 'DAS Proxy v2 (Legal NER)', priority: 'P0', effort: 'L', status: 'In Progress', category: 'Intelligence', desc: 'Legal-aware Named Entity Recognition for jurisdictional PII (e.g. Ghana Card recognition).' },
  { id: 'SOV-203', title: 'HSM RS256 Token Enclave', priority: 'P0', effort: 'M', status: 'Done', category: 'Governance', desc: 'Implementing RS256 signing inside the TEE for short-lived mobile session tokens.' },
  { id: 'SOV-204', title: 'Sovereign Revocation Sync (SRS)', priority: 'P1', effort: 'L', status: 'Backlog', category: 'Infrastructure', desc: 'Global kill-switch broadcast to invalidate tokens across all regional silos in <200ms.' },
  { id: 'SOV-205', title: 'WhatsApp Sanitized Egress', priority: 'P1', effort: 'M', status: 'In Progress', category: 'Infrastructure', desc: 'E2EE bridge for WhatsApp with automatic PII scrubbing on every outgoing bubble.' },
  { id: 'SOV-206', title: 'Predictive SLA Breach Predictor', priority: 'P2', effort: 'XL', status: 'Backlog', category: 'Intelligence', desc: 'AI-driven forecasting for matter delays based on historical silo throughput.' },
  { id: 'SOV-207', title: 'LEDES/UTBMS Audit Layer', priority: 'P2', effort: 'M', status: 'Backlog', category: 'Governance', desc: 'Automated billing validation against industry-standard legal code-sets.' },
];

const EngineeringBacklog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [buildStatus, setBuildStatus] = useState<'IDLE' | 'DEPLOYING'>('IDLE');

  useEffect(() => {
    if (buildStatus === 'DEPLOYING') {
      const messages = [
        "Initializing Silo-GH-ACC-01 Build Chain...",
        "Cloning DAS-Proxy-v2 repository...",
        "Injecting GBA Ethics Model v2.4...",
        "Testing KMS Handshake... SUCCESS",
        "Provisioning HSM Enclave 01... ACTIVE",
        "Deploying OIDC Discovery Node...",
        "Build complete. Verifying integrity hashes..."
      ];
      
      let i = 0;
      const interval = setInterval(() => {
        if (i < messages.length) {
          setLogs(prev => [`> ${messages[i]}`, ...prev].slice(0, 10));
          i++;
        } else {
          setBuildStatus('IDLE');
          clearInterval(interval);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [buildStatus]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Terminal className="text-emerald-400" size={28} />
            </div>
            Phase 2: Engineering Backlog
          </h3>
          <p className="text-slate-400 text-sm">Mapping "Secure Bridge" technical debt and deployment priorities.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setBuildStatus('DEPLOYING')}
            disabled={buildStatus === 'DEPLOYING'}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
           >
             {buildStatus === 'DEPLOYING' ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
             Trigger Silo Build
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main List */}
        <div className="lg:col-span-8 space-y-4">
           <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-4">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Layers size={14} /> Current Sprint: "Bridge Security"
                 </h4>
                 <div className="h-4 w-[1px] bg-slate-800"></div>
                 <span className="text-[10px] text-emerald-500 font-mono">GIT: 8a2f1c9_release_p2</span>
              </div>
           </div>

           <div className="space-y-3">
              {Phase2Backlog.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-700 transition-all group relative overflow-hidden">
                   <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                            item.status === 'Done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            item.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse' :
                            'bg-slate-800 border-slate-700 text-slate-500'
                         }`}>
                            {item.status === 'Done' ? <CheckCircle2 size={24}/> : <GitBranch size={24}/>}
                         </div>
                         <div className="space-y-1">
                            <div className="flex items-center gap-3">
                               <span className="text-xs font-mono text-slate-500">{item.id}</span>
                               <h5 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{item.title}</h5>
                            </div>
                            <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed">{item.desc}</p>
                         </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                         <div className="flex gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                               item.priority === 'P0' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                               item.priority === 'P1' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                               'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>
                               {item.priority}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[8px] font-bold uppercase">
                               Effort: {item.effort}
                            </span>
                         </div>
                         <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">Category: {item.category}</span>
                      </div>
                   </div>
                   {item.status === 'In Progress' && (
                     <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-1/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                   )}
                </div>
              ))}
           </div>
        </div>

        {/* Build Monitor Sidebar */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
           {/* CI/CD Terminal View */}
           <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                 <Cpu size={120} />
              </div>
              
              <div className="flex items-center justify-between">
                 <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                    <Code2 size={16}/> Build Monitor
                 </h4>
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${buildStatus === 'DEPLOYING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Silo_Main_01</span>
                 </div>
              </div>

              <div className="bg-black/60 rounded-2xl p-5 font-mono text-[10px] h-[350px] overflow-y-auto border border-emerald-900/30 scrollbar-hide space-y-2 flex flex-col-reverse shadow-inner">
                 {logs.length === 0 && <p className="text-slate-800 italic uppercase tracking-widest">System Idle. Awaiting CI Trigger.</p>}
                 {logs.map((log, i) => (
                   <p key={i} className={`animate-in slide-in-from-left-2 ${i === 0 ? 'text-emerald-400' : 'text-emerald-900'}`}>
                      {log}
                   </p>
                 ))}
              </div>

              <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-600 uppercase">Branch Integrity</p>
                    <p className="text-xs font-bold text-emerald-500">SECURE_BY_DESIGN</p>
                 </div>
                 <Lock className="text-slate-800" size={24} />
              </div>
           </div>

           {/* Metrics Card */}
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={14} className="text-amber-400" /> Velocity Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-4">
                 <Metric label="Done" value="14" color="emerald" />
                 <Metric label="Blocked" value="02" color="red" />
                 <Metric label="Sprints" value="04" color="blue" />
                 <Metric label="Avg Effort" value="M" color="amber" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value, color }: any) => (
  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
     <p className={`text-xl font-bold text-${color}-400`}>{value}</p>
  </div>
);

export default EngineeringBacklog;
