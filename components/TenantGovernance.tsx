
import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  Activity,
  Database,
  Zap,
  Lock,
  Server,
  TrendingUp,
  Box,
  LayoutGrid,
  HardDrive,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';
import { TenantMetadata, Region, SaaSPlan } from '../types';

const TenantGovernance: React.FC = () => {
  const [tenants, setTenants] = useState<TenantMetadata[]>([
    { id: 'T-001', name: 'Accra Partners Ltd', plan: SaaSPlan.SOVEREIGN, primaryRegion: Region.GHANA, sovereignCredits: 4200, activeMatters: 12, dataGravity: '4.2 TB' },
    { id: 'T-002', name: 'Frankfurt Finance Enclave', plan: SaaSPlan.ENCLAVE_EXCLUSIVE, primaryRegion: Region.GERMANY, sovereignCredits: 8500, activeMatters: 4, dataGravity: '12.8 TB' },
    { id: 'T-003', name: 'Standard US Corp', plan: SaaSPlan.STANDARD, primaryRegion: Region.USA, sovereignCredits: 1200, activeMatters: 45, dataGravity: '0.8 TB' }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <Globe className="text-blue-400" size={28} />
            </div>
            Global Governance Console
          </h3>
          <p className="text-slate-400 text-sm">Centralized administration for cross-regional silos and multi-tenant enclaves.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-400 transition-all"
            aria-label="Sync Tenants"
            title="Sync Tenants"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-900/20 transition-all">
            <Plus size={18} /> Provision Tenant
          </button>
        </div>
      </div>

      {/* Infrastructure Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ResourceCard label="Global Storage" value="17.8 TB" sub="Pinned Artifacts" icon={<Database className="text-blue-400" />} />
        <ResourceCard label="Compute Nodes" value="42" sub="Distributed TEEs" icon={<Server className="text-emerald-400" />} />
        <ResourceCard label="AI Throughput" value="1.4M" sub="Daily Tokens" icon={<Zap className="text-amber-400" />} />
        <ResourceCard label="Tenant Health" value="100%" sub="Silo Integrity" icon={<ShieldCheck className="text-emerald-500" />} />
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] p-8 space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <LayoutGrid size={16} /> Multi-Tenant Portfolio
            </h4>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                placeholder="Filter tenants..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> INFRA: OPTIMAL</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> DAS: READY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tenants.map(tenant => (
            <div key={tenant.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl hover:border-blue-500/40 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                <Box size={100} />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                    <HardDrive size={24} className="text-slate-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-lg tracking-tight">{tenant.name}</h5>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{tenant.id}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative z-10 py-2">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Primary Silo</p>
                  <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Globe size={14} className="text-blue-400" /> {tenant.primaryRegion}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Plan Tier</p>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border inline-block ${tenant.plan === SaaSPlan.ENCLAVE_EXCLUSIVE ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    tenant.plan === SaaSPlan.SOVEREIGN ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                    {tenant.plan}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800/50 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Sovereign Credits</span>
                  <span className="text-emerald-400">{tenant.sovereignCredits} Unit / mo</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[72%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 relative z-10">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                  <TrendingUp size={14} className="text-emerald-500" />
                  {tenant.activeMatters} Active Matters
                </div>
                <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1 group/btn">
                  Manage Silo <TrendingUp size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ label, value, sub, icon }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-slate-700 transition-all group shadow-xl">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="space-y-1">
      <h4 className="text-4xl font-bold text-white tracking-tighter">{value}</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sub}</p>
    </div>
  </div>
);

export default TenantGovernance;
