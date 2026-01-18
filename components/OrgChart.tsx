
import React, { useState } from 'react';
import { 
  Users, 
  Scale, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Briefcase, 
  UserCheck, 
  LayoutGrid, 
  GitBranch, 
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Settings,
  CheckCircle2,
  Building2,
  Gavel,
  Monitor,
  BarChart3,
  Globe
} from 'lucide-react';
import { UserRole } from '../types';

type OrgArchetype = 'TRADITIONAL_FIRM' | 'MODERN_FIRM' | 'ENT_STANDARD' | 'ENT_LEAN';

interface OrgNode {
  id: string;
  role: string;
  systemRole: UserRole;
  access: 'FULL' | 'SCRUBBED' | 'METADATA' | 'READ_ONLY';
  capabilities: string[];
  parentId: string | null;
  label?: string; // Relationship label
}

const ARCHETYPES: Record<OrgArchetype, OrgNode[]> = {
  TRADITIONAL_FIRM: [
    { id: '1', role: 'Managing Partner', systemRole: UserRole.TENANT_ADMIN, access: 'FULL', capabilities: ['Global Approval', 'Billing Oversight', 'Audit Control'], parentId: null },
    { id: '2', role: 'Practice Partner', systemRole: UserRole.INTERNAL_COUNSEL, access: 'FULL', capabilities: ['Matter Lead', 'AI Override'], parentId: '1', label: 'Oversees' },
    { id: '3', role: 'Senior Associate', systemRole: UserRole.INTERNAL_COUNSEL, access: 'FULL', capabilities: ['Drafting', 'Review'], parentId: '2', label: 'Mentors' },
    { id: '4', role: 'Associate', systemRole: UserRole.EXTERNAL_COUNSEL, access: 'SCRUBBED', capabilities: ['Research', 'Drafting (DAS-Filtered)'], parentId: '3', label: 'Executes' },
  ],
  MODERN_FIRM: [
    { id: '1', role: 'Executive Committee', systemRole: UserRole.TENANT_ADMIN, access: 'FULL', capabilities: ['Governance', 'Risk Control'], parentId: null },
    { id: '2', role: 'COO / Legal Ops Head', systemRole: UserRole.LEGAL_OPS, access: 'METADATA', capabilities: ['SLA Monitoring', 'Vendor Spend'], parentId: '1', label: 'Operational Control' },
    { id: '3', role: 'Practice Group Head', systemRole: UserRole.INTERNAL_COUNSEL, access: 'FULL', capabilities: ['Legal Strategy', 'High-Risk Review'], parentId: '1', label: 'Strategic Lead' },
    { id: '4', role: 'AI Admin / IT', systemRole: UserRole.GLOBAL_ADMIN, access: 'METADATA', capabilities: ['Model Selection', 'Enclave Config'], parentId: '2', label: 'Tech Stack' },
  ],
  ENT_STANDARD: [
    { id: '1', role: 'General Counsel (GC)', systemRole: UserRole.TENANT_ADMIN, access: 'FULL', capabilities: ['Board Reporting', 'Final Sign-off', 'Silo Root Key'], parentId: null },
    { id: '2', role: 'Deputy GC / Practice Lead', systemRole: UserRole.INTERNAL_COUNSEL, access: 'FULL', capabilities: ['Contract Approval', 'Counsel Verification'], parentId: '1', label: 'Escalation Point' },
    { id: '3', role: 'Chief Legal Ops (CLOps)', systemRole: UserRole.LEGAL_OPS, access: 'METADATA', capabilities: ['Spend Analytics', 'Workflow Design', 'SLA Pulse'], parentId: '1', label: 'Efficiency Engine' },
    { id: '4', role: 'Compliance Officer (CCO)', systemRole: UserRole.LEGAL_OPS, access: 'METADATA', capabilities: ['Regulatory Audits', 'BoG Intercept Config'], parentId: '1', label: 'Risk Guard' },
    { id: '5', role: 'Legal Counsel', systemRole: UserRole.INTERNAL_COUNSEL, access: 'FULL', capabilities: ['Review', 'AI Drafting', 'Internal Analysis'], parentId: '2', label: 'Review Loop' },
    { id: '6', role: 'External Counsel (Firm)', systemRole: UserRole.EXTERNAL_COUNSEL, access: 'SCRUBBED', capabilities: ['Outsourced Research', 'Strict DAS PII Redaction'], parentId: '3', label: 'Vendor Bridge' },
  ],
  ENT_LEAN: [
    { id: '1', role: 'General Counsel', systemRole: UserRole.TENANT_ADMIN, access: 'FULL', capabilities: ['Full Stack Legal Ops', 'Governance'], parentId: null },
    { id: '2', role: 'Legal Counsel / Ops', systemRole: UserRole.INTERNAL_COUNSEL, access: 'FULL', capabilities: ['Workflow Management', 'Analysis'], parentId: '1', label: 'Execution' },
    { id: '3', role: 'Compliance Analyst', systemRole: UserRole.LEGAL_OPS, access: 'METADATA', capabilities: ['Monitoring', 'Audit Trail'], parentId: '1', label: 'Risk Audit' },
  ]
};

const OrgChart: React.FC = () => {
  const [archetype, setArchetype] = useState<OrgArchetype>('ENT_STANDARD');
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);

  const nodes = ARCHETYPES[archetype];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24 max-w-7xl mx-auto">
      {/* Header & Archetype Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <LayoutGrid className="text-blue-400" size={28} />
            </div>
            Sovereign Topography
          </h3>
          <p className="text-slate-400 text-sm">Visualizing the alignment of human authority to cryptographic enforcement.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
           {(Object.keys(ARCHETYPES) as OrgArchetype[]).map(type => (
             <button
               key={type}
               onClick={() => { setArchetype(type); setSelectedNode(null); }}
               className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                 archetype === type 
                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                 : 'text-slate-500 hover:text-slate-300'
               }`}
             >
               {type.replace('_', ' ')}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Visual Map Area */}
        <div className="lg:col-span-7 bg-slate-950/50 border border-slate-900 rounded-[3rem] p-12 relative overflow-hidden min-h-[700px] flex flex-col items-center overflow-y-auto scrollbar-hide">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
           
           <div className="relative z-10 w-full max-w-lg space-y-12">
              {nodes.map((node, index) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div key={node.id} className="flex flex-col items-center relative">
                    {/* Vertical Connector Line & Label */}
                    {index > 0 && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-[2px] h-12 bg-gradient-to-b from-blue-500/20 to-blue-500/80"></div>
                        {node.label && (
                          <div className="absolute top-3 bg-slate-950 px-2 py-0.5 border border-slate-800 rounded-md text-[8px] font-mono text-slate-500 uppercase z-20 whitespace-nowrap">
                            {node.label}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setSelectedNode(node)}
                      className={`w-full p-6 rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-between group ${
                        isSelected 
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-105' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`p-3 rounded-2xl transition-colors ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-blue-400'
                        }`}>
                          <NodeIcon node={node} isSelected={isSelected} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white tracking-tight">{node.role}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter">{node.systemRole}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <AccessBadge access={node.access} />
                        <ChevronRight size={16} className={`transition-transform ${isSelected ? 'rotate-90 text-white' : 'text-slate-700 group-hover:translate-x-1'}`} />
                      </div>
                    </button>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Info Panel Sidebar */}
        <div className="lg:col-span-5 space-y-6">
           {selectedNode ? (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 sticky top-24">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Operational Context</h4>
                      <p className="text-2xl font-bold text-white tracking-tight">{selectedNode.role}</p>
                   </div>
                   <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase border ${
                     selectedNode.access === 'FULL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                     selectedNode.access === 'SCRUBBED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                     'bg-purple-500/10 text-purple-400 border-purple-500/20'
                   }`}>
                     {selectedNode.access} CONTEXT
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <Zap size={14} className="text-blue-400"/> System Privileges
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                         {selectedNode.capabilities.map((cap, i) => (
                           <div key={i} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              <span className="text-xs text-slate-300 font-medium">{cap}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4 pt-6 border-t border-slate-800">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enforcement Layer</h5>
                      <div className="space-y-3">
                         <EnforcementLine 
                           label="PII Scrubbing" 
                           status={selectedNode.access === 'SCRUBBED' ? 'Active' : 'Bypassed'} 
                           active={selectedNode.access === 'SCRUBBED'} 
                         />
                         <EnforcementLine 
                           label="Board Reporting" 
                           status={selectedNode.capabilities.includes('Board Reporting') ? 'Authorized' : 'Restricted'} 
                           active={selectedNode.capabilities.includes('Board Reporting')} 
                         />
                         <EnforcementLine 
                           label="Silo Root Access" 
                           status={selectedNode.capabilities.includes('Silo Root Key') ? 'Exclusive' : 'Denied'} 
                           active={selectedNode.capabilities.includes('Silo Root Key')} 
                         />
                         <EnforcementLine 
                           label="External Egress" 
                           status={selectedNode.access === 'SCRUBBED' ? 'Tunnel Only' : 'Managed'} 
                           active={true} 
                         />
                      </div>
                   </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4">
                   <Info className="text-blue-400 shrink-0" size={18} />
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">
                     "In {archetype.includes('ENT') ? 'Enterprise' : 'Firm'} mode, {selectedNode.role} permissions are anchored to jurisdictional mandates. Data provenance is tracked at every {selectedNode.access === 'FULL' ? 'unmasked' : 'scrubbed'} interaction."
                   </p>
                </div>
             </div>
           ) : (
             <div className="h-full bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="p-5 bg-slate-800 rounded-full text-slate-600">
                   <GitBranch size={48} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-slate-300">Topography Offline</h4>
                   <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed uppercase tracking-widest text-[10px] font-bold">Select an authority node in the topography map to inspect its Sovereign RBAC projection.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const NodeIcon = ({ node, isSelected }: { node: OrgNode, isSelected: boolean }) => {
  const size = 24;
  if (node.role.includes('GC') || node.role.includes('Partner')) return <Gavel size={size} />;
  if (node.role.includes('CLOps') || node.role.includes('COO')) return <BarChart3 size={size} />;
  if (node.role.includes('Board') || node.role.includes('Committee')) return <Monitor size={size} />;
  if (node.role.includes('External')) return <Globe size={size} />;
  if (node.systemRole === UserRole.TENANT_ADMIN) return <ShieldCheck size={size} />;
  return <Users size={size} />;
};

const AccessBadge = ({ access }: { access: string }) => {
  if (access === 'FULL') return <Eye size={16} className="text-emerald-500" />;
  if (access === 'SCRUBBED') return <EyeOff size={16} className="text-amber-500" />;
  return <Lock size={16} className="text-purple-500" />;
};

const EnforcementLine = ({ label, status, active }: { label: string, status: string, active: boolean }) => (
  <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
     <span className={`text-[10px] font-mono font-bold uppercase ${active ? 'text-emerald-400' : 'text-slate-600'}`}>{status}</span>
  </div>
);

export default OrgChart;
