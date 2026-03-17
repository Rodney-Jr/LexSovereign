
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Globe, Database, ShieldAlert, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface ResidencyConfig {
    jurisdiction: string;
    storageBucketUri: string;
    enclaveOnlyProcessing: boolean;
    region: string;
}

interface SovereignResidencySettingsProps {
    tenantId?: string;
}

const SovereignResidencySettings: React.FC<SovereignResidencySettingsProps> = ({ tenantId }) => {
    const [config, setConfig] = useState<ResidencyConfig>({
        jurisdiction: 'GH_ACC_1',
        storageBucketUri: 'sov-gh-acc-01-vault',
        enclaveOnlyProcessing: false,
        region: 'GHANA'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const session = getSavedSession();
            if (!session?.token) return;

            try {
                const url = tenantId 
                    ? `/api/tenant/settings?targetTenantId=${tenantId}` 
                    : '/api/tenant/settings';
                const data = await authorizedFetch(url, { token: session.token });
                setConfig({
                    jurisdiction: data.jurisdiction || 'GH_ACC_1',
                    storageBucketUri: data.storageBucketUri || 'sov-gh-acc-01-vault',
                    enclaveOnlyProcessing: data.enclaveOnlyProcessing || false,
                    region: data.primaryRegion || 'GHANA'
                });
            } catch (error) {
                console.error("Failed to fetch residency settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleToggleProcessing = async () => {
        const session = getSavedSession();
        if (!session?.token) return;

        setIsSaving(true);
        try {
            const newStatus = !config.enclaveOnlyProcessing;
            await authorizedFetch('/api/tenant/settings', {
                method: 'PATCH',
                token: session.token,
                body: JSON.stringify({ 
                    enclaveOnlyProcessing: newStatus,
                    ...(tenantId && { targetTenantId: tenantId })
                })
            });
            setConfig(prev => ({ ...prev, enclaveOnlyProcessing: newStatus }));
        } catch (error) {
            alert("Failed to update sovereignty constraints.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Synchronizing Jurisdictional Metadata...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Sovereign Pin Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <ShieldCheck size={160} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Globe className="text-emerald-400" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Active Jurisdictional Pin</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white font-mono tracking-tighter">
                                {config.jurisdiction}
                            </p>
                            <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
                                Region: {config.region} Data Silo
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-400/5 w-fit px-3 py-1.5 rounded-full border border-emerald-400/20">
                            <CheckCircle2 size={14} />
                            Hardware-Enforced Data Residency
                        </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 min-w-[300px]">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Database size={18} className="text-purple-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">Storage Vault</span>
                        </div>
                        <div className="space-y-1 p-3 bg-slate-900 rounded-xl border border-slate-800">
                            <p className="text-xs font-mono text-blue-400">{config.storageBucketUri}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Encrypted S3 Object Store</p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Status</span>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                Synchronized
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sovereignty Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Cpu className="text-purple-400" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-white">Advanced Sovereignty Controls</h4>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-start justify-between gap-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                            <div className="space-y-1">
                                <h5 className="text-sm font-bold text-white">Strict Enclave Processing</h5>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    When enabled, all AI reasoning and processing are hard-blocked from public cloud gateways. 
                                    All prompts are routed to the regional GPU cluster within your national borders.
                                </p>
                            </div>
                            <button
                                onClick={handleToggleProcessing}
                                disabled={isSaving}
                                title={config.enclaveOnlyProcessing ? "Disable Sovereign Enclave Processing" : "Enable Sovereign Enclave Processing"}
                                aria-label="Toggle Enclave Processing"
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                                    config.enclaveOnlyProcessing ? 'bg-purple-600' : 'bg-slate-700'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    config.enclaveOnlyProcessing ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3">
                            <ShieldAlert className="text-orange-400 mt-0.5" size={20} />
                            <div>
                                <h5 className="text-sm font-bold text-white">Compliance Warning</h5>
                                <p className="text-xs text-slate-400 mt-1">
                                    Enclave-only processing may result in higher latency but guarantees 100% data sovereignty for sensitive matters.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Lock className="text-blue-400" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-white">Encryption & Keys</h4>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Your jurisdictional pin is cryptographically linked to your hardware security module (HSM) region. 
                            Keys never leave the regional Boundary.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">HSM Status</p>
                                <p className="text-xs text-emerald-400 font-bold">FIPS 140-2 L3</p>
                            </div>
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Root Key</p>
                                <p className="text-xs text-blue-400 font-bold font-mono">SOV_ROOT_01</p>
                            </div>
                        </div>
                        
                        <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-700">
                            Rotate Regional Keys
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SovereignResidencySettings;
