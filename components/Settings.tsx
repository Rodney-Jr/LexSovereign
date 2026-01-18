
import React from 'react';
import { AppMode, UserRole } from '../types';
import { ShieldAlert, Code, Database, RefreshCw, Users, Settings as SettingsIcon, Briefcase, Link, ShieldCheck, Globe } from 'lucide-react';

interface SettingsProps {
  mode: AppMode;
  killSwitchActive: boolean;
  setKillSwitchActive: (val: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ mode, killSwitchActive, setKillSwitchActive }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-8 shadow-2xl backdrop-blur-sm">
        <div className="space-y-2 border-b border-slate-800 pb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="text-emerald-400" />
            Meta-Config Workflow Engine
          </h3>
          <p className="text-slate-400 text-sm">
            Toggled to <span className="text-emerald-400 font-bold uppercase">{mode.replace('_', ' ')}</span> mode. 
            Phase 3 Omnichannel settings are currently inherited from Firm-wide security policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Column 1: RBAC & Governance */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Briefcase size={16}/> RBAC Hierarchy
              </h4>
              <div className="space-y-3">
                {/* Fix: Changed UserRole.ADMIN to UserRole.GLOBAL_ADMIN */}
                <RoleCard role={UserRole.GLOBAL_ADMIN} access="Full System & Audit Trace" />
                <RoleCard role={UserRole.INTERNAL_COUNSEL} access="Matter View + Approval Rights" />
                <RoleCard role={UserRole.EXTERNAL_COUNSEL} access="Drafting + Redline Only" />
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <ShieldAlert size={16}/> Safety Overrides
               </h4>
               <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                <div>
                  <p className="font-bold text-white text-sm">Deterministic Lock</p>
                  <p className="text-[10px] text-slate-400">Kill-switch AI for confidence &lt; 85%</p>
                </div>
                <button 
                  onClick={() => setKillSwitchActive(!killSwitchActive)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${killSwitchActive ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${killSwitchActive ? 'left-6.5' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Phase 3 Bridge & Egress */}
          <div className="space-y-8">
            <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Link size={16}/> Phase 3: Identity Bridge
               </h4>
               <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase">OIDC Discovery URL</label>
                     <input 
                        type="text" 
                        readOnly 
                        value="https://idp.accrapartners.gh/.well-known/openid-configuration"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Signing Alg</label>
                      <div className="bg-slate-950 p-2 rounded-lg text-xs font-mono text-slate-400">RS256</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Token TTL</label>
                      <div className="bg-slate-950 p-2 rounded-lg text-xs font-mono text-slate-400">15m (Mobile)</div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <ShieldCheck size={16}/> Egress Sanitization
               </h4>
               <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-300">Strict PII Scrubbing</span>
                     <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-300">WhatsApp Proxy Pinning</span>
                     <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                     </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[9px] text-slate-500 leading-relaxed italic">
                      "Phase 3 mandates that all tokens destined for Meta endpoints traverse the Sovereign Scrubbing Proxy GH-PROXY-01."
                    </p>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Globe className="text-blue-400" size={18}/>
                 <p className="text-xs">Sovereign Silo: West Africa</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Latency: 12ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoleCard = ({ role, access }: { role: UserRole, access: string }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700 rounded-2xl hover:border-emerald-500/30 transition-colors">
    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400">
      <Users size={20} />
    </div>
    <div>
      <p className="font-bold text-sm text-white">{role}</p>
      <p className="text-[10px] text-slate-400">{access}</p>
    </div>
  </div>
);

export default Settings;
