
import React, { useState } from 'react';
import { 
  Plug, 
  ShieldCheck, 
  MessageSquare, 
  Key, 
  Database, 
  Cpu, 
  DollarSign, 
  Building2, 
  Gavel, 
  RefreshCw, 
  Zap, 
  Lock, 
  EyeOff, 
  Terminal,
  Activity,
  ArrowRightLeft,
  Settings2,
  AlertCircle,
  Link2
} from 'lucide-react';
import { IntegrationBridge, IntegrationStatus, EncapsulationLevel } from '../types';

const INITIAL_BRIDGES: IntegrationBridge[] = [
  { id: 'b1', name: 'Azure Entra ID', category: 'Identity', provider: 'Microsoft', status: IntegrationStatus.NOMINAL, encapsulation: EncapsulationLevel.HSM_TUNNEL, priority: 'P0', lastActivity: '12s ago' },
  { id: 'b2', name: 'WhatsApp Cloud API', category: 'Messaging', provider: 'Meta', status: IntegrationStatus.NOMINAL, encapsulation: EncapsulationLevel.DAS_PROXY, priority: 'P0', lastActivity: '1m ago' },
  { id: 'b3', name: 'AWS S3 Silo (Accra)', category: 'Storage', provider: 'Amazon', status: IntegrationStatus.NOMINAL, encapsulation: EncapsulationLevel.HSM_TUNNEL, priority: 'P0', lastActivity: '45s ago' },
  { id: 'b4', name: 'Gemini 3 Pro', category: 'AI', provider: 'Google', status: IntegrationStatus.NOMINAL, encapsulation: EncapsulationLevel.DAS_PROXY, priority: 'P0', lastActivity: '2s ago' },
  { id: 'b5', name: 'SAP S/4HANA', category: 'ERP', provider: 'SAP', status: IntegrationStatus.SYNCING, encapsulation: EncapsulationLevel.HSM_TUNNEL, priority: 'P1', lastActivity: '5m ago' },
  { id: 'b6', name: 'Ghana Court DB', category: 'Regulatory', provider: 'Judicial Service', status: IntegrationStatus.NOMINAL, encapsulation: EncapsulationLevel.STANDARD, priority: 'P2', lastActivity: '2h ago' },
  { id: 'b7', name: 'Llama-3 (Local)', category: 'AI', provider: 'Enclave Node 1', status: IntegrationStatus.NOMINAL, encapsulation: EncapsulationLevel.AIR_GAP, priority: 'P1', lastActivity: '15m ago' },
];

const BridgeRegistry: React.FC = () => {
  const [bridges, setBridges] = useState<IntegrationBridge[]>(INITIAL_BRIDGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const selectedBridge = bridges.find(b => b.id === selectedId);
  const categories = ['All', 'Identity', 'Messaging', 'Storage', 'AI', 'ERP', 'Regulatory'];

  const filteredBridges = filter === 'All' ? bridges : bridges.filter(b => b.category === filter);

  const toggleIsolation = (id: string) => {
    setBridges(prev => prev.map(b => 
      b.id === id 
        ? { ...b, status: b.status === IntegrationStatus.ISOLATED ? IntegrationStatus.NOMINAL : IntegrationStatus.ISOLATED } 
        : b
    ));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24 max-w-7xl mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Plug className="text-emerald-400" size={28} />
            </div>
            Bridge Registry: Sovereign Integration Layer
          </h3>
          <p className="text-slate-400 text-sm">Managing the secure handshake between logical silos and external enterprise ecosystem.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => { setFilter(cat); setSelectedId(null); }}
               className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                 filter === cat 
                 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                 : 'text-slate-500 hover:text-slate-300'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Adapter Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           {filteredBridges.map(bridge => (
             <button
               key={bridge.id}
               onClick={() => setSelectedId(bridge.id)}
               className={`p-6 rounded-[2.5rem] border-2 text-left transition-all duration-500 group relative overflow-hidden h-full flex flex-col justify-between ${
                 selectedId === bridge.id 
                 ? 'bg-emerald-600/10 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.15)] scale-[1.02]' 
                 : 'bg-slate-900 border-slate-800 hover:border-slate-700'
               } ${bridge.status === IntegrationStatus.ISOLATED ? 'opacity-70 grayscale border-dashed' : ''}`}
             >
                <div className="flex items-start justify-between mb-6 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-colors ${
                        selectedId === bridge.id ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-emerald-400'
                      }`}>
                         <CategoryIcon category={bridge.category} />
                      </div>
                      <div>
                         <h4 className="font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">{bridge.name}</h4>
                         <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{bridge.provider}</p>
                      </div>
                   </div>
                   <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                     bridge.priority === 'P0' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                     bridge.priority === 'P1' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                     'bg-blue-500/10 text-blue-400 border-blue-500/20'
                   }`}>
                     {bridge.priority}
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          bridge.status === IntegrationStatus.NOMINAL ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                          bridge.status === IntegrationStatus.SYNCING ? 'bg-blue-500 animate-pulse' : 
                          bridge.status === IntegrationStatus.ISOLATED ? 'bg-slate-600' : 'bg-red-500'
                        }`}></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bridge.status}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-600">{bridge.lastActivity}</span>
                   </div>

                   <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {bridge.encapsulation.includes('DAS') ? <EyeOff size={12} className="text-amber-400"/> : <ShieldCheck size={12} className="text-blue-400"/>}
                        <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[120px]">{bridge.encapsulation}</span>
                      </div>
                      {bridge.status !== IntegrationStatus.ISOLATED && <Zap size={12} className="text-emerald-500 animate-pulse" />}
                   </div>
                </div>

                {bridge.status === IntegrationStatus.ISOLATED && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[8px] font-bold text-slate-500 uppercase tracking-widest">Logic Lock Active</div>
                  </div>
                )}
             </button>
           ))}
        </div>

        {/* Bridge Config Sidebar */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
           {selectedBridge ? (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Plug size={120} />
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Adapter Intelligence</h4>
                      <p className="text-2xl font-bold text-white tracking-tight">{selectedBridge.name}</p>
                   </div>
                   <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors">
                      <Settings2 size={18} />
                   </button>
                </div>

                <div className="space-y-6 relative z-10">
                   <div className="p-5 bg-slate-950 rounded-2xl space-y-4 border border-slate-800">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inception ID</span>
                         <span className="text-[10px] font-mono text-emerald-500">TOK-{selectedBridge.id.toUpperCase()}-HANDSHAKE</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latency (Avg)</span>
                         <span className="text-[10px] font-mono text-blue-400">24ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Handshake</span>
                         <span className="text-[10px] font-mono text-slate-400 uppercase">E2EE / RS256</span>
                      </div>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-blue-400"/> Encapsulation Policy
                      </h5>
                      <div className="space-y-3">
                         <EnforcementLine label="DAS NER Filtering" status={selectedBridge.encapsulation.includes('DAS') ? 'Enforced' : 'Not Required'} active={selectedBridge.encapsulation.includes('DAS')} />
                         <EnforcementLine label="HSM Key Wrapping" status={selectedBridge.encapsulation.includes('HSM') ? 'Active' : 'Bypassed'} active={selectedBridge.encapsulation.includes('HSM')} />
                         <EnforcementLine label="Egress Sanitization" status="Automatic" active={true} />
                         <EnforcementLine label="Request Signing" status="FIPS 140-2" active={true} />
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-800 flex gap-4">
                      <button 
                        onClick={() => toggleIsolation(selectedBridge.id)}
                        className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                          selectedBridge.status === IntegrationStatus.ISOLATED 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}
                      >
                         {selectedBridge.status === IntegrationStatus.ISOLATED ? <Link2 size={18}/> : <Lock size={18}/>}
                         {selectedBridge.status === IntegrationStatus.ISOLATED ? 'Restore Bridge' : 'Isolate Silo'}
                      </button>
                   </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4">
                   <AlertCircle className="text-blue-400 shrink-0" size={18} />
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">
                     "In the Sovereign model, bridges are not 'trusted connections'—they are monitored pipelines. Every outbound payload to {selectedBridge.provider} is cryptographically audited for PII leakage."
                   </p>
                </div>
             </div>
           ) : (
             <div className="h-full bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="p-5 bg-slate-800 rounded-full text-slate-600">
                   <Plug size={48} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-slate-300">Adapter Control Offline</h4>
                   <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed uppercase tracking-widest text-[10px] font-bold">Select a bridge node in the topography to inspect its cryptographic encapsulation profile.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const CategoryIcon = ({ category }: { category: string }) => {
  const size = 20;
  switch (category) {
    case 'Identity': return <Key size={size} />;
    case 'Messaging': return <MessageSquare size={size} />;
    case 'Storage': return <Database size={size} />;
    case 'AI': return <Cpu size={size} />;
    case 'ERP': return <Building2 size={size} />;
    case 'Finance': return <DollarSign size={size} />;
    case 'Regulatory': return <Gavel size={size} />;
    default: return <Plug size={size} />;
  }
};

const EnforcementLine = ({ label, status, active }: { label: string, status: string, active: boolean }) => (
  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
     <span className={`text-[10px] font-mono font-bold uppercase ${active ? 'text-emerald-400' : 'text-slate-600'}`}>{status}</span>
  </div>
);

export default BridgeRegistry;
