
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Key, 
  Smartphone, 
  Lock, 
  Plus, 
  MoreVertical, 
  Power, 
  ShieldAlert,
  Server,
  CloudLightning
} from 'lucide-react';
import { IdentityProvider, MobileSession } from '../types';

const IdentityHub: React.FC = () => {
  const [providers, setProviders] = useState<IdentityProvider[]>([
    { id: 'idp_1', name: 'Azure AD (Accra Partners)', type: 'OIDC', status: 'Connected', lastSync: '2m ago', discoveryUrl: 'https://login.microsoftonline.com/accra/.well-known/openid-configuration' },
    { id: 'idp_2', name: 'Okta Enterprise', type: 'OIDC', status: 'Syncing', lastSync: '10m ago', discoveryUrl: 'https://okta.sovereign-legal.com/.well-known/openid-configuration' }
  ]);

  const [sessions, setSessions] = useState<MobileSession[]>([
    { id: 'sess_1', userId: 'Kofi Mensah', platform: 'WhatsApp', status: 'Active', sanitizationLevel: 'Strict', expiresAt: '12m' },
    { id: 'sess_2', userId: 'Ama Serwaa', platform: 'iOS', status: 'Active', sanitizationLevel: 'Metadata-Only', expiresAt: '45m' }
  ]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" />
            Identity & Auth Bridge
          </h3>
          <p className="text-slate-400 text-sm">Managing Federated Trust and Sovereign Mobile Sessions (Phase 3).</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
          <Plus size={18} /> Add Provider
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trusted IdPs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Server size={14} /> Federated Trust Providers
            </h4>
            <span className="text-[10px] text-emerald-500 font-mono">HSM-ENCLAVE: ACTIVE</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4 hover:border-slate-700 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                    <CloudLightning className="text-blue-400" size={20} />
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    p.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {p.status}
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-white">{p.name}</h5>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{p.discoveryUrl}</p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><RefreshCw size={10} /> {p.lastSync}</span>
                  <span className="font-bold">{p.type} 2.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signing Node Status */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
           <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
             <Key size={14}/> Signer Enclave (HSM)
           </h4>
           
           <div className="space-y-6">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-500">ACCRA-GH-HSM-1</span>
                    <span className="text-[10px] font-mono text-emerald-400">99.9% HP</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[94%]"></div>
                 </div>
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Signings</p>
                 <div className="space-y-2">
                    <SigningLog label="JWT.Sovereign.Partner" time="12s ago" />
                    <SigningLog label="JWT.Sovereign.Admin" time="45s ago" />
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                 <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                   Rotate Master Keys
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Active Mobile Sessions */}
      <div className="space-y-6">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 px-2">
          <Smartphone size={14} /> Active Mobile Sessions
        </h4>
        
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
           <table className="w-full text-left">
              <thead className="bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Platform</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Policy</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Expires</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
                          <Lock size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-200">{s.userId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <Smartphone size={12} className="text-blue-400"/>
                        {s.platform}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-0.5 rounded border border-purple-500/20 bg-purple-500/10 text-purple-400 text-[9px] font-bold uppercase">
                        {s.sanitizationLevel}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-slate-500">
                      {s.expiresAt}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded-lg transition-all">
                          <Power size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem] flex items-start gap-5">
        <ShieldAlert className="text-amber-500 shrink-0" size={24} />
        <div className="space-y-1">
          <h5 className="font-bold text-xs text-amber-400 uppercase tracking-widest">Phase 3 Security Protocol</h5>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            All mobile sessions are signed with a <strong>Unique Enclave Key</strong>. Revoking a session here immediately invalidates the JWT across all regional clusters via the 
            <strong> Sovereign Revocation Sync</strong> (SRS).
          </p>
        </div>
      </div>
    </div>
  );
};

const SigningLog = ({ label, time }: { label: string, time: string }) => (
  <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
     <span className="text-[9px] font-mono text-slate-400">{label}</span>
     <span className="text-[8px] font-mono text-emerald-500">{time}</span>
  </div>
);

export default IdentityHub;
