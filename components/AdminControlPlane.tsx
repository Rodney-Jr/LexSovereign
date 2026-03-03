import React, { useState, useEffect } from 'react';
import {
    Building2,
    Plus,
    ShieldCheck,
    FileJson,
    Download,
    Users,
    Briefcase,
    Search,
    CheckCircle,
    Clock
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

const AdminControlPlane: React.FC = () => {
    const [departments, setDepartments] = useState<any[]>([]);
    const [showAddDept, setShowAddDept] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [auditMatterId, setAuditMatterId] = useState('');
    const [auditExport, setAuditExport] = useState<any>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const session = getSavedSession();
            if (!session?.token) return;
            // In a real scenario, we'd have a GET /api/admin/departments
            // For now, we simulate or assume they are fetched via analytics if needed
        } catch (e) {
            console.error(e);
        }
    };

    const createDept = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const res = await authorizedFetch('/api/admin/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDept),
                token: session.token
            });
            setDepartments([...departments, res]);
            setShowAddDept(false);
            setNewDept({ name: '', description: '' });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const exportAudit = async () => {
        if (!auditMatterId) return;
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const res = await authorizedFetch(`/api/admin/audit-export/${auditMatterId}`, {
                token: session.token
            });
            setAuditExport(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex-1 bg-[#0a0c10] p-10 space-y-10 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Tenant Governance</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-sky-500" /> Admin Control Plane | Policy Enforcement
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Department Management */}
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Building2 className="text-sky-500" size={24} />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Org Structure</h3>
                        </div>
                        <button
                            title="Provision New Department"
                            onClick={() => setShowAddDept(true)}
                            className="p-3 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl transition-all shadow-lg shadow-sky-900/40"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {showAddDept && (
                        <div className="p-6 bg-slate-950 border border-sky-500/30 rounded-3xl space-y-4 animate-in zoom-in duration-300">
                            <input
                                placeholder="Department Name"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-bold uppercase tracking-widest"
                                value={newDept.name}
                                onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                            />
                            <textarea
                                placeholder="Description..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"
                                rows={3}
                                value={newDept.description}
                                onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                            />
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={createDept}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                                >
                                    {loading ? 'PROVISIONING...' : 'CREATE UNIT'}
                                </button>
                                <button
                                    onClick={() => setShowAddDept(false)}
                                    className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {departments.length === 0 ? (
                            <div className="p-10 border border-dashed border-slate-800 rounded-3xl text-center">
                                <Users className="text-slate-800 mx-auto mb-4" size={32} />
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No custom departments provisioned</p>
                            </div>
                        ) : (
                            departments.map((d, i) => (
                                <div key={i} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-sky-500/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-sky-400 font-black">
                                            {d.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{d.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Governance Base</p>
                                        </div>
                                    </div>
                                    <CheckCircle size={16} className="text-emerald-500" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Audit & Compliance Tool */}
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 flex flex-col">
                    <div className="flex items-center gap-4">
                        <FileJson className="text-amber-500" size={24} />
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Audit Export</h3>
                    </div>

                    <div className="flex-1 space-y-6">
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Enter a Matter UUID to generate an immutable, provenance-tracked audit report for regulatory submission.
                        </p>

                        <div className="relative">
                            <Search className="absolute left-5 top-5 text-slate-600" size={16} />
                            <input
                                placeholder="MATTER-UUID-ENCLAVE"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-mono text-xs focus:border-amber-500/50 outline-none transition-all"
                                value={auditMatterId}
                                onChange={e => setAuditMatterId(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={exportAudit}
                            disabled={loading || !auditMatterId}
                            className="w-full py-5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98 shadow-xl shadow-amber-900/10"
                        >
                            <Download size={18} /> {loading ? 'INTERROGATING LOGS...' : 'GENERATE IMMUTABLE EXPORT'}
                        </button>

                        {auditExport && (
                            <div className="mt-6 p-6 bg-slate-950 border border-emerald-500/20 rounded-3xl space-y-4 animate-in slide-in-from-bottom duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        <span className="text-[9px] font-black text-emerald-500 uppercase">PROVENANCE VERIFIED</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-600">{auditExport.integrityHash}</span>
                                </div>
                                <div className="space-y-2">
                                    {auditExport.logs.slice(0, 3).map((l: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between border-b border-slate-900 pb-2">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{l.action}</span>
                                            <span className="text-[10px] text-slate-600 font-mono italic">{new Date(l.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                    <p className="text-center pt-2 text-[9px] text-slate-700 font-bold uppercase tracking-widest">... {auditExport.logs.length - 3} additional entries truncated</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-start gap-4">
                        <Clock className="text-slate-700 mt-1" size={18} />
                        <div className="space-y-1">
                            <h5 className="font-bold text-[9px] text-slate-600 uppercase tracking-widest">Regulatory Compliance</h5>
                            <p className="text-[9px] text-slate-800 uppercase leading-relaxed font-bold italic">
                                "All exports are cryptographicly hashed and recorded in the Sovereign Enclave's tamper-evident ledger."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminControlPlane;
