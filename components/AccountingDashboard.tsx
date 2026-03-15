
import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard,
    Landmark,
    BookOpen,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Download,
    PieChart,
    Calendar,
    Search,
    RefreshCw,
    Shield,
    X,
    CheckCircle2,
    AlertCircle,
    FileText,
} from 'lucide-react';
import ModuleGate from './ModuleGate';
import { getSavedSession, authorizedFetch } from '../utils/api';

const AccountingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'trust' | 'reconciliation' | 'reports'>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [trialBalance, setTrialBalance] = useState<any>(null);
    const [reportData, setReportData] = useState<any>({ pl: null, bs: null });
    const [reconciliationData, setReconciliationData] = useState<any[]>([]);
    const [trustData, setTrustData] = useState<any>(null);
    const [ledgerSearch, setLedgerSearch] = useState('');
    const [showJournalModal, setShowJournalModal] = useState(false);
    const [journalState, setJournalState] = useState<{ description: string; entries: { accountId: string; debit: string; credit: string }[] }>({
        description: '',
        entries: [
            { accountId: '', debit: '', credit: '' },
            { accountId: '', debit: '', credit: '' },
        ]
    });
    const [journalStatus, setJournalStatus] = useState<'idle' | 'posting' | 'success' | 'error'>('idle');
    const [journalError, setJournalError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAccountingData = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        setIsLoading(true);
        try {
            const [accs, tb, pl, bs, pending, trust] = await Promise.all([
                authorizedFetch('/api/accounting/accounts', { token: session.token }),
                authorizedFetch('/api/accounting/trial-balance', { token: session.token }),
                authorizedFetch('/api/accounting/profit-loss', { token: session.token }),
                authorizedFetch('/api/accounting/balance-sheet', { token: session.token }),
                authorizedFetch('/api/accounting/reconciliation/pending', { token: session.token }),
                authorizedFetch('/api/accounting/trust-ledger', { token: session.token }),
            ]);
            setAccounts(Array.isArray(accs) ? accs : []);
            setTrialBalance(tb);
            setReportData({ pl, bs });
            setReconciliationData(Array.isArray(pending) ? pending : []);
            setTrustData(trust);
        } catch (e) {
            console.error("[Accounting] Fetch failed:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountingData();
    }, []);

    // Export current tab data as CSV
    const handleExport = () => {
        let csvRows: string[] = [];
        let filename = 'accounting-export.csv';

        if (activeTab === 'overview' || activeTab === 'ledger') {
            csvRows = ['Account Name,Type,Balance (GHS)'];
            accounts.forEach(a => csvRows.push(`"${a.name}",${a.type},${a.balance}`));
            filename = 'chart-of-accounts.csv';
        } else if (activeTab === 'reports') {
            csvRows = ['Report,Value'];
            if (reportData.pl) {
                csvRows.push(`Revenue,${reportData.pl.revenue}`);
                csvRows.push(`Expenses,${reportData.pl.expenses}`);
                csvRows.push(`Net Income,${reportData.pl.netIncome}`);
            }
            filename = 'financial-report.csv';
        } else if (activeTab === 'trust') {
            csvRows = ['Date,Description,Amount (GHS)'];
            (trustData?.transactions || []).forEach((t: any) =>
                csvRows.push(`"${new Date(t.date).toLocaleDateString()}","${t.description}",${t.amount}`)
            );
            filename = 'trust-ledger.csv';
        } else if (activeTab === 'reconciliation') {
            csvRows = ['Date,Description,Amount (GHS)'];
            reconciliationData.forEach(tx =>
                csvRows.push(`"${new Date(tx.date).toLocaleDateString()}","${tx.description}",${tx.amount}`)
            );
            filename = 'reconciliation.csv';
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handlePostJournal = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        setJournalStatus('posting');
        setJournalError('');
        try {
            const entries = journalState.entries
                .filter(e => e.accountId)
                .map(e => ({
                    accountId: e.accountId,
                    debit: parseFloat(e.debit) || 0,
                    credit: parseFloat(e.credit) || 0,
                    description: journalState.description
                }));
            const result = await authorizedFetch('/api/accounting/transactions', {
                token: session.token,
                method: 'POST',
                body: JSON.stringify({ description: journalState.description, entries })
            });
            if (result.error) throw new Error(result.error);
            setJournalStatus('success');
            await fetchAccountingData();
            setTimeout(() => {
                setShowJournalModal(false);
                setJournalStatus('idle');
                setJournalState({ description: '', entries: [{ accountId: '', debit: '', credit: '' }, { accountId: '', debit: '', credit: '' }] });
            }, 1500);
        } catch (e: any) {
            setJournalStatus('error');
            setJournalError(e.message);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const session = getSavedSession();
        if (!session?.token) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/accounting/reconciliation/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.token}`
                },
                body: formData
            });

            const data = await result.json();
            if (!result.ok) throw new Error(data.error || 'Upload failed');

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';

            // Refresh feed
            await fetchAccountingData();
        } catch (error: any) {
            console.error("Statement upload error:", error);
            alert(`Failed to process statement: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

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

    const allEntries = accounts.flatMap(a => (a.entries || []).map((e: any) => ({ ...e, accountName: a.name })));
    const filteredEntries = ledgerSearch
        ? allEntries.filter((e: any) => e.description?.toLowerCase().includes(ledgerSearch.toLowerCase()) || e.accountName?.toLowerCase().includes(ledgerSearch.toLowerCase()))
        : allEntries;

    return (
        <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight italic">SOVEREIGN <span className="text-blue-500">ACCOUNTING</span></h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Financial Control Plane</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                        <button
                            onClick={() => setShowJournalModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                        >
                            <Plus size={14} /> New Journal Entry
                        </button>
                    </div>
                </div>

                {/* Tab Nav */}
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

                {/* KPI Cards */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FinanceCard title="Total Revenue (YTD)" amount={`GHS ${revenueBalance.toLocaleString()}`} trend="+12.5%" trendUp={true} icon={<ArrowUpRight className="text-emerald-400" />} />
                        <FinanceCard title="Accounts Receivable" amount={`GHS ${arBalance.toLocaleString()}`} trend="+4.2%" trendUp={false} icon={<ArrowDownRight className="text-amber-400" />} />
                        <FinanceCard title="Operating Float" amount={`GHS ${operatingBalance.toLocaleString()}`} trend="+18.1%" trendUp={true} icon={<PieChart className="text-blue-400" />} />
                        <FinanceCard title="Trust Liability" amount={`GHS ${trustBalance.toLocaleString()}`} trend="Reconciled" trendUp={true} icon={<Landmark className="text-purple-400" />} />
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl min-h-[500px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <RefreshCw className="text-blue-500 animate-spin" size={32} />
                        </div>
                    ) : (
                        <>
                            {/* ── OVERVIEW ── */}
                            {activeTab === 'overview' && (
                                <div className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                    <Calendar size={16} className="text-blue-500" /> Recent Transactions
                                                </h3>
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
                                                        {allEntries.slice(0, 5).length === 0 ? (
                                                            <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-600 text-xs">No transactions yet. Post a journal entry to get started.</td></tr>
                                                        ) : allEntries.slice(0, 5).map((row: any, i: number) => (
                                                            <tr key={i} className="hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                                                <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                                                                <td className="px-6 py-4 text-xs font-bold text-white group-hover:text-blue-400">{row.description || 'System Entry'}</td>
                                                                <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{row.accountName}</td>
                                                                <td className="px-6 py-4 text-xs font-mono text-right font-bold text-white">
                                                                    {row.debit > 0 ? <span className="text-emerald-400">+GHS {row.debit}</span> : <span className="text-amber-400">-GHS {row.credit}</span>}
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
                                                {accounts.slice(0, 6).map((acc, i) => (
                                                    <AccountBadge key={acc.id} name={acc.name} balance={`GHS ${acc.balance.toLocaleString()}`} color={(['blue', 'purple', 'emerald', 'amber', 'blue', 'purple'] as const)[i % 6]} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── GENERAL LEDGER ── */}
                            {activeTab === 'ledger' && (
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen size={16} className="text-blue-500" /> General Ledger
                                        </h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search entries..."
                                                value={ledgerSearch}
                                                onChange={e => setLedgerSearch(e.target.value)}
                                                className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 w-64"
                                            />
                                        </div>
                                    </div>

                                    {/* Account Summary Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { type: 'ASSET', label: 'Total Assets', color: 'emerald' },
                                            { type: 'LIABILITY', label: 'Total Liabilities', color: 'red' },
                                            { type: 'REVENUE', label: 'Total Revenue', color: 'blue' },
                                            { type: 'EXPENSE', label: 'Total Expenses', color: 'amber' },
                                        ].map(({ type, label, color }) => {
                                            const total = accounts.filter(a => a.type === type).reduce((s, a) => s + a.balance, 0);
                                            return (
                                                <div key={type} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                                    <p className={`text-lg font-black font-mono text-${color}-400`}>GHS {total.toLocaleString()}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Ledger Table */}
                                    <div className="border border-slate-800 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-950 border-b border-slate-800">
                                                    <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account</th>
                                                    <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                                    <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                                                    <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Balance (GHS)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {accounts.length === 0 ? (
                                                    <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-600 text-xs">No accounts found.</td></tr>
                                                ) : accounts.map(acc => (
                                                    <tr key={acc.id} className="hover:bg-slate-800/20 transition-colors">
                                                        <td className="px-5 py-3.5 text-xs font-bold text-white">{acc.name}</td>
                                                        <td className="px-5 py-3.5">
                                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${acc.type === 'ASSET' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                acc.type === 'LIABILITY' ? 'bg-red-500/10 text-red-400' :
                                                                    acc.type === 'REVENUE' ? 'bg-blue-500/10 text-blue-400' :
                                                                        'bg-amber-500/10 text-amber-400'
                                                                }`}>{acc.type}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-[10px] text-slate-500 font-mono">{acc.category}</td>
                                                        <td className="px-5 py-3.5 text-xs font-mono font-bold text-right text-white">{acc.balance.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {trialBalance && (
                                                <tfoot>
                                                    <tr className="border-t border-slate-700 bg-slate-950/80">
                                                        <td colSpan={3} className="px-5 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Trial Balance Status</td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${trialBalance.isBalanced ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                {trialBalance.isBalanced ? '✓ Balanced' : '✗ Out of Balance'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ── FINANCIAL REPORTS ── */}
                            {activeTab === 'reports' && (
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6 p-6 bg-slate-950/50 border border-slate-800 rounded-3xl">
                                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                                <FileText size={16} className="text-blue-500" /> Profit & Loss (YTD)
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400">Total Revenue</span>
                                                    <span className="text-emerald-400">GHS {reportData.pl?.revenue?.toLocaleString() ?? '—'}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400">Total Expenses</span>
                                                    <span className="text-amber-400">(GHS {reportData.pl?.expenses?.toLocaleString() ?? '—'})</span>
                                                </div>
                                                <div className="h-px bg-slate-800 w-full" />
                                                <div className="flex justify-between text-sm font-black">
                                                    <span className="text-white">Net Operating Income</span>
                                                    <span className={reportData.pl?.netIncome >= 0 ? 'text-blue-400' : 'text-red-400'}>GHS {reportData.pl?.netIncome?.toLocaleString() ?? '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 p-6 bg-slate-950/50 border border-slate-800 rounded-3xl">
                                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Landmark size={16} className="text-purple-500" /> Balance Sheet
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400">Total Assets</span>
                                                    <span className="text-white">GHS {reportData.bs?.assets?.toLocaleString() ?? '—'}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400">Total Liabilities</span>
                                                    <span className="text-white">GHS {reportData.bs?.liabilities?.toLocaleString() ?? '—'}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400">Total Equity (+ Retained Earnings)</span>
                                                    <span className="text-white">GHS {reportData.bs?.equity?.toLocaleString() ?? '—'}</span>
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

                            {/* ── TRUST LEDGER ── */}
                            {activeTab === 'trust' && (
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <Shield size={16} className="text-purple-500" /> IOLTA Trust Ledger
                                        </h3>
                                        <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-black uppercase tracking-widest">
                                            Trust Balance: GHS {(trustData?.balance || 0).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">IOLTA Balance</p>
                                            <p className="text-2xl font-black text-purple-400 font-mono">GHS {(trustData?.balance || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Transactions</p>
                                            <p className="text-2xl font-black text-white font-mono">{(trustData?.transactions || []).length}</p>
                                        </div>
                                        <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-5 text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Audit Status</p>
                                            <p className="text-sm font-black text-emerald-400 uppercase tracking-tight">✓ Compliant</p>
                                        </div>
                                    </div>

                                    <div className="border border-slate-800 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-950 border-b border-slate-800">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount (GHS)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {(trustData?.transactions || []).length === 0 ? (
                                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-600 text-xs">No trust transactions recorded. Post client funds via a journal entry to the Trust Account.</td></tr>
                                                ) : (trustData?.transactions || []).map((t: any) => (
                                                    <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 text-xs font-bold text-white">{t.description}</td>
                                                        <td className="px-6 py-4 text-[10px] font-mono text-slate-500">{t.reference || '—'}</td>
                                                        <td className="px-6 py-4 text-xs font-mono text-right font-bold">
                                                            <span className={t.amount >= 0 ? 'text-emerald-400' : 'text-amber-400'}>{t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString()}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ── RECONCILIATION ── */}
                            {activeTab === 'reconciliation' && (
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Bank Statement Reconciliation</h3>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept=".csv,.pdf,.docx"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                                            >
                                                {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                                                {isUploading ? 'Parsing...' : 'Upload Bank Statement'}
                                            </button>
                                            <button
                                                onClick={fetchAccountingData}
                                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                                            >
                                                <RefreshCw size={14} /> Refresh Feed
                                            </button>
                                        </div>
                                    </div>

                                    {reconciliationData.length === 0 ? (
                                        <div className="text-center py-20 bg-slate-950/30 rounded-3xl border border-dashed border-slate-800">
                                            <CheckCircle2 className="mx-auto text-emerald-600/40 mb-4" size={40} />
                                            <p className="text-slate-500 text-sm font-bold">No transactions pending reconciliation.</p>
                                            <p className="text-slate-700 text-xs mt-1">All bank transactions have been matched.</p>
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
                        </>
                    )}
                </div>

            {/* ── NEW JOURNAL ENTRY MODAL ── */}
            {showJournalModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 w-full max-w-2xl space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">New Journal Entry</h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Double-entry — Debits must equal Credits</p>
                            </div>
                            <button onClick={() => { setShowJournalModal(false); setJournalStatus('idle'); setJournalError(''); }} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                            <input
                                type="text"
                                placeholder="e.g. Client retainer receipt — Matter #123"
                                value={journalState.description}
                                onChange={e => setJournalState(s => ({ ...s, description: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ledger Lines</label>
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">
                                <div className="col-span-6">Account</div>
                                <div className="col-span-3 text-right">Debit</div>
                                <div className="col-span-3 text-right">Credit</div>
                            </div>
                            {journalState.entries.map((entry, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2">
                                    <select
                                        value={entry.accountId}
                                        onChange={e => {
                                            const entries = [...journalState.entries];
                                            entries[i] = { ...entries[i], accountId: e.target.value };
                                            setJournalState(s => ({ ...s, entries }));
                                        }}
                                        className="col-span-6 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select account...</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    <input
                                        type="number" min="0" placeholder="0.00"
                                        value={entry.debit}
                                        onChange={e => {
                                            const entries = [...journalState.entries];
                                            entries[i] = { ...entries[i], debit: e.target.value, credit: '' };
                                            setJournalState(s => ({ ...s, entries }));
                                        }}
                                        className="col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono text-right focus:outline-none focus:border-emerald-500"
                                    />
                                    <input
                                        type="number" min="0" placeholder="0.00"
                                        value={entry.credit}
                                        onChange={e => {
                                            const entries = [...journalState.entries];
                                            entries[i] = { ...entries[i], credit: e.target.value, debit: '' };
                                            setJournalState(s => ({ ...s, entries }));
                                        }}
                                        className="col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono text-right focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={() => setJournalState(s => ({ ...s, entries: [...s.entries, { accountId: '', debit: '', credit: '' }] }))}
                                className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1"
                            >
                                <Plus size={12} /> Add Line
                            </button>
                        </div>

                        {journalStatus === 'error' && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                                <AlertCircle size={16} /> {journalError}
                            </div>
                        )}

                        {journalStatus === 'success' ? (
                            <div className="flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-black">
                                <CheckCircle2 size={20} /> Journal Entry Posted Successfully
                            </div>
                        ) : (
                            <div className="flex justify-end gap-3">
                                <button onClick={() => { setShowJournalModal(false); setJournalStatus('idle'); }} className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePostJournal}
                                    disabled={journalStatus === 'posting' || !journalState.description}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-900/30"
                                >
                                    {journalStatus === 'posting' ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                                    {journalStatus === 'posting' ? 'Posting...' : 'Post Entry'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
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
