
import React, { useState, useEffect } from 'react';
import { 
  FileUp, 
  ShieldCheck, 
  Cpu, 
  Search, 
  Scale, 
  FileText, 
  Zap, 
  Lock, 
  Globe, 
  ArrowRight, 
  Activity,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Database,
  Fingerprint,
  HardDrive,
  Archive,
  Hash,
  // Fix: Added missing Terminal icon to imports
  Terminal
} from 'lucide-react';

const MatterWorkflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [traceLogs, setTraceLogs] = useState<string[]>([]);
  const [resolutionHash, setResolutionHash] = useState<string | null>(null);

  const steps = [
    {
      id: 'AUTH',
      title: 'Identity Handshake',
      icon: <Fingerprint size={24} />,
      color: 'blue',
      desc: 'OIDC Federated Auth verifying Lead Counsel identity against firm-managed Azure AD.',
      security: 'OIDC / RS256'
    },
    {
      id: 'INGEST',
      title: 'Vault Ingestion',
      icon: <FileUp size={24} />,
      color: 'emerald',
      desc: 'Artifact entry point. BYOK keys are requested from the client HSM to wrap the raw payload.',
      security: 'AES-256-GCM / BYOK'
    },
    {
      id: 'PINNING',
      title: 'Sovereignty Pinning',
      icon: <Globe size={24} />,
      color: 'blue',
      desc: 'Data is physically routed to the Accra-GH-1 regional silo. Cross-border transit is blocked.',
      security: 'Regional IP-Pinning'
    },
    {
      id: 'DAS',
      title: 'DAS Scrubbing Proxy',
      icon: <EyeOff size={24} />,
      color: 'purple',
      desc: 'PII entities (Names, IDs) are stripped in volatile RAM before reaching AI indexing layers.',
      security: 'Blind-fold NER Filter'
    },
    {
      id: 'AI_INTEL',
      title: 'AI Intelligence Hub',
      icon: <Cpu size={24} />,
      color: 'blue',
      desc: 'Gemini 3 Pro analyzes the scrubbed context. Matter context is injected for high-accuracy reasoning.',
      security: 'Dual-Agent Verification'
    },
    {
      id: 'RRE',
      title: 'Regulatory Intercept',
      icon: <Scale size={24} />,
      color: 'amber',
      desc: 'RRE Engine checks AI output against GBA/BoG rules for unauthorized legal advice triggers.',
      security: 'GBA Rules Engine v2.4'
    },
    {
      id: 'AUDIT',
      title: 'Counsel Oversight',
      icon: <ShieldCheck size={24} />,
      color: 'emerald',
      desc: 'Final human-in-the-loop verification. Counsel signs the artifact with a session-pinned token.',
      security: 'FIPS 140-2 Ledger'
    },
    {
      id: 'RESOLVE',
      title: 'Sovereign Resolution',
      icon: <Archive size={24} />,
      color: 'emerald',
      desc: 'Final resolution hash generated. Matter is cryptographically sealed and archived in the vault.',
      security: 'Immutable Block Seal'
    }
  ];

  const addTraceLog = (msg: string) => {
    setTraceLogs(prev => [`> ${msg}`, ...prev.slice(0, 5)]);
  };

  const startTrace = () => {
    setIsTracing(true);
    setActiveStep(0);
    setTraceLogs([]);
    setResolutionHash(null);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setActiveStep(currentStep);
        addTraceLog(`Executing Stage: ${steps[currentStep].id}... OK`);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsTracing(false);
        setResolutionHash(`SOV-${Math.random().toString(16).slice(2, 10).toUpperCase()}-GH1`);
        addTraceLog("MATTER LIFECYCLE: RESOLVED & SEALED.");
      }
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Zap className="text-emerald-500" size={28} />
            </div>
            End-to-End Matter Orchestration
          </h3>
          <p className="text-slate-400 text-sm">Visualizing the 8-stage Zero-Knowledge lifecycle of Matter MT-772.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Enclave Status: Synchronized</span>
          </div>
          <button 
            onClick={startTrace}
            disabled={isTracing}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-2xl shadow-blue-900/20 hover:-translate-y-1 active:scale-95 active:translate-y-0"
          >
            {isTracing ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
            {isTracing ? "Tracing Path..." : "Run Global Simulation"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: The Factory Line (Vertical Circuit) */}
        <div className="lg:col-span-8 space-y-4 relative">
          {/* Central Connecting Circuit Line */}
          <div className="absolute left-[3.25rem] top-12 bottom-12 w-[3px] bg-slate-800/50 z-0">
             <div 
               className="w-full bg-emerald-500 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
               style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
             ></div>
          </div>

          {steps.map((step, idx) => (
            <div 
              key={step.id}
              onClick={() => !isTracing && setActiveStep(idx)}
              className={`relative z-10 flex items-start gap-8 p-6 rounded-[2.5rem] border transition-all cursor-pointer group ${
                activeStep === idx 
                  ? `bg-${step.color}-500/10 border-${step.color}-500/40 shadow-2xl shadow-${step.color}-500/10` 
                  : activeStep > idx 
                    ? 'bg-slate-900/40 border-emerald-500/20' 
                    : 'bg-slate-900/20 border-slate-800/50 grayscale opacity-40 hover:opacity-80 hover:grayscale-0'
              }`}
            >
              <div className={`shrink-0 w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 border-2 ${
                activeStep === idx 
                  ? `bg-${step.color}-500 border-${step.color}-400 text-white shadow-[0_0_30px_rgba(var(--color-rgb),0.3)]` 
                  : activeStep > idx 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                {activeStep > idx ? <CheckCircle2 size={28} /> : step.icon}
              </div>
              
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold text-sm uppercase tracking-widest ${activeStep === idx ? `text-${step.color}-400` : activeStep > idx ? 'text-emerald-400' : 'text-slate-500'}`}>
                    PHASE 0{idx + 1}: {step.title}
                  </h4>
                  {activeStep === idx && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase">Processing</span>
                    </div>
                  )}
                </div>
                <p className={`text-[13px] leading-relaxed max-w-2xl ${activeStep === idx ? 'text-slate-100' : 'text-slate-400'}`}>
                  {step.desc}
                </p>
                
                <div className="flex items-center gap-4 pt-3">
                  <div className={`flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-tight px-3 py-1 rounded-full border ${
                    activeStep >= idx ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-transparent border-transparent'
                  }`}>
                    <Lock size={12} className={activeStep === idx ? 'text-emerald-400' : 'text-slate-600'} /> 
                    Protocol: {step.security}
                  </div>
                  {activeStep >= idx && (
                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase">
                      <Hash size={12} /> Proof: 0x{Math.random().toString(16).slice(2, 8)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Operational Insights & Resolution */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
           {/* Resolution Card (Appears at End) */}
           {resolutionHash && (
             <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-[3rem] space-y-6 shadow-2xl shadow-emerald-500/5 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Archive size={120} />
                </div>
                <div className="text-center space-y-4 relative z-10">
                   <div className="w-20 h-20 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <CheckCircle2 size={40} className="text-white" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-xl font-bold text-white">Matter Resolution</h4>
                      <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">MT-772 Cryptographically Sealed</p>
                   </div>
                   <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/20">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Final Resolution Hash</p>
                      <p className="text-xs font-mono text-emerald-400 break-all">{resolutionHash}</p>
                   </div>
                   <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                      Export Signed Archive
                   </button>
                </div>
             </div>
           )}

           {/* Live Trace Monitor */}
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                 <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                   <Terminal size={16} className="text-blue-400"/> System Trace Monitor
                 </h4>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase">GH-HSM-ACTIVE</span>
                 </div>
              </div>

              <div className="bg-slate-950 rounded-[1.5rem] p-6 font-mono text-[10px] h-64 overflow-y-auto border border-slate-800 scrollbar-hide flex flex-col-reverse gap-2">
                 {traceLogs.length === 0 && <p className="text-slate-700 italic">Awaiting lifecycle trigger...</p>}
                 {traceLogs.map((log, i) => (
                   <p key={i} className={`animate-in slide-in-from-left-2 ${i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                     {log}
                   </p>
                 ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/50">
                 <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Enclave CPU Heat</span>
                    <span className="text-white">42.8°C</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[42%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                 </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4">
                 <ShieldCheck className="text-blue-400 shrink-0" size={18} />
                 <p className="text-[10px] leading-relaxed text-slate-400 italic">
                   "Each stage update is recorded in the Sovereign Ledger with a unique temporal salt."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MatterWorkflow;
