import React, { useState, useMemo } from 'react';
import {
    ShieldAlert,
    Search,
    FileText,
    Cpu,
    Scale,
    DollarSign,
    UserCheck,
    Layout,
    ChevronRight,
    ExternalLink,
    ShieldCheck,
    Zap,
    Loader2,
    RefreshCw,
    Info
} from 'lucide-react';
import { GHANA_LEGAL_HEURISTICS, calculateStampDuty } from '../utils/ghanaRules';

const GhanaReviewScreen: React.FC = () => {
    const [contractText, setContractText] = useState(`This Agreement is made between Parties for commercial services. 
Any Dispute Resolution shall be settled through Litigation in Accra.
Confidentiality and Data Protection is of utmost importance.
Stamp Duty is payable on all documents under the law.`);

    const [contractValue, setContractValue] = useState(50000);
    const [isSyncing, setIsSyncing] = useState(false);
    const [orcStatus, setOrcStatus] = useState<'idle' | 'syncing' | 'verified'>('idle');

    const activeFlags = useMemo(() => {
        return GHANA_LEGAL_HEURISTICS.filter(rule => {
            const hasPattern = rule.pattern.test(contractText);
            const missingMandatory = rule.negativePattern && !rule.negativePattern.test(contractText);
            return hasPattern && missingMandatory;
        });
    }, [contractText]);

    const handleOrcSync = () => {
        setIsSyncing(true);
        setOrcStatus('syncing');
        setTimeout(() => {
            setIsSyncing(false);
            setOrcStatus('verified');
        }, 2000);
    };

    const stampDuty = calculateStampDuty(contractValue);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border pb-8">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold flex items-center gap-4 tracking-tight text-brand-text">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                            <ShieldAlert className="text-brand-primary" size={28} />
                        </div>
                        Ghana Sovereign Sentinel
                    </h3>
                    <p className="text-brand-muted text-sm italic">
                        Automated statutory compliance audit for the Ghana legal jurisdiction.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-brand-sidebar p-2 rounded-2xl border border-brand-border">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-widest">
                        <Zap size={14} /> HEURISTICS: ACTIVE
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-secondary/10 rounded-xl border border-brand-secondary/20 text-brand-secondary text-[10px] font-bold uppercase tracking-widest">
                        ACCRA SILO v1.2
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Panel: Document Preview */}
                <div className="lg:col-span-7 bg-brand-sidebar border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col h-[700px]">
                    <div className="bg-brand-bg/50 border-b border-brand-border p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="text-brand-muted" size={20} />
                            <span className="text-sm font-bold text-brand-text">contract_preview.docx</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button title="Search Document" className="p-2 text-brand-muted hover:text-brand-text transition-colors"><Search size={16} /></button>
                            <button title="Toggle Layout" className="p-2 text-brand-muted hover:text-brand-text transition-colors"><Layout size={16} /></button>
                        </div>
                    </div>
                    <div className="flex-1 p-10 overflow-auto bg-brand-bg/20">
                        <textarea
                            value={contractText}
                            onChange={(e) => setContractText(e.target.value)}
                            className="w-full h-full bg-transparent text-brand-text/90 font-mono text-sm leading-relaxed outline-none border-none resize-none"
                            placeholder="Paste contract text here for analysis..."
                        />
                    </div>
                </div>

                {/* Right Panel: Sentinel Audit */}
                <div className="lg:col-span-5 space-y-8 h-[700px] overflow-auto pr-2 custom-scrollbar">

                    {/* Stamp Duty Estimator Card */}
                    <div className="bg-brand-sidebar border border-brand-border p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all text-brand-primary">
                            <DollarSign size={80} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={14} className="text-brand-primary" /> Stamp Duty Estimator
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
                                    <span className="text-xs text-brand-muted italic">Contract Value (GHS)</span>
                                    <input
                                        type="number"
                                        value={contractValue}
                                        onChange={(e) => setContractValue(Number(e.target.value))}
                                        className="bg-transparent text-right font-black text-brand-text w-32 outline-none border-none pr-1"
                                        placeholder="Enter value"
                                        title="Contract Value in GHS"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-brand-text">Estimated Duty</span>
                                    <span className="text-2xl font-black text-brand-primary">GHS {stampDuty.toLocaleString()}</span>
                                </div>
                                <p className="text-[9px] text-brand-muted leading-relaxed">
                                    *Based on GRA standard 0.5% rate for commercial instruments.
                                    <span className="text-brand-primary cursor-pointer hover:underline inline-flex items-center gap-1 ml-1">Learn more <ExternalLink size={8} /></span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Registry Sync Card */}
                    <div className="bg-brand-sidebar border border-brand-border p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                <UserCheck size={14} className="text-brand-secondary" /> Registry Verification
                            </h4>
                            {orcStatus === 'verified' && (
                                <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 font-bold tracking-tighter">ORC SYNCED</span>
                            )}
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-brand-bg/50 rounded-2xl border border-brand-border shrink-0">
                                <RefreshCw className={`text-brand-secondary ${isSyncing ? 'animate-spin' : ''}`} size={24} />
                            </div>
                            <div className="space-y-3 flex-1">
                                <p className="text-xs text-brand-text font-bold leading-tight">Verify Signatory Authority</p>
                                <button
                                    onClick={handleOrcSync}
                                    disabled={isSyncing}
                                    className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-bg text-[10px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isSyncing ? <><Loader2 size={12} className="animate-spin" /> Syncing ORC Registry...</> : 'Check Director Listing'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sentinel Audit Checklist */}
                    <div className="space-y-4 pt-4 border-t border-brand-border">
                        <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-4">Sentinel Audit (Ghana Silo)</h4>

                        {activeFlags.length === 0 ? (
                            <div className="bg-brand-primary/5 border border-brand-primary/10 p-8 rounded-[2rem] flex flex-col items-center text-center space-y-4">
                                <ShieldCheck size={40} className="text-brand-primary" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-brand-text">Audit Nominal</p>
                                    <p className="text-[10px] text-brand-muted">No statutory conflicts detected in the current text block.</p>
                                </div>
                            </div>
                        ) : (
                            activeFlags.map((rule) => (
                                <div key={rule.id} className="bg-brand-bg/40 border border-brand-border p-6 rounded-[2rem] space-y-4 hover:border-brand-primary/30 transition-all stagger-in">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-brand-text flex items-center gap-2">
                                                <AlertCircle className="text-amber-500" size={16} /> {rule.issue}
                                            </p>
                                            <p className="text-[9px] font-mono text-brand-muted uppercase tracking-tighter">{rule.statute}</p>
                                        </div>
                                    </div>
                                    <div className="bg-brand-bg/60 p-4 rounded-xl border border-brand-border/50 text-[10px] text-brand-text/80 leading-relaxed italic border-l-2 border-l-brand-primary">
                                        {rule.fix}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Tips Section */}
                    <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex items-start gap-3">
                        <Info className="text-brand-primary shrink-0" size={16} />
                        <p className="text-[10px] leading-relaxed text-brand-muted">
                            <strong>Sales Pitch:</strong> "We don't just review the law; we help you budget for the filing." Use the Stamp Duty Estimator to advise clients on overhead costs before submission.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlertCircle = ({ className, size }: any) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

export default GhanaReviewScreen;
