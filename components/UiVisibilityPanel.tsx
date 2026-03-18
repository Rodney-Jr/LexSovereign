import React, { useState, useEffect } from 'react';
import { Shield, LayoutGrid, Zap, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { ALL_QUICK_ACTIONS, ALL_NAV_ITEMS } from '../constants';
import { useNotification } from './NotificationProvider';

const UiVisibilityPanel: React.FC = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [config, setConfig] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { notify } = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            const session = getSavedSession();
            if (!session?.token) return;

            try {
                const [rolesResult, configResult] = await Promise.allSettled([
                    authorizedFetch('/api/roles', { token: session.token }),
                    authorizedFetch('/api/tenant/ui-config', { token: session.token, silent: true })
                ]);
                
                if (rolesResult.status === 'fulfilled') {
                    const rolesData = rolesResult.value;
                    setRoles(Array.isArray(rolesData) ? rolesData : []);
                    if (Array.isArray(rolesData) && rolesData.length > 0) {
                        setSelectedRole(rolesData[0].name);
                    }
                } else {
                    notify('error', 'Role Load Failed', 'Could not fetch system roles.');
                }

                if (configResult.status === 'fulfilled') {
                    setConfig(configResult.value || {});
                } else {
                    console.warn('[UI Gating] Failed to load tenant config, using defaults.');
                }
            } catch (error) {
                notify('error', 'Sync Failed', 'Critical failure during initialization.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [notify]);

    const handleToggle = (type: 'navItems' | 'quickActions', id: string) => {
        setConfig((prev: any) => {
            const roleConfig = prev[selectedRole] || { navItems: [], quickActions: [] };
            const list = roleConfig[type] || [];
            const newList = list.includes(id) 
                ? list.filter((item: string) => item !== id)
                : [...list, id];
            
            return {
                ...prev,
                [selectedRole]: {
                    ...roleConfig,
                    [type]: newList
                }
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const session = getSavedSession();
        try {
            await authorizedFetch('/api/tenant/ui-config', {
                method: 'PATCH',
                token: session?.token,
                body: JSON.stringify({ config })
            });
            notify('success', 'Configuration Saved', 'UI visibility rules updated across the enclave.');
        } catch (error) {
            notify('error', 'Update Failed', 'Failed to save UI visibility rules.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-primary" /></div>;

    const currentRoleConfig = config[selectedRole] || { navItems: [], quickActions: [] };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold text-white flex items-center gap-3">
                            <Shield className="text-brand-primary" /> UI Visibility Gating
                        </h4>
                        <p className="text-sm text-slate-400">Control which features and navigation items are visible for specific user roles.</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-64">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Role</label>
                        <select 
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                            title="Select Role to Configure"
                        >
                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Navigation Items */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                            <LayoutGrid size={14} className="text-brand-primary" /> Navigation Sidebar
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                            {ALL_NAV_ITEMS.map(item => (
                                <VisibilityToggle 
                                    key={item.id}
                                    label={item.label}
                                    isActive={currentRoleConfig.navItems?.includes(item.id)}
                                    onToggle={() => handleToggle('navItems', item.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                            <Zap size={14} className="text-brand-secondary" /> Quick Action Buttons
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                            {ALL_QUICK_ACTIONS.map(item => (
                                <VisibilityToggle 
                                    key={item.id}
                                    label={item.label}
                                    isActive={currentRoleConfig.quickActions?.includes(item.id)}
                                    onToggle={() => handleToggle('quickActions', item.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-primary/5"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

const VisibilityToggle: React.FC<{ label: string, isActive: boolean, onToggle: () => void }> = ({ label, isActive, onToggle }) => (
    <div 
        onClick={onToggle}
        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
            isActive 
            ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-text shadow-inner' 
            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-900/50'
        }`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-brand-primary shadow-[0_0_8px_rgba(79,70,229,0.5)] scale-110' : 'bg-slate-800'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-brand-text' : 'text-slate-500'}`}>{label}</span>
        </div>
        {isActive ? <Eye size={16} className="text-brand-primary animate-pulse" /> : <EyeOff size={16} className="opacity-20" />}
    </div>
);

export default UiVisibilityPanel;
