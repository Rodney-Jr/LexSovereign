
import React, { useState, useEffect } from 'react';
import { 
    BookOpen, 
    Plus, 
    Search, 
    Trash2, 
    Edit, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Database,
    Globe,
    Tag,
    X,
    Save
} from 'lucide-react';
import { authorizedFetch } from '../utils/api';

export const ClauseManagementTab = () => {
    const [clauses, setClauses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClause, setEditingClause] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'GENERAL',
        jurisdiction: 'GH_ACC_1',
        content: '',
        tags: ''
    });

    useEffect(() => {
        fetchClauses();
    }, []);

    const fetchClauses = async () => {
        setLoading(true);
        try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';
            const data = await authorizedFetch('/api/platform/clauses', { token });
            if (Array.isArray(data)) setClauses(data);
        } catch (e) {
            console.error("Failed to fetch clauses", e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (clause: any = null) => {
        if (clause) {
            setEditingClause(clause);
            setFormData({
                title: clause.title,
                category: clause.category,
                jurisdiction: clause.jurisdiction,
                content: typeof clause.content === 'string' ? clause.content : JSON.stringify(clause.content, null, 2),
                tags: (clause.tags || []).join(', ')
            });
        } else {
            setEditingClause(null);
            setFormData({
                title: '',
                category: 'GENERAL',
                jurisdiction: 'GH_ACC_1',
                content: '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Clause Text Here"}]}]}',
                tags: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setStatus(null);
        try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';
            
            let contentJson;
            try {
                contentJson = JSON.parse(formData.content);
            } catch (e) {
                // If it's pure HTML or text, we can wrap it or handle it, but Studio expects ProseMirror JSON
                // For now, let's assume the user provides valid ProseMirror JSON or simple text that we wrap.
                contentJson = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: formData.content }] }] };
            }

            const payload = {
                title: formData.title,
                category: formData.category,
                jurisdiction: formData.jurisdiction,
                content: contentJson,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
            };

            const url = editingClause ? `/api/platform/clauses/${editingClause.id}` : '/api/platform/clauses';
            const method = editingClause ? 'PATCH' : 'POST';

            const response = await authorizedFetch(url, {
                method,
                token,
                body: JSON.stringify(payload)
            });

            if (response.error) throw new Error(response.error);

            setStatus({ type: 'success', message: `Clause ${editingClause ? 'updated' : 'created'} successfully.` });
            setIsModalOpen(false);
            fetchClauses();
        } catch (e: any) {
            setStatus({ type: 'error', message: e.message || 'Failed to save clause' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanent registry removal? This will impact all tenants relying on this standard clause.')) return;

        try {
            const sessionData = localStorage.getItem('nomosdesk_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';
            await authorizedFetch(`/api/platform/clauses/${id}`, {
                method: 'DELETE',
                token
            });
            setClauses(clauses.filter(c => c.id !== id));
            setStatus({ type: 'success', message: 'Clause removed from global registry.' });
        } catch (e) {
            console.error("Failed to delete", e);
        }
    };

    const filteredClauses = clauses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen size={14} className="text-cyan-400" /> Standard Clause Registry
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono italic">Shared across all sovereign enclaves</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search library..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all w-64"
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                    >
                        <Plus size={14} /> Add Standard Clause
                    </button>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs border ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <p>{status.message}</p>
                    <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100"><X size={14} /></button>
                </div>
            )}

            {/* Registry Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
                        <Loader2 className="animate-spin w-10 h-10 text-cyan-500" />
                        <p className="font-mono text-[10px] animate-pulse uppercase tracking-[0.2em]">Syncing Clause Enclaves...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            <tr>
                                <th className="px-8 py-5">Clause Specification</th>
                                <th className="px-8 py-5">Jurisdiction</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5">Usage</th>
                                <th className="px-8 py-5 text-right">Registry Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredClauses.map(clause => (
                                <tr key={clause.id} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                                                <Database size={18} />
                                            </div>
                                            <div className="max-w-[400px]">
                                                <p className="text-sm font-bold text-white truncate">{clause.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {(clause.tags || []).slice(0, 2).map((t: string) => (
                                                        <span key={t} className="text-[8px] font-bold text-slate-500 uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{t}</span>
                                                    ))}
                                                    <span className="text-[10px] text-slate-600 font-mono">ID: {clause.id.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} className="text-cyan-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{clause.jurisdiction}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold uppercase">
                                            {clause.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">{clause.usageCount || 0}</span>
                                            <span className="text-[8px] text-slate-500 uppercase">Injections</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(clause)}
                                                className="p-2 hover:bg-cyan-500/10 text-slate-600 hover:text-cyan-400 transition-all rounded-xl"
                                                title="Edit Clause"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(clause.id)}
                                                className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all rounded-xl"
                                                title="Remove Clause"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredClauses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <p className="text-slate-500 text-sm italic">Standard registry is empty / No results matching query.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/10 rounded-2xl">
                                    <Database className="text-cyan-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{editingClause ? 'Edit Standard Clause' : 'Ingest New Standard Clause'}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">SOV-REGISTRY-OPS</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Clause Title</label>
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="e.g. Force Majeure (Standard)"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Jurisdiction / Region</label>
                                    <select 
                                        value={formData.jurisdiction}
                                        onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
                                        title="Select Jurisdiction Region"
                                        aria-label="Select Jurisdiction Region"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-bold uppercase tracking-wider appearance-none"
                                    >
                                        <option value="GH_ACC_1">Ghana (Accra Enclave)</option>
                                        <option value="NG_LAG_1">Nigeria (Lagos Silo)</option>
                                        <option value="KE_NBO_1">Kenya (Nairobi Silo)</option>
                                        <option value="ZA_CPT_1">South Africa (Cape Town)</option>
                                        <option value="GLOBAL">Global (Standard)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        title="Select Clause Category"
                                        aria-label="Select Clause Category"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-bold uppercase tracking-wider appearance-none"
                                    >
                                        <option value="GENERAL">General Terms</option>
                                        <option value="TERMINATION">Termination</option>
                                        <option value="LIABILITY">Limitation of Liability</option>
                                        <option value="CONFIDENTIALITY">Confidentiality</option>
                                        <option value="INTELLECTUAL_PROPERTY">Intellectual Property</option>
                                        <option value="DISPUTE_RESOLUTION">Dispute Resolution</option>
                                        <option value="EMPLOYMENT">Employment</option>
                                        <option value="COMMERCIAL">Commercial</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Keywords / Tags (Comma separated)</label>
                                    <input 
                                        type="text" 
                                        value={formData.tags}
                                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                        placeholder="e.g. risk, liability, standard"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clause Artifact (ProseMirror JSON)</label>
                                    <span className="text-[8px] text-slate-600 font-mono tracking-tighter">STRUCT_JSON_ENFORCED</span>
                                </div>
                                <textarea 
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    rows={8}
                                    placeholder='{"type": "doc", ...}'
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-cyan-500/80 font-mono focus:outline-none focus:border-cyan-500 transition-all resize-none scrollbar-hide"
                                />
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-800 bg-slate-800/20 flex gap-4">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="flex-[2] py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> {editingClause ? 'Commit Registry Update' : 'Finalize Global Ingestion'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
