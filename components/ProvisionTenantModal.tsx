
import React, { useState } from 'react';
import { X, Server, Check, Loader2, Shield } from 'lucide-react';

interface ProvisionTenantModalProps {
    onClose: () => void;
}

export const ProvisionTenantModal: React.FC<ProvisionTenantModalProps> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        adminName: '',
        adminEmail: '',
        plan: 'STANDARD',
        region: 'GH_ACC_1'
    });
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/platform/provision', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data.details);
                setStep(2);
            } else {
                alert(data.error || 'Provisioning failed');
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
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                            <Server size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Deploy Sovereign Tenant</h3>
                            <p className="text-xs text-slate-500">Automated Enclave Provisioning</p>
                        </div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Law Firm Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                    placeholder="e.g. Nexus Legal Alliance"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Admin Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                        placeholder="John Doe"
                                        value={formData.adminName}
                                        onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Admin Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                        placeholder="admin@firm.com"
                                        value={formData.adminEmail}
                                        onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Plan Hierarchy</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none uppercase text-xs font-bold"
                                        value={formData.plan}
                                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                                    >
                                        <option value="STANDARD">Standard</option>
                                        <option value="SOVEREIGN">Sovereign</option>
                                        <option value="ENCLAVE">Enclave (Dedicated)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Physical Region</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none uppercase text-xs font-bold"
                                        value={formData.region}
                                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                                    >
                                        <option value="GH_ACC_1">Ghana (Accra)</option>
                                        <option value="NG_LOS_1">Nigeria (Lagos)</option>
                                        <option value="KE_NBO_1">Kenya (Nairobi)</option>
                                        <option value="ZA_CPT_1">South Africa (Cape Town)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                                {isLoading ? 'Provisioning Resources...' : 'Initialize Tenant'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <Check size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Tenant Provisioned!</h4>
                                <p className="text-sm text-slate-400">Resources allocated successfully.</p>
                            </div>

                            <div className="bg-black/50 p-4 rounded-xl border border-slate-800 text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[10px] text-slate-500 uppercase">Tenant ID</span>
                                    <span className="text-[10px] font-mono text-cyan-400">{result.tenantId.substring(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] text-slate-500 uppercase">Temp Password</span>
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded">{result.tempPassword}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-800">
                                    <div className="text-[10px] text-slate-500 uppercase mb-1">One-Time Login URL</div>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 break-all text-[10px] font-mono text-slate-300 select-all">
                                        {result.loginUrl}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
