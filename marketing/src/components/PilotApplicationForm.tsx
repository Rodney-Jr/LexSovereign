import React, { useState } from 'react';
import { Button } from './ui';
import { Send, CheckCircle, Building2, Users, Scale, Briefcase, Calendar } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function PilotApplicationForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        firmName: '',
        partnerName: '',
        email: '',
        phone: '',
        firmSize: '',
        practiceAreas: '',
        currentTools: '',
        demoTime: ''
    });

    const getUTMData = () => {
        if (typeof window === 'undefined') return {};
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || 'direct',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            referrer: document.referrer || 'direct'
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const response = await apiFetch('/api/leads', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.partnerName,
                    company: formData.firmName,
                    phone: formData.phone,
                    source: 'FOUNDING_PILOT',
                    metadata: {
                        firmSize: formData.firmSize,
                        practiceAreas: formData.practiceAreas,
                        currentTools: formData.currentTools,
                        demoTime: formData.demoTime,
                        ...getUTMData()
                    }
                })
            });

            if (response.ok) {
                setStatus('success');
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            console.error('Form submission error:', err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Application Transmitted</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Your firm's qualifications have been entered into the Founding Cohort review pipeline. 
                        A partnership coordinator will contact you at <strong>{formData.email}</strong>.
                    </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-emerald-500/80 uppercase tracking-widest leading-relaxed">
                    Trace-ID: COHORT-Q2-{Math.random().toString(16).slice(2, 8).toUpperCase()}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <Field 
                        label="Law Firm Name" 
                        icon={<Building2 size={14} />}
                        placeholder="e.g. Mensah & Co. Legal"
                        value={formData.firmName}
                        onChange={(val) => setFormData({ ...formData, firmName: val })}
                    />
                    <Field 
                        label="Managing Partner Name" 
                        icon={<Users size={14} />}
                        placeholder="e.g. Kofi Mensah"
                        value={formData.partnerName}
                        onChange={(val) => setFormData({ ...formData, partnerName: val })}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <Field 
                        label="Email Address" 
                        type="email"
                        icon={<Send size={14} />}
                        placeholder="partner@firm.internal"
                        value={formData.email}
                        onChange={(val) => setFormData({ ...formData, email: val })}
                    />
                    <Field 
                        label="Phone Number" 
                        icon={<Briefcase size={14} />}
                        placeholder="+233 20 123 4567"
                        value={formData.phone}
                        onChange={(val) => setFormData({ ...formData, phone: val })}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                            <Scale size={14} /> Firm Size
                        </label>
                        <select
                            required
                            title="Select Firm Size"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none p-3.5 rounded-2xl text-white transition-colors appearance-none"
                            value={formData.firmSize}
                            onChange={(e) => setFormData({ ...formData, firmSize: e.target.value })}
                        >
                            <option value="" disabled>Select size</option>
                            <option value="1-3">1-3 Lawyers (Boutique)</option>
                            <option value="4-10">4-10 Lawyers (Mid-Size)</option>
                            <option value="11-30">11-30 Lawyers (Established)</option>
                            <option value="31+">31+ Lawyers (Institutional)</option>
                        </select>
                    </div>
                    <Field 
                        label="Primary Practice Areas" 
                        icon={<Scale size={14} />}
                        placeholder="e.g. Litigation, Corporate, Family"
                        value={formData.practiceAreas}
                        onChange={(val: string) => setFormData({ ...formData, practiceAreas: val })}
                    />
                </div>

                <div className="space-y-2">
                    <Field 
                        label="Current Toolset"
                        icon={<Briefcase size={14} />}
                        placeholder="e.g. Excel, WhatsApp, Local Server"
                        value={formData.currentTools}
                        onChange={(val: string) => setFormData({ ...formData, currentTools: val })}
                    />
                </div>
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                    <Calendar className="text-indigo-400" size={18} />
                    <h5 className="text-xs font-bold text-white uppercase tracking-widest">Preferred Demo Timing</h5>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <TimeOption 
                        active={formData.demoTime === 'morning'} 
                        label="Morning (8AM - 12PM)" 
                        onClick={() => setFormData({ ...formData, demoTime: 'morning' })} 
                    />
                    <TimeOption 
                        active={formData.demoTime === 'afternoon'} 
                        label="Afternoon (1PM - 5PM)" 
                        onClick={() => setFormData({ ...formData, demoTime: 'afternoon' })} 
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-5 rounded-2xl shadow-xl shadow-indigo-500/10 font-black text-lg"
            >
                {status === 'loading' ? 'Transmitting...' : 'Apply for Founding Status'}
                <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {status === 'error' && (
                <p className="text-rose-500 text-xs text-center font-bold">Inception Error: Transmission failed. Please contact infrastructure support.</p>
            )}

            <p className="text-[10px] text-center text-slate-500 leading-relaxed font-medium">
                By submitting, you agree to participate in operational feedback sessions and acknowledge the <a href="/terms" className="underline">Founding Member Terms</a>.
            </p>
        </form>
    );
}

function Field({ label, placeholder, icon, value, onChange, type = 'text' }: { label: string, placeholder: string, icon: React.ReactNode, value: string, onChange: (val: string) => void, type?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                {icon} {label}
            </label>
            <input
                required
                type={type}
                placeholder={placeholder}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none p-3.5 rounded-2xl text-white transition-colors"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function TimeOption({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all text-center ${
                active ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
        >
            {label}
        </button>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
