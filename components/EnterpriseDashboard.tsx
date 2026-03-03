import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    PieChart,
    Activity,
    Users,
    ShieldAlert,
    TrendingUp,
    ArrowUpRight,
    Filter,
    Download,
    Calendar
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

const EnterpriseDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const data = await authorizedFetch('/api/admin/analytics', {
                token: session.token
            });
            setAnalytics(data);
        } catch (e) {
            console.error("Analytics Fetch Failed", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-[#0a0c10]">
            <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex-1 bg-[#0a0c10] p-10 space-y-10 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Enterprise Governance</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Activity size={14} className="text-sky-500" /> Organizational Insights & Telemetry
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-slate-700 transition-all flex items-center gap-2">
                        <Filter size={16} /> Filter Periods
                    </button>
                    <button className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-sky-900/20 flex items-center gap-2">
                        <Download size={16} /> Export Intelligence
                    </button>
                </div>
            </div>

            {/* High Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Matters', value: analytics?.totalMatters || 0, icon: BarChart3, color: 'sky' },
                    { label: 'Active Workflows', value: analytics?.activeWorkflows || 0, icon: Activity, color: 'emerald' },
                    { label: 'Avg complexity', value: analytics?.averageComplexity || 0, icon: TrendingUp, color: 'amber' },
                    { label: 'Operational Risk', value: 'Low', icon: ShieldAlert, color: 'rose' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] group hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} />
                            </div>
                            <ArrowUpRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Departmental Allocation */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Users className="text-sky-500" size={24} />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Departmental Velocity</h3>
                        </div>
                        <PieChart className="text-slate-700" size={20} />
                    </div>

                    <div className="space-y-6">
                        {Object.entries(analytics?.distribution?.department || {}).map(([name, count]: [string, any], i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{name}</span>
                                    <span className="text-xs font-black text-white">{count} Matters</span>
                                </div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-sky-600 to-indigo-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${(count / (analytics?.totalMatters || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Profile */}
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"></div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-center">Organizational Risk Mask</h3>

                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 border-[16px] border-slate-800 rounded-full"></div>
                        <div
                            className="absolute inset-0 border-[16px] border-emerald-500 rounded-full transition-all duration-1000"
                            style={{
                                clipPath: `inset(0 ${(1 - (analytics?.distribution?.risk?.LOW / analytics?.totalMatters || 0)) * 100}% 0 0)`,
                                transform: 'rotate(-90deg)'
                            }}
                        ></div>
                        <div className="text-center">
                            <h2 className="text-4xl font-black text-white">{((analytics?.distribution?.risk?.LOW / analytics?.totalMatters || 0) * 100).toFixed(0)}%</h2>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Safe Ops</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full pt-8 divide-x divide-slate-800">
                        <div className="text-center">
                            <p className="text-[9px] text-slate-600 font-bold uppercase">Critical</p>
                            <p className="text-lg font-black text-rose-500">{analytics?.distribution?.risk?.HIGH || 0}</p>
                        </div>
                        <div className="text-center px-2">
                            <p className="text-[9px] text-slate-600 font-bold uppercase">Moderate</p>
                            <p className="text-lg font-black text-amber-500">{analytics?.distribution?.risk?.MEDIUM || 0}</p>
                        </div>
                        <div className="text-center px-2">
                            <p className="text-[9px] text-slate-600 font-bold uppercase">Low</p>
                            <p className="text-lg font-black text-emerald-500">{analytics?.distribution?.risk?.LOW || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advisory Feed (Simulated) */}
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] flex items-start gap-8">
                <div className="p-4 bg-sky-500/10 rounded-3xl text-sky-400 shrink-0">
                    <Calendar size={24} />
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Compliance & Governance Protocol</h4>
                    <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-slate-800 pl-6">
                        "NomosDesk Enterprise Analytics utilizes decentralized telemetry to track cycle times across all legal departments.
                        Automated anomaly detection is monitoring the 'Approval' bottlenecks in the EMEA region."
                    </p>
                    <div className="flex gap-4 pt-2">
                        <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-3 py-1 rounded-full uppercase tracking-widest">SOX-AI Compliant</span>
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Governance V4.2</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnterpriseDashboard;
