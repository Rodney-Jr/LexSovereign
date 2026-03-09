
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { Wallet, Landmark, Plus, ArrowUpRight, ArrowDownRight, Filter, AlertCircle, Lock, X, Loader2 } from 'lucide-react';

interface FinanceOpsProps {
    userRole: UserRole;
}

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    status: string;
    expenseDate: string;
    notes?: string;
}

const CATEGORIES = ['Office Supplies', 'Utilities', 'Legal Research', 'Logistics & Runs', 'Client Entertainment', 'Travel', 'Software', 'Other'];

const SovereignFinanceOps: React.FC<FinanceOpsProps> = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState<'expenses' | 'budget'>('expenses');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Office Supplies', expenseDate: new Date().toISOString().split('T')[0], notes: '' });

    const canFreeze = ['OWNER', 'PARTNER', 'SENIOR_COUNSEL', 'GLOBAL_ADMIN'].includes(userRole);

    const fetchExpenses = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            setIsLoading(true);
            const data = await authorizedFetch('/api/firm/expenses', { token: session.token });
            setExpenses(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('[FinanceOps] Failed to fetch expenses:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleLogExpense = async () => {
        const session = getSavedSession();
        if (!session?.token || !newExpense.description || !newExpense.amount) return;
        try {
            setIsSubmitting(true);
            await authorizedFetch('/api/firm/expenses', {
                method: 'POST',
                token: session.token,
                body: JSON.stringify({
                    description: newExpense.description,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category,
                    status: 'PENDING',
                    expenseDate: newExpense.expenseDate,
                    notes: newExpense.notes,
                    type: 'UTILITY'
                })
            });
            setShowLogModal(false);
            setNewExpense({ description: '', amount: '', category: 'Office Supplies', expenseDate: new Date().toISOString().split('T')[0], notes: '' });
            await fetchExpenses();
        } catch (e) {
            console.error('[FinanceOps] Failed to log expense:', e);
            alert('Failed to log expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            await authorizedFetch(`/api/firm/expenses/${id}/status`, {
                method: 'PUT',
                token: session.token,
                body: JSON.stringify({ status })
            });
            await fetchExpenses();
        } catch (e) {
            console.error('[FinanceOps] Failed to update status:', e);
        }
    };

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const approvedExpenses = expenses.filter(e => e.status === 'APPROVED').reduce((acc, e) => acc + e.amount, 0);
    const pendingCount = expenses.filter(e => e.status === 'PENDING').length;

    // Derive department buckets from live expense categories
    const budgetBuckets = CATEGORIES.slice(0, 3).map(cat => {
        const spent = expenses.filter(e => e.category === cat).reduce((a, e) => a + e.amount, 0);
        const limit = totalExpenses > 0 ? totalExpenses * 0.4 : 50000;
        return { cat, spent, limit, pct: Math.min(100, Math.round((spent / limit) * 100)) };
    });

    return (
        <div className="flex flex-col gap-6">
            {/* KPI Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl"><Landmark className="text-blue-400" size={24} /></div>
                        <span className="text-xs text-slate-500 font-medium">Total Outflow</span>
                    </div>
                    <div className="text-2xl font-bold text-white">GHS {totalExpenses.toLocaleString()}</div>
                    <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs">
                        <span>{expenses.length} expense records</span>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl"><Wallet className="text-emerald-400" size={24} /></div>
                        <span className="text-xs text-slate-500 font-medium">Approved Spend</span>
                    </div>
                    <div className="text-2xl font-bold text-white">GHS {approvedExpenses.toLocaleString()}</div>
                    <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
                        <ArrowDownRight size={14} /><span>Reconciled</span>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-amber-500">
                    <div className="text-xs text-slate-500 font-medium mb-1">Pending Approval</div>
                    <div className="text-2xl font-semibold text-amber-400">{pendingCount} Items</div>
                    <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Awaiting Partner Review</div>
                </div>
            </div>

            {/* Main Container */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="flex border-b border-slate-800">
                    {(['expenses', 'budget'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'text-blue-400 border-blue-400 bg-blue-400/5' : 'text-slate-400 border-transparent hover:text-slate-200'}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'expenses' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Office Expenditures</h3>
                                <button
                                    onClick={() => setShowLogModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                                    <Plus size={16} /> Log Expense
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                {isLoading ? (
                                    <div className="py-12 flex items-center justify-center gap-3 text-slate-500">
                                        <Loader2 size={18} className="animate-spin" /> Loading expenses...
                                    </div>
                                ) : expenses.length === 0 ? (
                                    <div className="py-12 text-center text-slate-500 text-sm">No expense records found. Log your first expense above.</div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-slate-500 border-b border-slate-800">
                                            <tr>
                                                <th className="pb-4 font-medium">Date</th>
                                                <th className="pb-4 font-medium">Category</th>
                                                <th className="pb-4 font-medium">Description</th>
                                                <th className="pb-4 font-medium">Amount</th>
                                                <th className="pb-4 font-medium">Status</th>
                                                {canFreeze && <th className="pb-4 font-medium">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {expenses.map(exp => (
                                                <tr key={exp.id} className="group hover:bg-slate-800/30">
                                                    <td className="py-4 text-slate-400">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                                                    <td className="py-4">
                                                        <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded-full border border-slate-700">{exp.category}</span>
                                                    </td>
                                                    <td className="py-4 text-white group-hover:text-blue-400 transition-colors">{exp.description}</td>
                                                    <td className="py-4 font-mono font-semibold text-white">GHS {exp.amount.toLocaleString()}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${exp.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{exp.status}</span>
                                                    </td>
                                                    {canFreeze && exp.status === 'PENDING' && (
                                                        <td className="py-4">
                                                            <button onClick={() => handleUpdateStatus(exp.id, 'APPROVED')}
                                                                className="text-[10px] px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all">
                                                                Approve
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">Operational Budgets</h3>
                                {!canFreeze && (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                                        <AlertCircle size={16} /> Budget control restricted to Partners
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {budgetBuckets.map(b => (
                                    <div key={b.cat} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-slate-300 font-medium">{b.cat}</span>
                                            <span className="text-xs text-slate-500">{b.pct}% used</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${b.pct > 80 ? 'bg-rose-500' : b.pct > 60 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${b.pct}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-3">
                                            <span className="text-xs text-slate-500">Spent: GHS {b.spent.toLocaleString()}</span>
                                            <span className="text-xs text-slate-400 font-semibold">Budget: GHS {b.limit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Log Expense Modal */}
            {showLogModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Log New Expense</h3>
                            <button onClick={() => setShowLogModal(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Description *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Monthly internet subscription"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={newExpense.description}
                                    onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount (GHS) *</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={newExpense.amount}
                                        onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={newExpense.expenseDate}
                                        onChange={e => setNewExpense(prev => ({ ...prev, expenseDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Category</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={newExpense.category}
                                    onChange={e => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                                    title="Select expense category"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Notes (Optional)</label>
                                <textarea
                                    placeholder="Any additional context..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                    rows={2}
                                    value={newExpense.notes}
                                    onChange={e => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all">Cancel</button>
                            <button
                                onClick={handleLogExpense}
                                disabled={isSubmitting || !newExpense.description || !newExpense.amount}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Logging...</> : 'Log Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SovereignFinanceOps;
