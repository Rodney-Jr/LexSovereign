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
   FileText,
} from 'lucide-react';
import { TenantUser, UserRole, Department } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import SovereignBilling from './SovereignBilling';
import ChatbotStudio from './ChatbotStudio';
import BrandingSettings from './BrandingSettings';
import TemplateManager from './TemplateManager';
import ComplianceRiskCenter from './ComplianceRiskCenter';
import { authorizedFetch, getSavedSession } from '../utils/api';

const TenantAdministration: React.FC = () => {
   const [users, setUsers] = useState<TenantUser[]>([]);
   const [stats, setStats] = useState({ users: 0, matters: 0, documents: 0, siloHealth: 'NOMINAL' });
   const [settings, setSettings] = useState({
      matterPrefix: 'MAT-SOV-',
      numberingPadding: 4,
      requiredFields: [] as string[],
      encryptionMode: 'SYSTEM_MANAGED' as 'SYSTEM_MANAGED' | 'BYOK',
      separationMode: 'OPEN' as 'OPEN' | 'DEPARTMENTAL' | 'STRICT'
   });

   const { setSeparationMode } = usePermissions();

   const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'billing' | 'chatbot' | 'branding' | 'access' | 'templates' | 'compliance'>('users');
   const [showInviteModal, setShowInviteModal] = useState(false);
   const [generatedLink, setGeneratedLink] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [copySuccess, setCopySuccess] = useState(false);
   const [isEmailing, setIsEmailing] = useState(false);
   const [inviteForm, setInviteForm] = useState({ email: '', roleName: 'SENIOR_COUNSEL', department: Department.INVESTIGATION });
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
      if (!generatedLink) return;
      const session = getSavedSession();
      if (!session?.token) return;

      setIsEmailing(true);
      try {
         const token = generatedLink.split('token=')[1];
         await authorizedFetch('/api/auth/dispatch-invite', {
            method: 'POST',
            token: session.token,
            body: JSON.stringify({
               token,
               email: inviteForm.email || pendingInvites.find(i => i.token === token)?.email
            })
         });
         alert("Sovereign Invitation dispatched to practitioner.");
      } catch (e: any) {
         console.error(e);
         alert(`Dispatch failed: ${e.message}`);
      } finally {
         setIsEmailing(false);
      }
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
               <TabButton label="Roles" active={activeTab === 'roles'} icon={<Shield size={16} />} onClick={() => setActiveTab('roles')} />
               <TabButton label="Access Control" active={activeTab === 'access'} icon={<ShieldCheck size={16} />} onClick={() => setActiveTab('access')} />
               <TabButton label="Bot Studio" active={activeTab === 'chatbot'} icon={<Bot size={16} />} onClick={() => setActiveTab('chatbot')} />
               <TabButton label="Branding" active={activeTab === 'branding'} icon={<Droplet size={16} />} onClick={() => setActiveTab('branding')} />
               <TabButton label="Templates" active={activeTab === 'templates'} icon={<FileText size={16} />} onClick={() => setActiveTab('templates')} />
               <TabButton label="Compliance & Risk" active={activeTab === 'compliance'} icon={<ShieldCheck size={16} />} onClick={() => setActiveTab('compliance')} />
               {import.meta.env.VITE_SHOW_PRICING === 'true' && (
                  <TabButton label="Sovereign Billing" active={activeTab === 'billing'} icon={<CreditCard size={16} />} onClick={() => setActiveTab('billing')} />
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-12">
               {activeTab === 'access' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                     <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                        <div className="space-y-2">
                           <h4 className="text-lg font-bold text-white flex items-center gap-3">
                              <ShieldCheck className="text-purple-400" /> Departmental Separation
                           </h4>
                           <p className="text-sm text-slate-400">Configure how data visibility is enforced between departments (e.g., Investigation vs. Prosecution).</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {[
                              { mode: 'OPEN', title: 'Open Collaboration', desc: 'All members can see all non-privileged matters. Best for standard law firms.' },
                              { mode: 'DEPARTMENTAL', title: 'Departmental Firewall', desc: 'Members only see matters within their assigned Department. Best for Agencies.' },
                              { mode: 'STRICT', title: 'Strict Assignment', desc: 'Members only see matters explicitly assigned to them. Zero-Trust model.' }
                           ].map((option) => (
                              <button
                                 key={option.mode}
                                 onClick={async () => {
                                    try {
                                       const session = getSavedSession();
                                       if (!session?.token) return;
                                       await authorizedFetch('/api/tenant/settings/mode', {
                                          method: 'POST',
                                          token: session.token,
                                          body: JSON.stringify({ mode: option.mode })
                                       });
                                       setSettings(prev => ({ ...prev, separationMode: option.mode as any }));
                                       setSeparationMode(option.mode as any);
                                    } catch (e: any) {
                                       alert(`Failed to update mode: ${e.message}`);
                                    }
                                 }}
                                 className={`text-left p-6 rounded-2xl border transition-all ${settings.separationMode === option.mode
                                    ? 'bg-purple-600/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] flow-root'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                                    }`}
                              >
                                 <div className="flex justify-between items-start mb-4">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.separationMode === option.mode ? 'border-purple-500' : 'border-slate-600'}`}>
                                       {settings.separationMode === option.mode && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                                    </div>
                                    {settings.separationMode === option.mode && <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Active</span>}
                                 </div>
                                 <h5 className={`font-bold mb-2 ${settings.separationMode === option.mode ? 'text-white' : 'text-slate-300'}`}>{option.title}</h5>
                                 <p className="text-xs text-slate-500 leading-relaxed">{option.desc}</p>
                              </button>
                           ))}
                        </div>

                        {settings.separationMode === 'DEPARTMENTAL' && (
                           <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                              <ShieldAlert className="text-blue-400 mt-0.5" size={20} />
                              <div>
                                 <h5 className="text-sm font-bold text-white">Partitioning Active</h5>
                                 <p className="text-xs text-slate-400 mt-1">
                                    Ensure all users are assigned a Department in the "Users" tab.
                                    Users without a department will default to Strict Mode (seeing only their own assigned matters).
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               )}

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
                                       <th className="px-8 py-4">Department</th>
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
                                                {user.department ? (
                                                   <span className="px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase border bg-slate-800 text-slate-400 border-slate-700">
                                                      {user.department}
                                                   </span>
                                                ) : (
                                                   <span className="text-[9px] text-slate-600 italic">Unassigned</span>
                                                )}
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

               {activeTab === 'roles' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                     <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                           <div className="space-y-2">
                              <h4 className="text-lg font-bold text-white flex items-center gap-3">
                                 <Shield className="text-purple-400" /> Role Governance
                              </h4>
                              <p className="text-sm text-slate-400">Manage custom roles and permissions for your organization.</p>
                           </div>
                           <button
                              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-purple-900/20 active:scale-95 transition-all"
                              title="Create New Role"
                           >
                              <Plus size={16} />
                              New Role
                           </button>
                        </div>

                        {/* Roles List */}
                        <div className="space-y-4">
                           {isLoadingRoles ? (
                              <div className="text-center py-12">
                                 <RefreshCw className="animate-spin text-purple-400 mx-auto mb-4" size={32} />
                                 <p className="text-sm text-slate-400">Loading roles...</p>
                              </div>
                           ) : availableRoles.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {availableRoles.map((role) => (
                                    <div
                                       key={role.id}
                                       className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-purple-500/30 transition-all"
                                    >
                                       <div className="flex items-start justify-between">
                                          <div className="space-y-1 flex-1">
                                             <div className="flex items-center gap-2">
                                                <h5 className="text-sm font-bold text-white">{role.name}</h5>
                                                {role.isSystem && (
                                                   <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">System</span>
                                                )}
                                             </div>
                                             <p className="text-xs text-slate-500">Role ID: {role.id}</p>
                                          </div>
                                          {!role.isSystem && (
                                             <button
                                                className="text-slate-500 hover:text-purple-400 transition-colors"
                                                title="Manage Role"
                                             >
                                                <MoreVertical size={16} />
                                             </button>
                                          )}
                                       </div>

                                       <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                                          <span className="text-[10px] text-slate-600 uppercase tracking-widest">Permissions</span>
                                          <button
                                             className="text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:underline"
                                             title="View Permissions"
                                          >
                                             View Details
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl">
                                 <Shield className="text-slate-700 mx-auto mb-4" size={48} />
                                 <p className="text-sm text-slate-400 mb-2">No custom roles defined</p>
                                 <p className="text-xs text-slate-600">Create your first role to get started</p>
                              </div>
                           )}
                        </div>

                        {/* System Roles Info */}
                        <div className="pt-6 border-t border-slate-800">
                           <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 space-y-3">
                              <div className="flex items-center gap-3">
                                 <ShieldCheck className="text-blue-400" size={20} />
                                 <h5 className="text-sm font-bold text-white">System Roles</h5>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                 System roles (TENANT_ADMIN, INTERNAL_COUNSEL) are managed by the platform and cannot be modified.
                                 Create custom roles to define specific permission sets for your organization.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'chatbot' && <ChatbotStudio />}

               {activeTab === 'branding' && <BrandingSettings />}

               {activeTab === 'templates' && <TemplateManager />}

               {activeTab === 'compliance' && <ComplianceRiskCenter />}

               {activeTab === 'billing' && import.meta.env.VITE_SHOW_PRICING === 'true' && <SovereignBilling />}
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
                                 <LinkIcon size={12} /> Sovereign {inviteForm.roleName === 'CLIENT' ? 'Client' : 'Practitioner'} Link
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

                           {/* User Type Toggle */}
                           <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
                              <button
                                 onClick={() => setInviteForm(prev => ({ ...prev, roleName: availableRoles[0]?.name || 'SENIOR_COUNSEL' }))}
                                 className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${inviteForm.roleName !== 'CLIENT' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                              >
                                 Internal Member
                              </button>
                              <button
                                 onClick={() => setInviteForm(prev => ({ ...prev, roleName: 'CLIENT' }))}
                                 className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${inviteForm.roleName === 'CLIENT' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                              >
                                 External Client
                              </button>
                           </div>

                           <div className="space-y-2">
                              <label htmlFor="invite-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                              <input
                                 id="invite-email"
                                 type="email"
                                 placeholder={inviteForm.roleName === 'CLIENT' ? "client@external.org" : "personnel@organization.internal"}
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

                           {inviteForm.roleName !== 'CLIENT' && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
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
                                 </select>
                              </div>
                           )}

                           {inviteForm.roleName !== 'CLIENT' && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-3">
                                 <label htmlFor="department-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Department</label>
                                 <select
                                    id="department-select"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none text-slate-300"
                                    value={inviteForm.department}
                                    onChange={e => setInviteForm({ ...inviteForm, department: e.target.value as Department })}
                                 >
                                    {Object.values(Department).map(dept => (
                                       <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                 </select>
                              </div>
                           )}

                           {inviteForm.roleName === 'CLIENT' && (
                              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                 <p className="text-xs text-purple-200 leading-relaxed">
                                    <strong className="block mb-1 text-purple-400">Client Portal Access</strong>
                                    Invited clients will have restricted access to the Client Portal to view shared documents and real-time status updates. They cannot access internal matters or sensitive firm data.
                                 </p>
                              </div>
                           )}

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
