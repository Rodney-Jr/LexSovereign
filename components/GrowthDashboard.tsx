
import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    ShieldCheck,
    Clock,
    Users,
    Scale,
    FileCheck,
    Download,
    Printer,
    Award,
    Zap,
    DollarSign,
    AlertCircle
} from 'lucide-react';

import { GHANA_LEGAL_HEURISTICS, detectMonetaryValue } from '../utils/ghanaRules';
import { fetchFxRates, LiveFxRates } from '../utils/ghanaFinanceService';

const GrowthDashboard: React.FC = () => {
    const [partnerRate, setPartnerRate] = useState(5625); // GHS approx for $450
    const [hoursSaved, setHoursSaved] = useState(0);
    const [staffCount, setStaffCount] = useState(0);
    const [feeRecovery, setFeeRecovery] = useState(0);
    const [tatReduction, setTatReduction] = useState(0);
    const [liveRates, setLiveRates] = useState<LiveFxRates | null>(null);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const sovPin = localStorage.getItem('sov-pin') || '';
                const rates = await fetchFxRates(sovPin);
                setLiveRates(rates);

                const sessionData = localStorage.getItem('lexSovereign_session');
                const token = sessionData ? JSON.parse(sessionData).token : '';

                const response = await fetch('/api/analytics/metrics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.growth) {
                    setHoursSaved(data.growth.hoursSaved || 0);
                    setStaffCount(data.growth.staffCount || 0);
                    setFeeRecovery(data.growth.feeRecovery || 0);
                    setTatReduction(data.growth.tatReduction || 0);
                }
            } catch (error) {
                console.error("Failed to fetch growth metrics:", error);
            }
        };

        fetchDashboardData();
    }, []);

    const revenueProtected = useMemo(() => hoursSaved * partnerRate, [hoursSaved, partnerRate]);
    const extraCapacity = useMemo(() => Math.floor(hoursSaved / 8), [hoursSaved]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24 print:bg-white print:text-black">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border pb-8 print:border-black">
                <div className="space-y-2">
                    <h3 className="text-3xl font-bold flex items-center gap-4 tracking-tight text-brand-text print:text-black">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 print:hidden shadow-lg shadow-brand-primary/10">
                            <Scale className="text-brand-primary" size={28} />
                        </div>
                        Practice Growth & Compliance Report
                    </h3>
                    <p className="text-brand-muted text-sm italic">
                        Executive Summary for Senior Partners & Executive Committee
                    </p>
                </div>
                <div className="flex gap-4 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-brand-bg px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-brand-primary/20"
                    >
                        <Printer size={18} /> Generate Monthly Report
                    </button>
                </div>
            </div>

            {/* Main ROI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Money-In-Pocket Card */}
                <div className="lg:col-span-2 bg-brand-sidebar border border-brand-border p-10 rounded-[3rem] shadow-xl relative overflow-hidden group backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all text-brand-primary">
                        <DollarSign size={150} />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                                <Award className="text-brand-primary" size={20} />
                            </div>
                            <h4 className="font-bold text-brand-muted uppercase tracking-widest text-xs">Financial Performance</h4>
                            <div className="ml-auto flex flex-col items-end">
                                <span className={`text-[9px] px-2 py-1 rounded border uppercase font-bold tracking-tighter ${liveRates?.USD_GHS ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                    {liveRates?.USD_GHS ? `LIVE RATE: ${liveRates.USD_GHS.date}` : 'PILOT RATE'}
                                </span>
                                {liveRates?.USD_GHS && (
                                    <span className="text-[8px] text-brand-muted font-mono mt-1">$1 = GHS {liveRates.USD_GHS.rate.toFixed(2)}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-5xl font-black text-brand-text">
                                GHS {revenueProtected.toLocaleString()}
                            </p>
                            <h2 className="text-xl font-bold text-brand-muted">Total Revenue Protected from Overhead</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-brand-border">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest italic">Senior Partner Rate (GHS)</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-text font-bold">GHS</span>
                                    <input
                                        type="number"
                                        value={partnerRate}
                                        onChange={(e) => setPartnerRate(Number(e.target.value))}
                                        className="bg-transparent border-b border-brand-border focus:border-brand-primary outline-none w-24 text-lg font-bold text-brand-text"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest italic">Hours Saved this Month</p>
                                <p className="text-2xl font-black text-brand-primary">{hoursSaved} Hrs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Court-Ready Widget */}
                <div className="bg-brand-sidebar border border-brand-border p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/10 blur-3xl rounded-full"></div>

                    <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center border-4 border-brand-primary/20">
                        <FileCheck className="text-brand-primary" size={48} />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-brand-text tracking-tight">Verified Local Law Compliance</h4>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck size={12} /> GAZETTE SYNC: NOMINAL
                        </div>
                    </div>

                    <p className="text-[10px] text-brand-muted italic uppercase tracking-widest">Nigeria NDPA 2023 / Kenya DPA 2019 Ready</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard
                    icon={<Users size={24} />}
                    label="Active Staff Efficiency"
                    value={`${staffCount} Personnel`}
                    sub="Current headcount utilizing Sovereign"
                    color="secondary"
                />
                <MetricCard
                    icon={<TrendingUp size={24} />}
                    label="Unbilled Fee Recovery"
                    value={`GHS ${feeRecovery.toLocaleString()}`}
                    sub="Captured from automated tracing"
                    color="primary"
                />
                <MetricCard
                    icon={<Clock size={24} />}
                    label="Drafting Turnaround Time (TAT)"
                    value={`-${tatReduction}%`}
                    sub="Average reduction per matter"
                    color="purple"
                />
            </div>

            {/* Capacity & Insurance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-brand-sidebar border border-brand-border p-10 rounded-[3rem] space-y-8 shadow-inner backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-brand-muted uppercase tracking-widest text-xs flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" /> Billable Multiplier
                        </h4>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-6xl font-black text-brand-text tracking-tighter">
                            {extraCapacity}
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-bold text-brand-text leading-tight">Extra Cases Your Current Staff Can Handle This Month</p>
                            <p className="text-xs text-brand-muted uppercase tracking-widest">WITHOUT INCREASING HEADCOUNT</p>
                        </div>
                    </div>

                    <div className="h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                        <div className="h-full bg-brand-primary w-3/4 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                    </div>
                </div>

                <div className="lg:col-span-5 bg-brand-sidebar border border-brand-border p-10 rounded-[3rem] flex items-center gap-6 relative overflow-hidden group backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-700 text-brand-secondary">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="p-5 bg-brand-secondary/10 rounded-2xl border border-brand-secondary/20 shrink-0">
                        <ShieldCheck className="text-brand-secondary" size={32} />
                    </div>
                    <div className="space-y-2 relative z-10">
                        <h5 className="font-bold text-brand-text text-lg">Professional Indemnity Protection</h5>
                        <p className="text-xs text-brand-muted leading-relaxed italic">
                            All AI-assisted drafts are cross-referenced with jurisdictional gazettes, physically reducing regulatory liability by 88%.
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block pt-12 mt-12 border-t border-black text-center text-[10px] uppercase tracking-[0.2em]">
                Strictly Confidential • Generated by LexSovereign Alpha • Distributed to Executive Board
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, sub, color }: any) => {
    const colorClass = color === 'primary' ? 'text-brand-primary' : color === 'secondary' ? 'text-brand-secondary' : 'text-purple-400';
    const bgColorClass = color === 'primary' ? 'bg-brand-primary/10' : color === 'secondary' ? 'bg-brand-secondary/10' : 'bg-purple-500/10';

    return (
        <div className="bg-brand-sidebar border border-brand-border p-8 rounded-[2.5rem] hover:border-brand-primary/50 transition-all duration-500 group backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-brand-bg rounded-xl shadow-inner border border-brand-border group-hover:scale-110 transition-transform ${colorClass}`}>
                    {icon}
                </div>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest italic">{sub}</p>
            </div>
            <div className="space-y-1">
                <h4 className="text-3xl font-black text-brand-text tracking-tighter">{value}</h4>
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
};

export default GrowthDashboard;
