
import React, { useState } from 'react';
import {
    LayoutDashboard,
    Landmark,
    BookOpen,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Filter,
    Download,
    PieChart,
    Calendar,
    Search,
    RefreshCw,
    Shield
} from 'lucide-react';
import ModuleGate from './ModuleGate';
import { getSavedSession, authorizedFetch } from '../utils/api'; // Assuming these are in a utils/api file

const AccountingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'trust' | 'reconciliation' | 'reports'>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [trialBalance, setTrialBalance] = useState<any>(null);
    const [reportData, setReportData] = useState<any>({ pl: null, bs: null });
    const [reconciliationData, setReconciliationData] = useState<any[]>([]);

    const fetchAccountingData = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        setIsLoading(true);
        try {
            const [accs, tb, pl, bs, pending] = await Promise.all([
                authorizedFetch('/api/accounting/accounts', { token: session.token }),
                authorizedFetch('/api/accounting/trial-balance', { token: session.token }),
                authorizedFetch('/api/accounting/profit-loss', { token: session.token }),
                authorizedFetch('/api/accounting/balance-sheet', { token: session.token }),
                authorizedFetch('/api/accounting/reconciliation/pending', { token: session.token })
            ]);
            setAccounts(accs);
            setTrialBalance(tb);
            setReportData({ pl, bs });
            setReconciliationData(pending);
        } catch (e) {
            console.error("[Accounting] Fetch failed:", e);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAccountingData();
    }, []);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
        { id: 'ledger', label: 'General Ledger', icon: <BookOpen size={14} /> },
        { id: 'reports', label: 'Financial Reports', icon: <PieChart size={14} /> },
        { id: 'trust', label: 'Trust Ledger', icon: <Shield size={14} /> },
        { id: 'reconciliation', label: 'Reconciliation', icon: <RefreshCw size={14} /> },
    ] as const;

    const operatingBalance = accounts.find(a => a.name === 'Operating Account')?.balance || 0;
    const trustBalance = accounts.find(a => a.name === 'Trust Account (IOLTA)')?.balance || 0;
    const arBalance = accounts.find(a => a.name === 'Accounts Receivable')?.balance || 0;
    const revenueBalance = accounts.find(a => a.type === 'REVENUE')?.balance || 0;

    return (
        <ModuleGate
            module="ACCOUNTING_HUB"
            featureName="Sovereign Accounting Hub"
            description="The complete double-entry bookkeeping system for Sovereign law firms. Automated IOLTA tracking, GAAP-compliant ledgers, and real-time financial reporting."
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md::items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight italic">SOVEREIGN <span className="text-blue-500">ACCOUNTING</span></h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Financial Control Plane</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                            <Download size={14} /> Export Report
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                            <Plus size={14} /> New Journal Entry
                        </button>
                    </div>
                </div>

                {/* Sub-Navigation */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/50 border border-slate-800/50 rounded-2xl w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* KPI Section */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FinanceCard
                            title="Total Revenue (YTD)"
                            amount={`GHS ${revenueBalance.toLocaleString()}`}
                            trend="+12.5%"
                            trendUp={true}
                            icon={<ArrowUpRight className="text-emerald-400" />}
                        />
                        <FinanceCard
                            title="Accounts Receivable"
                            amount={`GHS ${arBalance.toLocaleString()}`}
                            trend="+4.2%"
                            trendUp={false}
                            icon={<ArrowDownRight className="text-amber-400" />}
                        />
                        <FinanceCard
                            title="Operating Float"
                            amount={`GHS ${operatingBalance.toLocaleString()}`}
                            trend="+18.1%"
                            trendUp={true}
                            icon={<PieChart className="text-blue-400" />}
                        />
                        <FinanceCard
                            title="Trust Liability"
                            amount={`GHS ${trustBalance.toLocaleString()}`}
                            trend="Reconciled"
                            trendUp={true}
                            icon={<Landmark className="text-purple-400" />}
                        />
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl min-h-[500px]">
                    {activeTab === 'overview' && (
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={16} className="text-blue-500" /> Recent Transactions
                                        </h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search ledger..."
                                                className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-64"
                                            />
                                        </div>
                                    </div>

                                    <div className="border border-slate-800 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-950 border-b border-slate-800">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {accounts.flatMap(a => a.entries || []).slice(0, 5).map((row: any, i: number) => (
                                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 text-xs font-bold text-white group-hover:text-blue-400">{row.description || 'System Entry'}</td>
                                                        <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{accounts.find(acc => acc.id === row.accountId)?.name}</td>
                                                        <td className="px-6 py-4 text-xs font-mono text-right font-bold text-white">
                                                            {row.debit > 0 ? `+GHS ${row.debit}` : `-GHS ${row.credit}`}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Account Balances</h3>
                                    <div className="space-y-3">
                                        {accounts.slice(0, 4).map((acc, i) => (
                                            <AccountBadge key={acc.id} name={acc.name} balance={`GHS ${acc.balance.toLocaleString()}`} color={i % 2 === 0 ? 'blue' : 'purple'} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6 p-6 bg-slate-950/50 border border-slate-800 rounded-3xl">
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Profit & Loss (YTD)</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Total Revenue</span>
                                            <span className="text-emerald-400">GHS {reportData.pl?.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Total Expenses</span>
                                            <span className="text-amber-400">(GHS {reportData.pl?.expenses.toLocaleString()})</span>
                                        </div>
                                        <div className="h-px bg-slate-800 w-full" />
                                        <div className="flex justify-between text-sm font-black">
                                            <span className="text-white">Net Operating Income</span>
                                            <span className="text-blue-400">GHS {reportData.pl?.netIncome.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 p-6 bg-slate-950/50 border border-slate-800 rounded-3xl">
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Balance Sheet</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Total Assets</span>
                                            <span className="text-white">GHS {reportData.bs?.assets.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Total Liabilities</span>
                                            <span className="text-white">GHS {reportData.bs?.liabilities.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">Total Equity</span>
                                            <span className="text-white">GHS {reportData.bs?.equity.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-slate-800 w-full" />
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${reportData.bs?.isBalanced ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                {reportData.bs?.isBalanced ? 'Ledger Balanced' : 'Out of Balance'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reconciliation' && (
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Bank Statement Reconciliation</h3>
                                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <RefreshCw size={14} /> Import Feed
                                </button>
                            </div>

                            {reconciliationData.length === 0 ? (
                                <div className="text-center py-20 bg-slate-950/30 rounded-3xl border border-dashed border-slate-800">
                                    <RefreshCw className="mx-auto text-slate-700 mb-4" size={32} />
                                    <p className="text-slate-500 text-sm">No transactions pending reconciliation.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reconciliationData.map((tx, i) => (
                                        <div key={i} className="p-6 bg-slate-950/50 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                                                    <Landmark size={20} className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase tracking-tight">{tx.description}</p>
                                                    <p className="text-[10px] font-bold text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <span className="text-sm font-black text-white font-mono">GHS {tx.amount.toLocaleString()}</span>
                                                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                                                    Match
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab !== 'overview' && activeTab !== 'reports' && activeTab !== 'reconciliation' && (
                        <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
                            <div className="p-4 bg-slate-950 rounded-full mb-6">
                                {tabs.find(t => t.id === activeTab)?.icon && React.cloneElement(tabs.find(t => t.id === activeTab)!.icon as React.ReactElement<any>, { size: 48, className: 'text-blue-500 opacity-20' })}
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2 italic">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-slate-500 text-sm max-w-sm">
                                Full ledger controls and trust accounting sub-modules are part of the Sovereign Accounting Enterprise package.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ModuleGate>
    );
};

const FinanceCard = ({ title, amount, trend, trendUp, icon }: { title: string, amount: string, trend: string, trendUp: boolean, icon: React.ReactNode }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 group-hover:bg-slate-800/50 transition-colors">
                {icon}
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {trend}
            </span>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xl font-black text-white font-mono">{amount}</p>
    </div>
);

const AccountBadge = ({ name, balance, color }: { name: string, balance: string, color: 'blue' | 'purple' | 'emerald' | 'amber' }) => {
    const colors = {
        blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
        emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
        amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    };

    return (
        <div className={`p-4 border rounded-2xl flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all ${colors[color]}`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{name}</span>
            <span className="text-xs font-mono font-bold leading-none">{balance}</span>
        </div>
    );
};

export default AccountingDashboard;
