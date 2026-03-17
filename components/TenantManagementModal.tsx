
import React from 'react';
import { X, ShieldCheck, Building2, Settings } from 'lucide-react';
import SovereignResidencySettings from './SovereignResidencySettings';

interface TenantManagementModalProps {
    tenantId: string;
    tenantName: string;
    onClose: () => void;
}

export const TenantManagementModal: React.FC<TenantManagementModalProps> = ({ tenantId, tenantName, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <Building2 className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Manage Sovereign Enclave</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                <span className="text-emerald-400 font-bold uppercase">{tenantName}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span className="font-mono text-[10px] uppercase tracking-tighter">{tenantId}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Close Management Modal"
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    <div className="space-y-10">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <Settings size={18} className="text-purple-400" />
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Residency & Sovereignty</h4>
                            </div>
                            <SovereignResidencySettings tenantId={tenantId} />
                        </section>

                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-start gap-4">
                            <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={20} />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Platform Owner Context</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                    "You are modifying a production jurisdictional silo. All changes are logged and cryptographically signed. 
                                    Ensuring data residency remains the primary directive for this operation."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        Close Control Panel
                    </button>
                </div>
            </div>
        </div>
    );
};
