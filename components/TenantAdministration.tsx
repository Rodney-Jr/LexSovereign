
import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Key, 
  ShieldCheck, 
  Mail, 
  MoreVertical, 
  Plus, 
  Search, 
  UserPlus,
  Shield,
  Activity,
  Fingerprint,
  Lock,
  Globe,
  Database,
  Terminal,
  ShieldAlert,
  RefreshCw,
  CreditCard,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  X,
  Bot
} from 'lucide-react';
import { TenantUser, UserRole } from '../types';
import SovereignBilling from './SovereignBilling';
import ChatbotStudio from './ChatbotStudio';

const TenantAdministration: React.FC = () => {
  const [users, setUsers] = useState<TenantUser[]>([
    { id: 'u1', name: 'Kofi Mensah', email: 'k.mensah@accrapartners.gh', role: UserRole.TENANT_ADMIN, lastActive: '2m ago', mfaEnabled: true },
    { id: 'u2', name: 'Ama Serwaa', email: 'a.serwaa@accrapartners.gh', role: UserRole.INTERNAL_COUNSEL, lastActive: '1h ago', mfaEnabled: true },
    { id: 'u3', name: 'Desmond Tutu', email: 'd.tutu@accrapartners.gh', role: UserRole.LEGAL_OPS, lastActive: '2d ago', mfaEnabled: false },
    { id: 'u4', name: 'Marcus Aurelius', email: 'm.aurelius@accrapartners.gh', role: UserRole.INTERNAL_COUNSEL, lastActive: '5h ago', mfaEnabled: true },
  ]);

  const [activeTab, setActiveTab] = useState<'users' | 'oidc' | 'templates' | 'billing' | 'chatbot'>('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInvite = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedLink(`https://lexsovereign.gh/join?token=SOV-INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 tracking-tight text-white">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <Settings className="text-purple-400" size={28} />
            </div>
            Tenant Administration
          </h3>
          <p className="text-slate-400 text-sm">Managing organization-level users, identity federation, and regional legal templates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <TabButton label="Users & RBAC" active={activeTab === 'users'} icon={<Users size={16}/>} onClick={() => setActiveTab('users')} />
           <TabButton label="Bot Studio" active={activeTab === 'chatbot'} icon={<Bot size={16}/>} onClick={() => setActiveTab('chatbot')} />
           <TabButton label="Sovereign Billing" active={activeTab === 'billing'} icon={<CreditCard size={16}/>} onClick={() => setActiveTab('billing')} />
           <TabButton label="Identity Bridge" active={activeTab === 'oidc'} icon={<Key size={16}/>} onClick={() => setActiveTab('oidc')} />
           <TabButton label="Templates" active={activeTab === 'templates'} icon={<Database size={16}/>} onClick={() => setActiveTab('templates')} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12">
          {activeTab === 'users' && (
            <div className="space-y-6">
               <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                     <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search lawyers and staff..."
                          className="bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 w-72"
                        />
                     </div>
                     <button 
                      onClick={() => { setShowInviteModal(true); setGeneratedLink(''); }}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                     >
                        <UserPlus size={16} /> Invite Practitioner
                     </button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                           <tr>
                              <th className="px-8 py-4">User Identity</th>
                              <th className="px-8 py-4">Sovereign Role</th>
                              <th className="px-8 py-4 text-center">Security</th>
                              <th className="px-8 py-4 text-right">Last Session</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                           {users.map(user => (
                             <tr key={user.id} className="hover:bg-slate-800/20 transition-all group">
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-purple-400 font-bold border border-slate-700 group-hover:bg-purple-500/10 transition-colors">
                                         {user.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-white tracking-tight">{user.name}</p>
                                         <p className="text-[10px] text-slate-500 font-mono lowercase">{user.email}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-5">
                                   <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase border ${
                                     user.role === UserRole.TENANT_ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                                   }`}>
                                     {user.role}
                                   </span>
                                </td>
                                <td className="px-8 py-5">
                                   <div className="flex justify-center">
                                      {user.mfaEnabled ? (
                                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded-lg border border-emerald-400/20">
                                          <Fingerprint size={12}/>
                                          <span className="text-[8px] font-bold uppercase">MFA Active</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/20">
                                          <ShieldAlert size={12}/>
                                          <span className="text-[8px] font-bold uppercase">MFA Required</span>
                                        </div>
                                      )}
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <span className="text-[10px] font-mono text-slate-500">{user.lastActive}</span>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'chatbot' && <ChatbotStudio />}

          {activeTab === 'billing' && <SovereignBilling />}

          {activeTab === 'oidc' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Lock size={120} />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-lg font-bold text-white flex items-center gap-3">
                        <Key className="text-blue-400" /> Organization Identity Bridge
                     </h4>
                     <p className="text-sm text-slate-400">Configure Federated Authentication (OIDC) for your organization's legal enclaves.</p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Discovery Endpoint (Well-Known)</label>
                           <input 
                              type="text" 
                              value="https://idp.accrapartners.gh/.well-known/openid-configuration"
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs font-mono text-blue-400 focus:outline-none"
                              readOnly
                           />
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Client Identifier</label>
                           <input 
                              type="text" 
                              value="SOV-ACCRA-PRTNRS-991A"
                              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs font-mono text-slate-300 focus:outline-none"
                              readOnly
                           />
                        </div>
                     </div>
                     
                     <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                              <ShieldCheck className="text-emerald-400" size={24}/>
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white">Trust Chain Verified</p>
                              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">GBA-ROOT-CA-01 certificate pinned</p>
                           </div>
                        </div>
                        <button className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] hover:underline">Re-verify Handshake</button>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-800 flex justify-end">
                     <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/20 transition-all">
                        Update Identity Config
                     </button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                  <h4 className="text-lg font-bold text-white flex items-center gap-3">
                     <Database className="text-emerald-400" /> Matter Metadata Templates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1">Matter Numbering Strategy</h5>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-300">Matter Prefix</span>
                              <span className="text-xs font-mono text-emerald-400 font-bold">ACC-GH-</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-300">Sequential Padding</span>
                              <span className="text-xs font-mono text-slate-500">4-Digits (0001)</span>
                           </div>
                           <div className="pt-4 border-t border-slate-800 flex justify-end">
                              <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline">Edit Logic</button>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1">Required Silo Fieldset</h5>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-300 font-bold">Jurisdiction Pin</span>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold">Mandatory</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-300">Client Reference</span>
                              <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase font-bold">Optional</span>
                           </div>
                           <div className="pt-4 border-t border-slate-800 flex justify-end">
                              <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline">Configure Fields</button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5"><LinkIcon size={120} /></div>
              
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                       <UserPlus className="text-purple-400" size={24} />
                    </div>
                    <div>
                       <h4 className="text-xl font-bold text-white tracking-tight">Sovereign Invite</h4>
                       <p className="text-xs text-slate-500">Generating cryptographically-signed link.</p>
                    </div>
                 </div>
                 <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <div className="space-y-6 relative z-10">
                 {generatedLink ? (
                   <div className="space-y-6 animate-in slide-in-from-bottom-4">
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <LinkIcon size={12} /> Sovereign Practitioner Link
                         </p>
                         <p className="text-xs font-mono text-blue-400 break-all leading-relaxed">
                            {generatedLink}
                         </p>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={() => navigator.clipboard.writeText(generatedLink)}
                           className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all border border-slate-700"
                         >
                            <Copy size={16}/> Copy Link
                         </button>
                         <button className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all">
                            <Mail size={16}/> Email Invite
                         </button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                         <input type="email" placeholder="practitioner@firm.gh" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Enclave Role</label>
                         <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none">
                            <option>Associate Counsel</option>
                            <option>External Expert</option>
                            <option>Legal Analyst</option>
                         </select>
                      </div>
                      <button 
                        onClick={generateInvite}
                        disabled={isGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-900/20"
                      >
                         {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Key size={18}/>}
                         {isGenerating ? "Signing Token..." : "Generate Signed Invite"}
                      </button>
                   </div>
                 )}
              </div>

              <div className="pt-6 border-t border-slate-800 relative z-10">
                 <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                    <CheckCircle2 size={12}/> Security: HSM Link-Pinning Active
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ label, active, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${
      active ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default TenantAdministration;
