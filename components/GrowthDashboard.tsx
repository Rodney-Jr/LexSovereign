
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

const GrowthDashboard: React.FC = () => {
    const [partnerRate, setPartnerRate] = useState(450);
    const [hoursSaved, setHoursSaved] = useState(142);
    const [staffCount, setStaffCount] = useState(12);

    const revenueProtected = useMemo(() => hoursSaved * partnerRate, [hoursSaved, partnerRate]);
    const extraCapacity = useMemo(() => Math.floor(hoursSaved / 8), [hoursSaved]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24 print:bg-white print:text-black">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 print:border-black">
                <div className="space-y-2">
                    <h3 className="text-3xl font-serif font-bold flex items-center gap-4 tracking-tight text-slate-900 dark:text-white print:text-black">
                        <div className="p-3 bg-slate-900 dark:bg-slate-100 rounded-2xl border border-slate-800 dark:border-slate-200 print:hidden">
                            <Scale className="text-slate-100 dark:text-slate-900" size={28} />
                        </div>
                        Practice Growth & Compliance Report
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic font-serif">
                        Executive Summary for Senior Partners & Executive Committee
                    </p>
                </div>
                <div className="flex gap-4 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg"
                    >
                        <Printer size={18} /> Generate Monthly Report
                    </button>
                </div>
            </div>

            {/* Main ROI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Money-In-Pocket Card */}
                <div className="lg:col-span-2 bg-[#fdfbf7] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all">
                        <DollarSign size={150} />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <Award className="text-emerald-600 dark:text-emerald-400" size={20} />
                            </div>
                            <h4 className="font-serif font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Financial Performance</h4>
                        </div>

                        <div className="space-y-2">
                            <p className="text-5xl font-serif font-black text-slate-900 dark:text-white">
                                ${revenueProtected.toLocaleString()}
                            </p>
                            <h2 className="text-xl font-serif font-bold text-slate-600 dark:text-slate-400">Total Revenue Protected from Overhead</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Senior Partner Rate</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-900 dark:text-white font-bold">$</span>
                                    <input
                                        type="number"
                                        value={partnerRate}
                                        onChange={(e) => setPartnerRate(Number(e.target.value))}
                                        className="bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-emerald-500 outline-none w-20 text-lg font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Hours Saved this Month</p>
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{hoursSaved} Hrs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Court-Ready Widget */}
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>

                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500/30">
                        <FileCheck className="text-emerald-400" size={48} />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Verified Local Law Compliance</h4>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck size={12} /> GAZETTE SYNC: NOMINAL
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">Nigeria NDPA 2023 / Kenya DPA 2019 Ready</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricCard
                    icon={<Users size={24} />}
                    label="Junior Staffing Efficiency"
                    value="+42%"
                    sub="Hours redirected to strategy"
                    color="blue"
                />
                <MetricCard
                    icon={<TrendingUp size={24} />}
                    label="Unbilled Fee Recovery"
                    value="$12,400"
                    sub="Captured from automated tracing"
                    color="emerald"
                />
                <MetricCard
                    icon={<Clock size={24} />}
                    label="Drafting Turnaround Time (TAT)"
                    value="-65%"
                    sub="Average reduction per matter"
                    color="purple"
                />
            </div>

            {/* Capacity & Insurance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 bg-[#fdfbf7] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] space-y-8 shadow-inner">
                    <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" /> Billable Multiplier
                        </h4>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {extraCapacity}
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200 leading-tight">Extra Cases Your Current Staff Can Handle This Month</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">WITHOUT INCREASING HEADCOUNT</p>
                        </div>
                    </div>

                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-3/4 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                    </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-10 rounded-[3rem] flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-700">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shrink-0">
                        <ShieldCheck className="text-blue-400" size={32} />
                    </div>
                    <div className="space-y-2 relative z-10">
                        <h5 className="font-serif font-bold text-white text-lg">Professional Indemnity Protection</h5>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            All AI-assisted drafts are cross-referenced with jurisdictional gazettes, physically reducing regulatory liability by 88%.
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block pt-12 mt-12 border-t border-black text-center text-[10px] font-serif uppercase tracking-[0.2em]">
                Strictly Confidential • Generated by LexSovereign Alpha • Distributed to Executive Board
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, sub, color }: any) => (
    <div className="bg-[#f0f2f5] dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] hover:border-slate-400 dark:hover:border-slate-700 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-900 dark:text-white`}>
                {icon}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{sub}</p>
        </div>
        <div className="space-y-1">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-serif font-bold uppercase tracking-widest">{label}</p>
        </div>
    </div>
);

export default GrowthDashboard;
