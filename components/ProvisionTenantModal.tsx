
import React, { useState } from 'react';
import { X, Building2, User, Lock, Globe, ShieldCheck, Mail, Key, Briefcase, Scale, Sparkles, RefreshCw } from 'lucide-react';
import { Region, SaaSPlan, AppMode } from '../types';

interface ProvisionTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ProvisionTenantModal: React.FC<ProvisionTenantModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        adminEmail: '',
        adminPassword: 'Password123!', // Dedicated default
        plan: SaaSPlan.STANDARD,
        appMode: AppMode.LAW_FIRM,
        primaryRegion: Region.GHANA
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const saved = localStorage.getItem('lexSovereign_session');
            const { token } = JSON.parse(saved || '{}');

            const response = await fetch('/api/platform/provision-tenant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const text = await response.text();
                let errorMessage = 'Provisioning failed';
                try {
                    const json = JSON.parse(text);
                    errorMessage = json.error || errorMessage;
                } catch (e) {
                    errorMessage = text || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            setSuccessMessage(`Tenant "${formData.name}" successfully created.`);
            setTimeout(() => {
                onSuccess();
                onClose();
                setSuccessMessage(null);
                setFormData({
                    name: '',
                    adminEmail: '',
                    adminPassword: 'Password123!',
                    plan: SaaSPlan.STANDARD,
                    appMode: AppMode.LAW_FIRM,
                    primaryRegion: Region.GHANA
                });
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in transition-all">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">

                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-600/30">
                            <Building2 className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Manual Provisioning</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">White-Glove Onboarding</p>
                        </div>
                    </div>
                    <button onClick={onClose} title="Close Modal" className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-xs text-red-400 animate-in shake-1">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-xs text-emerald-400 flex items-center gap-3 animate-in zoom-in-95">
                            <ShieldCheck size={16} /> {successMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {/* Org Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account Name</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                                        placeholder="e.g. Accra Chambers"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deployment Region</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <select
                                        title="Deployment Region"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none appearance-none"
                                        value={formData.primaryRegion}
                                        onChange={e => setFormData({ ...formData, primaryRegion: e.target.value as Region })}
                                    >
                                        <option value={Region.GHANA}>West Africa (GH-ACC-1)</option>
                                        <option value={Region.GERMANY}>EU Central (DE-FRA-1)</option>
                                        <option value={Region.USA}>US East (US-NYC-1)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">App Mode</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, appMode: AppMode.LAW_FIRM })}
                                        className={`py-2 text-[10px] font-bold border rounded-xl transition-all ${formData.appMode === AppMode.LAW_FIRM ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                                    >
                                        Law Firm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, appMode: AppMode.ENTERPRISE })}
                                        className={`py-2 text-[10px] font-bold border rounded-xl transition-all ${formData.appMode === AppMode.ENTERPRISE ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                                    >
                                        Enterprise
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Admin Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="root-admin-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Root Admin Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input
                                        id="root-admin-email"
                                        title="Root Admin Email"
                                        required
                                        type="email"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                                        placeholder="admin@tenant.com"
                                        value={formData.adminEmail}
                                        onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="initial-password" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Initial Password</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                    <input
                                        id="initial-password"
                                        title="Initial Password"
                                        required
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                        value={formData.adminPassword}
                                        onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Service Tier</label>
                                <select
                                    title="Service Tier"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-sm text-slate-200 focus:outline-none appearance-none"
                                    value={formData.plan}
                                    onChange={e => setFormData({ ...formData, plan: e.target.value as SaaSPlan })}
                                >
                                    <option value={SaaSPlan.STANDARD}>Standard</option>
                                    <option value={SaaSPlan.SOVEREIGN}>Sovereign+</option>
                                    <option value={SaaSPlan.ENCLAVE_EXCLUSIVE}>Enclave Exclusive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-2 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 disabled:bg-slate-800 flex items-center justify-center gap-3 px-12"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="animate-spin" size={16} />
                            ) : (
                                <Sparkles size={16} />
                            )}
                            Provision Enclave
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProvisionTenantModal;
