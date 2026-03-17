import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, CheckCircle2, Files, Server, Copy, ShieldAlert } from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
    lastUsed: string | null;
    isActive: boolean;
    rawKey?: string; // Only available immediately after creation
}

const ApiKeysDashboard: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [recentlyCreatedKey, setRecentlyCreatedKey] = useState<ApiKey | null>(null);

    const fetchKeys = async () => {
        try {
            const session = getSavedSession();
            const token = session?.token || '';
            const data = await authorizedFetch('/api/tenant/api-keys', { token });
            if (data && !data.error) {
                setApiKeys(data);
            }
        } catch (e) {
            console.error("Failed to fetch API keys", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        try {
            const session = getSavedSession();
            const token = session?.token || '';
            const data = await authorizedFetch('/api/tenant/api-keys', {
                method: 'POST',
                token,
                body: JSON.stringify({ name: newKeyName })
            });

            if (data && !data.error) {
                setRecentlyCreatedKey(data);
                setNewKeyName('');
                setIsCreating(false);
                fetchKeys();
            }
        } catch (e) {
            console.error("Failed to create API key", e);
        }
    };

    const handleRevokeKey = async (id: string) => {
        if (!window.confirm("Are you sure you want to revoke this API Key? Any agents using it will immediately lose access.")) return;

        try {
            const session = getSavedSession();
            const token = session?.token || '';
            const data = await authorizedFetch(`/api/tenant/api-keys/${id}`, {
                method: 'DELETE',
                token
            });

            if (data && !data.error) {
                fetchKeys();
            }
        } catch (e) {
            console.error("Failed to revoke API key", e);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-white tracking-tight">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <Server className="text-indigo-400" size={24} />
                        </div>
                        Agent Sync & API Keys
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Generate secure tokens for local Desktop Agents or custom API integrations.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2"
                >
                    <Plus size={16} />
                    Generate New Key
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                    <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">New Agent API Key</h4>
                    <form onSubmit={handleCreateKey} className="flex gap-4">
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g., Accra Office NAS Sync"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                            autoFocus
                        />
                        <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!newKeyName.trim()} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-50">
                            Create
                        </button>
                    </form>
                </div>
            )}

            {recentlyCreatedKey?.rawKey && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldAlert size={120} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <CheckCircle2 size={16} /> Key Generated Successfully
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Please copy your new API key now. For your security, <strong className="text-white">it will never be shown again</strong>.
                        </p>
                        
                        <div className="flex items-center gap-4 mt-6">
                            <code className="flex-1 block p-4 bg-slate-950 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono text-sm overflow-x-auto">
                                {recentlyCreatedKey.rawKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(recentlyCreatedKey.rawKey!)}
                                className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 font-bold text-sm"
                            >
                                <Copy size={18} /> Copy
                            </button>
                        </div>
                        
                        <div className="pt-6 border-t border-emerald-500/20 mt-6">
                            <button onClick={() => setRecentlyCreatedKey(null)} className="text-sm text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                                I have securely stored this key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50">
                            <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Key Name</th>
                            <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Token Prefix</th>
                            <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Created</th>
                            <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Last Used</th>
                            <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500 text-sm animate-pulse">Scanning identity vault...</td>
                            </tr>
                        ) : apiKeys.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500">
                                    <Key className="mx-auto mb-4 opacity-20" size={48} />
                                    <p>No API keys generated yet.</p>
                                </td>
                            </tr>
                        ) : (
                            apiKeys.map(key => (
                                <tr key={key.id} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-slate-200">{key.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">ID: {key.id.split('-')[0]}</div>
                                    </td>
                                    <td className="p-6">
                                        <code className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-400">
                                            {key.prefix}
                                        </code>
                                    </td>
                                    <td className="p-6 text-sm text-slate-400">
                                        {new Date(key.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-6 text-sm text-slate-400">
                                        {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleRevokeKey(key.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Revoke Key"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-start gap-4">
                 <div className="p-3 bg-slate-800 rounded-xl">
                     <Files className="text-indigo-400" size={20} />
                 </div>
                 <div>
                     <h4 className="font-bold text-white text-sm mb-1">Looking for the Desktop Agent?</h4>
                     <p className="text-xs text-slate-400 leading-relaxed mb-4">
                         The NomosDesk Desktop Agent is a lightweight daemon that securely synchronizes your firm's local NAS or file servers directly into the Sovereign Knowledge Enclave without manual uploads.
                     </p>
                     <div className="flex gap-4">
                         <a href="https://github.com/nomosdesk/agent" target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300">View Documentation →</a>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default ApiKeysDashboard;
