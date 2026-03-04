import React, { useState } from 'react';
import { X, FileText, Calendar, DollarSign, User, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { Region } from '../types';

interface CLMIntakeModalProps {
    existingMatterId?: string;
    initialData?: { name?: string; client?: string; description?: string; internalCounsel?: string; region?: Region };
    onClose: () => void;
    onCreated: (matter: any) => void;
}

const CLMIntakeModal: React.FC<CLMIntakeModalProps> = ({ onClose, onCreated, existingMatterId, initialData }) => {
    const [step, setStep] = useState(existingMatterId ? 2 : 1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        client: initialData?.client || '',
        description: initialData?.description || '',
        counterparty: '',
        value: '',
        currency: 'USD',
        effectiveDate: '',
        renewalDate: '',
        expiryDate: '',
        internalCounsel: initialData?.internalCounsel || '',
        region: initialData?.region || Region.PRIMARY
    });

    const [practitioners, setPractitioners] = useState<any[]>([]);

    React.useEffect(() => {
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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const session = getSavedSession();
            if (!session?.token) throw new Error('Authentication required');

            let matterId = existingMatterId;
            let matterData = null;

            // 1. Create the base Matter if not already existing
            if (!matterId) {
                const matterPayload = {
                    name: formData.name,
                    client: formData.client,
                    type: 'Contract',
                    region: formData.region,
                    internalCounselId: formData.internalCounsel,
                    tenantId: session.tenantId,
                    description: formData.description,
                    complexityWeight: 5.0
                };

                const newMatter = await authorizedFetch('/api/matters', {
                    method: 'POST',
                    token: session.token,
                    body: JSON.stringify(matterPayload)
                });

                if (newMatter.error) throw new Error(newMatter.error);
                matterId = newMatter.id;
                matterData = newMatter;
            } else {
                matterData = { id: matterId, name: formData.name, client: formData.client };
            }

            // 2. Initialize CLM Metadata
            const clmPayload = {
                matterId: matterId,
                metadata: {
                    value: parseFloat(formData.value) || 0,
                    currency: formData.currency,
                    counterparty: formData.counterparty,
                    effectiveDate: formData.effectiveDate,
                    renewalDate: formData.renewalDate,
                    expiryDate: formData.expiryDate
                }
            };

            const clmResponse = await authorizedFetch('/api/workflows/clm/initialize', {
                method: 'POST',
                token: session.token,
                body: JSON.stringify(clmPayload)
            });

            if (clmResponse.error) throw new Error(clmResponse.error);

            onCreated(matterData);
        } catch (e: any) {
            console.error("[CLM Intake] Failed:", e);
            alert(`Inception Failed: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStep1Valid = formData.name && formData.client && formData.counterparty;
    const isStep2Valid = formData.value && formData.internalCounsel;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <FileText className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Contract Intake Protocol</h3>
                            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">CLM Phase 2 Core Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} title="Close Intake Modal" className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-all hover:rotate-90">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step 1: Core Identities</h4>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contract Name</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white"
                                        placeholder="e.g. Master Service Agreement - Q1 Expansion"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Internal Owner/BU</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white"
                                            placeholder="e.g. Marketing Dept"
                                            value={formData.client}
                                            onChange={e => setFormData({ ...formData, client: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Counterparty Entity</label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white"
                                            placeholder="e.g. Acme Corp Inc."
                                            value={formData.counterparty}
                                            onChange={e => setFormData({ ...formData, counterparty: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step 2: Financials & Ownership</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contract Value</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white"
                                            placeholder="0.00"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Internal Counsel</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <select
                                            id="internalCounselSelect"
                                            title="Select Internal Counsel"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white appearance-none"
                                            value={formData.internalCounsel}
                                            onChange={e => setFormData({ ...formData, internalCounsel: e.target.value })}
                                        >
                                            <option value="">Select Counsel...</option>
                                            {practitioners.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step 3: Lifecycle Deadlines</h4>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Effective Date</label>
                                    <input
                                        id="effectiveDate"
                                        title="Effective Date"
                                        type="date"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white"
                                        value={formData.effectiveDate}
                                        onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Renewal Reminder Date</label>
                                        <input
                                            id="renewalDate"
                                            title="Renewal Date"
                                            type="date"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white"
                                            value={formData.renewalDate}
                                            onChange={e => setFormData({ ...formData, renewalDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <input
                                            id="expiryDate"
                                            title="Expiry Date"
                                            type="date"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-white"
                                            value={formData.expiryDate}
                                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-4">
                                <ShieldCheck className="text-emerald-500" size={20} />
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                    "All lifecycle events are recorded in the Sovereign Audit Log and trigger automated deadline alerts across the team."
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (step === 2 && !existingMatterId) {
                                setStep(1);
                            } else if (step === 3) {
                                setStep(2);
                            } else {
                                onClose();
                            }
                        }}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-all disabled:opacity-0"
                    >
                        <ArrowLeft size={18} /> {step === 1 ? 'Cancel' : existingMatterId && step === 2 ? 'Cancel Specialization' : 'Back'}
                    </button>

                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-3 text-slate-500 hover:text-white transition-all">Cancel</button>
                        <button
                            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                            disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2 active:scale-95"
                        >
                            {isSubmitting ? 'Incepting...' : step === 3 ? 'Incept Contract' : 'Continue'}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CLMIntakeModal;
