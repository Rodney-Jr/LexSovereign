
import React from 'react';
import { Layers, Database, Cpu, ShieldCheck, ArrowRight, Lock, Cloud, HardDrive, Globe, Server, Network } from 'lucide-react';

const ArchitectureMap: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-brand-sidebar/50 border border-brand-border rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 p-4">
          <span className="bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">MVP: Hybrid Egress</span>
        </div>

        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-brand-text">
          <Layers className="text-brand-primary" />
          Sovereign Logical Topology (Railway + Regional Silo)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">MVP Control Plane (Railway)</h4>
            <div className="space-y-3">
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-4">
                <Cloud className="text-blue-400 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-blue-300 text-sm">Railway Orchestrator</p>
                  <p className="text-xs text-slate-400">Hosts UI, RRE Engine, and Federated Auth. Operates as a stateless intelligence router.</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-4">
                <Network className="text-emerald-400 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-emerald-300 text-sm">Zero-Knowledge Egress</p>
                  <p className="text-xs text-slate-400">Metadata is processed on Railway; Document blobs are fetched client-side from regional storage.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-bg rounded-2xl p-6 border border-brand-border relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-brand-primary">
              <ShieldCheck size={120} />
            </div>
            <h4 className="text-xs font-bold uppercase text-brand-muted mb-6">Regional Silo (Ghana/EU)</h4>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4 justify-between">
                <div className="flex flex-col items-center">
                  <HardDrive size={24} className="text-brand-primary mb-2" />
                  <span className="text-[10px] font-mono text-brand-text">Pinned Storage</span>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="w-full h-[1px] bg-brand-border relative">
                    <div className="absolute top-1/2 left-0 w-2 h-2 bg-brand-secondary rounded-full -translate-y-1/2 animate-[ping_2s_infinite]"></div>
                  </div>
                  <span className="text-[8px] font-bold text-brand-secondary uppercase mt-2">mTLS Tunnel</span>
                </div>
                <div className="flex flex-col items-center">
                  <Database size={24} className="text-brand-muted mb-2" />
                  <span className="text-[10px] font-mono text-brand-text">Local Vault</span>
                </div>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed italic border-l-2 border-brand-primary/50 pl-3">
                "The Railway MVP uses a Split-Plane approach. Intelligence (Gemini) executes in the cloud, but the 'Legal Weight' (Documents) remains regional."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <Server className="text-blue-400 mb-4" />
          <h5 className="font-bold text-sm mb-2">Stateless API</h5>
          <p className="text-xs text-slate-400">Railway containers reset on deploy. No PII is cached in the cloud runtime.</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <Lock className="text-emerald-400 mb-4" />
          <h5 className="font-bold text-sm mb-2">Client-Side BYOK</h5>
          <p className="text-xs text-slate-400">Decryption happens in the user's browser or a local node, keeping keys off PaaS servers.</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <Globe className="text-purple-400 mb-4" />
          <h5 className="font-bold text-sm mb-2">Hybrid Residency</h5>
          <p className="text-xs text-slate-400">Metadata in US-East-1 (Railway); Legal artifacts in GH-ACC-1 (Regional S3).</p>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureMap;
