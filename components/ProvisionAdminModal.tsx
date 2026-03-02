
import React, { useState } from 'react';
import { X, ShieldCheck, Check, Loader2, UserPlus, Fingerprint } from 'lucide-react';
import { authorizedFetch } from '../utils/api';

interface ProvisionAdminModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export const ProvisionAdminModal: React.FC<ProvisionAdminModalProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        accessLevel: 'SUPER_ADMIN'
    });
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';

            const data = await authorizedFetch('/api/platform/admins', {
                method: 'POST',
                token,
                body: JSON.stringify(formData)
            });

            if (data && !data.error) {
                setResult(data.details);
                setStep(2);
                if (onSuccess) onSuccess();
            } else {
                const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                alert(errorMsg || 'Provisioning failed');
            }
        } catch (err) {
            console.error(err);
            alert('Provisioning error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative">
                <button
                    onClick={onClose}
                    title="Close Provisioning Modal"
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
                            <Fingerprint size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Provision Platform Admin</h3>
                            <p className="text-xs text-slate-500">Add Trusted Member to the Sovereign Fleet</p>
                        </div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Full Identity Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="e.g. Elena Vance"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Secure Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="elena@nomosdesk.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Platform Access Hierarchy</label>
                                <select
                                    title="Select Access Level"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none uppercase text-xs font-bold transition-all cursor-pointer"
                                    value={formData.accessLevel}
                                    onChange={e => setFormData({ ...formData, accessLevel: e.target.value })}
                                >
                                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                                    <option value="INFRA_ADMIN">INFRA_ADMIN (Regions & Silos)</option>
                                    <option value="SECURITY_ADMIN">SECURITY_ADMIN (Audits & Logs)</option>
                                    <option value="MARKETING_ADMIN">MARKETING_ADMIN (Leads & CRM)</option>
                                </select>
                                <p className="text-[9px] text-slate-500 mt-2 italic px-1">
                                    Access is mathematically enforced via the Sovereign Policy Engine.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-white font-bold uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                {isLoading ? 'Authenticating Request...' : 'Authorize Fleet Member'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-8 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                <Check size={40} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Identity Provisioned!</h4>
                                <p className="text-sm text-slate-400">Fleet member has been authorized globally.</p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-2xl border border-slate-800 text-left space-y-4 shadow-inner">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Admin ID</span>
                                    <span className="text-[10px] font-mono text-cyan-400">{result.adminId.substring(0, 12)}...</span>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Temporary Access Patch</div>
                                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl flex justify-between items-center group">
                                        <span className="text-xs font-mono text-emerald-400 select-all">{result.tempPassword}</span>
                                        <span className="text-[8px] font-bold text-emerald-600 uppercase">Secure</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Authorization Link</div>
                                    <div className="bg-slate-900/50 p-3 rounded-xl break-all text-[9px] font-mono text-slate-400 select-all border border-slate-800/50">
                                        {result.loginUrl}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold uppercase transition-all tracking-widest active:scale-95"
                            >
                                Dismiss Command
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProvisionAdminModal;
