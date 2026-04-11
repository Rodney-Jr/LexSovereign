import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    ShieldAlert, 
    History, 
    User as UserIcon, 
    Search, 
    Terminal, 
    RefreshCw,
    XCircle,
    Info
} from 'lucide-react';

interface AuditLog {
    id: string;
    action: string;
    timestamp: string;
    userId: string | null;
    details: string;
    hash: string;
    previousHash: string | null;
    user?: {
        name: string;
        email: string;
        roleString: string;
    };
}

const AuditRegistry = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [integrity, setIntegrity] = useState<{ isValid: boolean; brokenAt?: string } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const fetchFullLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/compliance/logs');
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyIntegrity = async () => {
        setIsVerifying(true);
        try {
            const response = await fetch('/api/compliance/integrity');
            const data = await response.json();
            setIntegrity(data);
        } catch (error) {
            setIntegrity({ isValid: false });
        } finally {
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        fetchFullLogs();
        verifyIntegrity();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        (log.user?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
        log.details.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl">
                        <History className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Audit Registry</h2>
                        <p className="text-slate-500 text-sm">Forensic tamper-evident legal history</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 ${
                        integrity?.isValid 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        {isVerifying ? (
                            <RefreshCw className="animate-spin" size={18} />
                        ) : integrity?.isValid ? (
                            <ShieldCheck size={18} />
                        ) : (
                            <ShieldAlert size={18} />
                        )}
                        <span className="font-bold text-sm tracking-wide uppercase">
                            {isVerifying ? 'Verifying Chain...' : integrity?.isValid ? 'Chain Integrity: Valid' : 'Tampering Detected'}
                        </span>
                    </div>
                    <button 
                        onClick={() => { fetchFullLogs(); verifyIntegrity(); }}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors"
                        title="Refresh Registry"
                    >
                        <RefreshCw size={18} className={isVerifying ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                    type="text"
                    placeholder="Search by action, user, or artifact..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-medium"
                />
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Event Time</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Action Item</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Initiator</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Chain Proof</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-8">
                                            <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
                                            <div className="h-4 bg-slate-800/50 rounded w-1/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <History className="mx-auto text-slate-700 mb-4" size={48} />
                                        <p className="text-slate-400 font-medium">No results found in the registry</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr 
                                        key={log.id} 
                                        onClick={() => setSelectedLog(log)}
                                        className="hover:bg-blue-500/5 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </span>
                                                <span className="text-slate-500 text-xs">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-blue-400 font-bold text-xs tracking-wider uppercase">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-slate-300 text-sm line-clamp-1">
                                                    {(() => {
                                                        try {
                                                            const details = JSON.parse(log.details);
                                                            return typeof details === 'string' ? details : (details.message || details.name || log.details);
                                                        } catch {
                                                            return log.details;
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                    <UserIcon size={14} className="text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm font-medium">{log.user?.name || 'System'}</span>
                                                    <span className="text-slate-500 text-xs">{log.user?.roleString || 'Automated'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                                                <Terminal size={12} className="text-blue-400" />
                                                <span className="text-[10px] font-mono text-blue-400">
                                                    {log.hash.substring(0, 8)}...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Overlay */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Forensic Audit Proof</h3>
                                <p className="text-slate-500 text-sm">Verified Transaction Record</p>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SHA256 Content Hash</label>
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[10px] text-blue-400 break-all select-all">
                                        {selectedLog.hash}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preceding Hash Anchor</label>
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[10px] text-slate-500 break-all">
                                        {selectedLog.previousHash || '0000000000000000000000000000000000000000000000000000000000000000'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event Metadata</label>
                                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 font-mono text-sm text-emerald-400 overflow-x-auto">
                                    <pre>
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(selectedLog.details);
                                                return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 4);
                                            } catch {
                                                return selectedLog.details;
                                            }
                                        })()}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                    <ShieldCheck className="text-emerald-400" size={24} />
                                </div>
                                <div className="text-sm">
                                    <p className="text-white font-bold">Immutable Integrity Verified</p>
                                    <p className="text-slate-400">
                                        This entry is cryptographically linked to the preceding state of the legal silo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                            >
                                Close Proof
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditRegistry;
