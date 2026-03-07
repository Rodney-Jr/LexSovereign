import React, { useState } from 'react';
import {
    Receipt,
    Plus,
    X,
    Zap,
    Wifi,
    Building2,
    DollarSign,
    TrendingDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Filter,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

type ExpenseCategory = 'Utilities' | 'Petty Cash' | 'Supplies' | 'Maintenance' | 'Other';
type ExpenseStatus = 'Paid' | 'Pending' | 'Overdue';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    status: ExpenseStatus;
    notes?: string;
    approvedBy?: string;
}

interface LogExpenseForm {
    description: string;
    amount: string;
    category: ExpenseCategory;
    date: string;
    notes: string;
}

const STATUS_STYLES: Record<ExpenseStatus, string> = {
    Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_ICON: Record<ExpenseStatus, React.ReactNode> = {
    Paid: <CheckCircle2 size={12} />,
    Pending: <Clock size={12} />,
    Overdue: <AlertCircle size={12} />,
};

const CATEGORIES: ExpenseCategory[] = ['Utilities', 'Petty Cash', 'Supplies', 'Maintenance', 'Other'];

const formatGHS = (amount: number) =>
    `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SovereignExpenseTracker: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'utilities' | 'petty-cash' | 'log'>('utilities');
    const [showLogModal, setShowLogModal] = useState(false);
    const [utilities, setUtilities] = useState<Expense[]>([]);
    const [pettyCash, setPettyCash] = useState<Expense[]>([]);
    const [filterStatus, setFilterStatus] = useState<ExpenseStatus | 'All'>('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<LogExpenseForm>({
        description: '',
        amount: '',
        category: 'Petty Cash',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const allExpenses = [...utilities, ...pettyCash].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const filteredAll = filterStatus === 'All'
        ? allExpenses
        : allExpenses.filter(e => e.status === filterStatus);

    const totalPaid = allExpenses.filter(e => e.status === 'Paid').reduce((s, e) => s + e.amount, 0);
    const totalPending = allExpenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
    const totalOverdue = allExpenses.filter(e => e.status === 'Overdue').reduce((s, e) => s + e.amount, 0);

    // ESC to close modal
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowLogModal(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    React.useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const session = getSavedSession();
                const data: Expense[] = await authorizedFetch('/api/firm/expenses', { token: session?.token });

                // We use 'UTILITY' and 'PETTY_CASH' as type
                // But the interface uses ExpenseCategory. We'll segment based on a local convention
                // Or rather, the backend 'type' can be mapped
                // Let's use the DB 'type' field that we added. Since we cast the response to Expense[] we need to be careful
                // Actually the API returns `type` in the response.

                // For simplicity mapping DB `type` back to front-end states
                // @ts-ignore
                const dbUtilities = data.filter((e: any) => e.type === 'UTILITY');
                // @ts-ignore
                const dbPettyCash = data.filter((e: any) => e.type === 'PETTY_CASH');

                setUtilities(dbUtilities);
                setPettyCash(dbPettyCash);
            } catch (error) {
                console.error('Failed to fetch firm expenses', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const handleLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.description.trim() || !form.amount) return;

        try {
            setIsSubmitting(true);
            const expenseType = form.category === 'Utilities' ? 'UTILITY' : 'PETTY_CASH';

            const session = getSavedSession();
            const newExpense: Expense = await authorizedFetch('/api/firm/expenses', {
                method: 'POST',
                token: session?.token,
                body: JSON.stringify({
                    description: form.description,
                    amount: parseFloat(form.amount),
                    category: form.category,
                    expenseDate: form.date,
                    status: 'Pending',
                    notes: form.notes || undefined,
                    type: expenseType
                })
            });

            if (expenseType === 'UTILITY') {
                setUtilities(prev => [newExpense, ...prev]);
            } else {
                setPettyCash(prev => [newExpense, ...prev]);
            }

            setForm({ description: '', amount: '', category: 'Petty Cash', date: new Date().toISOString().slice(0, 10), notes: '' });
            setShowLogModal(false);
        } catch (error) {
            console.error('Failed to log expense', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const markPaid = async (id: string) => {
        try {
            const session = getSavedSession();
            await authorizedFetch(`/api/firm/expenses/${id}/status`, {
                method: 'PUT',
                token: session?.token,
                body: JSON.stringify({ status: 'Paid' })
            });

            const updateState = (prev: Expense[]) => prev.map(e => e.id === id ? { ...e, status: 'Paid' as ExpenseStatus, approvedBy: 'Admin Manager' } : e);
            setUtilities(updateState);
            setPettyCash(updateState);
        } catch (error) {
            console.error('Failed to mark as paid', error);
        }
    };

    const tabs = [
        { key: 'utilities', label: 'Office Utilities' },
        { key: 'petty-cash', label: 'Imprest & Petty Cash' },
        { key: 'log', label: 'Master Expense Log' },
    ] as const;

    const renderExpenseRow = (expense: Expense) => (
        <div key={expense.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{expense.category}</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-[10px] font-mono text-slate-600">{expense.date}</span>
                        {expense.approvedBy && (
                            <>
                                <span className="text-slate-700">•</span>
                                <span className="text-[10px] text-slate-600 italic">By {expense.approvedBy}</span>
                            </>
                        )}
                    </div>
                    {expense.notes && (
                        <p className="text-[10px] text-amber-400/70 mt-1.5 italic">{expense.notes}</p>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-white font-mono">{formatGHS(expense.amount)}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${STATUS_STYLES[expense.status]}`}>
                        {STATUS_ICON[expense.status]}
                        {expense.status}
                    </span>
                    {expense.status === 'Pending' && (
                        <button
                            onClick={() => markPaid(expense.id)}
                            title="Mark as Paid"
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition-all"
                        >
                            Mark Paid
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                            <Receipt className="text-orange-400" size={22} />
                        </div>
                        Sovereign Expense Tracker
                    </h2>
                    <p className="text-slate-400 text-xs mt-2">Track office utilities, imprest, and petty cash disbursements.</p>
                </div>
                <button
                    onClick={() => setShowLogModal(true)}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-orange-900/20"
                >
                    <Plus size={16} /> Log Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Total Paid', value: totalPaid, color: 'emerald', icon: <CheckCircle2 size={20} /> },
                    { label: 'Pending Approval', value: totalPending, color: 'amber', icon: <Clock size={20} /> },
                    { label: 'Overdue', value: totalOverdue, color: 'red', icon: <AlertCircle size={20} /> },
                ].map(card => (
                    <div key={card.label} className={`bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex items-center gap-5`}>
                        <div className={`p-3 bg-${card.color}-500/10 rounded-2xl border border-${card.color}-500/20 text-${card.color}-400`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
                            <p className="text-lg font-black text-white mt-0.5 font-mono">{formatGHS(card.value)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab.key
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="p-16 flex justify-center items-center text-orange-500">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : (
                    <>
                        {activeTab === 'utilities' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <Zap className="text-yellow-400" size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recurring Office Bills</span>
                                </div>
                                {utilities.map(renderExpenseRow)}
                            </div>
                        )}

                        {activeTab === 'petty-cash' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="text-orange-400" size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Imprest & Petty Cash Ledger</span>
                                </div>
                                {pettyCash.map(renderExpenseRow)}
                            </div>
                        )}

                        {activeTab === 'log' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <select
                                            title="Filter by status"
                                            value={filterStatus}
                                            onChange={e => setFilterStatus(e.target.value as any)}
                                            className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-300 outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
                                        >
                                            {(['All', 'Paid', 'Pending', 'Overdue'] as const).map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={12} />
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{filteredAll.length} entries</span>
                                </div>
                                {filteredAll.map(renderExpenseRow)}
                                {filteredAll.length === 0 && (
                                    <div className="text-center py-16 text-slate-700">
                                        <TrendingDown size={40} className="mx-auto mb-3 opacity-40" />
                                        <p className="text-sm font-bold">No expenses match this filter</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Log Expense Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-7 animate-in zoom-in-95 duration-300 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                                    <Receipt className="text-orange-400" size={22} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white tracking-tight">Log New Expense</h4>
                                    <p className="text-xs text-slate-500">Records to pending approval queue.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleLogSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. ECG Electricity Bill — April 2026"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-orange-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount (GHS)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-orange-500/50 focus:outline-none transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                                    <select
                                        title="Expense category"
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-300 focus:border-orange-500/50 focus:outline-none transition-all cursor-pointer"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                                <input
                                    type="date"
                                    title="Expense date"
                                    required
                                    value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-orange-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notes (optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Additional context..."
                                    value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-orange-500/50 focus:outline-none transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Submit to Pending Queue
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SovereignExpenseTracker;
