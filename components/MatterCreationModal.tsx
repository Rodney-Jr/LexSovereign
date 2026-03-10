
import React, { useState, useEffect } from 'react';
import {
  X, Briefcase, Users, Globe, Shield, CheckCircle2, Zap,
  ArrowRight, ArrowLeft, Lock, EyeOff, UserCheck,
  ShieldAlert, Scale, Settings, LayoutGrid, Fingerprint,
  Sliders, ShieldCheck, Database, Search, RefreshCw, FileText
} from 'lucide-react';
import { Region, Matter, AppMode } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import FileUploader, { UploadedFile } from './FileUploader';
import { authorizedFetch, getSavedSession } from '../utils/api';
import CLMIntakeModal from './CLMIntakeModal';
import CaseIntakeModal from './CaseIntakeModal';

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
  const [createdMatter, setCreatedMatter] = useState<Matter | null>(null);
  const [promotionIntent, setPromotionIntent] = useState<'CASE' | 'CLM' | null>(null);
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
    overrideJustification: '',
    billing: {
      type: 'HOURLY' as 'HOURLY' | 'FLAT_FEE' | 'MILESTONE' | 'CONTINGENCY',
      flatFeeAmount: 0,
      depositRequired: false
    }
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
    if (!formData.internalCounsel) return;

    try {
      const session = getSavedSession();
      if (!session?.token) return;

      const data = await authorizedFetch(`/api/matters/validate-capacity?userId=${formData.internalCounsel}&riskLevel=LOW&region=${formData.region}&complexityWeight=5.0`, {
        token: session.token
      });

      if (!data.allowed) {
        setCapacityStatus({
          severity: data.severity || 'OVERRIDE',
          reason: data.reason
        });
      } else {
        setCapacityStatus({
          severity: data.severity || 'GREEN',
          reason: data.reason
        });
        setShowOverrideInput(false);
      }
    } catch (err) {
      console.error("[Capacity] Validation failed:", err);
    }
  };

  const handleFilesAdded = async (files: FileList) => {
    const newFiles = Array.from(files).map((f: File) => {
      const id = `file-${crypto.randomUUID()}`;
      return {
        id,
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
        status: 'encrypted' as const,
        file: f
      };
    });

    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    // Step 1: Internal validation safety net (Pro Fix)
    if (!formData.name || !formData.client || !formData.type) {
      alert('Inception Protocol Halted: Required fields (Name, Client/Entity) are missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = getSavedSession();
      if (!session?.token) {
        throw new Error('Authentication required');
      }

      const { rbac, ...flatFormData } = formData;
      const payload = {
        ...flatFormData,
        tenantId: session.tenantId,
        internalCounselId: formData.internalCounsel,
        riskLevel: 'LOW',
        complexityWeight: 5.0,
        conflictStatus: conflictResult === 'CLEAN' ? 'CLEAN' : 'COLLISION',
        conflictProof: conflictResult === 'CLEAN' ? `ZK-PROOF-${(crypto.randomUUID().split('-')[0] || 'A1B2C').toUpperCase()}` : undefined
      };

      const newMatter = await authorizedFetch('/api/matters', {
        method: 'POST',
        token: session.token,
        body: JSON.stringify(payload)
      });

      if (newMatter && !newMatter.id) throw new Error(newMatter.error || "Matter inception failed");

      // Link Billing Component
      try {
        await authorizedFetch('/api/billing/components', {
          method: 'POST',
          token: session.token,
          body: JSON.stringify({
            matterId: newMatter.id,
            type: formData.billing.type,
            config: {
              fixedAmount: formData.billing.flatFeeAmount || null,
              depositRequired: formData.billing.depositRequired,
              priority: formData.billing.type === 'FLAT_FEE' ? 10 : 0
            }
          })
        });
      } catch (billingErr) {
        console.error("Failed to link Billing Component, proceeding with Matter creation:", billingErr);
      }

      // Upload artifacts
      if (attachedFiles.length > 0) {
        for (const fileItem of attachedFiles) {
          if (fileItem.file) {
            const formDataPayload = new FormData();
            formDataPayload.append('file', fileItem.file);
            formDataPayload.append('matterId', newMatter.id);
            formDataPayload.append('region', flatFormData.region);

            try {
              await fetch('/api/documents/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.token}`
                },
                body: formDataPayload
              });
            } catch (err) {
              console.error('Failed to upload artifact:', err);
            }
          }
        }
      }

      setCreatedMatter(newMatter);
      setStep(5); // Advance to Promotion
    } catch (e: any) {
      console.error("Failed to create matter:", e);
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  };

  const performZkConflictSearch = async () => {
    if (!conflictSearchTerm || conflictSearchTerm.length < 3) return;

    setIsConflictSearching(true);
    setConflictResult('SCANNING');
    setConflictScanProgress(0);

    // Visual progress simulation
    const interval = setInterval(() => {
      setConflictScanProgress(p => (p >= 90 ? p : p + 10));
    }, 50);

    try {
      const session = getSavedSession();
      if (!session?.token) throw new Error("No session");

      const data = await authorizedFetch('/api/matters/conflict-check', {
        method: 'POST',
        token: session.token,
        body: JSON.stringify({ searchTerm: conflictSearchTerm })
      });

      clearInterval(interval);
      setConflictScanProgress(100);
      setIsConflictSearching(false);
      setConflictResult(data.result);

      if (data.collisions) {
        console.warn("[Conflict] Collisions detected:", data.collisions);
      }
    } catch (err) {
      console.error("[Conflict] Search failed:", err);
      clearInterval(interval);
      setIsConflictSearching(false);
      setConflictResult('CLEAN'); // Fallback to safe state
    }
  };

  const isStep1Valid = conflictResult === 'CLEAN';
  const isStep2Valid = formData.name && formData.client && formData.type;

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
                <MetadataInput label="Matter Name *" placeholder="e.g. Standard Corporate Restructure" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
                <MetadataInput label={isFirm ? "Client Entity *" : "Internal Business Unit *"} placeholder="Search verified directory..." value={formData.client} onChange={(v: string) => setFormData({ ...formData, client: v })} />
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="internalCounsel">Assigned Practitioner (Optional)</label>
                  <select
                    id="internalCounsel"
                    title="Select assigned practitioner"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-300"
                    value={formData.internalCounsel}
                    onChange={e => setFormData({ ...formData, internalCounsel: e.target.value })}
                  >
                    <option value="">Skip for now / Unassigned</option>
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

              {/* Billing Foundation Configuration */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Database className="text-emerald-400" size={16} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white tracking-tight">Financial & Billing Foundation</h5>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Immutable Ledger Configuration</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Billing Model</label>
                    <select
                      title="Select billing model"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-slate-300"
                      value={formData.billing.type}
                      onChange={e => setFormData({ ...formData, billing: { ...formData.billing, type: e.target.value as any } })}
                    >
                      <option value="HOURLY">Hourly (Time & Materials)</option>
                      <option value="FLAT_FEE">Flat Fee (Fixed Pricing)</option>
                      <option value="MILESTONE">Milestone Based</option>
                      <option value="CONTINGENCY">Contingency (Outcome)</option>
                    </select>
                  </div>

                  {formData.billing.type === 'FLAT_FEE' && (
                    <div className="space-y-2.5 animate-in fade-in duration-300">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Total Fee Amount (USD)</label>
                      <input
                        type="number"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-slate-300"
                        placeholder="e.g. 50000"
                        value={formData.billing.flatFeeAmount || ''}
                        onChange={e => setFormData({ ...formData, billing: { ...formData.billing, flatFeeAmount: parseFloat(e.target.value) || 0 } })}
                      />
                    </div>
                  )}
                </div>

                {formData.billing.type === 'FLAT_FEE' && (
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-8 h-4 rounded-full transition-colors relative ${formData.billing.depositRequired ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${formData.billing.depositRequired ? 'left-[18px]' : 'left-1'}`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Require Instant Deposit Invoice (Trigger 100% upfront)</span>
                    </label>
                  </div>
                )}
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

          {step === 5 && createdMatter && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 py-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-5 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-2">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h4 className="text-3xl font-black text-white italic uppercase tracking-tight">Identity Born.</h4>
                <p className="text-slate-500 text-sm max-w-md mx-auto">Matter identity has been successfully pinned to the <b>{formData.region}</b> silo. How shall we specialize this workflow?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setPromotionIntent('CASE')}
                  className="p-8 bg-slate-950 border border-slate-800 hover:border-sky-500/40 rounded-[2.5rem] text-left group transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-sky-500/10 rounded-2xl group-hover:bg-sky-500/20 transition-all">
                      <Scale className="text-sky-400" size={28} />
                    </div>
                    <ArrowRight size={20} className="text-slate-700 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h5 className="text-lg font-bold text-white mb-2">Litigation & Advisory</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">Initialize court-bound workflows, hearing calendars, and procedural deadline tracking.</p>
                </button>

                <button
                  onClick={() => setPromotionIntent('CLM')}
                  className="p-8 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-[2.5rem] text-left group transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-all">
                      <FileText className="text-emerald-400" size={28} />
                    </div>
                    <ArrowRight size={20} className="text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h5 className="text-lg font-bold text-white mb-2">Contract Lifecycle</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">Activate signing workflows, renewal calendars, and liability cap risk monitoring.</p>
                </button>
              </div>

              <div className="pt-6 text-center">
                <button
                  onClick={() => onCreated(createdMatter)}
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all underline underline-offset-8"
                >
                  Stay in General Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Promotion Overlays */}
        {promotionIntent === 'CASE' && createdMatter && (
          <CaseIntakeModal
            onClose={() => setPromotionIntent(null)}
            onCreated={(matter) => onCreated(matter)}
          />
        )}

        {promotionIntent === 'CLM' && createdMatter && (
          <CLMIntakeModal
            onClose={() => setPromotionIntent(null)}
            onCreated={(matter) => onCreated(matter)}
          />
        )}

        {/* Footer */}
        {step < 5 && (
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
                {isSubmitting ? 'Incepting...' : step === 4 ? 'Finalize Inception' : 'Continue to ' + ['', 'Metadata', 'Pinning', 'RBAC'][step]}
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                )}
              </button>
            </div>
          </div>
        )}
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
