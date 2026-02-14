
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
   EyeOff
} from 'lucide-react';
import { Region, GlobalAdminIdentity } from '../types';
import { ProvisionTenantModal } from './ProvisionTenantModal';
import { authorizedFetch } from '../utils/api';

interface GlobalControlPlaneProps {
   userName: string;
   onNavigate?: (tab: string) => void;
}

const GlobalControlPlane: React.FC<GlobalControlPlaneProps> = ({ userName, onNavigate }) => {
   const [activeTab, setActiveTab] = useState<'telemetry' | 'admins' | 'leads'>('telemetry');
   const [globalStatus, setGlobalStatus] = useState('NOMINAL');
   const [isSyncing, setIsSyncing] = useState(false);
   const [showProvisionModal, setShowProvisionModal] = useState(false);
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

   React.useEffect(() => {
      const fetchPlatformData = async () => {
         try {
            const sessionData = localStorage.getItem('lexSovereign_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';

            // Parallel fetch for all platform signals
            const [statsData, adminData, siloData, logData] = await Promise.all([
               authorizedFetch('/api/platform/stats', { token }),
               authorizedFetch('/api/platform/admins', { token }),
               authorizedFetch('/api/platform/silos', { token }),
               authorizedFetch('/api/platform/audit-logs', { token })
            ]);

            if (!statsData.error) setStats(statsData);
            if (Array.isArray(adminData)) setPlatformAdmins(adminData);
            if (Array.isArray(siloData)) setRegionalSilos(siloData);
            if (Array.isArray(logData)) setAuditLogs(logData);

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
                     onClick={() => setActiveTab('leads')}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'leads' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     Leads
                  </button>
                  <button
                     onClick={() => onNavigate?.('pricing-calib')}
                     className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all text-slate-500 hover:text-cyan-400 border border-transparent hover:border-cyan-500/30 hover:bg-cyan-500/10"
                  >
                     Pricing
                  </button>
               </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${globalStatus === 'NOMINAL' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
               <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Platform: {globalStatus}</span>
            </div>
         </div>


         {/* Render Modals */}
         {showProvisionModal && (
            <ProvisionTenantModal onClose={() => setShowProvisionModal(false)} />
         )}

         {/* Content Switcher */}
         {activeTab === 'telemetry' && (
            <>
               {/* Global Telemetry Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <GlobalMetric label="Total Sovereign Tenants" value={stats.tenants} sub="+12 this month" icon={<Users className="text-blue-400" />} />
                  <GlobalMetric label="Infrastructure Margin" value={stats.margin} sub="Target: 65.0%" icon={<TrendingUp className="text-emerald-400" />} />
                  <GlobalMetric label="Active Compute Silos" value={stats.silos} sub="Global TEE instances" icon={<Cpu className="text-purple-400" />} />
                  <GlobalMetric label="Cross-Border Egress" value={stats.egress} sub="Policy Enforcement: 100%" icon={<ShieldCheck className="text-cyan-400" />} />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Regional Silo Map/List */}
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

                     {/* Model Registry Module */}
                     <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Database size={16} className="text-purple-400" /> Global Model Registry
                           </h4>
                           <button className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:underline">Deploy Update</button>
                        </div>
                        <div className="space-y-3">
                           <ModelRow name="Gemini 1.5 Pro" regions="Global" users="Sovereign+" version="v1.5.0" status="PROD" />
                           <ModelRow name="Gemini 1.5 Flash" regions="Global" users="Standard" version="v1.5.0" status="PROD" />
                           <ModelRow name="Claude 3.5 Sonnet" regions="Global" users="Sovereign+" version="latest" status="PROD" />
                           <ModelRow name="GPT-4 Turbo" regions="Global" users="Enterprise" version="2024-04-09" status="PROD" />
                           <ModelRow name="Llama-3-Sovereign-70B" regions="Primary, Secondary" users="Enclave Only" version="v0.9.8" status="BETA" />
                           <ModelRow name="Legal-Mistral-Enclave" regions="Secondary" users="Enclave Only" version="v0.8.2" status="STAGING" />
                        </div>
                     </div>
                  </div>

                  {/* Global Security & Incident Response */}
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
               {/* Admin Management Workspace */}
               <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} className="text-cyan-400" /> Platform Admin Fleet
                     </h4>
                     <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
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

               {/* Admin Fleet Detail/Logs */}
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

         {activeTab === 'leads' && <LeadsTab />}
      </div >
   );
};

const LeadsTab = () => {
   const [leads, setLeads] = useState<any[]>([]);

   React.useEffect(() => {
      const fetchLeads = async () => {
         try {
            const sessionData = localStorage.getItem('lexSovereign_session');
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
         const sessionData = localStorage.getItem('lexSovereign_session');
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

const ModelRow = ({ name, regions, users, version, status }: any) => (
   <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-all group">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/10 transition-colors">
            <Zap size={18} />
         </div>
         <div>
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{regions} • {users}</p>
         </div>
      </div>
      <div className="text-right">
         <p className="text-[10px] font-mono text-slate-400">{version}</p>
         <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-full border border-emerald-400/10 uppercase tracking-widest">{status}</span>
      </div>
   </div>
);

export default GlobalControlPlane;
