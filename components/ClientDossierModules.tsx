
import React from 'react';
import { 
    Briefcase, FileText, Banknote, ShieldCheck, 
    AlertCircle, ChevronRight, ExternalLink,
    FileSignature, Clock, Building2
} from 'lucide-react';
import { Matter, KnowledgeArtifact } from '../types';

interface ClientBillSummary {
    totalInvoiced: number;
    outstanding: number;
    trustBalance: number;
    lastPaymentDate?: string;
}

export const ClientMattersView: React.FC<{ matters: Matter[] }> = ({ matters }) => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={16} className="text-blue-400" />
                Active Matters
            </h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                {matters.length} Enrolled
            </span>
        </div>
        <div className="space-y-3">
            {matters.length === 0 ? (
                <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500">No active legal matters found for this client.</p>
                </div>
            ) : (
                matters.map(matter => (
                    <div key={matter.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{matter.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-500 font-mono">{matter.id}</span>
                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        matter.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {matter.status}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

export const ClientBillingView: React.FC<{ billing: ClientBillSummary }> = ({ billing }) => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trust Balance</p>
                <p className="text-xl font-black text-emerald-400 font-mono">GHS {billing.trustBalance.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Outstanding</p>
                <p className="text-xl font-black text-red-400 font-mono">GHS {billing.outstanding.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Invoiced</p>
                <p className="text-xl font-black text-white font-mono">GHS {billing.totalInvoiced.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-slate-900/50 border border-brand-border p-6 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <Banknote className="text-blue-400" size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">Retainer Replenishment</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Automated prompt when trust falls below threshold.</p>
                </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20">
                View Ledger
            </button>
        </div>
    </div>
);

export const ClientDocumentsView: React.FC<{ docs: KnowledgeArtifact[] }> = ({ docs }) => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <FileText size={16} className="text-purple-400" />
                Vault Artifacts
            </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
            {docs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-800 rounded-xl text-slate-400 group-hover:text-purple-400 transition-colors">
                            <FileSignature size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{doc.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{doc.category}</p>
                        </div>
                    </div>
                    <button 
                        className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                        title="Open Document"
                    >
                        <ExternalLink size={16} />
                    </button>
                </div>
            ))}
        </div>
    </div>
);

export const KYCStatusIndicator: React.FC<{ status: 'Verified' | 'Pending' | 'Rejected' }> = ({ status }) => {
    const config = {
        Verified: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <ShieldCheck size={14} /> },
        Pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Clock size={14} /> },
        Rejected: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <AlertCircle size={14} /> },
    }[status];

    return (
        <div className={`flex items-center gap-2 px-3 py-1 ${config.bg} ${config.color} border ${config.border} rounded-full text-[10px] font-bold uppercase tracking-widest transition-all animate-pulse`}>
            {config.icon}
            KYC {status}
        </div>
    );
};
