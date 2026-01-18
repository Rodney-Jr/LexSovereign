
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Terminal, 
  ShieldAlert, 
  Settings,
  ChevronRight,
  Database,
  Cpu,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  BarChart3,
  Building2,
  Activity,
  Code2,
  FileSignature,
  Scale,
  Globe,
  Monitor
} from 'lucide-react';
import { UserRole, SystemPermission } from '../types';

interface RoleProfile {
  title: string;
  description: string;
  icon: React.ReactNode;
  permissions: SystemPermission;
}

const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  [UserRole.EXECUTIVE_BOARD]: {
    title: "Executive / Board",
    description: "High-level strategic oversight with read-only access to department metrics.",
    icon: <Monitor size={20} />,
    permissions: {
      dataVisibility: 'METADATA_ONLY',
      aiCapability: 'ANALYTICS_ONLY',
      authorityLevel: 'READ_ONLY',
      canApproveSpend: true,
      canOverrideGuardrails: false,
      canSignDocuments: false,
      encryptionScope: 'REGIONAL',
      canManageSiloKeys: false,
      canManageTenantUsers: false
    }
  },
  [UserRole.TENANT_ADMIN]: {
    title: "General Counsel (GC)",
    description: "Silo Root authority. Ultimate responsibility for logical architecture, key rotation, and AI oversight.",
    icon: <Gavel size={20} />,
    permissions: {
      dataVisibility: 'FULL',
      aiCapability: 'OVERSIGHT',
      authorityLevel: 'TENANT',
      canApproveSpend: true,
      canOverrideGuardrails: true,
      canSignDocuments: true,
      encryptionScope: 'GLOBAL',
      canManageSiloKeys: true,
      canManageTenantUsers: true
    }
  },
  [UserRole.DEPUTY_GC]: {
    title: "Deputy General Counsel",
    description: "Global escalation point for contract approvals and high-risk review.",
    icon: <Scale size={20} />,
    permissions: {
      dataVisibility: 'FULL',
      aiCapability: 'OVERSIGHT',
      authorityLevel: 'TENANT',
      canApproveSpend: true,
      canOverrideGuardrails: false,
      canSignDocuments: true,
      encryptionScope: 'REGIONAL',
      canManageSiloKeys: false,
      canManageTenantUsers: true
    }
  },
  [UserRole.INTERNAL_COUNSEL]: {
    title: "Legal Counsel",
    description: "Daily matter management and document review within assigned practice groups.",
    icon: <Users size={20} />,
    permissions: {
      dataVisibility: 'FULL',
      aiCapability: 'DRAFTING',
      authorityLevel: 'MATTER',
      canApproveSpend: false,
      canOverrideGuardrails: false,
      canSignDocuments: true,
      encryptionScope: 'MATTER_SPECIFIC',
      canManageSiloKeys: false,
      canManageTenantUsers: false
    }
  },
  [UserRole.LEGAL_OPS]: {
    title: "Legal Operations Officer",
    description: "Operational efficiency, workflow design, and spend management specialist.",
    icon: <Activity size={20} />,
    permissions: {
      dataVisibility: 'METADATA_ONLY',
      aiCapability: 'ANALYTICS_ONLY',
      authorityLevel: 'TENANT',
      canApproveSpend: true,
      canOverrideGuardrails: false,
      canSignDocuments: false,
      encryptionScope: 'REGIONAL',
      canManageSiloKeys: false,
      canManageTenantUsers: true
    }
  },
  [UserRole.COMPLIANCE]: {
    title: "Compliance Officer",
    description: "Regulatory monitoring, risk auditing, and jurisdictional rule management.",
    icon: <ShieldCheck size={20} />,
    permissions: {
      dataVisibility: 'SCRUBBED',
      aiCapability: 'RESEARCH_ONLY',
      authorityLevel: 'TENANT',
      canApproveSpend: false,
      canOverrideGuardrails: false,
      canSignDocuments: false,
      encryptionScope: 'GLOBAL',
      canManageSiloKeys: false,
      canManageTenantUsers: false
    }
  },
  [UserRole.EXTERNAL_COUNSEL]: {
    title: "Outside Counsel",
    description: "External firm practitioners invited into specific matters with PII masking.",
    icon: <Building2 size={20} />,
    permissions: {
      dataVisibility: 'SCRUBBED',
      aiCapability: 'DRAFTING',
      authorityLevel: 'MATTER',
      canApproveSpend: false,
      canOverrideGuardrails: false,
      canSignDocuments: false,
      encryptionScope: 'MATTER_SPECIFIC',
      canManageSiloKeys: false,
      canManageTenantUsers: false
    }
  },
  [UserRole.FINANCE_BILLING]: {
    title: "Finance / Billing",
    description: "Restricted to spend data, invoice reconciliation, and billing audits.",
    icon: <Database size={20} />,
    permissions: {
      dataVisibility: 'METADATA_ONLY',
      aiCapability: 'ANALYTICS_ONLY',
      authorityLevel: 'MATTER',
      canApproveSpend: true,
      canOverrideGuardrails: false,
      canSignDocuments: false,
      encryptionScope: 'MATTER_SPECIFIC',
      canManageSiloKeys: false,
      canManageTenantUsers: false
    }
  },
  [UserRole.GLOBAL_ADMIN]: {
    title: "System / IT Admin",
    description: "Infrastructure management and security enclave configuration.",
    icon: <Settings size={20} />,
    permissions: {
      dataVisibility: 'METADATA_ONLY',
      aiCapability: 'RESEARCH_ONLY',
      authorityLevel: 'PLATFORM',
      canApproveSpend: false,
      canOverrideGuardrails: true,
      canSignDocuments: false,
      encryptionScope: 'GLOBAL',
      canManageSiloKeys: true,
      canManageTenantUsers: true
    }
  },
  [UserRole.CLIENT]: {
    title: "Business Liaison",
    description: "Internal stakeholders requesting legal services via chatbot interfaces.",
    icon: <Briefcase size={20} />,
    permissions: {
      dataVisibility: 'SCRUBBED',
      aiCapability: 'RESEARCH_ONLY',
      authorityLevel: 'MATTER',
      canApproveSpend: false,
      canOverrideGuardrails: false,
      canSignDocuments: false,
      encryptionScope: 'MATTER_SPECIFIC',
      canManageSiloKeys: false,
      canManageTenantUsers: false
    }
  }
};

const AccessGovernance: React.FC<{ 
  userRole: UserRole, 
  setUserRole: (role: UserRole) => void 
}> = ({ userRole, setUserRole }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<'IDLE' | 'CHALLENGE' | 'VERIFIED'>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserRole>(userRole);
  const [showManifest, setShowManifest] = useState(false);
  
  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 12)]);
  };

  const currentProfile = ROLE_PROFILES[selectedProfile];

  const triggerMFA = () => {
    setIsAuthenticating(true);
    setAuthStatus('CHALLENGE');
    addLog(`Initiating MFA for profile: ${selectedProfile}...`);
    
    setTimeout(() => {
      addLog("ZK-Proof challenge sent to hardware enclave...");
    }, 800);

    setTimeout(() => {
      addLog("Hardware Root Verification: SUCCESS");
      addLog(`Identity Claim [${selectedProfile}] verified by HSM-01.`);
      setAuthStatus('VERIFIED');
      setIsAuthenticating(false);
      setUserRole(selectedProfile);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <ShieldCheck className="text-blue-400" size={28} />
            </div>
            Access Governance: Sovereign RBAC
          </h3>
          <p className="text-slate-400 text-sm">Translating organogram authority into cryptographic constraints.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowManifest(!showManifest)}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${
               showManifest ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
             }`}
           >
              <Code2 size={14} />
              {showManifest ? 'Capability View' : 'Inspect Manifest'}
           </button>
           <div className="h-6 w-[1px] bg-slate-800"></div>
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active HSM Root</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Role Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           <div className="flex items-center justify-between px-2 mb-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Enterprise Personas</h4>
              <span className="text-[10px] font-mono text-slate-600">{Object.keys(ROLE_PROFILES).length} ROLES</span>
           </div>
           <div className="space-y-2 max-h-[700px] overflow-y-auto scrollbar-hide pr-1">
             {Object.entries(ROLE_PROFILES).map(([role, profile]) => (
               <button
                 key={role}
                 onClick={() => {
                   setSelectedProfile(role as UserRole);
                   setAuthStatus('IDLE');
                   addLog(`Pre-fetching manifest for: ${profile.title}`);
                 }}
                 className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group ${
                   selectedProfile === role 
                   ? 'bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-500/5' 
                   : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                 }`}
               >
                 <div className={`p-2.5 rounded-xl transition-colors ${
                   selectedProfile === role ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-blue-400'
                 }`}>
                   {profile.icon}
                 </div>
                 <div className="flex-1">
                    <p className={`text-sm font-bold tracking-tight ${selectedProfile === role ? 'text-white' : 'text-slate-300'}`}>{profile.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[180px]">{profile.description}</p>
                 </div>
                 {userRole === role && (
                   <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                 )}
               </button>
             ))}
           </div>
        </div>

        {/* Permission Matrix Area */}
        <div className="lg:col-span-8 space-y-8">
           {/* Detailed Profile View */}
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transition-opacity group-hover:opacity-[0.05]">
                 <Key size={300} />
              </div>

              <div className="flex items-start justify-between relative z-10">
                 <div className="space-y-2">
                    <div className="flex items-center gap-4">
                       <div className="p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20 text-blue-400">
                          {currentProfile.icon}
                       </div>
                       <div>
                          <h4 className="text-3xl font-bold text-white tracking-tighter">{currentProfile.title}</h4>
                          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Permission Profile</p>
                       </div>
                    </div>
                 </div>
                 
                 {userRole !== selectedProfile ? (
                   <button 
                    onClick={triggerMFA}
                    disabled={isAuthenticating}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 active:scale-95 group/btn"
                   >
                      {isAuthenticating ? <RefreshCw className="animate-spin" size={18} /> : <Fingerprint size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                      {authStatus === 'VERIFIED' ? 'Context Synchronized' : 'Authorize Identity'}
                   </button>
                 ) : (
                   <div className="px-6 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest">
                      <CheckCircle2 size={18}/> Active Session Context
                   </div>
                 )}
              </div>

              {showManifest ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                   <div className="flex items-center justify-between px-2">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={14} className="text-purple-400" /> Cryptographic Manifest
                      </h5>
                      <span className="text-[9px] font-mono text-slate-600">SCHEMATA_VERSION: SOV_2.5_ENT</span>
                   </div>
                   <div className="bg-slate-950 rounded-3xl p-6 font-mono text-[11px] text-blue-400 overflow-x-auto border border-slate-800/50 shadow-inner">
                      <pre>
{`{
  "role": "${selectedProfile}",
  "claims": {
    "data_visibility": "${currentProfile.permissions.dataVisibility}",
    "ai_inference_cap": "${currentProfile.permissions.aiCapability}",
    "authority_level": "${currentProfile.permissions.authorityLevel}",
    "regional_pinning": {
      "enforced": true,
      "scope": "${currentProfile.permissions.encryptionScope}"
    },
    "features": {
      "spend_approval": ${currentProfile.permissions.canApproveSpend},
      "guardrail_override": ${currentProfile.permissions.canOverrideGuardrails},
      "artifact_signing": ${currentProfile.permissions.canSignDocuments},
      "silo_key_mgmt": ${currentProfile.permissions.canManageSiloKeys},
      "user_mgmt": ${currentProfile.permissions.canManageTenantUsers}
    }
  },
  "provenance": "FIPS_140_HSM_SIGNED"
}`}
                      </pre>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 animate-in fade-in duration-300">
                  {/* Data Visibility & AI */}
                  <div className="space-y-4">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Eye size={14} className="text-blue-400" /> Interaction Layers
                      </h5>
                      <div className="space-y-2">
                        <PermissionIndicator 
                            label="Document Body Access" 
                            status={currentProfile.permissions.dataVisibility} 
                            active={true}
                            desc={currentProfile.permissions.dataVisibility === 'FULL' ? 'Direct binary access to all vault artifacts.' : currentProfile.permissions.dataVisibility === 'SCRUBBED' ? 'Real-time PII redaction via DAS Proxy.' : 'Only JSON metadata accessible.'}
                        />
                        <PermissionIndicator 
                            label="Inference Profile" 
                            status={currentProfile.permissions.aiCapability} 
                            active={true}
                            desc={currentProfile.permissions.aiCapability === 'OVERSIGHT' ? 'Full model interaction with system-level prompt override.' : currentProfile.permissions.aiCapability === 'DRAFTING' ? 'Generative legal drafting tools enabled.' : 'AI restricted to analytics.'}
                        />
                      </div>
                  </div>

                  {/* Administrative Authority */}
                  <div className="space-y-4">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={14} className="text-purple-400" /> Administrative Authority
                      </h5>
                      <div className="space-y-2">
                        <PermissionIndicator 
                            label="Silo Root Keys" 
                            status={currentProfile.permissions.canManageSiloKeys ? 'AUTHORIZED' : 'RESTRICTED'} 
                            active={currentProfile.permissions.canManageSiloKeys}
                            desc="Permission to rotate master encryption secrets and manage HSM trust."
                        />
                        <PermissionIndicator 
                            label="User & Plan Governance" 
                            status={currentProfile.permissions.canManageTenantUsers ? 'AUTHORIZED' : 'RESTRICTED'} 
                            active={currentProfile.permissions.canManageTenantUsers}
                            desc="Authority to invite practitioners and modify subscription allocations."
                        />
                      </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Authority Scope</p>
                       <p className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-tight">
                          <Building2 size={14} className="text-blue-400" /> {currentProfile.permissions.authorityLevel} PLANE
                       </p>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-800"></div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Residency Pin</p>
                       <p className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-tight">
                          <Globe size={14} className="text-emerald-400" /> {currentProfile.permissions.encryptionScope}
                       </p>
                    </div>
                 </div>
                 
                 <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex items-center gap-4 max-w-sm">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] text-slate-500 leading-tight italic">
                       {selectedProfile === UserRole.TENANT_ADMIN 
                         ? "General Counsel holds the Silo Root Key. Any override of deterministic safety guardrails is cryptographically attributed."
                         : "Permissions for this role are derived from the Silo Master Key and cannot be escalated without GC approval."}
                    </p>
                 </div>
              </div>
           </div>

           {/* Real-time Audit Terminal */}
           <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Terminal size={14} className="text-emerald-500" /> Authority Verification Trace
                 </h4>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[10px] font-mono text-emerald-500 uppercase">Enclave Stream: Active</span>
                    </div>
                    <button 
                      onClick={() => setLogs([])}
                      className="text-[9px] font-bold text-slate-700 uppercase hover:text-slate-400 transition-colors"
                    >
                      Clear Ledger
                    </button>
                 </div>
              </div>
              <div className="bg-black/40 rounded-[2rem] p-6 font-mono text-[10px] h-48 overflow-y-auto scrollbar-hide space-y-2 border border-slate-900/50 shadow-inner flex flex-col-reverse">
                 {logs.length === 0 && <p className="text-slate-700 italic uppercase tracking-widest text-center py-12">Awaiting authority event trigger...</p>}
                 {logs.map((log, i) => (
                   <p key={i} className={`animate-in slide-in-from-left-2 ${i === 0 ? 'text-blue-400' : 'text-slate-600'}`}>
                      {log}
                   </p>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const PermissionIndicator = ({ label, status, active, desc }: any) => (
  <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl hover:border-blue-500/30 transition-all group/pi">
     <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase transition-colors ${
           active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
           {status}
        </span>
     </div>
     <p className="text-[10px] text-slate-500 leading-relaxed group-hover/pi:text-slate-400 transition-colors">{desc}</p>
  </div>
);

export default AccessGovernance;
