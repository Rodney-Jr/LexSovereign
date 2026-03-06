import React, { useState } from 'react';
import { ExpenseEntry, ImprestAccount, UserRole } from '../types';
import { Wallet, Landmark, Plus, ArrowUpRight, ArrowDownRight, Filter, AlertCircle, Lock } from 'lucide-react';

interface FinanceOpsProps {
    userRole: UserRole;
    expenses: ExpenseEntry[];
    imprest: ImprestAccount[];
    onAddExpense: (expense: Omit<ExpenseEntry, 'id'>) => void;
    onFreezeBudget: (budgetId: string) => void;
}

const SovereignFinanceOps: React.FC<FinanceOpsProps> = ({ userRole, expenses, imprest, onAddExpense, onFreezeBudget }) => {
    const [activeTab, setActiveTab] = useState<'expenses' | 'imprest' | 'budget'>('expenses');

    const canFreeze = ['OWNER', 'PARTNER', 'SENIOR_COUNSEL', 'GLOBAL_ADMIN'].includes(userRole);

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="flex flex-col gap-6">
            {/* KPI Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Landmark className="text-blue-400" size={24} />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Monthly Outflow</span>
                    </div>
                    <div className="text-2xl font-bold text-white">GHS {totalExpenses.toLocaleString()}</div>
                    <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
                        <ArrowUpRight size={14} />
                        <span>12% from last month</span>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Wallet className="text-emerald-400" size={24} />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Total Imprest Float</span>
                    </div>
                    <div className="text-2xl font-bold text-white">GHS {imprest.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}</div>
                    <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
                        <ArrowDownRight size={14} />
                        <span>Reconciled 98%</span>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-blue-500">
                    <div className="text-xs text-slate-500 font-medium mb-1">Budget Health</div>
                    <div className="flex items-center gap-2 text-xl font-semibold text-white">
                        Within Limits
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-blue-500 h-full w-[65%]"></div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">65% of Q1 Ops Budget Used</div>
                </div>
            </div>

            {/* Main Container */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="flex border-b border-slate-800">
                    {(['expenses', 'imprest', 'budget'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                                    ? 'text-blue-400 border-blue-400 bg-blue-400/5'
                                    : 'text-slate-400 border-transparent hover:text-slate-200'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'expenses' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Office Expenditures</h3>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition-colors border border-slate-700">
                                        <Filter size={16} /> Filter
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                                        <Plus size={16} /> Log Expense
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-slate-500 border-b border-slate-800">
                                        <tr>
                                            <th className="pb-4 font-medium">Date</th>
                                            <th className="pb-4 font-medium">Category</th>
                                            <th className="pb-4 font-medium">Description</th>
                                            <th className="pb-4 font-medium">Amount</th>
                                            <th className="pb-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {expenses.map((exp) => (
                                            <tr key={exp.id} className="group hover:bg-slate-800/30">
                                                <td className="py-4 text-slate-400">{exp.date}</td>
                                                <td className="py-4">
                                                    <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded-full border border-slate-700">
                                                        {exp.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-white group-hover:text-blue-400 transition-colors">{exp.description}</td>
                                                <td className="py-4 font-mono font-semibold text-white">GHS {exp.amount.toLocaleString()}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${exp.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {exp.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">Operational Budgets</h3>
                                {canFreeze ? (
                                    <button
                                        onClick={() => onFreezeBudget('ALL')}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Lock size={16} /> Freeze All Budgets
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                                        <AlertCircle size={16} /> Budget control restricted to Partners
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['Logistics & Runs', 'Office Utilities', 'Legal Research Subs'].map((dept) => (
                                    <div key={dept} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-slate-300 font-medium">{dept}</span>
                                            <span className="text-xs text-slate-500">72% used</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full w-[72%]"></div>
                                        </div>
                                        <div className="flex justify-between mt-3">
                                            <span className="text-xs text-slate-500">Spent: GHS 45,000</span>
                                            <span className="text-xs text-slate-400 font-semibold">T: GHS 62,500</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SovereignFinanceOps;
