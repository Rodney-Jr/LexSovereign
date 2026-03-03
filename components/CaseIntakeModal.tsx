import React, { useState } from 'react';
import {
    X,
    Scale,
    MapPin,
    Hash,
    User,
    Calendar,
    AlertTriangle,
    ArrowRight,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface CaseIntakeModalProps {
    onClose: () => void;
    onCreated: (matter: any) => void;
}

const CaseIntakeModal: React.FC<CaseIntakeModalProps> = ({ onClose, onCreated }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Case Matter Identity
    const [name, setName] = useState('');
    const [client, setClient] = useState('');
    const [internalCounselId, setInternalCounselId] = useState('');

    // Litigation Specifics
    const [jurisdiction, setJurisdiction] = useState('');
    const [caseNumber, setCaseNumber] = useState('');
    const [courtName, setCourtName] = useState('');
    const [judgeName, setJudgeName] = useState('');
    const [filedDate, setFiledDate] = useState('');

    const handleCreateCase = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) throw new Error("No active session");

            // 1. Create the base Matter
            const matterResponse = await authorizedFetch('/api/matters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    client,
                    type: 'Case', // MatterType category
                    internalCounselId: session.userId, // Defaulting to creator for now
                    attributes: { source: 'CaseIntake' }
                }),
                token: session.token
            });

            if (!matterResponse.id) throw new Error("Failed to create matter container");

            // 2. Initialize Case Metadata
            await authorizedFetch('/api/workflows/litigation/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matterId: matterResponse.id,
                    metadata: {
                        jurisdiction,
                        caseNumber,
                        courtName,
                        judgeName,
                        filedDate
                    }
                }),
                token: session.token
            });

            // 3. Start the Case Workflow
            // Assuming a default "Case Management" workflow exists. In a real system, we'd fetch the ID.
            // For this implementation, we'll assume the backend handles default workflow assignment via MatterType logic if we don't pass an ID.

            onCreated(matterResponse);
        } catch (e: any) {
            console.error("Case Inception Failed", e);
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#0a0c10] border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-900 flex">
                    <div
                        className="h-full bg-sky-500 transition-all duration-500 shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-10 border-b border-slate-800/50">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                            <Scale className="text-sky-400" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Case Inception Protocol</h2>
                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Litigation & Advisory Unit | Step {step} of 2</p>
                        </div>
                    </div>
                    <button
                        title="Close Inception Protocol"
                        onClick={onClose}
                        className="p-3 hover:bg-slate-800/50 rounded-2xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {step === 1 ? (
                        <div className="space-y-10 animate-in slide-in-from-right duration-500">
                            <SectionHeader icon={<Briefcase size={18} />} title="Instance Identity" desc="Define the core parameters for this litigation matter." />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup id="caseName" label="Matter / Case Title" icon={<Scale size={16} />} value={name} onChange={setName} placeholder="e.g. Acme Corp v. Stellar Dynamics" />
                                <InputGroup id="clientName" label="Client (Entity/Individual)" icon={<User size={16} />} value={client} onChange={setClient} placeholder="e.g. Acme Corp" />
                            </div>

                            <div className="p-8 bg-sky-500/5 border border-sky-500/10 rounded-3xl flex items-start gap-4 shadow-inner">
                                <AlertTriangle className="text-sky-500 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <h5 className="font-bold text-[10px] text-sky-400 uppercase tracking-widest font-mono">SOVEREIGN COLLISION CHECK</h5>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                        "Matter inception triggers a zero-knowledge conflict search against existing tenant nodes. Identity is preserved while collision is avoided."
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in slide-in-from-right duration-500">
                            <SectionHeader icon={<MapPin size={18} />} title="Jurisdiction & Filing" desc="Assign procedural anchors to the case for automated deadline tracking." />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputGroup id="jurisdiction" label="Primary Jurisdiction" icon={<MapPin size={16} />} value={jurisdiction} onChange={setJurisdiction} placeholder="e.g. Southern District of New York" />
                                <InputGroup id="caseNum" label="Case / Docket Number" icon={<Hash size={16} />} value={caseNumber} onChange={setCaseNumber} placeholder="e.g. 1:23-cv-04567" />
                                <InputGroup id="courtName" label="Court / Tribunal" icon={<Scale size={16} />} value={courtName} onChange={setCourtName} placeholder="e.g. U.S. Federal Court" />
                                <InputGroup id="judgeName" label="Assigned Judge / Arbitrator" icon={<User size={16} />} value={judgeName} onChange={setJudgeName} placeholder="e.g. Judge Richards" />
                                <InputGroup id="filedDate" label="Filed Date" icon={<Calendar size={16} />} type="date" value={filedDate} onChange={setFiledDate} />
                            </div>

                            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-start gap-4 shadow-inner">
                                <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <h5 className="font-bold text-[10px] text-emerald-400 uppercase tracking-widest font-mono">DEADLINE ENGINE SYNC</h5>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                        "Jurisdiction-specific rules will be auto-calculated upon induction. Pleadings, Discovery, and Hearing windows will be initialized."
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-slate-800/50 bg-[#0c0e14] flex items-center justify-between">
                    <button
                        title="Go Back"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="px-8 py-4 text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        {step === 1 ? 'Cancel Operation' : 'Reverse Buffer'}
                    </button>

                    <button
                        title={step === 2 ? "Finalize Inception" : "Continue to Metadata"}
                        disabled={loading}
                        onClick={() => step === 1 ? setStep(2) : handleCreateCase()}
                        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center gap-4 transition-all shadow-2xl shadow-sky-900/30 active:scale-95"
                    >
                        {loading ? 'Processing...' : step === 1 ? (
                            <>Construct Meta-Layer <ArrowRight size={20} /></>
                        ) : (
                            <>Finalize Case Inception <ShieldCheck size={20} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface InputGroupProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ id, label, icon, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-3 group">
        <label htmlFor={id} className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors group-focus-within:text-sky-400">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors">
                {icon}
            </div>
            <input
                id={id}
                title={label}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-900/50 border border-slate-800 focus:border-sky-500/50 rounded-2xl py-5 pl-14 pr-8 text-white text-sm outline-none transition-all placeholder:text-slate-700"
            />
        </div>
    </div>
);

const SectionHeader = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-3 text-sky-400 mb-2">
            {icon}
            <h4 className="font-bold text-xs uppercase tracking-[0.2em]">{title}</h4>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default CaseIntakeModal;
