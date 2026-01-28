import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Check, AlertCircle, DollarSign, Users, Plus, X } from 'lucide-react';
import { authorizedFetch } from '../utils/api';

interface PricingConfig {
    id: string; // Plan Name
    basePrice: number;
    pricePerUser: number;
    creditsIncluded: number;
    features: string[];
}

export const PricingGovernance: React.FC = () => {
    const [configs, setConfigs] = useState<PricingConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/pricing'); // Public endpoint, but component is protected by guard
            if (!res.ok) throw new Error('Failed to fetch pricing');
            const data = await res.json();
            setConfigs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (config: PricingConfig) => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const res = await authorizedFetch(`/api/pricing/${config.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error('Failed to update pricing');

            setSuccess(`Updated ${config.id} tier successfully`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (index: number, field: keyof PricingConfig, value: any) => {
        const newConfigs = [...configs];
        newConfigs[index] = { ...newConfigs[index], [field]: value };
        setConfigs(newConfigs);
    };

    const addFeature = (index: number, feature: string) => {
        if (!feature) return;
        const newConfigs = [...configs];
        newConfigs[index].features = [...newConfigs[index].features, feature];
        setConfigs(newConfigs);
    };

    const removeFeature = (configIndex: number, featureIndex: number) => {
        const newConfigs = [...configs];
        newConfigs[configIndex].features.splice(featureIndex, 1);
        setConfigs(newConfigs);
    };

    if (loading) return <div className="p-8 text-center text-slate-400 font-mono animate-pulse">Loading Pricing Calibration...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Settings className="text-emerald-400" /> Hybrid Pricing Governance
                    </h2>
                    <p className="text-slate-400 mt-1">Configure tiered base rates and per-user billing models.</p>
                </div>
                <button onClick={fetchConfigs} title="Refresh Pricing" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <RefreshCw className="text-slate-400 hover:text-white" size={20} />
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400">
                    <Check size={20} /> {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {configs.map((config, idx) => (
                    <div key={config.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6 hover:border-slate-700 transition-all group">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white">{config.id}</h3>
                            <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-400">
                                {config.id.toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={12} /> Base Price (Monthly)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        title="Base Price"
                                        value={config.basePrice}
                                        onChange={(e) => updateConfig(idx, 'basePrice', parseFloat(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={12} /> Price Per User
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        title="Price Per User"
                                        value={config.pricePerUser}
                                        onChange={(e) => updateConfig(idx, 'pricePerUser', parseFloat(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Included Features</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {config.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg group/item">
                                            <span className="text-sm text-slate-300 flex-1 truncate">{feature}</span>
                                            <button
                                                onClick={() => removeFeature(idx, fIdx)}
                                                title="Remove Feature"
                                                className="text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            title="New Feature"
                                            placeholder="Add feature..."
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addFeature(idx, e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <button title="Add Feature" className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleUpdate(config)}
                            disabled={saving}
                            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
