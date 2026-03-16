import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Building2,
    Mail,
    Phone,
    CheckCircle2,
    Clock,
    X,
    UserPlus,
    ChevronDown,
    Loader2,
    Send,
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface Lead {
    id: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    source: string;
    status: 'NEW' | 'PROSPECT' | 'OUTREACH' | 'DEMO' | 'PILOT' | 'CONVERTED' | 'REJECTED';
    metadata: any;
    tenantId?: string;
    notes?: string;
    createdAt: string;
}

const stages = [
    { id: 'NEW', label: 'New Inquiry', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'PROSPECT', label: 'Pre-Screened', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { id: 'OUTREACH', label: 'In Discussion', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'DEMO', label: 'Consultation Complete', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { id: 'PILOT', label: 'Retainer Issued', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'CONVERTED', label: 'Client Retained', color: 'bg-green-600/10 text-green-400 border-green-600/20' },
    { id: 'REJECTED', label: 'Declined', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

const sources = ['ALL', 'WEB_MODAL', 'FOUNDING_PILOT', 'REFERRAL', 'EVENT', 'COLD_OUTREACH', 'INBOUND', 'MANUAL_ENTRY', 'FIRM_CHATBOT', 'MARKETING_CHATBOT'];

interface AddLeadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', source: 'MANUAL_ENTRY', firmSize: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const session = getSavedSession();
            await authorizedFetch('/api/leads', {
                token: session?.token || '',
                method: 'POST',
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    company: form.company,
                    phone: form.phone,
                    source: form.source,
                    notes: form.notes,
                    metadata: { firmSize: form.firmSize, addedManually: true }
                })
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to log lead.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-sidebar border border-brand-border rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-8 border-b border-brand-border">
                    <div>
                        <h3 className="font-bold text-brand-text text-lg">Log Manual Lead</h3>
                        <p className="text-xs text-brand-muted mt-1">Add a new prospect to the acquisition pipeline.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-xl text-brand-muted hover:text-brand-text transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Contact Name *</label>
                            <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors"
                                placeholder="Sterling Archer" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Email *</label>
                            <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors"
                                placeholder="s.archer@firm.com" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Law Firm</label>
                            <input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors"
                                placeholder="Apex Law Partners" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Phone</label>
                            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors"
                                placeholder="+233 24 000 0000" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Source</label>
                            <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors">
                                <option value="MANUAL_ENTRY">Manual Entry</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="EVENT">Event / Conference</option>
                                <option value="COLD_OUTREACH">Cold Outreach</option>
                                <option value="INBOUND">Inbound Inquiry</option>
                                <option value="FOUNDING_PILOT">Founding Pilot</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Firm Size</label>
                            <select value={form.firmSize} onChange={e => setForm(p => ({ ...p, firmSize: e.target.value }))}
                                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-colors">
                                <option value="">Unknown</option>
                                <option value="SOLO">Solo Practitioner</option>
                                <option value="SMALL">Small (2–10)</option>
                                <option value="MID">Mid-size (11–50)</option>
                                <option value="LARGE">Large (50+)</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Initial Notes / Context</label>
                        <textarea 
                            value={form.notes} 
                            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2 text-sm text-brand-text h-20 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                            placeholder="e.g. Seeking legal advice on Ghanaian land acquisition..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 rounded-2xl border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-primary/50 font-bold text-sm transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-3 rounded-2xl bg-brand-primary text-brand-bg font-bold text-sm shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            {loading ? 'Logging...' : 'Log Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LeadPipeline: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchLeads = async () => {
        try {
            const session = getSavedSession();
            const data = await authorizedFetch('/api/leads', { token: session?.token || '' });
            if (Array.isArray(data)) setLeads(data);
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            const session = getSavedSession();
            await authorizedFetch(`/api/leads/${id}/status`, {
                token: session?.token || '',
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l));
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleApproveForPilot = (id: string) => updateStatus(id, 'PILOT');

    const handleEmailLead = (email: string) => {
        window.open(`mailto:${email}?subject=LexSovereign%20Demo%20Invitation`, '_blank');
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(filter.toLowerCase()) ||
            lead.company?.toLowerCase().includes(filter.toLowerCase()) ||
            lead.email?.toLowerCase().includes(filter.toLowerCase());
        const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
        return matchesSearch && matchesSource;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {showAddModal && (
                <AddLeadModal onClose={() => setShowAddModal(false)} onSuccess={fetchLeads} />
            )}

            {/* Pipeline Summary */}
            <div className="grid grid-cols-5 gap-3">
                {stages.slice(0, 5).map(stage => {
                    const count = leads.filter(l => l.status === stage.id).length;
                    return (
                        <div key={stage.id} className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${sourceFilter === stage.id ? stage.color + ' scale-[1.02]' : 'bg-brand-sidebar border-brand-border hover:border-brand-primary/30'}`}
                            onClick={() => setSourceFilter(s => s === stage.id ? 'ALL' : stage.id)}>
                            <p className="text-2xl font-black text-brand-text">{count}</p>
                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">{stage.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search firms, partners, or emails..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm focus:border-brand-primary outline-none transition-colors"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowSourceDropdown(d => !d)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-sidebar border border-brand-border rounded-xl text-xs font-bold text-brand-muted hover:text-brand-text transition-colors"
                        >
                            <Filter size={14} />
                            {sourceFilter === 'ALL' ? 'Filter Source' : sourceFilter.replace('_', ' ')}
                            <ChevronDown size={12} />
                        </button>
                        {showSourceDropdown && (
                            <div className="absolute top-full mt-1 right-0 z-20 bg-brand-sidebar border border-brand-border rounded-2xl shadow-2xl overflow-hidden min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
                                {sources.map(s => (
                                    <button key={s} onClick={() => { setSourceFilter(s); setShowSourceDropdown(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-brand-primary/10 hover:text-brand-primary transition-colors ${sourceFilter === s ? 'text-brand-primary' : 'text-brand-muted'}`}>
                                        {s.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-bg rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                    >
                        <UserPlus size={14} /> Log Manual Lead
                    </button>
                </div>
            </div>

            {/* Lead Table */}
            <div className="bg-brand-sidebar border border-brand-border rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-brand-border bg-brand-bg/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Law Firm / Partner</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Contact Details</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Source</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Pipeline Stage</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {filteredLeads.map(lead => {
                            const stageStyle = stages.find(s => s.id === lead.status)?.color || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                            const isUpdating = updatingId === lead.id;
                            return (
                                <tr key={lead.id} className="hover:bg-brand-primary/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-primary shrink-0">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-brand-text leading-tight">{lead.company || 'Unknown Firm'}</p>
                                                <p className="text-xs text-brand-muted">{lead.name}</p>
                                                {lead.metadata?.firmSize && (
                                                    <span className="text-[9px] font-bold text-brand-secondary uppercase tracking-tighter">{lead.metadata.firmSize}</span>
                                                )}
                                                {lead.notes && (
                                                    <p className="text-[10px] text-brand-muted italic mt-1 line-clamp-1 border-l-2 border-brand-primary/30 pl-2">
                                                        {lead.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[10px] text-brand-muted">
                                                <Mail size={12} /> {lead.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-brand-muted">
                                                <Phone size={12} /> {lead.phone || 'No phone'}
                                            </div>
                                            <p className="text-[9px] text-brand-muted/60 font-mono">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="inline-flex items-center gap-2 px-2 py-1 bg-brand-bg rounded-lg border border-brand-border text-[10px] font-mono text-brand-muted">
                                            {lead.source.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {isUpdating ? (
                                                <Loader2 size={16} className="animate-spin text-brand-primary" />
                                            ) : (
                                                <select
                                                    value={lead.status}
                                                    title="Update Lead Status"
                                                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                    className={`text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full border outline-none cursor-pointer transition-colors ${stageStyle}`}
                                                >
                                                    {stages.map(stage => (
                                                        <option key={stage.id} value={stage.id} className="bg-brand-sidebar text-brand-text">{stage.label}</option>
                                                    ))}
                                                </select>
                                            )}
                                            {lead.status === 'NEW' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEmailLead(lead.email)}
                                                className="p-2 hover:bg-brand-bg rounded-lg text-brand-muted hover:text-brand-secondary transition-colors"
                                                title={`Email ${lead.name}`}
                                            >
                                                <Mail size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(lead.id, 'DEMO')}
                                                className="p-2 hover:bg-brand-bg rounded-lg text-brand-muted hover:text-purple-400 transition-colors"
                                                title="Mark as Demo Done"
                                            >
                                                <Clock size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleApproveForPilot(lead.id)}
                                                className="p-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-bg rounded-lg transition-all"
                                                title="Approve for Pilot"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredLeads.length === 0 && (
                    <div className="p-12 text-center space-y-3">
                        <Users size={32} className="mx-auto text-brand-muted opacity-30" />
                        <p className="text-brand-muted uppercase tracking-widest text-xs">
                            {filter || sourceFilter !== 'ALL' ? 'No leads match your filter.' : 'No leads in the pipeline yet.'}
                        </p>
                        {!filter && sourceFilter === 'ALL' && (
                            <button onClick={() => setShowAddModal(true)} className="text-brand-primary text-xs font-bold underline">
                                Log the first lead →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadPipeline;
