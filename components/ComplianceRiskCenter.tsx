
import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    Activity,
    FileText,
    ExternalLink,
    Search,
    ArrowUpRight,
    Filter,
    Loader2,
    Save,
    Map,
    X
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { PredictiveRisk } from '../types';
import ComplianceExport from './ComplianceExport';

const ComplianceRiskCenter: React.FC = () => {
    const [stats, setStats] = useState({ totalRisks: 0, highRisks: 0, mitigatedRisks: 0, totalMatters: 0, healthScore: 0 });
    const [risks, setRisks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showExport, setShowExport] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const session = getSavedSession();
            if (!session?.token) return;

            const [statsData, risksData] = await Promise.all([
                authorizedFetch('/api/compliance/stats', { token: session.token }),
                authorizedFetch('/api/compliance/organization-risks', { token: session.token })
            ]);

            setStats(statsData);
            setRisks(risksData);
        } catch (e) {
            console.error("Compliance data acquisition failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateRisk = async () => {
        if (!selectedRisk) return;
        try {
            setIsUpdating(true);
            const session = getSavedSession();
            if (!session?.token) return;

            await authorizedFetch(`/api/compliance/risks/${selectedRisk.id}`, {
                method: 'PATCH',
                token: session.token,
                body: JSON.stringify({
                    mitigationPlan: selectedRisk.mitigationPlan,
                    status: selectedRisk.status,
                    riskCategory: selectedRisk.riskCategory
                })
            });

            await fetchData();
            setSelectedRisk(null);
        } catch (e: any) {
            alert(`Mitigation update failed: ${e.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredRisks = risks.filter(r =>
        r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.matter.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-500">
                <Loader2 className="animate-spin text-emerald-400" size={48} />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Synching Compliance Enclave...</span>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Header & Stats Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                                <ShieldCheck className="text-emerald-400" size={28} /> Organizational Risk Matrix
                            </h3>
                            <p className="text-sm text-slate-400">Holistic oversight of legal, operational, and regulatory risks across all Sovereign Silos.</p>
                        </div>
                        <button
                            onClick={() => setShowExport(!showExport)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
                            title="Toggle Audit Package Export View"
                        >
                            <FileText size={16} /> Audit Export
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        <StatBox label="Total Scanned Risks" value={stats.totalRisks} icon={<Activity size={14} />} color="text-slate-400" />
                        <StatBox label="Critical/High" value={stats.highRisks} icon={<AlertTriangle size={14} />} color="text-red-400" />
                        <StatBox label="Mitigated" value={stats.mitigatedRisks} icon={<CheckCircle2 size={14} />} color="text-emerald-400" />
                        <StatBox label="Health Score" value={`${stats.healthScore}%`} icon={<ShieldCheck size={14} />} color="text-indigo-400" />
                    </div>
                </div>

                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-indigo-500 flex items-center justify-center relative z-10">
                        <span className="text-2xl font-bold text-white">{stats.healthScore}%</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Compliance Posture</h4>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Global Risk Coverage</p>
                    </div>
                </div>
            </div>

            {showExport ? (
                <ComplianceExport logs={risks.map(r => ({ approvalToken: `RISK-${r.id.substring(0, 8)}`, action: `Risk Identified: ${r.type}`, actor: 'Sovereign AI' }))} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Risks List */}
                    <div className="lg:col-span-12 space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filter by type or matter..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Filter size={16} className="text-slate-600" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Showing {filteredRisks.length} Vectors</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredRisks.map((risk) => (
                                <div
                                    key={risk.id}
                                    onClick={() => setSelectedRisk(risk)}
                                    className={`group p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${risk.status === 'MITIGATED'
                                        ? 'bg-slate-900 border-emerald-500/20 hover:border-emerald-500/40'
                                        : risk.impact === 'High' || risk.impact === 'Critical'
                                            ? 'bg-slate-900 border-red-500/20 hover:border-red-500/40'
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border ${risk.status === 'MITIGATED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                                                }`}>
                                                {risk.status}
                                            </span>
                                            <span className={`text-[10px] font-bold ${risk.impact === 'High' || risk.impact === 'Critical' ? 'text-red-400' : 'text-slate-500'
                                                }`}>
                                                {risk.impact} Impact
                                            </span>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{risk.type}</h5>
                                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{risk.matter.name}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{risk.description}</p>

                                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                                <BarChart3 size={12} /> {Math.round(risk.probability * 100)}% Prob.
                                            </div>
                                            <ArrowUpRight size={14} className="text-slate-700 group-hover:text-emerald-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mitigation Modal */}
            {selectedRisk && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                    <Map className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">Risk Mitigation Plan</h4>
                                    <p className="text-xs text-slate-500">Document controls and strategy to neutralize identified vectors.</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRisk(null)} title="Close Risk Mitigation Modal" className="text-slate-500 hover:text-white transition-colors">
                                <Search size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Risk Category</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                                    value={selectedRisk.riskCategory}
                                    onChange={e => setSelectedRisk({ ...selectedRisk, riskCategory: e.target.value })}
                                    title="Update Risk Category"
                                >
                                    <option value="OPERATIONAL">Operational</option>
                                    <option value="LEGAL">Legal</option>
                                    <option value="FINANCIAL">Financial</option>
                                    <option value="STRATEGIC">Strategic</option>
                                    <option value="REPUTATIONAL">Reputational</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Execution Status</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                                    value={selectedRisk.status}
                                    onChange={e => setSelectedRisk({ ...selectedRisk, status: e.target.value })}
                                    title="Update Risk Status"
                                >
                                    <option value="IDENTIFIED">Identified (Active)</option>
                                    <option value="MITIGATING">In Progress</option>
                                    <option value="MITIGATED">Mitigated (Resolved)</option>
                                    <option value="RESIDUAL">Residual (Accepted)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Proposed Mitigation Steps</label>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-300 h-40 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={selectedRisk.mitigationPlan || ''}
                                onChange={e => setSelectedRisk({ ...selectedRisk, mitigationPlan: e.target.value })}
                                placeholder="Describe the formal steps taken to mitigate this risk..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedRisk(null)}
                                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                            >
                                Discard Changes
                            </button>
                            <button
                                onClick={handleUpdateRisk}
                                disabled={isUpdating}
                                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {isUpdating ? "Persisting to Silo..." : "Save Mitigation Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBox = ({ label, value, icon, color }: any) => (
    <div className="bg-slate-950 border border-slate-800/50 p-4 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            {icon} {label}
        </div>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
);

export default ComplianceRiskCenter;
