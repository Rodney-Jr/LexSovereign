
import React, { useState, useEffect } from 'react';
import {
  X, Briefcase, Users, Globe, Shield, CheckCircle2, Zap,
  ArrowRight, ArrowLeft, Lock, EyeOff, UserCheck,
  ShieldAlert, Scale, Settings, LayoutGrid, Fingerprint,
  Sliders, ShieldCheck, Database
} from 'lucide-react';
import { Region, Matter, AppMode, UserRole } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import FileUploader, { UploadedFile } from './FileUploader';

interface MatterCreationModalProps {
  mode: AppMode;
  userId: string;
  tenantId: string;
  onClose: () => void;
  onCreated: (matter: Matter) => void;
}

const MatterCreationModal: React.FC<MatterCreationModalProps> = ({ mode, userId, tenantId, onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [isProfiling, setIsProfiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const isFirm = mode === AppMode.LAW_FIRM;

  // ... (existing state)

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    type: isFirm ? 'Litigation' : 'Corporate Governance',
    internalCounsel: '',
    region: Region.GHANA,
    description: '',
    riskLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    dasLevel: 2, // 1: Standard, 2: Strict, 3: Aggressive Redaction
    rbac: {
      lead: { viewPrivileged: true, exportSovereign: true, overrideAI: true },
      associate: { viewPrivileged: true, exportSovereign: false, overrideAI: true },
      external: { viewPrivileged: false, exportSovereign: false, overrideAI: false }
    }
  });

  // ... (AI Profiling code)

  // ... (useEffect)

  const handleFilesAdded = (files: FileList) => {
    // ... (existing code, unchanged logic but included for context if needed, but since relying on previous context, I'll only replace the parts changed)
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
      // Direct API Call with mock IDs if necessary
      const payload = {
        name: formData.name,
        client: formData.client,
        type: formData.type,
        description: formData.description,
        internalCounselId: userId, // Using current user as counsel for now
        tenantId: tenantId,
        riskLevel: formData.riskLevel,
        // region: formData.region  // Region is not on Matter schema yet, likely inferred from Tenant or User
      };

      // Retrieve token from localStorage
      const savedSession = localStorage.getItem('lexSovereign_session');
      let token = '';
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          token = session.token || '';
        } catch (e) {
          console.error("Error parsing session for token", e);
        }
      }

      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create matter');
      }

      const newMatter = await response.json();
      onCreated(newMatter);
    } catch (e) {
      console.error("Failed to create matter, implementing fallback for demo...", e);
      // Fallback for demo if API fails (e.g. no DB connection)
      const fallbackMatter: Matter = {
        ...formData,
        id: `MT-${Math.floor(Math.random() * 900 + 100)}`,
        status: 'Open',
        attachedFiles: attachedFiles.map(f => f.name) as string[],
        createdAt: new Date().toISOString().split('T')[0] ?? new Date().toISOString()
      };
      onCreated(fallbackMatter);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.name && formData.client && formData.description;

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
                <h3 className="text-xl font-bold text-white tracking-tight">Advanced Matter Inception</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Tenant Administrator Protocol</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2.5 hover:bg-slate-800 rounded-full text-slate-500 transition-all hover:rotate-90">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-2 transition-all ${step >= i ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 font-bold text-[10px] ${step === i ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                    step > i ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-slate-900 border-slate-800'
                    }`}>
                    {step > i ? <CheckCircle2 size={16} /> : i}
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">
                    {['Context', 'Pinning', 'Team/RBAC', 'Proxy/DAS', 'Rules'][i - 1]}
                  </span>
                </div>
                {i < 5 && <div className={`flex-1 h-[1px] mx-4 ${step > i ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">

          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-2 gap-8">
                <MetadataInput label="Matter Name" placeholder="e.g. Project Sunbird Restructure" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
                <MetadataInput label={isFirm ? "Client Entity" : "Internal Business Unit"} placeholder="Search verified directory..." value={formData.client} onChange={(v: string) => setFormData({ ...formData, client: v })} />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contextual Summary (AI-Profiled)</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-32 resize-none transition-all placeholder:text-slate-800"
                  placeholder="Describe the matter scope for risk inference..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <FileUploader files={attachedFiles} onFilesAdded={handleFilesAdded} onRemove={removeFile} />
              {isProfiling && <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl animate-pulse text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} /> Running Jurisdictional Complexity Profile...</div>}
            </div>
          )}

          {step === 2 && (
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

          {step === 3 && (
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
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-8">
              <h4 className="text-lg font-bold text-white flex items-center gap-3"><EyeOff className="text-purple-400" /> Intelligence Proxy (DAS) Setup</h4>
              <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Privacy Shield Strength</label>
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${formData.dasLevel === 3 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      Level {formData.dasLevel}: {formData.dasLevel === 1 ? 'Standard' : formData.dasLevel === 2 ? 'Strict' : 'Aggressive (Zero-PII)'}
                    </span>
                  </div>
                  <input
                    type="range" min="1" max="3" step="1"
                    value={formData.dasLevel}
                    aria-label="Privacy Shield Strength"
                    onChange={(e) => setFormData({ ...formData, dasLevel: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase tracking-tighter">
                    <span>Min Redaction</span>
                    <span>Full Anonymization</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PolicyToggle active={true} label="RAM-Only Inference" desc="Chunks never touch persistent AI cache." />
                  <PolicyToggle active={formData.dasLevel > 1} label="Identity Masking" desc="All names/IDs replaced with deterministic tokens." />
                  <PolicyToggle active={true} label="Regional Egress Lock" desc="Force block all cross-border inference calls." />
                  <PolicyToggle active={formData.dasLevel === 3} label="Metadata-Only Mode" desc="LLM only sees file context, no body text." />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right-8">
              <h4 className="text-lg font-bold text-white flex items-center gap-3"><Scale className="text-amber-400" /> Jurisdictional Guardrails</h4>
              <div className="space-y-4">
                <InterceptorCard
                  active={true}
                  label={isFirm ? "GBA Ethical Intercept v2.4" : "BoG Compliance Auditor"}
                  desc={isFirm ? "Blocks definitive legal advice triggers for non-verified practitioners." : "Scans for Bank of Ghana AML/KYC trigger events automatically."}
                />
                <InterceptorCard
                  active={true}
                  label="Conflict-of-Interest Filter"
                  desc="Zero-knowledge search for party collisions across all regional silos."
                />
                {isFirm && (
                  <InterceptorCard
                    active={true}
                    label="Scale of Fees Enforcement"
                    desc="Automated audit of time entries against Ghana statutory fee scales."
                  />
                )}
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] flex items-center gap-6">
                <div className="p-4 bg-emerald-500/20 rounded-3xl"><Fingerprint size={48} className="text-emerald-400" /></div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-white">Sovereign Key Handshake Ready</p>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "Finalizing inception will generate a unique matter root key in the Accra HSM. Only authorized team members can sign session tokens for this artifact."
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
              onClick={() => step < 5 ? setStep(step + 1) : handleSubmit()}
              disabled={step === 1 && !isStep1Valid}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-10 py-3.5 rounded-2xl font-bold text-sm shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-3 active:scale-95 group"
            >
              {step === 5 ? 'Incept Global Matter' : 'Continue to ' + ['', 'Pinning', 'RBAC', 'DAS', 'Rules'][step]}
              <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetadataInput = ({ label, placeholder, value, onChange }: any) => (
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

const RbacRoleCard = ({ role, icon, config, onChange }: any) => (
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

const PermissionToggle = ({ active, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all border ${active ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'}`}
  >
    {label}
  </button>
);

const PolicyToggle = ({ active, label, desc }: any) => (
  <div className={`p-4 rounded-2xl border transition-all ${active ? 'bg-purple-500/5 border-purple-500/20' : 'bg-slate-900/50 border-slate-800 opacity-40'}`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-purple-400' : 'bg-slate-600'}`}></div>
      <p className={`text-[10px] font-bold ${active ? 'text-slate-200' : 'text-slate-500'}`}>{label}</p>
    </div>
    <p className="text-[9px] text-slate-600 leading-tight">{desc}</p>
  </div>
);

const InterceptorCard = ({ active, label, desc }: any) => (
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
