import React, { useState, useEffect } from 'react';
import { getSavedSession } from '../utils/api';
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, History } from 'lucide-react';

interface TrustTransaction {
    id: string;
    date: string;
    type: string;
    amount: number;
    description: string;
    reference?: string;
}

interface TrustLedger {
    clientId: string;
    balance: number;
    transactions: TrustTransaction[];
}

export const ClientTrustLedger: React.FC<{ clientId: string }> = ({ clientId }) => {
    const [ledger, setLedger] = useState<TrustLedger | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const session = getSavedSession();
                const res = await fetch(`/api/accounting/trust/client/${clientId}`, {
                    headers: { 'Authorization': `Bearer ${session?.token || ''}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLedger(data);
                }
            } catch (err) {
                console.error("Failed to fetch trust ledger", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLedger();
    }, [clientId]);

    if (loading) {
        return (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse">
                <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
                <div className="h-12 w-64 bg-slate-800 rounded mb-8"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-slate-800 rounded-2xl"></div>
                    <div className="h-16 bg-slate-800 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!ledger) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="text-emerald-400" /> Trust & Retainer Balance
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        IOLTA Compliant Client Funds
                    </p>
                </div>
                
                <div className="flex bg-slate-950 p-6 rounded-[2rem] border border-slate-800 items-center gap-6 shadow-inner">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Available Balance</p>
                        <p className="text-3xl font-black text-white tracking-tighter">
                            GHS {ledger.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="h-12 w-px bg-slate-800" />
                    <Wallet size={32} className="text-emerald-500 opacity-80" />
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                    <History size={14} /> Transaction History
                </h5>
                
                {ledger.transactions.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <p className="text-xs uppercase font-bold tracking-widest text-slate-400">No trust account activity.</p>
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                        {ledger.transactions.map(tx => {
                            const isDeposit = tx.type === 'TRUST_DEPOSIT';
                            return (
                                <div key={tx.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl border ${isDeposit ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                            {isDeposit ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-200">{tx.description || tx.type.replace('_', ' ')}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter mt-1">
                                                {new Date(tx.date).toLocaleDateString()} {tx.reference && `• Ref: ${tx.reference}`}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-black tracking-tight ${isDeposit ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isDeposit ? '+' : '-'}GHS {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
