
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Trash2,
    Search,
    ChevronRight,
    Upload,
    History,
    Database,
    ShieldCheck,
    CheckCircle2,
    X,
    Loader2
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    jurisdiction: string;
    version: string;
    tenantId: string | null;
}

const TemplateManager: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        category: 'GENERAL',
        jurisdiction: 'GH_ACC_1',
        region: 'GH_ACC_1',
        content: '',
        version: '1.0.0'
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const session = getSavedSession();
            if (!session?.token) return;
            const data = await authorizedFetch('/api/document-templates', { token: session.token });
            setTemplates(data);
        } catch (e) {
            console.error("Failed to fetch templates", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpload = async () => {
        if (!newTemplate.name || !newTemplate.content) {
            alert("Name and Content are required.");
            return;
        }

        try {
            setUploading(true);
            const session = getSavedSession();
            if (!session?.token) return;

            await authorizedFetch('/api/document-templates', {
                method: 'POST',
                token: session.token,
                body: JSON.stringify({
                    ...newTemplate,
                    jurisdiction: newTemplate.region || newTemplate.jurisdiction
                })
            });

            setShowUploadModal(false);
            setNewTemplate({
                name: '',
                description: '',
                category: 'GENERAL',
                jurisdiction: 'GH_ACC_1',
                region: 'GH_ACC_1',
                content: '',
                version: '1.0.0'
            });
            fetchData();
        } catch (e: any) {
            alert(`Upload failed: ${e.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove the template "${name}" from your silo?`)) return;

        try {
            const session = getSavedSession();
            if (!session?.token) return;

            await authorizedFetch(`/api/document-templates/${id}`, {
                method: 'DELETE',
                token: session.token
            });
            fetchData();
        } catch (e: any) {
            alert(`Deletion failed: ${e.message}`);
        }
    };

    const filtered = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const privateTemplates = filtered.filter(t => t.tenantId !== null);
    const globalTemplates = filtered.filter(t => t.tenantId === null);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                        <h4 className="text-xl font-bold text-white flex items-center gap-3">
                            <Database className="text-emerald-400" size={20} /> Private Template Vault
                        </h4>
                        <p className="text-xs text-slate-500">Manage your organization's proprietary legal blueprints and jurisdictional logic.</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                        title="Upload a new template"
                    >
                        <Plus size={16} /> Upload New Template
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all"
                        title="Search templates"
                    />
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">Scanning Silo...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-4">
                        <History size={48} className="opacity-20" />
                        <p className="text-sm font-bold">No templates found.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {privateTemplates.length > 0 && (
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={12} /> Your Organization's Blueprints
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {privateTemplates.map(t => (
                                        <TemplateCard key={t.id} template={t} onDelete={() => handleDelete(t.id, t.name)} isOwner={true} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Database size={12} /> Global Sovereign Library
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {globalTemplates.map(t => (
                                    <TemplateCard key={t.id} template={t} isOwner={false} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <Upload className="text-emerald-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">Upload Blueprint</h4>
                                    <p className="text-xs text-slate-500">Add a new legal template to your private Sovereign Silo.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                title="Cancel Template Upload"
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Template Name" value={newTemplate.name} onChange={v => setNewTemplate({ ...newTemplate, name: v })} placeholder="e.g. Master Service Agreement" />
                            <InputField label="Jurisdiction" value={newTemplate.jurisdiction} onChange={v => setNewTemplate({ ...newTemplate, jurisdiction: v })} placeholder="e.g. GH_ACC_1" />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    title="Select Template Category"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-300 focus:outline-none"
                                    value={newTemplate.category}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                >
                                    <option value="GENERAL">General Template</option>
                                    <option value="COURT_FORM">Court Form</option>
                                    <option value="CONTRACT_MODAL">Contract Modal</option>
                                    <option value="INTERNAL_MEMO">Internal Memo</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Silo (Region)</label>
                                <select
                                    title="Select Target Silo"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-300 focus:outline-none"
                                    value={newTemplate.region}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewTemplate({ ...newTemplate, region: e.target.value })}
                                >
                                    <option value="GH_ACC_1">Ghana (Accra)</option>
                                    <option value="NG_LOS_1">Nigeria (Lagos)</option>
                                    <option value="KE_NBO_1">Kenya (Nairobi)</option>
                                    <option value="GB_LDN_1">UK (London)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-300 focus:outline-none"
                                value={newTemplate.description}
                                onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                placeholder="Summary of what this template is for..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Template Content (Markdown/Sovereign DSL)</label>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-300 h-48 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={newTemplate.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                                placeholder="# Template Title..."
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            {uploading ? "Securing Blueprint..." : "Finalize & Store in Silo"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TemplateCard = ({ template, onDelete, isOwner }: { template: Template, onDelete?: () => void, isOwner: boolean }) => (
    <div className={`p-5 bg-slate-950 border rounded-2xl flex flex-col justify-between gap-4 transition-all group ${isOwner ? 'border-indigo-500/20 hover:border-indigo-500/40' : 'border-slate-800 hover:border-slate-700'}`}>
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase border ${isOwner ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {template.category}
                </span>
                <span className="text-[9px] font-mono text-slate-600">v{template.version}</span>
            </div>
            <div>
                <h5 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{template.name}</h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{template.description}</p>
            </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-900">
            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                <FileText size={12} /> {template.jurisdiction}
            </div>
            {isOwner && (
                <button
                    onClick={onDelete}
                    className="p-1.5 text-slate-700 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                    title="Delete Template Blueprint"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    </div>
);

const InputField = ({ label, value, onChange, placeholder }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-300 focus:outline-none"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            title={label}
        />
    </div>
);

export default TemplateManager;
