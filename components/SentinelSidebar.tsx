import React, { useState } from 'react';
import {
    ShieldAlert,
    ShieldCheck,
    DollarSign,
    UserCheck,
    RefreshCw,
    Loader2,
    Info,
    ExternalLink,
    Scale,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import { LegalHeuristic } from '../utils/ghanaRules';
import {
    calculateDetailedStampDuty,
    INSTRUMENT_TYPES,
    convertUSDtoGHS,
    fetchFxRates,
    LiveFxRates
} from '../utils/ghanaFinanceService';

interface SentinelSidebarProps {
    activeFlags: LegalHeuristic[];
    detectedValue: { amount: number, currency: 'USD' | 'GHS' | null };
    isSyncing: boolean;
    orcStatus: 'idle' | 'syncing' | 'verified';
    onOrcSync: () => void;
    liveRates: LiveFxRates | null;
}

const SentinelSidebar: React.FC<SentinelSidebarProps> = ({
    activeFlags,
    detectedValue,
    isSyncing,
    orcStatus,
    onOrcSync,
    liveRates
}) => {
    const [instrumentType, setInstrumentType] = useState(INSTRUMENT_TYPES.COMMERCIAL);

    const exchangeRate = liveRates?.USD_GHS.rate || 12.5;
    const ghsValue = detectedValue.currency === 'USD'
        ? convertUSDtoGHS(detectedValue.amount, exchangeRate)
        : detectedValue.amount;

    const taxResults = calculateDetailedStampDuty(ghsValue, instrumentType);
    const isFallback = liveRates?.USD_GHS.isFallback ?? true;
    const rateDate = liveRates?.USD_GHS.date || 'System Default';

    return (
        <div className="space-y-8 h-[700px] overflow-auto pr-2 custom-scrollbar">

            {/* Tax & Filing Summary Widget */}
            <div className="bg-brand-sidebar border border-brand-border p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all text-brand-primary">
                    <DollarSign size={80} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                            <Scale size={14} className="text-brand-primary" /> Tax & Filing Summary
                        </h4>
                        <div className="flex flex-col items-end gap-1">
                            {detectedValue.currency === 'USD' && (
                                <span className="text-[8px] px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 font-bold">BoG RATE: $1 = GHS {exchangeRate}</span>
                            )}
                            <span className={`text-[7px] px-1.5 py-0.5 rounded border uppercase font-black tracking-tighter ${isFallback ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                {isFallback ? `FALLBACK: ${rateDate}` : `LIVE: ${rateDate}`}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold text-brand-muted uppercase tracking-tighter">Instrument Type</label>
                            <div className="relative">
                                <select
                                    value={instrumentType}
                                    onChange={(e) => setInstrumentType(e.target.value)}
                                    className="w-full bg-brand-bg/50 border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-primary appearance-none cursor-pointer"
                                    title="Select Instrument Type"
                                >
                                    {Object.values(INSTRUMENT_TYPES).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-2.5 text-brand-muted pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                                <p className="text-[9px] text-brand-muted uppercase tracking-tighter">Duty Payable</p>
                                <p className="text-xl font-black text-brand-primary">GHS {taxResults.dutyPayableGHS.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] text-brand-muted uppercase tracking-tighter">Filing Category</p>
                                <p className="text-xs font-bold text-brand-text">{taxResults.filingCategory}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-brand-bg/40 rounded-xl border border-brand-border/50">
                            <p className="text-[9px] text-brand-muted leading-relaxed italic">
                                {taxResults.disclaimer}
                            </p>
                        </div>
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
                        <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 font-bold tracking-tighter uppercase">ORC Synced</span>
                    )}
                </div>
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-brand-bg/50 rounded-2xl border border-brand-border shrink-0">
                        <RefreshCw className={`text-brand-secondary ${isSyncing ? 'animate-spin' : ''}`} size={24} />
                    </div>
                    <div className="space-y-3 flex-1">
                        <p className="text-xs text-brand-text font-bold leading-tight">Verify Signatory Authority</p>
                        <button
                            onClick={onOrcSync}
                            disabled={isSyncing}
                            className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-bg text-[10px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-secondary/10"
                        >
                            {isSyncing ? <><Loader2 size={12} className="animate-spin" /> Syncing...</> : 'Check ORC Directory'}
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
                        <div key={rule.id} className="bg-brand-bg/40 border border-brand-border p-6 rounded-[2rem] space-y-4 hover:border-brand-primary/30 transition-all stagger-in border-l-4 border-l-amber-500/50">
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

            {/* Statutory Tips */}
            <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl flex items-start gap-3">
                <Info className="text-brand-primary shrink-0" size={16} />
                <p className="text-[10px] leading-relaxed text-brand-muted">
                    <strong>Value Detection:</strong> The Sentinel automatically detects monetary values in USD/GHS and triggers duty assessment according to the <strong>Stamp Duty Act (Act 689)</strong>.
                </p>
            </div>
        </div>
    );
};

export default SentinelSidebar;
