
import React, { useState } from 'react';
import {
   Globe,
   ShieldCheck,
   Cpu,
   Zap,
   Activity,
   Lock,
   Server,
   Database,
   Users,
   TrendingUp,
   ShieldAlert,
   RefreshCw,
   LayoutGrid,
   ChevronRight,
   Monitor,
   Network,
   CloudLightning,
   Fingerprint,
   Plus,
   PlusCircle,
   Key,
   Terminal,
   UserPlus,
   MoreVertical,
   ShieldQuestion,
   MessageSquare,
   EyeOff
} from 'lucide-react';
import { Region, GlobalAdminIdentity } from '../types';
import { ProvisionTenantModal } from './ProvisionTenantModal';
import { ProvisionAdminModal } from './ProvisionAdminModal';
import { LegalRepositoryTab } from './LegalRepositoryTab';
import { TenantManagementModal } from './TenantManagementModal';
import { ClauseManagementTab } from './ClauseManagementTab';
import { authorizedFetch } from '../utils/api';

interface GlobalControlPlaneProps {
   userName: string;
   userRole?: string;
   onNavigate?: (tab: string) => void;
}

const GlobalControlPlane: React.FC<GlobalControlPlaneProps> = ({ userName, userRole, onNavigate }) => {
   const [activeTab, setActiveTab] = useState<'telemetry' | 'admins' | 'tenants' | 'ai-registry' | 'leads' | 'conversations' | 'repository' | 'clauses'>('telemetry');
   const [globalStatus, setGlobalStatus] = useState('NOMINAL');
   const [isSyncing, setIsSyncing] = useState(false);
   const [showProvisionModal, setShowProvisionModal] = useState(false);
   const [showAdminModal, setShowAdminModal] = useState(false);
   const [managingTenant, setManagingTenant] = useState<{ id: string, name: string } | null>(null);
   const [stats, setStats] = useState<any>({
      tenants: 0,
      matters: 0,
      documents: 0,
      silos: 0,
      margin: '0%',
      egress: 'Checking...',
      systemHealth: 100
   });

   const [platformAdmins, setPlatformAdmins] = useState<GlobalAdminIdentity[]>([]);
   const [regionalSilos, setRegionalSilos] = useState<any[]>([]);
   const [auditLogs, setAuditLogs] = useState<any[]>([]);
   const [conversations, setConversations] = useState<any[]>([]);

   React.useEffect(() => {
      const fetchPlatformData = async () => {
         try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';

            // Parallel fetch for all platform signals including conversations
            const [statsData, adminData, siloData, logData, conversationsData] = await Promise.all([
               authorizedFetch('/api/platform/stats', { token }),
               authorizedFetch('/api/platform/admins', { token }),
               authorizedFetch('/api/platform/tenants', { token }),
               authorizedFetch('/api/platform/audit-logs', { token }),
               authorizedFetch('/api/chat-conversations', { token })
            ]);

            if (!statsData.error) setStats(statsData);
            if (Array.isArray(adminData)) setPlatformAdmins(adminData);
            if (Array.isArray(siloData)) setRegionalSilos(siloData);
            if (Array.isArray(logData)) setAuditLogs(logData);
            if (Array.isArray(conversationsData)) setConversations(conversationsData);

         } catch (e) {
            console.error("Failed to fetch platform telemetry", e);
         }
      };

      fetchPlatformData();
      const interval = setInterval(fetchPlatformData, 30000); // Polling every 30s
      return () => clearInterval(interval);
   }, []);

   const handleGlobalSync = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
   };

   return (
      <div className="space-y-10 animate-in fade-in duration-700 pb-24">
         {/* Platform Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
            <div className="space-y-1">
               <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                     <Globe className="text-cyan-400" size={28} />
                  </div>
                  Sovereign Control Plane
               </h3>
               <p className="text-slate-400 text-sm">Platform Integrity Monitor | Authenticated: <span className="text-cyan-400 font-bold">{userName}</span></p>
            </div>
            <div className="flex items-center gap-4">
               <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex gap-1">
                  <button
                     onClick={() => setActiveTab('telemetry')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'telemetry' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Telemetry
                  </button>
                  <button
                     onClick={() => setActiveTab('admins')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'admins' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Admin Fleet
                  </button>
                  <button
                     onClick={() => setActiveTab('tenants')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'tenants' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Tenants
                  </button>
                  <button
                     onClick={() => setActiveTab('ai-registry')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'ai-registry' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     AI Registry
                  </button>
                  <button
                     onClick={() => setActiveTab('leads')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'leads' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Leads
                  </button>
                  <button
                     onClick={() => setActiveTab('conversations')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'conversations' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Conversations
                  </button>
                  <button
                     onClick={() => setActiveTab('clauses')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'clauses' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Clause Library
                  </button>
                  <button
                     onClick={() => setActiveTab('repository')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'repository' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Judicial Ingestion Hub
                  </button>
                  {import.meta.env.VITE_SHOW_PRICING === 'true' && (
                     <button
                        onClick={() => onNavigate?.('pricing-calib')}
                        className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all text-slate-500 hover:text-cyan-400 border border-transparent hover:border-cyan-500/30 hover:bg-cyan-500/10"
                     >
                        Pricing
                     </button>
                  )}
               </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
               <button
                  onClick={() => setShowProvisionModal(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-cyan-900/20 active:scale-95"
               >
                  <PlusCircle size={18} /> Deploy Sovereign Silo
               </button>
               <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${(stats.systemHealth || 100) >= 90 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform: {(stats.systemHealth || 100) >= 90 ? 'NOMINAL' : 'DEGRADED'}</span>
               </div>
            </div>
         </div>

         {/* Render Modals */}
         {showProvisionModal && (
            <ProvisionTenantModal onClose={() => setShowProvisionModal(false)} />
         )}

         {managingTenant && (
            <TenantManagementModal 
               tenantId={managingTenant.id} 
               tenantName={managingTenant.name} 
               onClose={() => setManagingTenant(null)} 
            />
         )}

         {showAdminModal && (
            <ProvisionAdminModal
               onClose={() => setShowAdminModal(false)}
               onSuccess={() => {
                  const sessionData = localStorage.getItem('nomosdesk_session');
                  const token = sessionData ? JSON.parse(sessionData).token : '';
                  authorizedFetch('/api/platform/admins', { token }).then(data => {
                     if (Array.isArray(data)) setPlatformAdmins(data);
                  });
               }}
            />
         )}

         {/* Content Switcher */}
         {activeTab === 'telemetry' && (
            <>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <GlobalMetric label="Total Sovereign Tenants" value={stats.tenants || 0} sub="+12 this month" icon={<Users className="text-blue-400" />} />
                  <GlobalMetric label="Infrastructure Margin" value={stats.margin || '0%'} sub="Target: 65.0%" icon={<TrendingUp className="text-emerald-400" />} />
                  <GlobalMetric label="Active Compute Silos" value={stats.silos || 0} sub="Global TEE instances" icon={<Cpu className="text-purple-400" />} />
                  <GlobalMetric label="Cross-Border Egress" value={stats.egress || 'Active'} sub="Policy Enforcement: 100%" icon={<ShieldCheck className="text-cyan-400" />} />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8 space-y-6">
                     <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Network size={14} /> Regional Silo Topography
                        </h4>
                        <span className="text-[10px] text-cyan-500 font-mono">LATENCY_PROTOCOL: GEEK_STREAMS_v2</span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {regionalSilos.map(silo => (
                           <div key={silo.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                                 <Globe size={80} />
                              </div>
                              <div className="flex items-center justify-between relative z-10 mb-6">
                                 <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                                       <CloudLightning className="text-cyan-400" size={20} />
                                    </div>
                                    <div>
                                       <h5 className="font-bold text-white tracking-tight">{silo.name}</h5>
                                       <p className="text-[10px] text-slate-500 font-mono">{silo.id}</p>
                                    </div>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${silo.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                    {silo.status}
                                 </span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4">
                                 <div className="text-center">
                                    <p className="text-sm font-bold text-white">{silo.nodes}</p>
                                    <p className="text-[8px] text-slate-500 uppercase">Nodes</p>
                                 </div>
                                 <div className="text-center border-x border-slate-800">
                                    <p className="text-sm font-bold text-cyan-400">{silo.latency}</p>
                                    <p className="text-[8px] text-slate-500 uppercase">Latency</p>
                                 </div>
                                 <div className="text-center">
                                    <p className="text-sm font-bold text-emerald-400">{silo.health}%</p>
                                    <p className="text-[8px] text-slate-500 uppercase">Health</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>

                     <LiveModelRegistryWidget stats={stats} />
                  </div>

                  <div className="lg:col-span-4 space-y-6 sticky top-24">
                     <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                           <ShieldAlert size={16} className="text-red-400" /> Security Command
                        </h4>

                        <div className="space-y-6">
                           <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between">
                                 <span className="text-xs font-bold text-white">Platform-Wide Lock</span>
                                 <div className="w-10 h-5 bg-slate-800 rounded-full relative cursor-pointer">
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-500 rounded-full"></div>
                                 </div>
                              </div>
                              <p className="text-[9px] text-slate-500 italic">Disables all non-local inference enclaves globally. Use in event of major Cloud-IdP breach.</p>
                           </div>

                           <div className="space-y-4">
                              <p className="text-[10px] font-bold text-slate-500 uppercase px-1">Global Audit Pulse</p>
                              <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[9px] h-40 overflow-y-auto space-y-2 border border-slate-900 scrollbar-hide">
                                 {auditLogs.length > 0 ? (
                                    auditLogs.map(log => (
                                       <p key={log.id} className="text-cyan-500/80 leading-tight">
                                          <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.action}: {log.user?.name || 'System'}
                                       </p>
                                    ))
                                 ) : (
                                    <p className="text-slate-600 italic">Listening for system signals...</p>
                                 )}
                              </div>
                           </div>

                           <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-cyan-900/20">
                              Sovereign Report (Board Level)
                           </button>

                           <a 
                              href="/NomosDesk_Staff_Training_Manual.pdf" 
                              download="NomosDesk_Staff_Training_Manual.pdf"
                              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all text-center block mt-4"
                           >
                              Download Staff Training Manual (PDF)
                           </a>
                        </div>
                     </div>

                     <div className="bg-cyan-500/5 border border-cyan-500/10 p-6 rounded-[2.5rem] flex items-start gap-4">
                        <Monitor className="text-cyan-400 shrink-0" size={24} />
                        <div className="space-y-1">
                           <h5 className="font-bold text-xs text-cyan-300 uppercase tracking-widest">Control Plane Isolation</h5>
                           <p className="text-[10px] text-slate-400 leading-relaxed italic">
                              "The Platform Owner Plane is physically isolated from Tenant Data. Metadata-only aggregation is enforced via ZK-Rollups."
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </>
         )}

         {activeTab === 'admins' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-right-4 duration-500">
               <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-cyan-400" /> Platform Admin Fleet
                     </h4>
                     <button
                        onClick={() => setShowAdminModal(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                     >
                        <UserPlus size={14} /> Provision Platform Admin
                     </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                     <table className="w-full text-left">
                        <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                           <tr>
                              <th className="px-8 py-5">Identity Hash</th>
                              <th className="px-8 py-5">Hardware Enclave</th>
                              <th className="px-8 py-5">Verification</th>
                              <th className="px-8 py-5 text-right">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                           {platformAdmins.map(admin => (
                              <tr key={admin.id} className="hover:bg-slate-800/20 transition-all group">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 font-bold border border-slate-700">
                                          <Fingerprint size={20} />
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-white">{admin.name}</p>
                                          <p className="text-[10px] text-slate-500 font-mono">{admin.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                       <Lock size={12} className="text-slate-500" />
                                       <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{admin.hardwareEnclaveId}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="px-2.5 py-1 rounded-xl bg-cyan-500/5 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold uppercase">
                                       {admin.mfaMethod}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                       <div className="text-right">
                                          <p className={`text-[10px] font-bold uppercase ${admin.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>{admin.status}</p>
                                          <p className="text-[8px] text-slate-600 font-mono">{admin.lastHandshake}</p>
                                       </div>
                                       <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-600 transition-all" aria-label="Admin options">
                                          <MoreVertical size={16} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                     <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <ShieldQuestion size={16} className="text-amber-500" /> Administrative Constraints
                        </h5>
                        <ul className="space-y-3">
                           <li className="flex items-start gap-3">
                              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              </div>
                              <p className="text-[11px] text-slate-400"><strong>Blind-fold Enforcement:</strong> Binary document access is mathematically prohibited for platform roles.</p>
                           </li>
                           <li className="flex items-start gap-3">
                              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              </div>
                              <p className="text-[11px] text-slate-400"><strong>Telemetry Only:</strong> Platform Admins can only see metadata traces and resource usage heatmaps.</p>
                           </li>
                        </ul>
                     </div>

                     <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Key size={16} className="text-purple-400" /> Multi-Sig Authority
                        </h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                           "Critical platform actions, such as global Silo migration or Master Root Key rotation, require <strong>2/3 M-of-N</strong> hardware signatures from the Platform Admin Fleet."
                        </p>
                        <button className="w-full py-3 bg-slate-950 border border-slate-800 hover:border-purple-500/30 text-slate-400 hover:text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all">
                           Initiate Multi-Sig Handshake
                        </button>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-6 sticky top-24">
                  <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                     <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
                           <Terminal size={16} /> Fleet Authority Trace
                        </h4>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[10px] font-mono text-slate-500 uppercase">ZK-Handshake: LIVE</span>
                        </div>
                     </div>

                     <div className="bg-black/60 rounded-2xl p-5 font-mono text-[10px] h-[400px] overflow-y-auto border border-cyan-900/20 scrollbar-hide space-y-2 shadow-inner">
                        {auditLogs.map((log, i) => (
                           <p key={log.id} className={`${i === 0 ? 'text-emerald-400' : 'text-cyan-500/80'}`}>
                              &gt; {new Date(log.timestamp).toISOString()} | {log.action} | {log.user?.email || 'SYSTEM'}
                           </p>
                        ))}
                        {auditLogs.length === 0 && <p className="text-slate-600">&gt; No recent activity traces found.</p>}
                     </div>

                     <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                              <EyeOff size={14} /> Zero-Knowledge Guarantee
                           </p>
                           <button
                              onClick={() => setShowProvisionModal(true)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-2"
                           >
                              <PlusCircle size={12} /> Provision Tenant
                           </button>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                           Platform Admins have zero visibility into legal artifact contents. All access is scoped to the infrastructure plane.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'tenants' && <TenantsTab onManage={setManagingTenant} />}

         {activeTab === 'leads' && <LeadsTab />}

         {activeTab === 'ai-registry' && <GlobalModelRegistry />}

         {activeTab === 'conversations' && <ConversationsTab conversations={conversations} />}

         {activeTab === 'repository' && <LegalRepositoryTab userRole={userRole} />}

         {activeTab === 'clauses' && <ClauseManagementTab />}
      </div>
   );
};

const TenantsTab = ({ onManage }: { onManage: (tenant: any) => void }) => {
   const [tenants, setTenants] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const fetchTenants = async () => {
      setLoading(true);
      try {
         const sessionData = localStorage.getItem('nomosdesk_session');
         const token = sessionData ? JSON.parse(sessionData).token : '';
         const data = await authorizedFetch('/api/platform/tenants', { token });
         if (Array.isArray(data)) setTenants(data);
      } catch (e) {
         console.error("Failed to fetch tenants", e);
      } finally {
         setLoading(false);
      }
   };

   React.useEffect(() => {
      fetchTenants();
   }, []);

   const handleToggleStatus = async (id: string, currentStatus: string) => {
      const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      try {
         const sessionData = localStorage.getItem('nomosdesk_session');
         const token = sessionData ? JSON.parse(sessionData).token : '';
         await authorizedFetch(`/api/platform/tenants/${id}/status`, {
            method: 'PATCH',
            token,
            body: JSON.stringify({ status: nextStatus })
         });
         setTenants(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
      } catch (e) {
         console.error("Failed to update status", e);
      }
   };

   const handleDecommission = async (id: string) => {
      if (!window.confirm("ARE YOU SURE? This will decommission the sovereign enclave and mark the tenant as DELETED.")) return;
      try {
         const sessionData = localStorage.getItem('nomosdesk_session');
         const token = sessionData ? JSON.parse(sessionData).token : '';
         await authorizedFetch(`/api/platform/tenants/${id}`, {
            method: 'DELETE',
            token
         });
         setTenants(prev => prev.map(t => t.id === id ? { ...t, status: 'DELETED' } : t));
      } catch (e) {
         console.error("Failed to decommission", e);
      }
   };

   if (loading) return (
      <div className="flex items-center justify-center h-64">
         <RefreshCw size={28} className="animate-spin text-cyan-400" />
      </div>
   );

   return (
      <div className="grid grid-cols-1 gap-10 animate-in slide-in-from-right-4 duration-500">
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-cyan-400" /> Sovereign Tenant Fleet
               </h4>
               <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                  {tenants.length} Enclave{tenants.length !== 1 ? 's' : ''} Provisioned
               </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <table className="w-full text-left">
                  <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                     <tr>
                        <th className="px-8 py-5">Tenant Enclave</th>
                        <th className="px-8 py-5">Geography</th>
                        <th className="px-8 py-5">Metrics</th>
                        <th className="px-8 py-5">Provisioned</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                     {tenants.map(tenant => (
                        <tr key={tenant.id} className="hover:bg-slate-800/20 transition-all group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 font-bold border border-slate-700">
                                    <Server size={20} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white">{tenant.name}</p>
                                    <p className="text-[9px] text-slate-500 font-mono tracking-tighter">{tenant.id}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <Globe size={12} className="text-slate-500" />
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tenant.primaryRegion}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-6">
                                 <div>
                                    <p className="text-xs font-bold text-white">{tenant.userCount}</p>
                                    <p className="text-[8px] text-slate-500 uppercase">Users</p>
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-white">{tenant.activeMatters}</p>
                                    <p className="text-[8px] text-slate-500 uppercase">Matters</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-cyan-400">{tenant.plan}</p>
                                    <p className="text-[8px] text-slate-500 uppercase">Plan</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-bold text-slate-300">
                                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'Legacy'}
                                 </span>
                                 <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleTimeString() : ''}
                                 </span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-3">
                                 <div className="text-right mr-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${tenant.status === 'ACTIVE'
                                       ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                       : tenant.status === 'DELETED'
                                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                       }`}>
                                       {tenant.status}
                                    </span>
                                 </div>
                                 {tenant.status !== 'DELETED' && (
                                    <>
                                       <button
                                          onClick={() => onManage(tenant)}
                                          className="px-3 py-1.5 bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-xl text-[9px] font-bold uppercase transition-all"
                                       >
                                          Manage
                                       </button>
                                       <button
                                          onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                                          className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all border ${tenant.status === 'ACTIVE'
                                             ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'
                                             : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                             }`}
                                       >
                                          {tenant.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                                       </button>
                                       <button
                                          onClick={() => handleDecommission(tenant.id)}
                                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-bold uppercase transition-all"
                                       >
                                          Decommission
                                       </button>
                                    </>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))}
                     {tenants.length === 0 && (
                        <tr>
                           <td colSpan={4} className="px-8 py-10 text-center text-slate-500 italic text-sm">No sovereign tenants provisioned yet.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

const ConversationsTab = ({ conversations }: { conversations: any[] }) => {
   const [expandedSession, setExpandedSession] = useState<string | null>(null);

   const sessionGroups = conversations.reduce((acc: any, conv: any) => {
      if (!acc[conv.sessionId]) {
         acc[conv.sessionId] = {
            sessionId: conv.sessionId,
            visitorName: conv.visitorName,
            visitorEmail: conv.visitorEmail,
            messages: conv.messages || [],
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            lastMessage: conv.updatedAt
         };
      }
      return acc;
   }, {});

   const sessions = Object.values(sessionGroups).sort((a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
   );

   return (
      <div className="grid grid-cols-1 gap-10 animate-in slide-in-from-right-4 duration-500">
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} className="text-purple-400" /> Marketing Chatbot Conversations
               </h4>
               <div className="text-slate-500 text-xs">
                  {sessions.length} session{sessions.length !== 1 ? 's' : ''}
               </div>
            </div>

            <div className="space-y-4">
               {sessions.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 text-center">
                     <MessageSquare size={48} className="text-slate-700 mx-auto mb-4" />
                     <p className="text-slate-500 text-sm">No chatbot conversations yet.</p>
                     <p className="text-slate-600 text-xs mt-2">Conversations from the marketing website will appear here.</p>
                  </div>
               ) : (
                  sessions.map((session: any) => (
                     <div
                        key={session.sessionId}
                        className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-slate-700 transition-all"
                     >
                        <div
                           className="p-6 cursor-pointer hover:bg-slate-800/30 transition-all"
                           onClick={() => setExpandedSession(expandedSession === session.sessionId ? null : session.sessionId)}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <MessageSquare size={24} className="text-purple-400" />
                                 </div>
                                 <div>
                                    <h5 className="text-white font-bold text-sm">
                                       {session.visitorName || `Session ${session.sessionId.slice(-8)}`}
                                    </h5>
                                    <p className="text-slate-500 text-xs font-mono mt-1">
                                       {session.visitorEmail || `${session.messages.length} message${session.messages.length !== 1 ? 's' : ''}`}
                                    </p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-slate-400 text-xs">
                                    {new Date(session.lastMessage).toLocaleDateString()}
                                 </p>
                                 <p className="text-slate-600 text-xs font-mono">
                                    {new Date(session.lastMessage).toLocaleTimeString()}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {expandedSession === session.sessionId && (
                           <div className="border-t border-slate-800 bg-slate-950 p-6 space-y-3">
                              {session.messages.map((msg: any, idx: number) => (
                                 <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                 >
                                    <div
                                       className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                          ? 'bg-purple-600 text-white'
                                          : 'bg-slate-800 text-slate-200'
                                          }`}
                                    >
                                       <p className="text-sm">{msg.content}</p>
                                       <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-purple-200 opacity-70' : 'text-slate-500'
                                          }`}>
                                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                                       </p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
};

const LeadsTab = () => {
   const [leads, setLeads] = useState<any[]>([]);

   React.useEffect(() => {
      const fetchLeads = async () => {
         try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';
            const data = await authorizedFetch('/api/leads', { token });
            if (Array.isArray(data)) setLeads(data);
         } catch (e) {
            console.error("Failed to fetch leads", e);
         }
      };
      fetchLeads();
   }, []);

   const updateStatus = async (id: string, status: string) => {
      try {
         const sessionData = localStorage.getItem('nomosdesk_session');
         const token = sessionData ? JSON.parse(sessionData).token : '';
         await authorizedFetch(`/api/leads/${id}/status`, {
            method: 'PATCH',
            token,
            body: JSON.stringify({ status })
         });
         setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
      } catch (e) {
         console.error("Failed to update status", e);
      }
   };

   return (
      <div className="grid grid-cols-1 gap-10 animate-in slide-in-from-right-4 duration-500">
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <UserPlus size={14} className="text-emerald-400" /> Demo Requests (Leads)
               </h4>
               <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-white transition-colors" title="Reload Leads">
                  <RefreshCw size={14} />
               </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <table className="w-full text-left">
                  <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                     <tr>
                        <th className="px-8 py-5">Contact</th>
                        <th className="px-8 py-5">Company</th>
                        <th className="px-8 py-5">Source</th>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                     {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-800/20 transition-all group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700">
                                    <Users size={20} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white">{lead.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{lead.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-slate-300 font-bold text-xs">{lead.company || '--'}</span>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold uppercase">
                                 {lead.source}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-[10px] font-mono text-slate-500">
                                 {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <select
                                    value={lead.status}
                                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-xs font-bold uppercase rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
                                    title="Update Lead Status"
                                 >
                                    <option value="NEW">NEW</option>
                                    <option value="CONTACTED">CONTACTED</option>
                                    <option value="CONVERTED">CONVERTED</option>
                                    <option value="ARCHIVED">ARCHIVED</option>
                                 </select>
                              </div>
                           </td>
                        </tr>
                     ))}
                     {leads.length === 0 && (
                        <tr>
                           <td colSpan={5} className="text-center py-10 text-slate-500 text-sm">No leads yet.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

const GlobalMetric = ({ label, value, sub, icon }: any) => (
   <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-700 transition-all group">
      <div className="flex items-center justify-between mb-4">
         <div className="p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform shadow-inner">
            {icon}
         </div>
         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sub}</span>
      </div>
      <div className="space-y-1">
         <h4 className="text-3xl font-bold text-white tracking-tighter">{value}</h4>
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
      </div>
   </div>
);

const LiveModelRegistryWidget = ({ stats }: { stats: any }) => {
   const isOpenRouter = (stats.activeAiProvider || 'openrouter') === 'openrouter';
   return (
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
         <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Database size={16} className="text-purple-400" /> Global Model Registry
            </h4>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isOpenRouter ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
               <span className="text-[9px] font-mono text-slate-400 uppercase">{stats.activeAiProvider || 'openrouter'}</span>
            </div>
         </div>

         <div className="flex items-center gap-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
               <Zap size={18} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-white">OpenRouter <span className="text-purple-400">· Active Default</span></p>
               <p className="text-[10px] text-slate-500 font-mono truncate">{stats.activeAiModel || 'google/gemini-2.0-flash-001'}</p>
            </div>
            <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-full border border-emerald-400/10 uppercase">LIVE</span>
         </div>

         <div className="space-y-2">
            {[
               { name: 'Gemini Pro 1.5', tier: 'Primary', color: 'blue' },
               { name: 'Mistral 7B Instruct', tier: 'Fast', color: 'green' },
               { name: 'Claude 3.5 Sonnet', tier: 'Premium', color: 'orange' },
               { name: 'OpenAI GPT-4o Mini', tier: 'Standard', color: 'slate' },
               { name: 'GPT-4o', tier: 'Premium', color: 'cyan' },
               { name: 'Llama 3.1 70B', tier: 'Open', color: 'yellow' },
               { name: 'DeepSeek R1', tier: 'Open', color: 'pink' },
            ].map(m => (
               <div key={m.name} className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl hover:border-purple-500/30 transition-all">
                  <span className="text-[11px] text-slate-300 font-medium">{m.name}</span>
                  <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700`}>{m.tier}</span>
               </div>
            ))}
         </div>
      </div>
   );
};

const GlobalModelRegistry = () => {
   const [registry, setRegistry] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [switching, setSwitching] = useState(false);
   const [selectedProvider, setSelectedProvider] = useState('openrouter');
   const [primaryModel, setPrimaryModel] = useState('google/gemini-2.0-flash-001');
   const [fastModel, setFastModel] = useState('mistralai/mistral-7b-instruct');
   const [successMsg, setSuccessMsg] = useState('');

   const getToken = () => {
      const s = localStorage.getItem('nomosdesk_session');
      return s ? JSON.parse(s).token : '';
   };

   React.useEffect(() => {
      const fetch = async () => {
         setLoading(true);
         try {
            const data = await authorizedFetch('/api/platform/ai-registry', { token: getToken() });
            setRegistry(data);
            setSelectedProvider(data.activeProvider || 'openrouter');
            setPrimaryModel(data.activeModel || 'google/gemini-2.0-flash-001');
            setFastModel(data.fastModel || 'mistralai/mistral-7b-instruct');
         } catch (e) { console.error(e); }
         finally { setLoading(false); }
      };
      fetch();
   }, []);

   const handleSwitch = async () => {
      setSwitching(true);
      try {
         await authorizedFetch('/api/platform/ai-registry', {
            method: 'PATCH',
            token: getToken(),
            body: JSON.stringify({
               activeProvider: selectedProvider,
               activeModel: primaryModel,
               fastModel: fastModel
            })
         });
         setSuccessMsg('Platform-wide AI strategy updated successfully.');
         setTimeout(() => setSuccessMsg(''), 5000);
      } catch (e) {
         console.error(e);
      } finally {
         setSwitching(false);
      }
   };

   if (loading) return <div className="p-12 text-center text-slate-500 italic">Accessing AI Kernel...</div>;

   return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-right-4 duration-500">
         <div className="lg:col-span-12 space-y-6">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Cpu size={14} className="text-purple-400" /> AI Failover & Model Registry
               </h4>
               {successMsg && <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-4 py-1 rounded-full border border-emerald-400/20">{successMsg}</span>}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Active AI Provider</label>
                     <select
                        title="Active AI Provider"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-purple-500 transition-all appearance-none"
                     >
                        <option value="openrouter">OpenRouter (Multimodal Failover)</option>
                        <option value="openai">OpenAI (Direct integration)</option>
                        <option value="anthropic">Direct Anthropic</option>
                     </select>
                  </div>

                  {/* Dynamic datalists for auto-complete */}
                  <datalist id="primary-models">
                     {selectedProvider === 'openrouter' && (
                        <>
                           <option value="google/gemini-2.0-flash-001" />
                           <option value="anthropic/claude-3.5-sonnet" />
                           <option value="openai/gpt-4o" />
                           <option value="meta-llama/llama-3.3-70b-instruct" />
                           <option value="deepseek/deepseek-r1" />
                        </>
                     )}
                     {selectedProvider === 'openai' && (
                        <>
                           <option value="gpt-4o" />
                           <option value="gpt-4-turbo" />
                           <option value="o1" />
                           <option value="o3-mini" />
                           <option value="gpt-4o-mini" />
                        </>
                     )}
                     {selectedProvider === 'anthropic' && (
                        <>
                           <option value="claude-3-5-sonnet-latest" />
                           <option value="claude-3-opus-latest" />
                           <option value="claude-3-5-haiku-latest" />
                        </>
                     )}
                  </datalist>

                  <datalist id="fast-models">
                     {selectedProvider === 'openrouter' && (
                        <>
                           <option value="mistralai/mistral-7b-instruct" />
                           <option value="google/gemini-2.0-flash-lite-preview-02-05" />
                           <option value="openai/gpt-4o-mini" />
                        </>
                     )}
                     {selectedProvider === 'openai' && (
                        <>
                           <option value="gpt-4o-mini" />
                           <option value="gpt-3.5-turbo" />
                        </>
                     )}
                     {selectedProvider === 'anthropic' && (
                        <>
                           <option value="claude-3-5-haiku-latest" />
                        </>
                     )}
                  </datalist>

                  <div className="space-y-4">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Primary Analytical Model</label>
                     <input
                        type="text"
                        title="Primary Analytical Model"
                        placeholder="e.g. gpt-4o"
                        list="primary-models"
                        value={primaryModel}
                        onChange={(e) => setPrimaryModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-all font-bold"
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Fast/Chat Model</label>
                     <input
                        type="text"
                        title="Fast/Chat Model"
                        placeholder="e.g. gpt-4o-mini"
                        list="fast-models"
                        value={fastModel}
                        onChange={(e) => setFastModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all font-bold"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800">
                  <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-start gap-4">
                     <ShieldCheck className="text-purple-400 shrink-0" size={24} />
                     <div className="space-y-2">
                        <h5 className="font-bold text-xs uppercase tracking-widest text-white">Kernel Failover Logic</h5>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                           "If the primary analytical model exceeds 500ms TTFT or returns a 429/500 status, NomosDesk will automatically route the request to the specified Fast Model via the sovereign gateway."
                        </p>
                     </div>
                  </div>

                  <div className="flex items-end flex-col justify-center">
                     <button
                        onClick={handleSwitch}
                        disabled={switching}
                        className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-900/20 active:scale-95 disabled:opacity-50"
                     >
                        {switching ? 'Synchronizing Kernel...' : 'Commit Platform Strategy'}
                     </button>
                     <p className="text-[9px] text-slate-600 mt-3 italic mr-2 text-right">Requires Platform-Owner authorization. Action is logged globally.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default GlobalControlPlane;
