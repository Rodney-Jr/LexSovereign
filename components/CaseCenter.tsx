import React, { useState, useEffect } from 'react';
import {
    Gavel,
    Clock,
    Calendar,
    Search,
    Filter,
    Plus,
    ArrowRight,
    ShieldAlert,
    Sparkles,
    Layout,
    FileText,
    MapPin,
    Scale,
    Activity,
    DollarSign,
    PieChart,
    Receipt,
    ListChecks
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { AppMode, Matter } from '../types';
import MatterSelectorModal from './MatterSelectorModal';
import AIIntelligenceSidebar from './AIIntelligenceSidebar';

const CaseCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'financials'>('overview');
    const [showSelector, setShowSelector] = useState(false);
    const [deadlines, setDeadlines] = useState<any[]>([]);
    const [hearings, setHearings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatterAI, setSelectedMatterAI] = useState<string | null>(null);
    const [financials, setFinancials] = useState<{ revenue: any, installments: any[] }>({ revenue: { flatFee: 0, hourly: 0, hybrid: 0 }, installments: [] });

    useEffect(() => {
        fetchCaseSignals();
    }, []);

    const fetchCaseSignals = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const [deadlineData, hearingData, financialData] = await Promise.all([
                authorizedFetch('/api/workflows/litigation/deadlines', { token: session.token }),
                authorizedFetch('/api/workflows/litigation/hearings', { token: session.token }),
                authorizedFetch('/api/billing/financials?type=CASE', { token: session.token })
            ]);

            if (Array.isArray(deadlineData)) setDeadlines(deadlineData);
            if (Array.isArray(hearingData)) setHearings(hearingData);
            if (financialData && financialData.revenue) setFinancials(financialData);
        } catch (e) {
            console.error("Failed to fetch Case signals", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-24">
            {/* Header & Quick Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
                        <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                            <Gavel className="text-sky-400" size={28} />
                        </div>
                        Litigation & Advisory Center
                    </h3>
                    <p className="text-slate-500 text-sm">Case Management Cockpit | Authority Group: <span className="text-sky-400 font-bold">LIT-OPS-1</span></p>
                </div>
                <button
                    onClick={() => setShowSelector(true)}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-sky-900/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Manage Case
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-px">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'overview' ? 'border-sky-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                >
                    Case Overview
                </button>
                <button
                    onClick={() => setActiveTab('financials')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'financials' ? 'border-sky-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                >
                    Financials & Billing <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full text-[9px]">NEW</span>
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard label="Active Cases" value={deadlines.length + 14} sub="Sovereign Enclave Matters" icon={<Gavel className="text-sky-400" />} />
                        <MetricCard label="Pending Deadlines" value={deadlines.length} sub="Requiring Priority Action" icon={<Clock className="text-rose-400" />} />
                        <MetricCard label="Upcoming Hearings" value={hearings.length} sub="Next 14 Days" icon={<Calendar className="text-amber-400" />} />
                        <MetricCard label="Compliance Rate" value="98%" sub="+2% this quarter" icon={<Activity className="text-emerald-400" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Calendar & Pipeline */}
                        <div className="lg:col-span-8 space-y-10">

                            {/* Hearing Schedule */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} className="text-amber-400" /> Hearing Calendar View
                                    </h4>
                                    <button title="View Full Calendar" className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest">Master Calendar</button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {hearings.length > 0 ? hearings.map(hearing => (
                                        <HearingCard key={hearing.id} hearing={hearing} />
                                    )) : (
                                        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center text-slate-500 italic text-sm font-medium">
                                            No upcoming hearings scheduled. Standing by...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Deadline Pipeline */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldAlert size={14} className="text-rose-400" /> Critical Deadline Pipeline
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-600 tracking-tighter uppercase">PROCEDURAL LOCK ACTIVE</span>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                            <tr>
                                                <th className="px-8 py-5">Matter / Jurisdiction</th>
                                                <th className="px-8 py-5">Deadline Event</th>
                                                <th className="px-8 py-5">Due Date</th>
                                                <th className="px-8 py-5 text-right">Priority</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {deadlines.length > 0 ? deadlines.map(deadline => (
                                                <tr key={deadline.id} className="hover:bg-slate-800/20 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-bold text-white">{deadline.matter.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{deadline.matter.client}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-xs font-bold text-slate-300 italic">
                                                            {deadline.title}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={12} className="text-rose-400" />
                                                            <span className="text-xs text-rose-400 font-black uppercase tracking-tighter">
                                                                {new Date(deadline.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                title="AI Intelligence"
                                                                onClick={() => setSelectedMatterAI(deadline.matterId)}
                                                                className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all border border-sky-500/20"
                                                            >
                                                                <Sparkles size={14} />
                                                            </button>
                                                            <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase border ${deadline.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                                'bg-sky-500/10 text-sky-500 border-sky-500/20'
                                                                }`}>
                                                                {deadline.priority}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-10 text-center text-slate-600 italic text-sm font-medium">Compliance Pulse Nominal: No pending deadlines.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Case Intelligence */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all scale-150 rotate-12">
                                    <Scale size={120} />
                                </div>

                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Procedural Distribution</h4>

                                <div className="space-y-6">
                                    <ProcMetric label="Pleadings / Service" count={8} color="bg-sky-500" />
                                    <ProcMetric label="Discovery Phase" count={12} color="bg-purple-500" />
                                    <ProcMetric label="Trial Prep" count={3} color="bg-rose-500" />
                                    <ProcMetric label="Advisory / Research" count={22} color="bg-emerald-500" />
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <button title="Export Procedural Audit" className="w-full py-4 bg-slate-950 border border-slate-800 hover:border-sky-500/30 text-sky-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                                        Export Procedural Audit
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 bg-sky-500/5 border border-sky-500/10 rounded-[2.5rem] flex items-start gap-4 shadow-inner">
                                <ShieldAlert className="text-sky-500 shrink-0" size={24} />
                                <div className="space-y-2">
                                    <h5 className="font-bold text-[10px] text-sky-400 uppercase tracking-[0.2em] font-mono">AUTOMATED COURT SYNC</h5>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                        "Matter states are cross-referenced with regional court Gazette feeds for automated deadline calibration and hearing detection."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'financials' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                            <div className="absolute right-0 top-0 p-8 opacity-5">
                                <DollarSign size={80} />
                            </div>
                            <div className="space-y-1 mb-6 relative z-10">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <PieChart size={14} className="text-sky-400" /> Revenue by Billing Model
                                </h4>
                            </div>
                            <div className="space-y-4 relative z-10 w-full text-sm">
                                <div className="flex justify-between items-center text-slate-300"><span>Flat Fee (Fixed)</span><span className="font-mono text-white">${financials.revenue.flatFee.toLocaleString()}</span></div>
                                <div className="w-full h-1 bg-slate-800 rounded-full"><div className="w-[60%] h-full bg-sky-500 rounded-full" /></div>

                                <div className="flex justify-between items-center text-slate-300"><span>Hourly (T&M)</span><span className="font-mono text-white">${financials.revenue.hourly.toLocaleString()}</span></div>
                                <div className="w-full h-1 bg-slate-800 rounded-full"><div className="w-[30%] h-full bg-emerald-500 rounded-full" /></div>

                                <div className="flex justify-between items-center text-slate-300"><span>Hybrid (Overflow)</span><span className="font-mono text-white">${financials.revenue.hybrid.toLocaleString()}</span></div>
                                <div className="w-full h-1 bg-slate-800 rounded-full"><div className="w-[10%] h-full bg-purple-500 rounded-full" /></div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl lg:col-span-2">
                            <div className="absolute right-0 top-0 p-8 opacity-5">
                                <ListChecks size={100} />
                            </div>
                            <div className="space-y-1 mb-6 relative z-10">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Receipt size={14} className="text-amber-400" /> Pending Installments & Balances
                                </h4>
                            </div>
                            <table className="w-full text-left text-sm relative z-10">
                                <thead className="text-[10px] uppercase text-slate-500 font-bold tracking-widest border-b border-slate-800">
                                    <tr>
                                        <th className="pb-3">Matter Name</th>
                                        <th className="pb-3">Component Type</th>
                                        <th className="pb-3">Remaining Balance</th>
                                        <th className="pb-3">Next Tranche</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {financials.installments.map((inst, i) => (
                                        <tr key={i} className="hover:bg-slate-800/20 transition-all">
                                            <td className="py-4 text-slate-200">{inst.matterName}</td>
                                            <td className="py-4 text-sky-400 text-[10px] uppercase tracking-widest font-bold">{inst.componentType}</td>
                                            <td className="py-4 text-white font-mono">${inst.remainingBalance.toLocaleString()}</td>
                                            <td className="py-4 text-slate-400">{inst.nextTranche}</td>
                                        </tr>
                                    ))}
                                    {financials.installments.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-slate-500 italic text-sm">No pending installments.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Deposit Rules / Warnings */}
                    <div className="p-8 bg-sky-500/5 border border-sky-500/10 rounded-[2.5rem] flex items-start gap-4 shadow-inner">
                        <ShieldAlert className="text-sky-500 shrink-0" size={24} />
                        <div className="space-y-2">
                            <h5 className="font-bold text-[10px] text-sky-400 uppercase tracking-[0.2em] font-mono">FINANCIAL LOCK VERIFIED</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                "Flat Fee amounts and priority hierarchies are locked after initial invoice generation. Override requires Partner-level cryptographic approval."
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showSelector && (
                <MatterSelectorModal
                    targetType="CASE"
                    onClose={() => setShowSelector(false)}
                    onSelected={(matter: Matter) => {
                        setShowSelector(false);
                        fetchCaseSignals();
                        // Potentially navigate to specific case view here if implemented
                    }}
                />
            )}

            <AIIntelligenceSidebar
                matterId={selectedMatterAI || ''}
                isOpen={!!selectedMatterAI}
                onClose={() => setSelectedMatterAI(null)}
            />
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value: string | number;
    sub: string;
    icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, sub, icon }) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-sky-500/30 transition-all group shadow-2xl">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-950 rounded-2xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-[10px] font-mono text-slate-700 tracking-widest">SOV-ACTIVE</span>
        </div>
        <div className="space-y-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
            <h4 className="text-4xl font-black text-white tracking-tighter">{value}</h4>
            <p className="text-[9px] text-slate-600 font-bold italic tracking-wide">{sub}</p>
        </div>
    </div>
);

const HearingCard = ({ hearing }: { hearing: any }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between hover:border-amber-500/30 transition-all group shadow-xl">
        <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:rotate-6 transition-transform">
                <MapPin size={24} />
            </div>
            <div className="space-y-1">
                <h5 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{hearing.matter.name}</h5>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <MapPin size={10} /> {hearing.location || 'Registry Office'}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                    <p className="text-[10px] text-amber-500 font-black uppercase italic tracking-[0.1em]">
                        Time: {new Date(hearing.hearingDate).toLocaleDateString()} @ {new Date(hearing.hearingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </div>
        <button title="Launch Hearing Workspace" className="p-3 hover:bg-slate-800 rounded-2xl text-slate-600 hover:text-white transition-all border border-transparent hover:border-slate-700">
            <ArrowRight size={20} />
        </button>
    </div>
);

const ProcMetric = ({ label, count, color }: { label: string, count: number, color: string }) => (
    <div className="flex items-center justify-between group/proc">
        <div className="flex items-center gap-4">
            <div className={`w-1 h-5 rounded-full ${color} group-hover/proc:scale-y-150 transition-transform`}></div>
            <p className="text-xs text-slate-400 font-bold group-hover/proc:text-white transition-colors">{label}</p>
        </div>
        <span className="text-xs font-mono text-slate-600 font-bold">{count}</span>
    </div>
);

export default CaseCenter;
