
import React, { useState, useEffect } from 'react';
import {
    Upload,
    FileText,
    Trash2,
    Search,
    Plus,
    CheckCircle,
    AlertCircle,
    Loader2,
    Database,
    BookOpen,
    Scale,
    Landmark
} from 'lucide-react';
import { authorizedFetch } from '../utils/api';

export const LegalRepositoryTab = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [category, setCategory] = useState('STATUTE');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const sessionData = localStorage.getItem('lexSovereign_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';
            const data = await authorizedFetch('/api/platform/judicial/documents', { token });
            if (Array.isArray(data)) setDocuments(data);
        } catch (e) {
            console.error("Failed to fetch documents", e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', category);

        try {
            const sessionData = localStorage.getItem('lexSovereign_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';

            const response = await fetch('/api/platform/judicial/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: `Successfully ingested ${result.chunksCreated} chunks from ${selectedFile.name}` });
                setSelectedFile(null);
                fetchDocuments();
            } else {
                setStatus({ type: 'error', message: result.error || 'Upload failed' });
            }
        } catch (e) {
            setStatus({ type: 'error', message: 'Failed to communicate with ingestor' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this document trace from the Sovereign Registry?')) return;

        try {
            const sessionData = localStorage.getItem('lexSovereign_session');
            const token = sessionData ? JSON.parse(sessionData).token : '';
            await authorizedFetch(`/api/platform/judicial/documents/${id}`, {
                method: 'DELETE',
                token
            });
            setDocuments(documents.filter(d => d.id !== id));
        } catch (e) {
            console.error("Failed to delete", e);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
            {/* Left Section: Upload & Controls */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-2">
                        <Upload className="text-cyan-400" size={20} />
                        <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">Document Ingestion</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Source Category</label>
                            <div className="grid grid-cols-2 gap-2">
                                <CategoryButton
                                    label="Statute"
                                    active={category === 'STATUTE'}
                                    onClick={() => setCategory('STATUTE')}
                                    icon={<BookOpen size={14} />}
                                />
                                <CategoryButton
                                    label="Constitution"
                                    active={category === 'CONSTITUTION'}
                                    onClick={() => setCategory('CONSTITUTION')}
                                    icon={<Landmark size={14} />}
                                />
                                <CategoryButton
                                    label="Casefile"
                                    active={category === 'CASEFILE'}
                                    onClick={() => setCategory('CASEFILE')}
                                    icon={<Scale size={14} />}
                                />
                                <CategoryButton
                                    label="Other"
                                    active={category === 'LEGAL_DOC'}
                                    onClick={() => setCategory('LEGAL_DOC')}
                                    icon={<FileText size={14} />}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">File Selection</label>
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-8 hover:border-cyan-500/30 transition-all cursor-pointer bg-slate-950/50">
                                <Upload className="text-slate-600 mb-3" size={32} />
                                <span className="text-xs text-slate-400 font-medium">
                                    {selectedFile ? selectedFile.name : 'Click to Browse (HTML, PDF, TXT)'}
                                </span>
                                <input type="file" className="hidden" onChange={handleFileChange} accept=".html,.htm,.pdf,.txt" />
                            </label>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-2xl flex gap-3 text-xs ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-100 border border-red-500/20'}`}>
                                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                <p>{status.message}</p>
                            </div>
                        )}

                        <button
                            disabled={!selectedFile || uploading}
                            onClick={handleUpload}
                            className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${!selectedFile || uploading
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-900/20'
                                } flex items-center justify-center gap-2`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Vectorizing & Grounding...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    Ingest to Enclave
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/10 p-6 rounded-[2.5rem] flex items-start gap-4">
                    <Database className="text-cyan-400 shrink-0" size={24} />
                    <div className="space-y-1">
                        <h5 className="font-bold text-xs text-cyan-300 uppercase tracking-widest">Sovereign Knowledge Enclave</h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                            All documents are automatically chunked and vectorized using text-embedding-3-small. Search index is physically scoped to regional enclaves.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section: Repository List */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Database size={14} className="text-cyan-400" /> Sovereign Registry Pulse
                    </h4>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search Registry..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all w-64"
                        />
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                            <Loader2 className="animate-spin w-10 h-10 text-cyan-500" />
                            <p className="font-mono text-[10px] animate-pulse">Syncing with Judicial Registry...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/30 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                <tr>
                                    <th className="px-8 py-5">Judicial Instrument</th>
                                    <th className="px-8 py-5">Category</th>
                                    <th className="px-8 py-5">Ingested</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id} className="hover:bg-slate-800/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="max-w-[300px]">
                                                    <p className="text-sm font-bold text-white truncate">{doc.title}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">ID: {doc.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold uppercase">
                                                {doc.metadata?.category || 'LEGAL_DOC'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all rounded-xl"
                                                title="Decommission Document"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDocs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-20">
                                            <p className="text-slate-500 text-sm">No judicial instruments found matching criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const CategoryButton = ({ label, active, onClick, icon }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${active
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg'
                : 'bg-slate-950/50 text-slate-500 border-slate-800 hover:border-slate-700'
            }`}
    >
        {icon}
        {label}
    </button>
);
