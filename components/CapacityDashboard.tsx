import React, { useState, useEffect } from 'react';
import {
    Activity,
    Users,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Search,
    ShieldAlert,
    TrendingUp
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { TenantUser, UserRole } from '../types';

const CapacityDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalLoad: 68,
        activeOverrides: 3,
        complianceReadiness: 94,
        bottlenecks: 2
    });

    const [practitioners, setPractitioners] = useState<TenantUser[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [utilizationData, setUtilizationData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStats();
        fetchPractitioners();
        fetchInsights();
    }, []);

    const fetchStats = async () => {
        try {
            const session = getSavedSession();
            if (!session?.token) return;
            const data = await authorizedFetch('/api/tenant/capacity-stats', { token: session.token });
            setStats(data);
        } catch (e) {
            console.error("Failed to fetch stats:", e);
        }
    };

    const fetchPractitioners = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;
            const data = await authorizedFetch('/api/users', { token: session.token });
            setPractitioners(data);

            // Try to fetch utilization data for each
            const uData: Record<string, any> = {};
            for (const user of data) {
                try {
                    const uRes = await authorizedFetch(`/api/productivity/utilization/${user.id}`, { token: session.token });
                    if (uRes && uRes.metrics) {
                        uData[user.id] = uRes.metrics;
                    }
                } catch (e) {
                    // ignore if endpoint fails
                }
            }
            setUtilizationData(uData);

        } catch (e) {
            console.error("Failed to fetch capacity data:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async () => {
        try {
            const session = getSavedSession();
            if (!session?.token) return;
            const data = await authorizedFetch('/api/tenant/insights', { token: session.token });
            setInsights(data);
        } catch (e) {
            console.error("Failed to fetch insights:", e);
        }
    };

    const getLoadState = (current?: number, max?: number) => {
        const ratio = (current || 0) / (max || 40);
        if (ratio > 0.95) return 'RED';
        if (ratio > 0.75) return 'AMBER';
        return 'GREEN';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Aggregated Firm Load"
                    value={`${stats.totalLoad}%`}
                    icon={<Activity className="text-purple-400" size={20} />}
                    trend={stats.totalLoad > 80 ? "High utilization alert" : "Within nominal bounds"}
                    color="purple"
                />
                <StatCard
                    title="Compliance Readiness"
                    value={`${stats.complianceReadiness}%`}
                    icon={<CheckCircle2 className="text-emerald-400" size={20} />}
                    trend="All credentials verified"
                    color="emerald"
                />
                <StatCard
                    title="Active Overrides"
                    value={stats.activeOverrides.toString()}
                    icon={<ShieldAlert className="text-rose-400" size={20} />}
                    trend="Requires Partner review"
                    color="rose"
                />
                <StatCard
                    title="Capacity Bottlenecks"
                    value={stats.bottlenecks.toString()}
                    icon={<AlertTriangle className="text-amber-400" size={20} />}
                    trend="Global Admin attention req."
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Practitioner Load Heatmap */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Users size={18} className="text-purple-400" />
                                    Practitioner Readiness Map
                                </h4>
                                <p className="text-xs text-slate-500">Real-time utilization across all regional silos.</p>
                            </div>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Filter practitioners..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 w-48"
                                />
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <tr>
                                            <th className="pb-4">Practitioner</th>
                                            <th className="pb-4">Region</th>
                                            <th className="pb-4 text-center">Utilization</th>
                                            <th className="pb-4 text-right">Billable Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {practitioners.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
                                            const metrics = utilizationData[p.id] || { utilizationRatePercentage: 0, billableHours: 0, targetHours: (p.maxWeeklyHours || 40) * 4 };

                                            let loadState = 'NOMINAL';
                                            if (metrics.utilizationRatePercentage > 95) loadState = 'BURNOUT_RISK';
                                            if (metrics.utilizationRatePercentage < 40) loadState = 'UNDER_UTILIZED';
                                            if (metrics.utilizationRatePercentage === 0) loadState = 'IDLE';

                                            return (
                                                <tr key={p.id} className="group hover:bg-slate-800/20 transition-all">
                                                    <td className="py-4 font-medium text-slate-300 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-purple-400">
                                                                {p.name.charAt(0)}
                                                            </div>
                                                            {p.name}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-xs font-mono text-slate-500 tracking-tighter uppercase">
                                                        {(p as any).jurisdictionPins?.[0] || 'GH_ACC_1'}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex justify-center">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${loadState === 'BURNOUT_RISK' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                                    loadState === 'UNDER_UTILIZED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                        loadState === 'IDLE' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                                                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                }`}>
                                                                {metrics.utilizationRatePercentage}% ({loadState})
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right text-xs font-mono text-slate-400">
                                                        {metrics.billableHours.toFixed(1)} / {metrics.targetHours}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Risk Insights Corner */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl space-y-6">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-purple-400" />
                            Operational Insights
                        </h4>

                        <div className="space-y-4">
                            {insights.map((insight, idx) => (
                                <InsightItem
                                    key={idx}
                                    level={insight.level}
                                    message={insight.message}
                                />
                            ))}
                        </div>

                        <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2 group">
                            Full Forensic Report
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, trend: string, color: string }> = ({ title, value, icon, trend, color }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 bg-${color}-500/10 rounded-xl border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="text-xs text-slate-500 font-mono tracking-tighter line-clamp-1">{trend}</span>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
    </div>
);

const InsightItem: React.FC<{ level: 'CRITICAL' | 'WARNING' | 'STABLE', message: string }> = ({ level, message }) => (
    <div className={`p-4 rounded-2xl border ${level === 'CRITICAL' ? 'bg-rose-500/5 border-rose-500/20' :
        level === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' :
            'bg-emerald-500/5 border-emerald-500/20'
        } space-y-1`}>
        <div className="flex items-center justify-between">
            <span className={`text-[9px] font-black tracking-widest uppercase ${level === 'CRITICAL' ? 'text-rose-400' :
                level === 'WARNING' ? 'text-amber-400' :
                    'text-emerald-400'
                }`}>{level}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">{message}</p>
    </div>
);

export default CapacityDashboard;
