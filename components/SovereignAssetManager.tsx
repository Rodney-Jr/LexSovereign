import React, { useState } from 'react';
import {
    MonitorSmartphone,
    Laptop,
    Smartphone,
    Key,
    Briefcase,
    Search,
    Filter,
    ChevronDown,
    Plus,
    X,
    CheckCircle2,
    Wrench,
    Archive,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

export type AssetCategory = 'Laptop' | 'Mobile' | 'Security Key' | 'Furniture' | 'Other';
export type AssetStatus = 'Available' | 'Assigned' | 'Maintenance' | 'Retired';

export interface FirmAsset {
    id: string;
    serialNumber: string;
    name: string;
    category: AssetCategory;
    status: AssetStatus;
    assignedTo?: string; // Staff Name or ID
    purchaseDate: string;
    notes?: string;
}

const CATEGORIES: AssetCategory[] = ['Laptop', 'Mobile', 'Security Key', 'Furniture', 'Other'];

const CATEGORY_ICON: Record<AssetCategory, React.ReactNode> = {
    'Laptop': <Laptop size={14} />,
    'Mobile': <Smartphone size={14} />,
    'Security Key': <Key size={14} />,
    'Furniture': <Briefcase size={14} />,
    'Other': <MonitorSmartphone size={14} />
};

const STATUS_STYLES: Record<AssetStatus, string> = {
    Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Retired: 'bg-slate-800 text-slate-400 border-slate-700',
};

const STATUS_ICON: Record<AssetStatus, React.ReactNode> = {
    Available: <CheckCircle2 size={12} />,
    Assigned: <MonitorSmartphone size={12} />,
    Maintenance: <Wrench size={12} />,
    Retired: <Archive size={12} />,
};

const SovereignAssetManager: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const [assets, setAssets] = useState<FirmAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<AssetStatus | 'All'>('All');
    const [filterCategory, setFilterCategory] = useState<AssetCategory | 'All'>('All');

    const [showLogModal, setShowLogModal] = useState(false);
    const [form, setForm] = useState<Partial<FirmAsset>>({
        name: '',
        serialNumber: '',
        category: 'Laptop',
        purchaseDate: new Date().toISOString().slice(0, 10),
        status: 'Available',
        notes: ''
    });

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.assignedTo && a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filterStatus === 'All' ? true : a.status === filterStatus;
        const matchesCategory = filterCategory === 'All' ? true : a.category === filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalAssets = assets.filter(a => a.status !== 'Retired').length;
    const availableAssets = assets.filter(a => a.status === 'Available').length;
    const assignedAssets = assets.filter(a => a.status === 'Assigned').length;
    const maintenanceAssets = assets.filter(a => a.status === 'Maintenance').length;

    React.useEffect(() => {
        const fetchAssets = async () => {
            try {
                const session = getSavedSession();
                const data = await authorizedFetch('/api/firm/assets', { token: session?.token });
                setAssets(data);
            } catch (error) {
                console.error('Failed to fetch firm assets', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssets();
    }, []);

    // ESC to close modal
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowLogModal(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.serialNumber) return;

        try {
            setIsSubmitting(true);
            const session = getSavedSession();
            const newAsset = await authorizedFetch('/api/firm/assets', {
                method: 'POST',
                token: session?.token,
                body: JSON.stringify({
                    name: form.name,
                    serialNumber: form.serialNumber,
                    category: form.category,
                    status: form.status,
                    purchaseDate: form.purchaseDate,
                    notes: form.notes
                })
            });

            setAssets(prev => [newAsset, ...prev]);
            setShowLogModal(false);
            setForm({ name: '', serialNumber: '', category: 'Laptop', purchaseDate: new Date().toISOString().slice(0, 10), status: 'Available', notes: '' });
        } catch (error) {
            console.error('Failed to log asset', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <MonitorSmartphone className="text-blue-400" size={22} />
                        </div>
                        Firm Asset Management
                    </h2>
                    <p className="text-slate-400 text-xs mt-2">Track and manage firm inventory, hardware assignments, and lifecycle.</p>
                </div>
                <div className="flex items-center gap-3">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-700"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setShowLogModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-blue-900/20"
                    >
                        <Plus size={16} /> Log New Asset
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: 'Active Firm Assets', value: totalAssets, color: 'blue', icon: <Briefcase size={20} /> },
                    { label: 'Assigned to Staff', value: assignedAssets, color: 'indigo', icon: <MonitorSmartphone size={20} /> },
                    { label: 'Available in Vault', value: availableAssets, color: 'emerald', icon: <CheckCircle2 size={20} /> },
                    { label: 'Under Maintenance', value: maintenanceAssets, color: 'amber', icon: <Wrench size={20} /> },
                ].map(card => (
                    <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 bg-${card.color}-500/10 rounded-xl border border-${card.color}-500/20 text-${card.color}-400`}>
                                {card.icon}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
                        </div>
                        <p className="text-3xl font-black text-white mt-1 font-mono pl-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search assets by name, serial, or assignee..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                    />
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <select
                            title="Filter by status"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as any)}
                            className="bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-8 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50 appearance-none cursor-pointer h-full"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Available">Available</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Retired">Retired</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                    </div>

                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <select
                            title="Filter by category"
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value as any)}
                            className="bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-8 py-3 text-sm text-slate-300 outline-none focus:border-blue-500/50 appearance-none cursor-pointer h-full"
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            {/* Asset Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {isLoading ? (
                    <div className="p-16 flex justify-center items-center text-blue-500">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Asset & Serial</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Assignment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.map(asset => (
                                <tr key={asset.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-white">{asset.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{asset.id}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">SN: {asset.serialNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                                            <span className="text-slate-500">{CATEGORY_ICON[asset.category]}</span>
                                            {asset.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[asset.status]}`}>
                                            {STATUS_ICON[asset.status]}
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {asset.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                                                    {asset.assignedTo.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-xs font-bold text-slate-300">{asset.assignedTo}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500 italic">Unassigned</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!isLoading && filteredAssets.length === 0 && (
                    <div className="p-16 text-center text-slate-500">
                        <AlertCircle size={40} className="mx-auto mb-3 opacity-40 text-slate-600" />
                        <p className="text-sm font-bold text-slate-400">No assets found matching the current filters.</p>
                    </div>
                )}
            </div>

            {/* Log Asset Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-7 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <Plus className="text-blue-400" size={22} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white tracking-tight">Log New Asset</h4>
                                    <p className="text-xs text-slate-500">Register firm hardware inventory.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleLogSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset Name / Model</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. ThinkPad X1 Carbon Gen 10"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Serial Number</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="SN-123456"
                                        value={form.serialNumber}
                                        onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                                    <div className="relative">
                                        <select
                                            title="Asset category"
                                            value={form.category}
                                            onChange={e => setForm(f => ({ ...f, category: e.target.value as AssetCategory }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-300 focus:border-blue-500/50 focus:outline-none transition-all cursor-pointer appearance-none"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Purchase Date</label>
                                    <input
                                        type="date"
                                        title="Purchase date"
                                        required
                                        value={form.purchaseDate}
                                        onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Initial Status</label>
                                    <div className="relative">
                                        <select
                                            title="Initial status"
                                            value={form.status}
                                            onChange={e => setForm(f => ({ ...f, status: e.target.value as AssetStatus }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-300 focus:border-blue-500/50 focus:outline-none transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Assigned">Assigned</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                Register Asset
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SovereignAssetManager;
