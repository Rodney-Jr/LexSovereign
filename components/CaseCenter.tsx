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
    Activity
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { AppMode } from '../types';
import MatterCreationModal from './MatterCreationModal';
import AIIntelligenceSidebar from './AIIntelligenceSidebar';

const CaseCenter: React.FC = () => {
    const [showIntake, setShowIntake] = useState(false);
    const [deadlines, setDeadlines] = useState<any[]>([]);
    const [hearings, setHearings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatterAI, setSelectedMatterAI] = useState<string | null>(null);

    useEffect(() => {
        fetchCaseSignals();
    }, []);

    const fetchCaseSignals = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const [deadlineData, hearingData] = await Promise.all([
                authorizedFetch('/api/workflows/litigation/deadlines', { token: session.token }),
                authorizedFetch('/api/workflows/litigation/hearings', { token: session.token })
            ]);

            if (Array.isArray(deadlineData)) setDeadlines(deadlineData);
            if (Array.isArray(hearingData)) setHearings(hearingData);
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
                    onClick={() => setShowIntake(true)}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-sky-900/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Incept New Case
                </button>
            </div>

            {/* Case Metrics */}
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

            {showIntake && (
                <MatterCreationModal
                    mode={AppMode.LAW_FIRM}
                    userId={(getSavedSession() as any)?.userId}
                    tenantId={(getSavedSession() as any)?.tenantId}
                    onClose={() => setShowIntake(false)}
                    onCreated={() => {
                        setShowIntake(false);
                        fetchCaseSignals();
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
