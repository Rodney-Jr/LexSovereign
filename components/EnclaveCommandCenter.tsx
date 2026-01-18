
import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  HardDrive, 
  RefreshCw, 
  ShieldAlert, 
  Thermometer, 
  Database, 
  Box, 
  Network,
  Lock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { EnclaveNode, EnclaveStatus, LocalModel } from '../types';

const EnclaveCommandCenter: React.FC = () => {
  const [isIsolated, setIsIsolated] = useState(true);
  const [nodes, setNodes] = useState<EnclaveNode[]>([
    { id: 'ENC-NODE-01', status: EnclaveStatus.ISOLATED, cpuLoad: 42, gpuLoad: 78, temp: 64, uptime: '142d 04h' },
    { id: 'ENC-NODE-02', status: EnclaveStatus.ISOLATED, cpuLoad: 12, gpuLoad: 0, temp: 42, uptime: '142d 04h' }
  ]);

  const [localModels] = useState<LocalModel[]>([
    { id: 'm1', name: 'Llama-3-Sovereign-Legal', version: 'v1.4.2', hash: 'SHA256: 8a2f...1e33', lastLoaded: '4h ago', parameterCount: '70B', quantization: '4-bit GGUF' },
    { id: 'm2', name: 'Mistral-Law-Encoder', version: 'v0.9.1', hash: 'SHA256: 41c2...b992', lastLoaded: '2d ago', parameterCount: '7B', quantization: 'FP16' }
  ]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Box className="text-blue-400" />
            </div>
            Air-Gap Command Center
          </h3>
          <p className="text-slate-400 text-sm">Managing physically isolated Sovereign Inference Enclaves (Phase 4).</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
           <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isIsolated ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/10' : 'text-slate-500'}`}>
              <Lock size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Isolated</span>
           </div>
           <button 
             onClick={() => setIsIsolated(!isIsolated)}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${!isIsolated ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/10' : 'text-slate-500 hover:text-slate-300'}`}
           >
              <RefreshCw size={16} className={!isIsolated ? 'animate-spin' : ''} />
              <span className="text-xs font-bold uppercase tracking-widest">Sync Port</span>
           </button>
        </div>
      </div>

      {/* Hardware Fleet Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {nodes.map(node => (
          <div key={node.id} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all"></div>
            
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                     <Server className="text-slate-400" size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-white tracking-tight">{node.id}</h4>
                     <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Node Uptime: {node.uptime}</p>
                  </div>
               </div>
               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 {node.status}
               </span>
            </div>

            <div className="grid grid-cols-3 gap-6">
               <StatItem label="CPU Load" value={`${node.cpuLoad}%`} icon={<Cpu size={14}/>} color="blue" />
               <StatItem label="GPU Inference" value={`${node.gpuLoad}%`} icon={<Zap size={14}/>} color="emerald" />
               <StatItem label="Thermal" value={`${node.temp}°C`} icon={<Thermometer size={14}/>} color="amber" />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/50">
               <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Memory Pressure (ECC-RAM)</span>
                  <span className="text-slate-300">18.4GB / 128GB</span>
               </div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[14%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Local Model Registry */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Database size={14} /> Local Model Registry (Phase 4)
            </h4>
            <div className="flex items-center gap-4">
               <span className="text-[10px] text-blue-400 font-mono">HASH-VERIFY: ENABLED</span>
               <span className="text-[10px] text-emerald-500 font-mono">ENCLAVE-CACHE: READY</span>
            </div>
         </div>

         <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left">
               <thead className="bg-slate-800/50 border-b border-slate-800">
                  <tr>
                     <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Model Artifact</th>
                     <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Params / Quant</th>
                     <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Sovereign Hash</th>
                     <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {localModels.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-all group">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-all border border-slate-700">
                                <Cpu size={16} className="text-emerald-400" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white">{m.name}</p>
                                <p className="text-[10px] text-slate-500">{m.version}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase">{m.parameterCount}</span>
                             <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400 text-[9px] font-bold uppercase">{m.quantization}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-[10px] font-mono text-slate-500">{m.hash}</span>
                       </td>
                       <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-emerald-400 uppercase">
                             <CheckCircle2 size={12}/> Loaded {m.lastLoaded}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Isolation Protocol Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem] flex items-start gap-4">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <div>
               <h5 className="font-bold text-xs text-amber-400 uppercase tracking-widest">Air-Gap Policy</h5>
               <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                 Phase 4 mode prohibits any external API calls. All inference is strictly routed to local enclaves.
               </p>
            </div>
         </div>
         <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] flex items-start gap-4">
            <Network className="text-blue-500 shrink-0" size={20} />
            <div>
               <h5 className="font-bold text-xs text-blue-400 uppercase tracking-widest">Data Hand-off</h5>
               <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                 Sync status: <strong className="text-blue-300">BLOCKED</strong>. Manual encrypted blob export required for remote auditing.
               </p>
            </div>
         </div>
         <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem] flex items-start gap-4">
            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
            <div>
               <h5 className="font-bold text-xs text-emerald-400 uppercase tracking-widest">Tamper Detection</h5>
               <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                 Chassis integrity verified. Physical root-of-trust active across all Sovereign Enclaves.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon, color }: any) => {
  const colorMap: any = {
    blue: 'text-blue-400 bg-blue-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    amber: 'text-amber-400 bg-amber-400/10'
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
};

export default EnclaveCommandCenter;
