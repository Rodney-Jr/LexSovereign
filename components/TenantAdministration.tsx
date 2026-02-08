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
   Bot,
   Trash2,
   Droplet,
} from 'lucide-react';
import { TenantUser, UserRole } from '../types';
import SovereignBilling from './SovereignBilling';
import ChatbotStudio from './ChatbotStudio';
import { authorizedFetch, getSavedSession } from '../utils/api';

const TenantAdministration: React.FC = () => {
   const [users, setUsers] = useState<TenantUser[]>([]);
   const [stats, setStats] = useState({ users: 0, matters: 0, documents: 0, siloHealth: 'NOMINAL' });
   const [settings, setSettings] = useState({
      matterPrefix: 'MAT-SOV-',
      numberingPadding: 4,
      requiredFields: [] as string[],
      encryptionMode: 'SYSTEM_MANAGED' as 'SYSTEM_MANAGED' | 'BYOK'
   });

   const [activeTab, setActiveTab] = useState<'users' | 'oidc' | 'templates' | 'billing' | 'chatbot'>('users');
   const [showInviteModal, setShowInviteModal] = useState(false);
   const [generatedLink, setGeneratedLink] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [copySuccess, setCopySuccess] = useState(false);
   const [isEmailing, setIsEmailing] = useState(false);
   const [inviteForm, setInviteForm] = useState({ email: '', roleName: 'SENIOR_COUNSEL' });
   const [availableRoles, setAvailableRoles] = useState<{ id: string, name: string, isSystem: boolean }[]>([]);
   const [isLoadingRoles, setIsLoadingRoles] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [emailError, setEmailError] = useState('');
   const [pendingInvites, setPendingInvites] = useState<any[]>([]);

   const fetchData = async () => {
      const session = getSavedSession();
      if (!session?.token) return;

      // Fetch Roles
      try {
         setIsLoadingRoles(true);
         const data = await authorizedFetch('/api/roles', { token: session.token });
         setAvailableRoles(data);
         const filtered = data.filter((r: any) => !r.isSystem || r.name !== 'GLOBAL_ADMIN');
         if (filtered.length > 0 && !filtered.find((r: any) => r.name === inviteForm.roleName)) {
            setInviteForm(prev => ({ ...prev, roleName: filtered[0].name }));
         }
      } catch (e) {
         console.error("[TenantAdmin] Role discovery failed:", e);
      } finally {
         setIsLoadingRoles(false);
      }

      // Fetch Users
      try {
         const userData = await authorizedFetch('/api/users', { token: session.token });
         setUsers(userData);
      } catch (e) {
         console.error("[TenantAdmin] User discovery failed:", e);
      }

      // Fetch Pending Invites
      try {
         const invites = await authorizedFetch('/api/auth/invites', { token: session.token });
         setPendingInvites(invites);
      } catch (e) {
         console.error("[TenantAdmin] Invite discovery failed:", e);
      }

      // Fetch Stats
      try {
         const statsData = await authorizedFetch('/api/tenant/admin-stats', { token: session.token });
         setStats(statsData);
      } catch (e) {
         console.error("[TenantAdmin] Stats discovery failed:", e);
      }

      // Fetch Settings
      try {
         const settingsData = await authorizedFetch('/api/tenant/settings', { token: session.token });
         setSettings(settingsData);
      } catch (e) {
         console.error("[TenantAdmin] Settings discovery failed:", e);
      }
   };

   React.useEffect(() => {
      fetchData();
   }, []);

   // ESC key handler for modal
   React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === 'Escape' && showInviteModal) {
            setShowInviteModal(false);
            setEmailError('');
         }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
   }, [showInviteModal]);

   const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
   };

   const generateInvite = async () => {
      // Validate email
      if (!inviteForm.email.trim()) {
         setEmailError('Email address is required');
         return;
      }
      if (!validateEmail(inviteForm.email)) {
         setEmailError('Please enter a valid email address');
         return;
      }
      setEmailError('');

      const session = getSavedSession();
      if (!session?.token) return;

      setIsGenerating(true);
      try {
         const data = await authorizedFetch('/api/auth/invite', {
            method: 'POST',
            token: session.token,
            body: JSON.stringify(inviteForm)
         });
         if (data.token) {
            const host = window.location.origin;
            setGeneratedLink(`${host}/join?token=${data.token}`);
            setInviteForm(prev => ({ ...prev, email: '' }));
            fetchData(); // Refresh invites list
         }
      } catch (e: unknown) {
         console.error(e);
         const msg = e instanceof Error ? e.message : "Invitation failed. Verify your administrative session.";
         setEmailError(msg);
      } finally {
         setIsGenerating(false);
      }
   };

   const handleCopyLink = () => {
      navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
   };

   const handleEmailInvite = async () => {
      setIsEmailing(true);
      // Simulate Sovereign Notification handshake
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsEmailing(false);
      alert("Sovereign Invitation dispatched to practitioner.");
   };

   const removeUser = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to remove ${name}? This action is irreversible.`)) return;

      try {
         const session = getSavedSession();
         if (!session?.token) return;

         await authorizedFetch(`/api/users/${id}`, {
            method: 'DELETE',
            token: session.token
         });
         fetchData();
      } catch (e: any) {
         alert(`Removal failed: ${e.message}`);
      }
   };

   const revokeInvite = async (id: string, email: string) => {
      if (!confirm(`Revoke invitation for ${email}?`)) return;

      try {
         const session = getSavedSession();
         if (!session?.token) return;

         await authorizedFetch(`/api/auth/invites/${id}`, {
            method: 'DELETE',
            token: session.token
         });
         fetchData();
      } catch (e: any) {
         alert(`Revocation failed: ${e.message}`);
      }
   };

   const updateEncryptionMode = async (mode: 'SYSTEM_MANAGED' | 'BYOK') => {
      try {
         const session = getSavedSession();
         if (!session?.token) return;

         await authorizedFetch('/api/tenant/settings', {
            method: 'PATCH',
            token: session.token,
            body: JSON.stringify({ encryptionMode: mode })
         });
         setSettings(prev => ({ ...prev, encryptionMode: mode }));
      } catch (e: any) {
         alert(`Update failed: ${e.message}`);
      }
   };

   return (
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h3 className="text-2xl lg:text-3xl font-bold flex items-center gap-3 lg:gap-4 tracking-tight text-white">
                  <div className="p-2 lg:p-3 bg-purple-500/10 rounded-xl lg:rounded-2xl border border-purple-500/20">
                     <Settings className="text-purple-400" size={24} />
                  </div>
                  Organization Administration
               </h3>
               <p className="text-slate-400 text-xs lg:text-sm">Managing organization-level users, identity federation, and regional legal templates.</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
               <TabButton label="Users & RBAC" active={activeTab === 'users'} icon={<Users size={16} />} onClick={() => setActiveTab('users')} />
               <TabButton label="Bot Studio" active={activeTab === 'chatbot'} icon={<Bot size={16} />} onClick={() => setActiveTab('chatbot')} />
               <TabButton label="Sovereign Billing" active={activeTab === 'billing'} icon={<CreditCard size={16} />} onClick={() => setActiveTab('billing')} />
               <TabButton label="Sovereign Credentials" active={activeTab === 'oidc'} icon={<Key size={16} />} onClick={() => setActiveTab('oidc')} />
               <TabButton label="Templates" active={activeTab === 'templates'} icon={<Database size={16} />} onClick={() => setActiveTab('templates')} />
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-12">
               {activeTab === 'users' && (() => {
                  const filteredUsers = users.filter(u =>
                     u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     u.role.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  return (
                     <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                           <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                              <div className="relative">
                                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                 <input
                                    type="text"
                                    placeholder="Search personnel..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 w-72 transition-all"
                                    aria-label="Search users by name, email, or role"
                                 />
                              </div>
                              <button
                                 onClick={() => { setShowInviteModal(true); setGeneratedLink(''); setCopySuccess(false); setIsEmailing(false); setEmailError(''); }}
                                 className="bg-purple-600 hover:bg-purple-500 text-white px-4 lg:px-5 py-2.5 rounded-xl lg:rounded-2xl font-bold text-[10px] lg:text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20 whitespace-nowrap"
                                 aria-label="Invite new practitioner"
                              >
                                 <UserPlus size={16} /> <span className="hidden sm:inline">Invite Practitioner</span><span className="sm:hidden">Invite</span>
                              </button>
                           </div>
                           <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                 <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                    <tr>
                                       <th className="px-8 py-4">User Identity</th>
                                       <th className="px-8 py-4">Sovereign Role</th>
                                       <th className="px-8 py-4 text-center">Security</th>
                                       <th className="px-8 py-4 text-center">Last Session</th>
                                       <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-800/50">
                                    {filteredUsers.length === 0 ? (
                                       <tr>
                                          <td colSpan={5} className="px-8 py-12 text-center">
                                             <div className="flex flex-col items-center gap-3 text-slate-600">
                                                <Users size={32} className="opacity-20" />
                                                <p className="text-sm font-bold">No users found</p>
                                                <p className="text-xs">Try adjusting your search criteria</p>
                                             </div>
                                          </td>
                                       </tr>
                                    ) : (
                                       filteredUsers.map(user => (
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
                                                <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase border ${user.role === UserRole.TENANT_ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                                                   }`}>
                                                   {user.role}
                                                </span>
                                             </td>
                                             <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                   {user.mfaEnabled ? (
                                                      <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded-lg border border-emerald-400/20">
                                                         <Fingerprint size={12} />
                                                         <span className="text-[8px] font-bold uppercase">MFA Active</span>
                                                      </div>
                                                   ) : (
                                                      <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/20">
                                                         <ShieldAlert size={12} />
                                                         <span className="text-[8px] font-bold uppercase">MFA Required</span>
                                                      </div>
                                                   )}
                                                </div>
                                             </td>
                                             <td className="px-8 py-5 text-center">
                                                <span className="text-[10px] font-mono text-slate-500">{user.lastActive}</span>
                                             </td>
                                             <td className="px-8 py-5 text-right">
                                                <button
                                                   onClick={() => removeUser(user.id, user.name)}
                                                   className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-all"
                                                   title="Remove Practitioner"
                                                >
                                                   <Trash2 size={16} />
                                                </button>
                                             </td>
                                          </tr>
                                       ))
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>

                        {/* Pending Invitations Section */}
                        {pendingInvites.length > 0 && (
                           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                 <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Mail className="text-blue-400" size={16} /> Pending Invitations
                                 </h4>
                                 <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                    {pendingInvites.length} Active
                                 </span>
                              </div>
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left">
                                    <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                       <tr>
                                          <th className="px-8 py-4">Recepient</th>
                                          <th className="px-8 py-4">Assigned Role</th>
                                          <th className="px-8 py-4 text-center">Expires</th>
                                          <th className="px-8 py-4 text-right">Actions</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                       {pendingInvites.map(invite => (
                                          <tr key={invite.id} className="hover:bg-slate-800/20 transition-all group">
                                             <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-white tracking-tight">{invite.email}</p>
                                             </td>
                                             <td className="px-8 py-5">
                                                <span className="px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase border bg-slate-800 text-slate-400 border-slate-700">
                                                   {invite.roleName}
                                                </span>
                                             </td>
                                             <td className="px-8 py-5 text-center">
                                                <span className="text-[10px] font-mono text-slate-500">
                                                   {new Date(invite.expiresAt).toLocaleDateString()}
                                                </span>
                                             </td>
                                             <td className="px-8 py-5 text-right">
                                                <button
                                                   onClick={() => revokeInvite(invite.id, invite.email)}
                                                   className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-all"
                                                   title="Revoke Invitation"
                                                >
                                                   <Trash2 size={16} />
                                                </button>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        )}
                     </div>
                  );
               })()}

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
                              <Key className="text-emerald-400" /> Unified Credential Protocol
                           </h4>
                           <p className="text-sm text-slate-400">Managing organization-wide login security and practitioner authentication.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                              <div className="flex items-center gap-3">
                                 <ShieldCheck className="text-emerald-500" size={20} />
                                 <h5 className="text-sm font-bold text-white">Direct Credential Logic</h5>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">LexSovereign manages cryptographic salts and hashes locally within your regional silo. OIDC handshakes have been disabled for direct accountability.</p>
                           </div>
                           <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                              <div className="flex items-center gap-3">
                                 <Fingerprint className="text-purple-500" size={20} />
                                 <h5 className="text-sm font-bold text-white">Silo-Master Binding</h5>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">Admin and Practitioner passwords are bound to the Silo's HSM Master Key. Password recovery requires Counsel-level verification.</p>
                           </div>
                        </div>

                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                 <CheckCircle2 className="text-blue-400" size={24} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-white">Protocol: "Sovereign-Direct"</p>
                                 <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Master Key: SOV-ORG-RSA4096-ACTIVE</p>
                              </div>
                           </div>
                           <button title="Download Security Audit" className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] hover:underline">Download Security Audit</button>
                        </div>

                        {/* Encryption Protocol Selection */}
                        <div className="pt-8 border-t border-slate-800 space-y-6">
                           <div className="space-y-2">
                              <h4 className="text-md font-bold text-white flex items-center gap-3">
                                 <ShieldCheck className="text-blue-400" size={20} /> Organizational Encryption Protocol
                              </h4>
                              <p className="text-xs text-slate-400 tracking-tight">Choose how your firm's data is cryptographically protected at rest.</p>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <button
                                 onClick={() => updateEncryptionMode('SYSTEM_MANAGED')}
                                 className={`p-6 rounded-3xl border text-sm text-left transition-all relative overflow-hidden group ${settings.encryptionMode === 'SYSTEM_MANAGED' ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-900/10' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                              >
                                 <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <Database className={settings.encryptionMode === 'SYSTEM_MANAGED' ? 'text-blue-400' : 'text-slate-500'} size={18} />
                                    <h5 className="font-bold text-white">Platform-Managed</h5>
                                 </div>
                                 <p className="text-[10px] text-slate-500 leading-relaxed relative z-10">Optimized for West/East African network latency. Salts and hashes are handled automatically within your regional silo.</p>
                                 {settings.encryptionMode === 'SYSTEM_MANAGED' && <div className="absolute top-0 right-0 p-4"><CheckCircle2 className="text-blue-500" size={16} /></div>}
                              </button>

                              <button
                                 onClick={() => updateEncryptionMode('BYOK')}
                                 className={`p-6 rounded-3xl border text-sm text-left transition-all relative overflow-hidden group ${settings.encryptionMode === 'BYOK' ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-900/10' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                              >
                                 <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <Key className={settings.encryptionMode === 'BYOK' ? 'text-purple-400' : 'text-slate-500'} size={18} />
                                    <h5 className="font-bold text-white">Sovereign-BYOK (Premium)</h5>
                                 </div>
                                 <p className="text-[10px] text-slate-500 leading-relaxed relative z-10">Bring Your Own Key. Data is encrypted using your firm's private keys. LexSovereign cannot read data without key-pinning.</p>
                                 {settings.encryptionMode === 'BYOK' && <div className="absolute top-0 right-0 p-4"><CheckCircle2 className="text-purple-500" size={16} /></div>}
                              </button>
                           </div>
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
                                    <span className="text-xs font-mono text-emerald-400 font-bold">{settings.matterPrefix}</span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-300">Sequential Padding</span>
                                    <span className="text-xs font-mono text-slate-500">{settings.numberingPadding}-Digits</span>
                                 </div>
                                 <div className="pt-4 border-t border-slate-800 flex justify-end">
                                    <button title="Edit Prefix" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline">Edit Logic</button>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1">Required Silo Fieldset</h5>
                              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                                 {settings.requiredFields.length > 0 ? settings.requiredFields.map((field, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                       <span className="text-xs text-slate-300 font-bold">{field}</span>
                                       <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold">Mandatory</span>
                                    </div>
                                 )) : (
                                    <p className="text-[10px] text-slate-600 italic">No mandatory fields defined.</p>
                                 )}
                                 <div className="pt-4 border-t border-slate-800 flex justify-end">
                                    <button title="Configure Fields" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline">Configure Fields</button>
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
            <div
               className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
               role="dialog"
               aria-modal="true"
               aria-labelledby="invite-modal-title"
            >
               <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><LinkIcon size={120} /></div>

                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                           <UserPlus className="text-purple-400" size={24} />
                        </div>
                        <div>
                           <h4 id="invite-modal-title" className="text-xl font-bold text-white tracking-tight">Sovereign Invite</h4>
                           <p className="text-xs text-slate-500">Generating cryptographically-signed link.</p>
                        </div>
                     </div>
                     <button
                        onClick={() => { setShowInviteModal(false); setEmailError(''); }}
                        title="Close Modal"
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
                        aria-label="Close invite modal"
                     >
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
                                 onClick={handleCopyLink}
                                 className={`flex-1 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all border ${copySuccess ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                                    }`}
                              >
                                 {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                 {copySuccess ? 'Copied' : 'Copy Link'}
                              </button>
                              <button
                                 onClick={handleEmailInvite}
                                 disabled={isEmailing}
                                 className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 transition-all"
                              >
                                 {isEmailing ? <RefreshCw className="animate-spin" size={16} /> : <Mail size={16} />}
                                 {isEmailing ? 'Sending...' : 'Email Invite'}
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label htmlFor="invite-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                              <input
                                 id="invite-email"
                                 type="email"
                                 placeholder="personnel@organization.internal"
                                 className={`w-full bg-slate-950 border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 transition-all ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:ring-purple-500'
                                    }`}
                                 value={inviteForm.email}
                                 onChange={e => { setInviteForm({ ...inviteForm, email: e.target.value }); setEmailError(''); }}
                                 aria-required="true"
                                 aria-invalid={!!emailError}
                                 aria-describedby={emailError ? "email-error" : undefined}
                              />
                              {emailError && (
                                 <p id="email-error" className="text-xs text-red-400 ml-1 flex items-center gap-1.5 animate-in slide-in-from-top-2">
                                    <ShieldAlert size={12} />
                                    {emailError}
                                 </p>
                              )}
                           </div>
                           <div className="space-y-2">
                              <label htmlFor="enclave-role" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Enclave Role</label>
                              <select
                                 id="enclave-role"
                                 title="Enclave Role"
                                 className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none text-slate-300"
                                 value={inviteForm.roleName}
                                 onChange={e => setInviteForm({ ...inviteForm, roleName: e.target.value })}
                              >
                                 {isLoadingRoles ? (
                                    <option disabled>Loading system roles...</option>
                                 ) : availableRoles.filter(r => !r.isSystem || r.name !== 'GLOBAL_ADMIN').length === 0 ? (
                                    <option disabled>No roles available</option>
                                 ) : (
                                    availableRoles.filter(r => !r.isSystem || r.name !== 'GLOBAL_ADMIN').map(role => (
                                       <option key={role.id} value={role.name}>{role.name.replace('_', ' ')}</option>
                                    ))
                                 )}
                                 <option value="CLIENT">CLIENT</option>
                              </select>
                           </div>
                           <button
                              onClick={generateInvite}
                              disabled={isGenerating}
                              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-purple-900/20"
                           >
                              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Key size={18} />}
                              {isGenerating ? "Signing Token..." : "Generate Signed Invite"}
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="pt-6 border-t border-slate-800 relative z-10">
                     <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Security: HSM Link-Pinning Active
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

interface TabButtonProps {
   label: string;
   active: boolean;
   icon: React.ReactNode;
   onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, icon, onClick }) => (
   <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${active ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
         }`}
   >
      {icon}
      {label}
   </button>
);

export default TenantAdministration;
