
import React, { useState, useEffect } from 'react';
import {
    Receipt,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Download,
    Mail,
    ArrowUpDown,
    Receipt as ReceiptIcon
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import InvoicePreviewModal from './InvoicePreviewModal';

interface Invoice {
    id: string;
    matterId: string;
    tenantId: string;
    status: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOIDED' | 'OVERDUE';
    totalAmount: number;
    issuedAt: string | null;
    dueDate: string | null;
    paidAt: string | null;
    createdAt: string;
    matter: {
        name: string;
        client: string;
    };
}

const ClientInvoicesRecord: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const fetchInvoices = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            setLoading(true);
            const data = await authorizedFetch('/api/billing/invoices', { token: session.token });
            setInvoices(data);
        } catch (e) {
            console.error("[Invoicing] Failed to fetch invoices:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handlePreview = async (id: string) => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            setIsFetchingDetail(true);
            const detail = await authorizedFetch(`/api/billing/invoices/${id}`, { token: session.token });
            setSelectedInvoice(detail);
            setIsPreviewOpen(true);
        } catch (e) {
            console.error("[Invoicing] Failed to fetch invoice details:", e);
        } finally {
            setIsFetchingDetail(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            await authorizedFetch(`/api/billing/invoices/${id}/status`, {
                method: 'PATCH',
                token: session.token,
                body: JSON.stringify({ status: newStatus })
            });
            fetchInvoices();
        } catch (e) {
            console.error("[Invoicing] Status update failed:", e);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.matter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.matter.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || inv.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'ISSUED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'OVERDUE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'DRAFT': return 'bg-slate-800 text-slate-400 border-slate-700';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Matter or Client..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold uppercase tracking-widest text-[10px]"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        title="Filter invoices by status"
                    >
                        <option value="ALL">All States</option>
                        <option value="DRAFT">Drafts Only</option>
                        <option value="ISSUED">Issued</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all active:scale-95">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Main Ledger */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            <tr>
                                <th className="px-8 py-6">Invoice ID</th>
                                <th className="px-8 py-6">Matter / Client</th>
                                <th className="px-8 py-6">Amount</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Timeline</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synchronizing Client Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-800/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-[10px] text-slate-400">#{inv.id.slice(0, 8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{inv.matter.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-tight">{inv.matter.client}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-base font-black text-white italic tracking-tighter">
                                                ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                                    <Clock size={10} /> Created: {new Date(inv.createdAt).toLocaleDateString()}
                                                </p>
                                                {inv.issuedAt && (
                                                    <p className="text-[10px] text-blue-400 flex items-center gap-1.5">
                                                        <CheckCircle size={10} /> Issued: {new Date(inv.issuedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {inv.status === 'DRAFT' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(inv.id, 'ISSUED')}
                                                        className="p-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-xl transition-all hover:scale-105"
                                                        title="Issue Invoice"
                                                    >
                                                        <Mail size={16} />
                                                    </button>
                                                )}
                                                {inv.status === 'ISSUED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(inv.id, 'PAID')}
                                                        className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all hover:scale-105"
                                                        title="Mark as Paid"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handlePreview(inv.id)}
                                                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all disabled:opacity-50"
                                                    title="View Full Artifact"
                                                    disabled={isFetchingDetail}
                                                >
                                                    {isFetchingDetail && selectedInvoice?.id === inv.id ? (
                                                        <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="space-y-4">
                                            <div className="inline-flex p-6 bg-slate-800/50 rounded-full border border-slate-700">
                                                <Receipt size={40} className="text-slate-600" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 italic">No matching client invoices found in the silo index.</p>
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Invoices are auto-generated from matter billing triggers.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Legend / Stats Footer */}
                {!loading && filteredInvoices.length > 0 && (
                    <div className="bg-slate-800/30 p-8 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pipeline Health</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[65%]" />
                                    </div>
                                    <span className="text-xs font-mono text-blue-400">65% Rec.</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outstanding</p>
                                <p className="text-lg font-black text-rose-400 italic">
                                    ${filteredInvoices.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE').reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                                Bulk Process Invoices
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isPreviewOpen && selectedInvoice && (
                <InvoicePreviewModal
                    invoice={selectedInvoice}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setSelectedInvoice(null);
                    }}
                />
            )}
        </div>
    );
};

export default ClientInvoicesRecord;
