import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    MoreVertical, 
    ArrowRight, 
    Building2, 
    Calendar, 
    Mail, 
    Phone, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    UserPlus
} from 'lucide-react';
import { authorizedFetch } from '../utils/api';

interface Lead {
    id: string;
    name: string;
    email: string;
    company: string;
    phone: string;
    source: string;
    status: 'NEW' | 'PROSPECT' | 'OUTREACH' | 'DEMO' | 'PILOT' | 'CONVERTED' | 'REJECTED';
    metadata: any;
    createdAt: string;
}

const LeadPipeline: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchLeads = async () => {
        try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';
            
            const data = await authorizedFetch('/api/leads', { token });
            setLeads(data);
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
        try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';

            await authorizedFetch(`/api/leads/${id}/status`, {
                token,
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            fetchLeads();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const filteredLeads = leads.filter(lead => 
        lead.name.toLowerCase().includes(filter.toLowerCase()) || 
        lead.company?.toLowerCase().includes(filter.toLowerCase())
    );

    const stages = [
        { id: 'NEW', label: 'New Inbox', color: 'bg-blue-500/10 text-blue-400' },
        { id: 'PROSPECT', label: 'Qualified', color: 'bg-indigo-500/10 text-indigo-400' },
        { id: 'OUTREACH', label: 'In Contact', color: 'bg-amber-500/10 text-amber-400' },
        { id: 'DEMO', label: 'Demo Done', color: 'bg-purple-500/10 text-purple-400' },
        { id: 'PILOT', label: 'Pilot Phase', color: 'bg-emerald-500/10 text-emerald-400' }
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search firms or partners..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm focus:border-brand-primary outline-none transition-colors"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-sidebar border border-brand-border rounded-xl text-xs font-bold text-brand-muted hover:text-brand-text transition-colors">
                        <Filter size={14} /> Filter Source
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-bg rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20">
                        <UserPlus size={14} /> Log Manual Lead
                    </button>
                </div>
            </div>

            <div className="bg-brand-sidebar border border-brand-border rounded-[2rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-brand-border bg-brand-bg/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Law Firm / Partner</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Pilot Details</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Source</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-brand-muted uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {filteredLeads.map(lead => (
                            <tr key={lead.id} className="hover:bg-brand-primary/5 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-primary shrink-0">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-text leading-tight">{lead.company || 'Unknown Firm'}</p>
                                            <p className="text-xs text-brand-muted">{lead.name}</p>
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
                                        {lead.metadata?.firmSize && (
                                            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-tighter">
                                                Size: {lead.metadata.firmSize}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-brand-bg rounded-lg border border-brand-border text-[10px] font-mono text-brand-muted">
                                        {lead.source}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={lead.status}
                                            title="Update Lead Status"
                                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                                            className={`text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full border border-transparent outline-none cursor-pointer transition-colors ${
                                                stages.find(s => s.id === lead.status)?.color || 'bg-slate-500/10 text-slate-400'
                                            }`}
                                        >
                                            {stages.map(stage => (
                                                <option key={stage.id} value={stage.id} className="bg-brand-sidebar text-brand-text">{stage.label}</option>
                                            ))}
                                            <option value="CONVERTED" className="bg-brand-sidebar text-brand-text">Converted</option>
                                            <option value="REJECTED" className="bg-brand-sidebar text-brand-text">Rejected</option>
                                        </select>
                                        {lead.status === 'NEW' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-brand-bg rounded-lg text-brand-muted hover:text-brand-primary" title="View Details">
                                            <Clock size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-brand-bg rounded-lg text-brand-muted hover:text-brand-secondary" title="Email Lead">
                                            <Mail size={16} />
                                        </button>
                                        <button className="p-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-bg rounded-lg transition-all" title="Approve for Pilot">
                                            <CheckCircle2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLeads.length === 0 && (
                    <div className="p-12 text-center text-brand-muted uppercase tracking-widest text-xs">
                        No leads records found in secure storage.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadPipeline;
