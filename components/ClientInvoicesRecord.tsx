
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
    Receipt as ReceiptIcon,
    Zap,
    Plus,
    X,
    Cpu,
    RefreshCw
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

    // AI Timesheet State
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiSyncing, setAiSyncing] = useState(false);
    const [isBackfilling, setIsBackfilling] = useState(false);

    const fetchInvoices = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            setLoading(true);
            const data = await authorizedFetch('/api/billing/invoices', { token: session.token });
            setInvoices(data);

            // Fetch AI Suggestions (in background)
            authorizedFetch(`/api/productivity/ai-timesheet-suggestions/${session.user.id}`, { token: session.token })
                .then(res => {
                    if (res.suggestions) setAiSuggestions(res.suggestions);
                })
                .catch(err => console.error("AI Suggestions error:", err));

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

    const handleApproveSuggestion = async (idx: number) => {
        const suggestion = aiSuggestions[idx];
        if (!suggestion) return;

        try {
            setAiSyncing(true);
            const session = getSavedSession();
            if (!session?.token) return;

            // Post it as a real time entry
            await authorizedFetch('/api/firm/time', {
                method: 'POST',
                token: session.token,
                body: JSON.stringify({
                    matterId: suggestion.matterId || null,
                    date: new Date().toISOString(),
                    durationMinutes: suggestion.durationMinutes,
                    description: suggestion.description,
                    isBillable: true,
                    activityType: suggestion.activityType
                })
            });

            // Remove from inbox UI
            setAiSuggestions(prev => prev.filter((_, i) => i !== idx));
        } catch (e) {
            console.error("Failed to approve suggestion", e);
        } finally {
            setAiSyncing(false);
        }
    };

    const handleDismissSuggestion = (idx: number) => {
        setAiSuggestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleExportCSV = () => {
        if (filteredInvoices.length === 0) return;
        const headers = ['Invoice ID', 'Matter', 'Client', 'Amount', 'Status', 'Created', 'Issued', 'Due Date'];
        const rows = filteredInvoices.map(inv => [
            '#' + inv.id.slice(0, 8).toUpperCase(),
            `"${inv.matter.name}"`,
            `"${inv.matter.client}"`,
            inv.totalAmount.toFixed(2),
            inv.status,
            inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
            inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '',
            inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const handleBackfill = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            setIsBackfilling(true);
            const res = await authorizedFetch('/api/billing/backfill', {
                method: 'POST',
                token: session.token
            });
            alert(res.message || "Backfill complete.");
            fetchInvoices();
        } catch (e: any) {
            console.error('[Invoicing] Backfill failed:', e);
            alert(`Backfill failed: ${e.message}`);
        } finally {
            setIsBackfilling(false);
        }
    };

    const handleBulkProcess = async () => {
        const draftInvoices = filteredInvoices.filter(i => i.status === 'DRAFT');
        if (draftInvoices.length === 0) {
            alert('No DRAFT invoices to process. All invoices are already issued or paid.');
            return;
        }
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            setIsBulkProcessing(true);
            await Promise.all(
                draftInvoices.map(inv =>
                    authorizedFetch(`/api/billing/invoices/${inv.id}/status`, {
                        method: 'PATCH',
                        token: session.token,
                        body: JSON.stringify({ status: 'ISSUED' })
                    })
                )
            );
            await fetchInvoices();
        } catch (e) {
            console.error('[Invoicing] Bulk process failed:', e);
            alert('Bulk processing failed. Some invoices may not have been updated.');
        } finally {
            setIsBulkProcessing(false);
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
                    <button
                        onClick={handleBackfill}
                        disabled={isBackfilling}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                        {isBackfilling ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Sync Missing
                    </button>
                    <button
                        onClick={handleExportCSV}
                        disabled={filteredInvoices.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* AI Suggested Timesheets Inbox */}
            {aiSuggestions.length > 0 && (
                <div className="bg-slate-900 border border-emerald-500/20 rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-500 mb-8">
                    <div className="bg-emerald-500/5 px-8 py-5 flex items-center justify-between border-b border-emerald-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Cpu size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    AI Unbilled Time Inbox
                                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                                        {aiSuggestions.length} Phantom Logs Found
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">Sovereign AI has inferred billable activity from your system access logs today.</p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {aiSuggestions.map((s, idx) => (
                            <div key={idx} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-all">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Zap size={16} className={s.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'} />
                                            <span className="text-sm font-bold text-slate-200">{s.activityType}</span>
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 uppercase">{s.durationMinutes} mins</span>
                                        </div>
                                        {s.matterId && (
                                            <span className="text-[10px] font-mono text-slate-500 border border-slate-700 px-2 py-1 rounded bg-slate-900">
                                                Matter: {s.matterId}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 italic">"{s.description}"</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        disabled={aiSyncing}
                                        onClick={() => handleDismissSuggestion(idx)}
                                        className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                        title="Discard"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button
                                        disabled={aiSyncing}
                                        onClick={() => handleApproveSuggestion(idx)}
                                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Plus size={14} /> Add to Timesheet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                            <button
                                onClick={handleBulkProcess}
                                disabled={isBulkProcessing || filteredInvoices.filter(i => i.status === 'DRAFT').length === 0}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isBulkProcessing ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : `Issue ${filteredInvoices.filter(i => i.status === 'DRAFT').length} Draft Invoices`}
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
