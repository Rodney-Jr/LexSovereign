import React, { useState, useEffect } from 'react';
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Calendar,
    Sparkles,
    DollarSign,
    PieChart,
    Receipt,
    ListChecks
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { AppMode, Matter } from '../types';
import MatterSelectorModal from './MatterSelectorModal';
import AIIntelligenceSidebar from './AIIntelligenceSidebar';

const CLMCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'financials'>('overview');
    const [showSelector, setShowSelector] = useState(false);
    const [renewals, setRenewals] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatterAI, setSelectedMatterAI] = useState<string | null>(null);
    const [financials, setFinancials] = useState<{ revenue: any, installments: any[] }>({ revenue: { flatFee: 0, hourly: 0, hybrid: 0 }, installments: [] });
    const [clmStats, setClmStats] = useState<{ activeContracts: number, avgCycleTime: string, riskHeatmap: any }>({
        activeContracts: 0,
        avgCycleTime: '0d',
        riskHeatmap: { highLiability: 0, nonStandardIndemnity: 0, autoRenewal: 0, jurisdictionMismatch: 0 }
    });

    useEffect(() => {
        fetchCLMSignals();
    }, []);

    const fetchCLMSignals = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const [renewalData, approvalData, financialData, statsData] = await Promise.all([
                authorizedFetch('/api/workflows/clm/renewals', { token: session.token }),
                authorizedFetch('/api/workflows/approvals/pending', { token: session.token }),
                authorizedFetch('/api/billing/financials?type=CONTRACT', { token: session.token }),
                authorizedFetch('/api/analytics/clm/stats', { token: session.token })
            ]);

            if (Array.isArray(renewalData)) setRenewals(renewalData);
            if (Array.isArray(approvalData)) setApprovals(approvalData);
            if (financialData && financialData.revenue) setFinancials(financialData);
            if (statsData && !statsData.error) setClmStats(statsData);
        } catch (e) {
            console.error("Failed to fetch CLM signals", e);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (matterId: string, stateId: string) => {
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const res = await authorizedFetch('/api/workflows/approve', {
                method: 'POST',
                token: session.token,
                body: JSON.stringify({ matterId, stateId, comments: 'Approved via CLM Operations Center' })
            });

            if (res.error) throw new Error(res.error);
            fetchCLMSignals();
        } catch (e) {
            console.error("Failed to approve", e);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-24">
            {/* Header & Quick Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold flex items-center gap-4 text-white tracking-tight">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <FileText className="text-emerald-400" size={28} />
                        </div>
                        CLM Operations Center
                    </h3>
                    <p className="text-slate-500 text-sm">Contract Lifecycle Management | Authority Group: <span className="text-emerald-400 font-bold">LEG-OPS-1</span></p>
                </div>
                <button
                    onClick={() => setShowSelector(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-[2rem] font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Manage Contract
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-px">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'overview' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                >
                    CLM Overview
                </button>
                <button
                    onClick={() => setActiveTab('financials')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'financials' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                >
                    Financials & Billing <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px]">NEW</span>
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard label="Active Contracts" value={clmStats.activeContracts} sub="Total Enclave Assets" icon={<FileText className="text-emerald-400" />} />
                        <MetricCard label="Pending Approvals" value={approvals.length} sub="Requiring Sign-off" icon={<CheckCircle2 className="text-blue-400" />} />
                        <MetricCard label="Renewal Pipeline" value={renewals.length} sub="Next 30 Days" icon={<Clock className="text-amber-400" />} />
                        <MetricCard label="Cycle Time (Avg)" value={clmStats.avgCycleTime} sub="Calculated from closed matters" icon={<TrendingUp className="text-purple-400" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Alerts & Queues */}
                        <div className="lg:col-span-8 space-y-10">

                            {/* Renewal Pipeline */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} className="text-amber-400" /> Renewal Alert Pipeline
                                    </h4>
                                    <button title="View Master Calendar" className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest">View Master Calendar</button>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {renewals.length > 0 ? renewals.map(renewal => (
                                        <RenewalCard key={renewal.id} renewal={renewal} />
                                    )) : (
                                        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[2.5rem] p-12 text-center text-slate-500 italic text-sm">
                                            No upcoming renewals detected. Monitoring...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Approval Queue */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-blue-400" /> Approval Routing Queue
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-600">ZK-QUORUM ACTIVE</span>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                            <tr>
                                                <th className="px-8 py-5">Matter / Contract</th>
                                                <th className="px-8 py-5">Workflow State</th>
                                                <th className="px-8 py-5">Received</th>
                                                <th className="px-8 py-5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {approvals.length > 0 ? approvals.map(approval => (
                                                <tr key={approval.id} className="hover:bg-slate-800/20 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-bold text-white">{approval.matter.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter mb-4">{approval.matter.client}</p>
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                title="AI Analysis"
                                                                onClick={() => setSelectedMatterAI(approval.matter.id)}
                                                                className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl hover:bg-sky-500 hover:text-white transition-all border border-sky-500/20"
                                                            >
                                                                <Sparkles size={18} />
                                                            </button>
                                                            <button
                                                                title="View Contract"
                                                                className="p-3 bg-slate-950 text-slate-500 rounded-2xl hover:text-white transition-all border border-slate-800"
                                                            >
                                                                <ArrowRight size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase">
                                                            {approval.workflowState.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-xs text-slate-400">
                                                        {new Date(approval.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => handleApprove(approval.matterId, approval.workflowStateId)}
                                                            className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                                                        >
                                                            Review & Sign
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-10 text-center text-slate-600 italic text-sm">Clean Desk Protocol: No pending approvals.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Analytics & Stats */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all scale-150">
                                    <TrendingUp size={120} />
                                </div>

                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Risk Exposure Heatmap</h4>

                                <div className="space-y-6">
                                    <RiskMetric label="High Liability Cap" value={clmStats.riskHeatmap.highLiability} color="bg-rose-500" />
                                    <RiskMetric label="Non-Standard Indemnity" value={clmStats.riskHeatmap.nonStandardIndemnity} color="bg-amber-500" />
                                    <RiskMetric label="Auto-Renewal Clauses" value={clmStats.riskHeatmap.autoRenewal} color="bg-blue-500" />
                                    <RiskMetric label="Jurisdiction Mismatch" value={clmStats.riskHeatmap.jurisdictionMismatch} color="bg-purple-500" />
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <button className="w-full py-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                                        Generate Full Risk Audit
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] flex items-start gap-4 shadow-inner">
                                <AlertTriangle className="text-emerald-500 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <h5 className="font-bold text-[10px] text-emerald-400 uppercase tracking-widest">Sovereign Compliance Layer</h5>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                        "Contract ingestion is monitored for anti-collision against the central clause library. Version parity is enforced via ZK-Trace."
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
                                    <PieChart size={14} className="text-emerald-400" /> Revenue by Billing Model
                                </h4>
                            </div>
                            <div className="space-y-4 relative z-10 w-full text-sm">
                                <div className="flex justify-between items-center text-slate-300"><span>Flat Fee (Fixed)</span><span className="font-mono text-white">${financials.revenue.flatFee.toLocaleString()}</span></div>
                                <div className="w-full h-1 bg-slate-800 rounded-full"><div className="w-[65%] h-full bg-emerald-500 rounded-full" /></div>

                                <div className="flex justify-between items-center text-slate-300"><span>Hourly (T&M)</span><span className="font-mono text-white">${financials.revenue.hourly.toLocaleString()}</span></div>
                                <div className="w-full h-1 bg-slate-800 rounded-full"><div className="w-[20%] h-full bg-blue-500 rounded-full" /></div>

                                <div className="flex justify-between items-center text-slate-300"><span>Hybrid (Overflow)</span><span className="font-mono text-white">${financials.revenue.hybrid.toLocaleString()}</span></div>
                                <div className="w-full h-1 bg-slate-800 rounded-full"><div className="w-[15%] h-full bg-purple-500 rounded-full" /></div>
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
                                        <th className="pb-3">Contract Name</th>
                                        <th className="pb-3">Component Type</th>
                                        <th className="pb-3">Remaining Balance</th>
                                        <th className="pb-3">Next Tranche</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {financials.installments.map((inst, i) => (
                                        <tr key={i} className="hover:bg-slate-800/20 transition-all">
                                            <td className="py-4 text-slate-200">{inst.matterName}</td>
                                            <td className="py-4 text-emerald-400 text-[10px] uppercase tracking-widest font-bold">{inst.componentType}</td>
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
                    <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] flex items-start gap-4 shadow-inner">
                        <AlertTriangle className="text-emerald-500 shrink-0" size={24} />
                        <div className="space-y-2">
                            <h5 className="font-bold text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-mono">FINANCIAL LOCK VERIFIED</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                "Flat Fee amounts and priority hierarchies are locked after initial invoice generation. Override requires Partner-level cryptographic approval."
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showSelector && (
                <MatterSelectorModal
                    targetType="CLM"
                    onClose={() => setShowSelector(false)}
                    onSelected={(matter: Matter) => {
                        setShowSelector(false);
                        fetchCLMSignals();
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
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group shadow-xl">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-950 rounded-2xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-[10px] font-mono text-slate-600">Pulse: Syncing</span>
        </div>
        <div className="space-y-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
            <h4 className="text-4xl font-black text-white tracking-tighter">{value}</h4>
            <p className="text-[9px] text-slate-600 font-medium">{sub}</p>
        </div>
    </div>
);

const RenewalCard = ({ renewal }: { renewal: any }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between hover:border-amber-500/30 transition-all group">
        <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Clock size={24} />
            </div>
            <div className="space-y-1">
                <h5 className="text-sm font-bold text-white">{renewal.matter.name}</h5>
                <div className="flex items-center gap-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Counterparty: {renewal.counterpartyName}</p>
                    <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                    <p className="text-[10px] text-amber-500 font-black uppercase">Renews: {new Date(renewal.renewalDate).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
        <button title="View Renewal Details" className="p-3 hover:bg-slate-800 rounded-xl text-slate-600 hover:text-white transition-all">
            <ArrowRight size={20} />
        </button>
    </div>
);

const RiskMetric = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="flex items-center justify-between group/risk">
        <div className="flex items-center gap-4">
            <div className={`w-1.5 h-6 rounded-full ${color} group-hover/risk:scale-y-125 transition-transform`}></div>
            <p className="text-xs text-slate-400 font-bold group-hover/risk:text-white transition-colors">{label}</p>
        </div>
        <span className="text-xs font-mono text-slate-500">{value}</span>
    </div>
);

export default CLMCenter;
