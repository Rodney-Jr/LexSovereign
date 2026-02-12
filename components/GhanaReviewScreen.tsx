import React, { useState, useMemo } from 'react';
import {
    ShieldAlert,
    Search,
    FileText,
    Zap,
    Layout
} from 'lucide-react';
import { GHANA_LEGAL_HEURISTICS, detectMonetaryValue } from '../utils/ghanaRules';
import { fetchFxRates, LiveFxRates } from '../utils/ghanaFinanceService';
import SentinelSidebar from './SentinelSidebar';

const GhanaReviewScreen: React.FC = () => {
    const [contractText, setContractText] = useState(`This Agreement is made between Parties for commercial services. 
Any Dispute Resolution shall be settled through Litigation in Accra.
Confidentiality and Data Protection is of utmost importance.
The Contract Value shall be $100,000 payable upon execution.
Stamp Duty is payable on all documents under the law.
This Agreement is governed by the laws of England and Wales.`);

    const [isSyncing, setIsSyncing] = useState(false);
    const [orcStatus, setOrcStatus] = useState<'idle' | 'syncing' | 'verified'>('idle');
    const [liveRates, setLiveRates] = useState<LiveFxRates | null>(null);

    React.useEffect(() => {
        const sovPin = localStorage.getItem('sov-pin') || '';
        fetchFxRates(sovPin).then(setLiveRates);
    }, []);

    const activeFlags = useMemo(() => {
        return GHANA_LEGAL_HEURISTICS.filter(rule => {
            const hasPattern = rule.pattern.test(contractText);
            const missingMandatory = rule.negativePattern && !rule.negativePattern.test(contractText);
            return hasPattern && missingMandatory;
        });
    }, [contractText]);

    const detectedValue = useMemo(() => {
        return detectMonetaryValue(contractText);
    }, [contractText]);

    const handleOrcSync = () => {
        setIsSyncing(true);
        setOrcStatus('syncing');
        setTimeout(() => {
            setIsSyncing(false);
            setOrcStatus('verified');
        }, 2000);
    };

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
                            className="w-full h-full bg-transparent text-brand-text/90 font-mono text-sm leading-relaxed outline-none border-none resize-none custom-scrollbar"
                            placeholder="Paste contract text here for analysis..."
                            title="Contract Editor"
                        />
                    </div>
                </div>

                {/* Right Panel: Sentinel Audit Workspace */}
                <div className="lg:col-span-5">
                    <SentinelSidebar
                        activeFlags={activeFlags}
                        detectedValue={detectedValue}
                        isSyncing={isSyncing}
                        orcStatus={orcStatus}
                        onOrcSync={handleOrcSync}
                        liveRates={liveRates}
                    />
                </div>
            </div>
        </div>
    );
};

export default GhanaReviewScreen;
