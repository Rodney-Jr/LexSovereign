
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Key,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Fingerprint,
  Scale,
  Lock,
  Zap,
  Globe2,
  Cpu,
  ShieldAlert,
  Briefcase,
  FileSignature,
  Terminal,
  Activity,
  RefreshCw,
  Box,
  Layers,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Region, SaaSPlan, AppMode } from '../types';
import { authorizedFetch } from '../utils/api';

interface PricingConfig {
  id: string;
  basePrice: number;
  pricePerUser: number;
  creditsIncluded: number;
  features: string[];
}

interface InceptionStep {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const steps: InceptionStep[] = [
  { id: 1, label: 'Entity Route', icon: <Building2 size={16} /> },
  { id: 2, label: 'Logical Silo', icon: <Globe size={16} /> },
  { id: 3, label: 'SaaS Tier', icon: <CreditCard size={16} /> },
  { id: 4, label: 'KMS Handshake', icon: <Key size={16} /> },
  { id: 5, label: 'Guardrails', icon: <ShieldCheck size={16} /> },
  { id: 6, label: 'Oath', icon: <FileSignature size={16} /> }
];

const TenantOnboarding: React.FC<{ onComplete: (mode: AppMode) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [entityType, setEntityType] = useState<AppMode | null>(null);
  const [affidavitSigned, setAffidavitSigned] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionLogs, setProvisionLogs] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    plan: SaaSPlan.PROFESSIONAL,
    region: Region.PRIMARY,
    encryption: 'SYSTEM',
    adminEmail: '',
    adminPassword: ''
  });

  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const data = await authorizedFetch('/api/pricing');
        if (data && !data.error) {
          setPricingConfigs(data);

          // Pre-select plan from URL
          const params = new URLSearchParams(window.location.search);
          const planParam = params.get('plan');
          if (planParam) {
            // Match case-insensitively or exactly as per seed IDs
            const matchedPlan = data.find((p: any) => p.id.toLowerCase() === planParam.toLowerCase());
            if (matchedPlan) {
              setFormData(prev => ({ ...prev, plan: matchedPlan.id as SaaSPlan }));
              // If we already have a plan, we could skip to a later step, 
              // but usually the user still needs to fill in their name/email.
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      } finally {
        setPricingLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const getPricingForPlan = (plan: SaaSPlan): PricingConfig | undefined => {
    return pricingConfigs.find(p => p.id === plan);
  };

  const addLog = (msg: string) => {
    setProvisionLogs(prev => [`> ${msg}`, ...prev.slice(0, 5)]);
  };

  const runProvisioning = async () => {
    setIsProvisioning(true);
    setProvisionLogs([]);

    try {
      // Start the API call immediately
      const apiCall = authorizedFetch('/api/auth/onboard-silo', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          plan: formData.plan,
          appMode: entityType || AppMode.LAW_FIRM,
          region: formData.region,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword
        })
      });

      // Visual sequence
      const sequence = [
        `Initializing ${formData.plan} Instance...`,
        "Software-Defined Silo: Allocated.",
        "Binding Logical Context to Regional IP-Pin...",
        formData.plan === SaaSPlan.INSTITUTIONAL ? "Provisioning BYOK Handshake Gateway..." : "Generating System-Managed Master Key...",
        "Sovereign Trust Chain pinned. HSM Handshake Complete."
      ];

      // Play logs while waiting for API, but ensure at least some logs show
      for (let i = 0; i < sequence.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        addLog(sequence[i]!);
      }

      // Await the real result
      const data = await apiCall;

      if (data.error) {
        let errorMessage = data.error || 'Provisioning failed';
        let isConflict = data.code === 'CONFLICT';

        if (isConflict) {
          throw new Error("IDENTITY CONFLICT: This email is already registered in a NomosDesk Enclave.");
        }
        throw new Error(errorMessage);
      }

      const session = data;

      // Add success log and wait a tiny bit
      addLog("Silo Activation: CONFIRMED.");
      await new Promise(r => setTimeout(r, 400));

      setTimeout(() => {
        setIsProvisioning(false);
        setStep(5);
        // Store for final launch
        (window as any)._pendingSession = session;
      }, 500);

    } catch (e: any) {
      addLog(`CRITICAL ERROR: ${e.message}`);
      // Do not disable provisioning state immediately so user sees the error? 
      // Or just revert state.
      setTimeout(() => setIsProvisioning(false), 2000);
    }
  };

  const next = () => {
    if (step === 3) {
      runProvisioning();
      setStep(4);
    } else {
      setStep(s => Math.min(s + 1, 6));
    }
  };

  const prev = () => setStep(s => Math.max(s - 1, 1));
  const isStep1Valid = formData.name && entityType !== null && formData.adminEmail && formData.adminPassword.length >= 6;

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Progress Header */}
      <div className="flex items-center justify-between px-8">
        {steps.map((s) => (
          <React.Fragment key={s.id}>
            <div className={`flex flex-col items-center gap-2 transition-all ${step >= s.id ? 'text-emerald-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 font-bold text-sm transition-all duration-500 ${step === s.id ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] rotate-3' :
                step > s.id ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-slate-900 border-slate-800'
                }`}>
                {step > s.id ? <CheckCircle2 size={18} /> : s.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest hidden lg:block">
                {s.label}
              </span>
            </div>
            {s.id < 6 && <div className={`flex-1 h-[1px] mx-4 rounded-full transition-all duration-1000 ${step > s.id ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-xl min-h-[600px] flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] -mr-40 -mt-40 group-hover:bg-emerald-500/10 transition-all"></div>

        <div className="relative z-10 flex-1 flex flex-col">
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 flex-1">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><Building2 className="text-blue-400" size={20} /></div>
                  Entity Route
                </h3>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed">NomosDesk implements Route-Based Sovereignty. Select the architectural template that matches your organizational charter.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <RouteCard
                  active={entityType === AppMode.LAW_FIRM}
                  onClick={() => setEntityType(AppMode.LAW_FIRM)}
                  icon={<Scale size={28} />}
                  title="Route A: Law Firm"
                  desc="Provision a Digital Chambers with Professional Ethical Interceptors enabled by default."
                  color="blue"
                  sub="SOVEREIGN CHAMBERS"
                />
                <RouteCard
                  active={entityType === AppMode.ENTERPRISE}
                  onClick={() => setEntityType(AppMode.ENTERPRISE)}
                  icon={<Briefcase size={28} />}
                  title="Route B: Legal Dept"
                  desc="Provision an Enterprise Enclave with Jurisdictional Compliance and OCG Audit logic."
                  color="purple"
                  sub="ENTERPRISE ENCLAVE"
                />
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Legal Entity Identity</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-800"
                    placeholder={entityType === AppMode.ENTERPRISE ? "e.g. Enterprise Global Corp" : "e.g. Strategic Partners Group"}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Administrator Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-800"
                      placeholder="admin@organization.internal"
                      value={formData.adminEmail}
                      onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Master Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-800"
                      placeholder="••••••••"
                      value={formData.adminPassword}
                      onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 flex-1">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Globe className="text-emerald-400" size={20} /></div>
                  Regional Silo Residency
                </h3>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Select your logical data pinning silo. This ensures compliance with regional Data Protection standards.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SiloCard
                  region={Region.PRIMARY}
                  active={formData.region === Region.PRIMARY}
                  onSelect={() => setFormData({ ...formData, region: Region.PRIMARY })}
                  cluster="Jurisdictional Primary Silo"
                  latency="12ms"
                />
                <div className="p-8 rounded-[2.5rem] border border-slate-900 bg-slate-950/40 opacity-30 cursor-not-allowed flex flex-col justify-center items-center gap-4 text-center grayscale">
                  <Globe2 size={40} className="text-slate-700" />
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">International Regional Silos<br />Sovereign Tier Required</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 flex-1">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20"><CreditCard className="text-purple-400" size={20} /></div>
                  Sovereign Subscription
                </h3>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Resource allocation defines your cryptographic isolation level and AI throughput.</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <PlanCard
                  plan={SaaSPlan.STARTER}
                  active={formData.plan === SaaSPlan.STARTER}
                  onClick={() => setFormData({ ...formData, plan: SaaSPlan.STARTER })}
                  pricing={getPricingForPlan(SaaSPlan.STARTER)}
                  loading={pricingLoading}
                />
                <PlanCard
                  plan={SaaSPlan.PROFESSIONAL}
                  active={formData.plan === SaaSPlan.PROFESSIONAL}
                  onClick={() => setFormData({ ...formData, plan: SaaSPlan.PROFESSIONAL })}
                  pricing={getPricingForPlan(SaaSPlan.PROFESSIONAL)}
                  loading={pricingLoading}
                  highlight={true}
                />
                <PlanCard
                  plan={SaaSPlan.INSTITUTIONAL}
                  active={formData.plan === SaaSPlan.INSTITUTIONAL}
                  onClick={() => setFormData({ ...formData, plan: SaaSPlan.INSTITUTIONAL })}
                  pricing={getPricingForPlan(SaaSPlan.INSTITUTIONAL)}
                  loading={pricingLoading}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-in zoom-in-95 duration-500 flex-1 flex flex-col">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20"><Key className="text-purple-400" size={20} /></div>
                  KMS Inception Handshake
                </h3>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Provisioning organization master keys and initializing the logical HSM gateway for the <strong className="text-white">{formData.plan}</strong> tier.</p>
              </div>

              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5"><Zap size={200} /></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-700 ${isProvisioning ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                      {isProvisioning ? <RefreshCw className="animate-spin" size={32} /> : <Lock size={32} />}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-white">Silo-HSM: {formData.region}</h4>
                      <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">{isProvisioning ? 'MAPPING RESOURCE QUOTAS...' : 'AWAITING INITIALIZATION'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-black/40 rounded-3xl p-6 font-mono text-[10px] space-y-2 border border-slate-900/50 overflow-y-auto scrollbar-hide">
                  {provisionLogs.map((log, i) => (
                    <p key={i} className="text-emerald-500/80 animate-in slide-in-from-left-2">{log}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 flex-1">
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20"><ShieldCheck className="text-amber-400" size={20} /></div>
                  Active Guardrails
                </h3>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Configure jurisdictional AI interceptors authorized by your <strong className="text-white">{formData.plan}</strong> subscription.</p>
              </div>
              <div className="space-y-4">
                {entityType === AppMode.LAW_FIRM ? (
                  <>
                    <InterceptorToggle active={true} icon={<Scale size={16} />} label="Ethics & UPL Intercept" desc="Blocks advice triggers for non-verified practitioners." />
                    <InterceptorToggle active={formData.plan !== SaaSPlan.STARTER} icon={<Activity size={16} />} label="Scale of Fees Auditor" desc="Real-time compliance checks for jurisdictional legal billing." />
                  </>
                ) : (
                  <>
                    <InterceptorToggle active={true} icon={<Layers size={16} />} label="Regulatory Compliance Auditor" desc="Scans for regional AML/KYC trigger events." />
                    <InterceptorToggle active={formData.plan !== SaaSPlan.STARTER} icon={<ShieldAlert size={16} />} label="OCG Expenditure Policy" desc="Ensures external spend matches corporate guidelines." />
                  </>
                )}
                <InterceptorToggle active={true} icon={<Fingerprint size={16} />} label="Logical DAS Scrubbing" desc="PII Redaction filter active for all software-defined inference." />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-10 animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-4 animate-bounce">
                <FileSignature size={48} className="text-slate-950" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 w-full max-w-2xl shadow-inner text-center">
                <h4 className="text-2xl font-bold text-white">Sovereign Admin Oath</h4>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest italic leading-relaxed">
                  "I acknowledge that this Silo operates on the <strong className="text-emerald-500">{formData.plan}</strong> Tier. I accept regional pinning and verify that all AI outputs will be human-reviewed."
                </p>
                <label className="flex items-center gap-5 cursor-pointer group p-6 bg-slate-900 border border-slate-800 rounded-3xl transition-all hover:border-emerald-500/30 text-left">
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${affidavitSigned ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-950 border-slate-700'}`}>
                    {affidavitSigned && <CheckCircle2 size={20} className="text-slate-950" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={affidavitSigned} onChange={() => setAffidavitSigned(!affidavitSigned)} />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-200">Electronically execute Silo Master Agreement</p>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Trace-ID: SOV-INC-{Math.random().toString(16).slice(2, 8).toUpperCase()}</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-800 relative z-10">
          <button onClick={prev} disabled={(step === 1) || (step === 4 && isProvisioning)} className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-slate-400 font-bold hover:text-white disabled:opacity-0 transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <button
            onClick={step === 6 ? () => onComplete(entityType!) : next}
            disabled={(step === 1 && !isStep1Valid) || (step === 4 && isProvisioning) || (step === 6 && !affidavitSigned) || (step === 3 && formData.plan === SaaSPlan.INSTITUTIONAL && getPricingForPlan(SaaSPlan.INSTITUTIONAL)?.basePrice === 0)}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-12 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-2xl shadow-emerald-900/30 active:scale-95"
          >
            {step === 3 && formData.plan === SaaSPlan.INSTITUTIONAL && getPricingForPlan(SaaSPlan.INSTITUTIONAL)?.basePrice === 0 ? 'Contact Sales' : (step === 6 ? 'Launch Legal Silo' : 'Initialize Phase')}
            {step < 6 && !(step === 3 && formData.plan === SaaSPlan.INSTITUTIONAL && getPricingForPlan(SaaSPlan.INSTITUTIONAL)?.basePrice === 0) && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const PlanCard = ({ plan, active, onClick, pricing, loading, highlight }: any) => {
  if (loading) {
    return (
      <div className="p-6 rounded-[2rem] border-2 border-slate-800 bg-slate-950 animate-pulse">
        <div className="h-20 bg-slate-800 rounded mb-4"></div>
        <div className="h-12 bg-slate-800 rounded"></div>
      </div>
    );
  }

  const basePrice = pricing?.basePrice || 0;
  const perUserPrice = pricing?.pricePerUser || 0;
  const features = pricing?.features || [];

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col relative ${active ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl shadow-emerald-500/10' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
        } ${highlight && !active ? 'border-dashed border-emerald-500/30' : ''}`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
      )}
      <div className="space-y-1 mb-4">
        <h4 className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-emerald-400' : 'text-slate-500'}`}>{plan}</h4>
        {plan === SaaSPlan.INSTITUTIONAL && basePrice === 0 ? (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white uppercase tracking-tighter">Custom Quote</span>
            <span className="text-[8px] text-amber-500 font-bold">CONTACT SALES REQUIRED</span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">${basePrice}</span>
              <span className="text-[10px] text-slate-500">/mo</span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono">+ ${perUserPrice}/user</p>
          </>
        )}
      </div>
      <div className="space-y-2 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-2 text-[9px] text-slate-300">
            <Sparkles size={10} className="text-emerald-500 shrink-0" /> {f}
          </div>
        ))}
      </div>
    </button>
  );
};

const RouteCard = ({ active, onClick, icon, title, desc, color, sub }: any) => (
  <button
    onClick={onClick}
    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between group h-64 ${active ? `bg-${color}-500/10 border-${color}-500 shadow-2xl shadow-${color}-500/10` : 'bg-slate-950 border-slate-800 hover:border-slate-700'
      }`}
  >
    <div className={`p-4 rounded-2xl w-fit transition-all duration-500 ${active ? `bg-${color}-500 text-slate-950 shadow-lg` : 'bg-slate-900 text-slate-600'}`}>
      {icon}
    </div>
    <div className="space-y-2">
      <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${active ? `text-${color}-400` : 'text-slate-600'}`}>{sub}</p>
      <h4 className="font-bold text-xl text-white tracking-tight">{title}</h4>
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
    </div>
  </button>
);

const SiloCard = ({ region, active, onSelect, cluster, latency }: any) => (
  <button
    onClick={onSelect}
    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left group ${active ? 'bg-emerald-500/10 border-emerald-500 shadow-2xl shadow-emerald-500/10' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
      }`}
  >
    <div className="flex items-center justify-between mb-8">
      <div className={`p-4 rounded-2xl transition-all duration-500 ${active ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 text-slate-500'}`}>
        <Globe2 size={32} />
      </div>
      {active && <div className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">PINNED</div>}
    </div>
    <div className="space-y-2">
      <h4 className="font-bold text-xl text-white tracking-tight">{region} Logical Silo</h4>
      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest">{cluster}</p>
      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2"><Activity size={12} className="text-emerald-500" /> Residency Verified</div>
        <span className="font-mono text-slate-600">{latency}</span>
      </div>
    </div>
  </button>
);

const InterceptorToggle = ({ active, label, desc, icon }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-3xl group hover:border-blue-500/30 transition-all">
    <div className="flex items-center gap-6">
      <div className="p-3 bg-slate-900 rounded-2xl text-slate-600 group-hover:text-blue-400 transition-colors border border-slate-800">{icon}</div>
      <div className="space-y-1 text-left">
        <h4 className="text-sm font-bold text-slate-100">{label}</h4>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-all ${active ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`}></div>
    </div>
  </div>
);

export default TenantOnboarding;
