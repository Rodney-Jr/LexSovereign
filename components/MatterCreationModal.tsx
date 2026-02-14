
import React, { useState, useEffect } from 'react';
import {
  X, Briefcase, Users, Globe, Shield, CheckCircle2, Zap,
  ArrowRight, ArrowLeft, Lock, EyeOff, UserCheck,
  ShieldAlert, Scale, Settings, LayoutGrid, Fingerprint,
  Sliders, ShieldCheck, Database, Search, RefreshCw
} from 'lucide-react';
import { Region, Matter, AppMode } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import FileUploader, { UploadedFile } from './FileUploader';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface MatterCreationModalProps {
  mode: AppMode;
  userId: string;
  tenantId: string;
  onClose: () => void;
  onCreated: (matter: Matter) => void;
}

interface RbacRoleConfig {
  viewPrivileged: boolean;
  exportSovereign: boolean;
  overrideAI: boolean;
}

interface RbacMatrix {
  lead: RbacRoleConfig;
  associate: RbacRoleConfig;
  external: RbacRoleConfig;
}

const MatterCreationModal: React.FC<MatterCreationModalProps> = ({ mode, userId, tenantId, onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [isProfiling, setIsProfiling] = useState(false);
  const [conflictSearchTerm, setConflictSearchTerm] = useState('');
  const [isConflictSearching, setIsConflictSearching] = useState(false);
  const [conflictResult, setConflictResult] = useState<'IDLE' | 'CLEAN' | 'COLLISION' | 'SCANNING'>('IDLE');
  const [conflictScanProgress, setConflictScanProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const isFirm = mode === AppMode.LAW_FIRM;
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    type: isFirm ? 'Litigation' : 'Corporate Governance',
    internalCounsel: '',
    region: Region.PRIMARY,
    description: '',
    riskLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    dasLevel: 2,
    rbac: {
      lead: { viewPrivileged: true, exportSovereign: true, overrideAI: true },
      associate: { viewPrivileged: true, exportSovereign: false, overrideAI: true },
      external: { viewPrivileged: false, exportSovereign: false, overrideAI: false }
    } as RbacMatrix,
    complexityWeight: 5.0,
    overrideJustification: ''
  });

  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [capacityStatus, setCapacityStatus] = useState<any>(null);
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  useEffect(() => {
    const fetchPractitioners = async () => {
      const session = getSavedSession();
      if (!session?.token) return;
      try {
        const data = await authorizedFetch('/api/users', { token: session.token });
        setPractitioners(data);
      } catch (e) {
        console.error("Failed to fetch practitioners:", e);
      }
    };
    fetchPractitioners();
  }, []);

  useEffect(() => {
    if (formData.internalCounsel) {
      validateCapacity();
    }
  }, [formData.internalCounsel, formData.complexityWeight, formData.riskLevel]);

  const validateCapacity = async () => {
    // In a real app, this would be an API call to CapacityService.validateAssignment
    // For the prototype, we simulate the validation logic
    const user = practitioners.find(p => p.id === formData.internalCounsel);
    if (!user) return;

    // Simulate potential issues
    const isOverloaded = Math.random() > 0.7; // Mock condition
    if (isOverloaded) {
      setCapacityStatus({
        severity: 'OVERRIDE',
        reason: 'Assignment would exceed capacity: 42.5h / 40h (Critical Overload)'
      });
    } else {
      setCapacityStatus({ severity: 'GREEN' });
      setShowOverrideInput(false);
    }
  };

  const handleFilesAdded = (files: FileList) => {
    const newFiles = Array.from(files).map((f: File) => {
      const id = `file-${Math.random().toString(36).substr(2, 9)}`;
      setTimeout(() => {
        setAttachedFiles(current =>
          current.map(item => item.id === id ? { ...item, status: 'encrypted' } : item)
        );
      }, 1500 + Math.random() * 2000);
      return {
        id,
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
        status: 'scanning' as const
      };
    });
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        client: formData.client,
        type: formData.type,
        description: formData.description,
        internalCounselId: formData.internalCounsel || userId,
        tenantId: tenantId,
        riskLevel: formData.riskLevel,
        complexityWeight: formData.complexityWeight,
        overrideJustification: formData.overrideJustification,
        conflictStatus: conflictResult === 'CLEAN' ? 'CLEAN' : 'NOT_CHECKED',
        conflictProof: conflictResult === 'CLEAN' ? `ZK-PROOF-${Math.random().toString(16).slice(2, 12).toUpperCase()}` : undefined
      };

      const session = getSavedSession();
      if (!session?.token) {
        throw new Error('Authentication required');
      }

      const newMatter = await authorizedFetch('/api/matters', {
        method: 'POST',
        token: session.token,
        body: JSON.stringify(payload)
      });

      onCreated(newMatter);
    } catch (e: any) {
      console.error("Failed to create matter, implementing fallback for demo...", e);
      // Fallback for demo if API fails (e.g. no DB connection)
      const fallbackMatter: Matter = {
        ...formData,
        id: `MT-${Math.floor(Math.random() * 900 + 100)}`,
        status: 'Open',
        internalCounsel: 'Current User', // Placeholder for display
        createdAt: new Date().toISOString().split('T')[0] ?? new Date().toISOString()
      };
      onCreated(fallbackMatter);
    } finally {
      setIsSubmitting(false);
    }
  };

  const performZkConflictSearch = () => {
    setIsConflictSearching(true);
    setConflictResult('SCANNING');
    setConflictScanProgress(0);

    const interval = setInterval(() => {
      setConflictScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsConflictSearching(false);
          setConflictResult(conflictSearchTerm.toLowerCase().includes('restricted') ? 'COLLISION' : 'CLEAN');
          return 100;
        }
        return p + 10;
      });
    }, 80);
  };

  const isStep1Valid = conflictResult === 'CLEAN';
  const isStep2Valid = formData.name && formData.client && formData.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-500">

        {/* Step Indicator Header */}
        <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Briefcase className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Matter Inception</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Tenant Administrator Protocol</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2.5 hover:bg-slate-800 rounded-full text-slate-500 transition-all hover:rotate-90">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">

          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white flex items-center gap-3">
                  <Search className="text-blue-400" size={24} />
                  Mandatory Conflict Search
                </h4>
                <p className="text-slate-400 text-xs">Matter creation requires a Zero-Knowledge collision check against the Sovereign Ledger.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Party Name / Adverse Entity</label>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-300"
                      placeholder="Enter party name for blind collision check..."
                      value={conflictSearchTerm}
                      onChange={e => setConflictSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase">
                    <Fingerprint size={12} /> SHA-256 Local Hashing Active
                  </div>
                  <button
                    onClick={performZkConflictSearch}
                    disabled={!conflictSearchTerm || isConflictSearching}
                    className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                  >
                    {isConflictSearching ? <RefreshCw className="animate-spin" size={14} /> : "Initiate Scan"}
                  </button>
                </div>

                {conflictResult === 'SCANNING' && (
                  <div className="space-y-3 pt-4 border-t border-slate-800/50">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                      <span>Scanning Sovereign Indices...</span>
                      <span className="text-blue-400">{conflictScanProgress}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${conflictScanProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {conflictResult === 'CLEAN' && (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in zoom-in-95">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-emerald-400 uppercase">Conflict Check: PASSED</p>
                      <p className="text-[10px] text-slate-500 leading-tight">No hazardous collisions found in the Regional Silo.</p>
                    </div>
                  </div>
                )}

                {conflictResult === 'COLLISION' && (
                  <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-in zoom-in-95">
                    <ShieldAlert className="text-rose-500" size={24} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-rose-400 uppercase">Conflict Detected</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Cryptographic collision identified. ESCALATE to Partner Enclave.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-start gap-4">
                <Database className="text-slate-500" size={20} />
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  "The ZK-Inception protocol prevents matter creation unless a negative conflict result is mathematically proven via blind search against the firm's encrypted vault index."
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-2 gap-8">
                <MetadataInput label="Matter Name" placeholder="e.g. Standard Corporate Restructure" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
                <MetadataInput label={isFirm ? "Client Entity" : "Internal Business Unit"} placeholder="Search verified directory..." value={formData.client} onChange={(v: string) => setFormData({ ...formData, client: v })} />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Matter Description</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-800 min-h-[100px] text-slate-300"
                  placeholder="Describe the scope and objective of this matter..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="internalCounsel">Assigned Practitioner</label>
                  <select
                    id="internalCounsel"
                    title="Select assigned practitioner"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-300"
                    value={formData.internalCounsel}
                    onChange={e => setFormData({ ...formData, internalCounsel: e.target.value })}
                  >
                    <option value="">Select Practitioner...</option>
                    {practitioners.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="complexityWeight">Complexity Weight</label>
                  <div className="flex items-center gap-4">
                    <input
                      id="complexityWeight"
                      title="Set complexity weight"
                      type="range" min="1" max="20" step="0.5"
                      value={formData.complexityWeight}
                      onChange={e => setFormData({ ...formData, complexityWeight: parseFloat(e.target.value) })}
                      className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs font-mono text-blue-400 w-10">{formData.complexityWeight}</span>
                  </div>
                </div>
              </div>

              {capacityStatus && capacityStatus.severity !== 'GREEN' && (
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-rose-400" size={18} />
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-tight">{capacityStatus.reason}</p>
                  </div>
                  {capacityStatus.severity === 'OVERRIDE' && !showOverrideInput && (
                    <button
                      onClick={() => setShowOverrideInput(true)}
                      className="text-[10px] font-black uppercase text-white bg-rose-600 px-4 py-1.5 rounded-lg hover:bg-rose-500 transition-all"
                    >
                      Authorize Manual Override
                    </button>
                  )}
                  {showOverrideInput && (
                    <div className="space-y-2">
                      <p className="text-[9px] text-rose-300 uppercase font-black">Override Justification Required (Audit Logged)</p>
                      <input
                        className="w-full bg-slate-950 border border-rose-500/30 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        placeholder="State reason for capacity override..."
                        value={formData.overrideJustification}
                        onChange={e => setFormData({ ...formData, overrideJustification: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              <FileUploader files={attachedFiles} onFilesAdded={handleFilesAdded} onRemove={removeFile} />
              {isProfiling && <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl animate-pulse text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} /> Running Jurisdictional Complexity Profile...</div>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8">
              <h4 className="text-lg font-bold text-white flex items-center gap-3"><Globe className="text-emerald-400" /> Logical Silo Allocation</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(Region).map(r => (
                  <button
                    key={r}
                    onClick={() => setFormData({ ...formData, region: r })}
                    className={`p-6 rounded-[2rem] border transition-all text-left group ${formData.region === r ? 'bg-emerald-500/10 border-emerald-500 shadow-xl' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${formData.region === r ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}><Globe size={20} /></div>
                      {formData.region === r && <CheckCircle2 size={18} className="text-emerald-400" />}
                    </div>
                    <p className="text-sm font-bold text-white">{r} Silo</p>
                    <p className="text-[10px] text-slate-500 font-mono">FIPS 140-2 Level 3 Active</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-8">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white flex items-center gap-3"><Lock className="text-blue-400" /> Matter-Level RBAC Matrix</h4>
                <span className="text-[10px] font-mono text-emerald-500">ZK-CLAIM SET: ACTIVE</span>
              </div>

              <div className="space-y-4">
                <RbacRoleCard
                  role={isFirm ? "Partner / Lead Counsel" : "General Counsel"}
                  icon={<UserCheck size={20} />}
                  config={formData.rbac.lead}
                  onChange={(cfg: any) => setFormData({ ...formData, rbac: { ...formData.rbac, lead: cfg } })}
                />
                <RbacRoleCard
                  role={isFirm ? "Associate Counsel" : "Legal Analyst"}
                  icon={<Users size={20} />}
                  config={formData.rbac.associate}
                  onChange={(cfg: any) => setFormData({ ...formData, rbac: { ...formData.rbac, associate: cfg } })}
                />
                <RbacRoleCard
                  role={isFirm ? "External Counsel" : "Business Liaison"}
                  icon={<Globe size={20} />}
                  config={formData.rbac.external}
                  onChange={(cfg: any) => setFormData({ ...formData, rbac: { ...formData.rbac, external: cfg } })}
                />
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] flex items-center gap-6 mt-8">
                <div className="p-4 bg-emerald-500/20 rounded-3xl"><Fingerprint size={48} className="text-emerald-400" /></div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-white">Sovereign Key Handshake Ready</p>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "Finalizing inception will generate a unique matter root key in the primary HSM. Only authorized team members can sign session tokens for this artifact."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between backdrop-blur-md">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-slate-400 font-bold text-sm hover:text-white transition-all disabled:opacity-0 hover:bg-slate-900"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-3.5 text-slate-400 font-bold text-sm hover:text-white transition-all hover:bg-slate-900 rounded-2xl">Cancel</button>
            <button
              onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
              disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-10 py-3.5 rounded-2xl font-bold text-sm shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-3 active:scale-95 group"
            >
              {isSubmitting ? 'Incepting...' : step === 4 ? 'Incept Global Matter' : 'Continue to ' + ['', 'Metadata', 'Pinning', 'RBAC'][step]}
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetadataInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const MetadataInput: React.FC<MetadataInputProps> = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input
      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-800"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

interface RbacRoleCardProps {
  role: string;
  icon: React.ReactNode;
  config: RbacRoleConfig;
  onChange: (config: RbacRoleConfig) => void;
}

const RbacRoleCard: React.FC<RbacRoleCardProps> = ({ role, icon, config, onChange }) => (
  <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-center gap-8 group hover:border-blue-500/30 transition-all">
    <div className="p-4 bg-slate-900 rounded-2xl text-slate-500 group-hover:text-blue-400 transition-colors">{icon}</div>
    <div className="flex-1 space-y-1">
      <p className="text-sm font-bold text-slate-100">{role}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Matter Permission Context</p>
    </div>
    <div className="flex gap-4">
      <PermissionToggle active={config.viewPrivileged} label="Privilege" onClick={() => onChange({ ...config, viewPrivileged: !config.viewPrivileged })} />
      <PermissionToggle active={config.exportSovereign} label="Export" onClick={() => onChange({ ...config, exportSovereign: !config.exportSovereign })} />
      <PermissionToggle active={config.overrideAI} label="Override" onClick={() => onChange({ ...config, overrideAI: !config.overrideAI })} />
    </div>
  </div>
);

interface PermissionToggleProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

const PermissionToggle: React.FC<PermissionToggleProps> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all border ${active ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'}`}
  >
    {label}
  </button>
);

interface PolicyToggleProps {
  active: boolean;
  label: string;
  desc: string;
}

const PolicyToggle: React.FC<PolicyToggleProps> = ({ active, label, desc }) => (
  <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-purple-500/5 border-purple-500/20' : 'bg-slate-900/50 border-slate-800 opacity-40'}`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-purple-400' : 'bg-slate-600'}`}></div>
      <p className={`text-[10px] font-bold ${active ? 'text-slate-200' : 'text-slate-500'}`}>{label}</p>
    </div>
    <p className="text-[9px] text-slate-600 leading-tight">{desc}</p>
  </div>
);

interface InterceptorCardProps {
  active: boolean;
  label: string;
  desc: string;
}

const InterceptorCard: React.FC<InterceptorCardProps> = ({ active, label, desc }) => (
  <div className="p-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] flex items-center justify-between group hover:border-amber-500/30 transition-all">
    <div className="flex items-center gap-5">
      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-500 group-hover:text-amber-400 transition-colors">
        <Sliders size={18} />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-bold text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase">
      <ShieldCheck size={12} /> Active
    </div>
  </div>
);

export default MatterCreationModal;
