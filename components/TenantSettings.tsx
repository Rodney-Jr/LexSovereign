
import React from 'react';
import { AppMode, UserRole } from '../types';
import { ShieldAlert, Briefcase, Users, Settings as SettingsIcon } from 'lucide-react';

interface TenantSettingsProps {
    mode: AppMode;
    killSwitchActive: boolean;
    setKillSwitchActive: (val: boolean) => void;
}

const TenantSettings: React.FC<TenantSettingsProps> = ({ mode, killSwitchActive, setKillSwitchActive }) => {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-8 shadow-2xl backdrop-blur-sm">
                <div className="space-y-2 border-b border-slate-800 pb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <SettingsIcon className="text-emerald-400" />
                        Tenant Governance Controls
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Toggled to <span className="text-emerald-400 font-bold uppercase">{mode.replace('_', ' ')}</span> mode.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Column 1: RBAC & Governance */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Briefcase size={16} /> RBAC Hierarchy
                            </h4>
                            <div className="space-y-3">
                                <RoleCard role={UserRole.GLOBAL_ADMIN} access="Full System & Audit Trace" />
                                <RoleCard role={UserRole.INTERNAL_COUNSEL} access="Matter View + Approval Rights" />
                                <RoleCard role={UserRole.EXTERNAL_COUNSEL} access="Drafting + Redline Only" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Safety Overrides */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ShieldAlert size={16} /> Safety Overrides
                            </h4>
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                                <div>
                                    <p className="font-bold text-white text-sm">Deterministic Lock</p>
                                    <p className="text-[10px] text-slate-400">Kill-switch AI for confidence &lt; 85%</p>
                                </div>
                                <button
                                    onClick={() => setKillSwitchActive(!killSwitchActive)}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${killSwitchActive ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${killSwitchActive ? 'left-6.5' : 'left-0.5'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RoleCard = ({ role, access }: { role: UserRole, access: string }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700 rounded-2xl hover:border-emerald-500/30 transition-colors">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400">
            <Users size={20} />
        </div>
        <div>
            <p className="font-bold text-sm text-white">{role}</p>
            <p className="text-[10px] text-slate-400">{access}</p>
        </div>
    </div>
);

export default TenantSettings;
