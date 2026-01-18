
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Rocket, ShieldCheck, Cpu, Zap, Lock, Globe, Terminal, Activity, Fingerprint, ShieldAlert, Layers, ShieldQuestion, Database } from 'lucide-react';

const ProjectStatus: React.FC = () => {
  const [integrityScore, setIntegrityScore] = useState(99.42);
  const [driftScore, setDriftScore] = useState(0.04);
  const [lastScan, setLastScan] = useState(new Date().toLocaleTimeString());
  const [activeNodes, setActiveNodes] = useState(12);
  const [securityEvents, setSecurityEvents] = useState<string[]>([
    "KMS Key Rotation GH-ACC-01 successful",
    "GBA Rule Intercept: Legal Advice Trigger Blocked",
    "OIDC Handshake: Accra Partners verified",
    "Logical Silo integrity check: 100% compliant"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrityScore(prev => +(prev + (Math.random() * 0.04 - 0.02)).toFixed(2));
      setDriftScore(prev => +(Math.random() * 0.1).toFixed(3));
      setLastScan(new Date().toLocaleTimeString());
      
      if (Math.random() > 0.85) {
        const events = [
          "Logical Enclave heartbeat verified",
          "DAS Proxy re-indexing complete",
          "Regional egress attempt: DENIED",
          "GBA Regulatory cache refreshed",
          "BoG AML Proof accepted: MT-772"
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setSecurityEvents(prev => [randomEvent, ...prev.slice(0, 3)]);
      }

      if (Math.random() > 0.7) setActiveNodes(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* High-Level Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard 
          title="Logical Architecture" 
          status="Operational" 
          progress={100} 
          icon={<Cpu className="text-emerald-400" />} 
          color="emerald"
          detail="Software-Defined Enclaves Verified"
        />
        <StatusCard 
          title="Data Residency" 
          status="Ghana Pinned" 
          progress={100} 
          icon={<Globe className="text-blue-400" />} 
          color="blue"
          detail="West Africa Silo Enforced"
        />
        <StatusCard 
          title="Intelligence Layer" 
          status="GBA Rules Active" 
          progress={98} 
          icon={<ShieldCheck className="text-purple-400" />} 
          color="purple"
          detail="Dual-Agent Validation v1.0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Implementation Roadmap */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="text-emerald-400" size={24} />
              <h3 className="text-2xl font-bold tracking-tight text-white">Sovereignty Roadmap (GhanaContext)</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <Activity size={12} className="text-emerald-500" />
              BUILD: v1.2-GHANA-SOVEREIGN
            </div>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] space-y-8 relative overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="space-y-10 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800/60">
              <RoadmapItem 
                phase="Current: Phase 1" 
                title="Logical Sovereignty & GBA Rules" 
                description="Deployment of isolated cloud partitions with Ghana-specific regulatory guardrails and Cloud-KMS key management."
                completed={true}
              />
              <RoadmapItem 
                phase="Up Next: Phase 2" 
                title="Omnichannel Mobile Egress" 
                description="Secure WhatsApp/Mobile bridging with real-time PII scrubbing for on-the-go matter status updates."
                inProgress={true}
              />
              <RoadmapItem 
                phase="Future: Phase 3" 
                title="Physical Sovereignty (Enclave)" 
                description="Transition to on-premises Air-Gap hardware enclaves and local LLM inference for high-security banking/govt artifacts."
                completed={false}
              />
            </div>
          </div>

          {/* Real-time Event Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                <Terminal size={16} className="text-emerald-500" />
                Live Logical Security Feed
             </div>
             <div className="space-y-2">
                {securityEvents.map((event, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-900 rounded-2xl animate-in slide-in-from-left-4 transition-all">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[11px] font-mono text-slate-300">{event}</span>
                      <span className="ml-auto text-[9px] font-mono text-slate-600 uppercase tracking-tighter">Verified</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Live Integrity Feed */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all"></div>
            
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Activity className="text-emerald-400" size={16}/>
                Silo Health Monitor
              </h4>
              <span className="text-[10px] font-mono text-slate-500 tracking-tighter">{lastScan}</span>
            </div>

            <div className="space-y-1 text-center py-6 border-y border-slate-800/50">
              <p className="text-5xl font-bold text-white tracking-tighter tabular-nums">{integrityScore}%</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                 <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Status: Compliant</p>
                 <span className="text-slate-800">•</span>
                 <p className="text-[10px] text-blue-400 font-mono">Drift: {driftScore}</p>
              </div>
            </div>

            <div className="space-y-4">
              <IntegrityLine label="Logical Silo Isolation" status="ENFORCED" active={true} icon={<Globe size={12}/>} />
              <IntegrityLine label="Cloud-KMS Handshake" status="ACTIVE" active={true} icon={<Lock size={12}/>} />
              <IntegrityLine label="GBA Rule Intercept" status="READY" active={true} icon={<Layers size={12}/>} />
              <IntegrityLine label="PII Scrubbing Proxy" status="FILTERING" active={true} icon={<Fingerprint size={12}/>} />
            </div>

            <div className="pt-6">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Compute Slots</span>
                 <span className="text-[10px] text-emerald-400 font-mono font-bold">{activeNodes}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/60 w-[94%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
               </div>
            </div>
          </div>

          <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] space-y-4 shadow-xl">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <ShieldAlert className="text-blue-400" size={20} />
                </div>
                <h4 className="font-bold text-sm text-blue-300">Ghana Privacy Act</h4>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed italic">
                "Logical isolation ensures that Ghana Data Protection Commission (DPC) standards are met by pinning executing context to regional boundaries without requiring physical server ownership."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ title, status, progress, icon, color, detail }: any) => (
  <div className={`bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-${color}-500/30 transition-all group relative overflow-hidden shadow-xl`}>
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-widest text-${color}-400 bg-${color}-400/10 px-3 py-1 rounded-full border border-${color}-400/20`}>
        {status}
      </span>
    </div>
    <div className="space-y-4 relative z-10">
      <div className="space-y-1">
        <p className="text-sm text-slate-200 font-bold">{title}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{detail}</p>
      </div>
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color}-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(var(--color-rgb),0.5)]`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const RoadmapItem = ({ phase, title, description, completed, inProgress }: any) => (
  <div className="relative pl-12 group/item">
    <div className={`absolute left-[0.15rem] top-1 w-7 h-7 rounded-xl z-10 border-2 transition-all duration-700 flex items-center justify-center ${
      completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
      inProgress ? 'bg-slate-950 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 
      'bg-slate-950 border-slate-800 opacity-50'
    }`}>
      {completed ? <CheckCircle2 size={16} className="text-slate-950" /> : 
       inProgress ? <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> : 
       <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>}
    </div>
    <div className={`space-y-2 transition-opacity ${!completed && !inProgress ? 'opacity-50' : 'opacity-100'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${completed ? 'text-emerald-500' : inProgress ? 'text-blue-400' : 'text-slate-600'}`}>
        {phase}
      </p>
      <h4 className={`font-bold text-base tracking-tight transition-colors ${completed || inProgress ? 'text-slate-100' : 'text-slate-700'}`}>
        {title}
      </h4>
      <p className={`text-sm leading-relaxed max-w-2xl transition-colors ${completed || inProgress ? 'text-slate-400' : 'text-slate-800'}`}>
        {description}
      </p>
    </div>
  </div>
);

const IntegrityLine = ({ label, status, active, icon }: any) => (
  <div className="flex items-center justify-between text-[11px] font-mono group/line">
    <div className="flex items-center gap-2">
      <span className="text-slate-600 group-hover/line:text-emerald-500 transition-colors">{icon}</span>
      <span className="text-slate-500 group-hover/line:text-slate-300 transition-colors uppercase tracking-tight">{label}</span>
    </div>
    <span className={`font-bold tracking-widest ${active ? 'text-emerald-400' : 'text-slate-600'}`}>{status}</span>
  </div>
);

export default ProjectStatus;
