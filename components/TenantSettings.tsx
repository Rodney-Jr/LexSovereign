
import React, { useState } from 'react';
import { Settings, Building2, Key, GitBranch, Plug, Droplet } from 'lucide-react';
import TenantAdministration from './TenantAdministration';
import AccessGovernance from './AccessGovernance';
import BridgeRegistry from './BridgeRegistry';
import OrgChart from './OrgChart';
import BrandingSettings from './BrandingSettings';
import { UserRole } from '../types';

interface TenantSettingsProps {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
}

type SettingsTab = 'organization' | 'access' | 'integrations' | 'blueprint' | 'branding';

const TenantSettings: React.FC<TenantSettingsProps> = ({ userRole, setUserRole }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('organization');

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white flex items-center gap-4 tracking-tight">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Settings className="text-purple-400" size={32} />
                    </div>
                    Tenant Settings
                </h2>
                <p className="text-slate-400 text-sm">
                    Configure organizational settings, access control, and system integrations
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-hide">
                <TabButton
                    icon={<Building2 size={16} />}
                    label="Organization"
                    active={activeTab === 'organization'}
                    onClick={() => setActiveTab('organization')}
                />
                <TabButton
                    icon={<Key size={16} />}
                    label="Access Control"
                    active={activeTab === 'access'}
                    onClick={() => setActiveTab('access')}
                />
                <TabButton
                    icon={<Plug size={16} />}
                    label="Integrations"
                    active={activeTab === 'integrations'}
                    onClick={() => setActiveTab('integrations')}
                />
                <TabButton
                    icon={<GitBranch size={16} />}
                    label="Blueprint"
                    active={activeTab === 'blueprint'}
                    onClick={() => setActiveTab('blueprint')}
                />
                <TabButton
                    icon={<Droplet size={16} />}
                    label="White Label"
                    active={activeTab === 'branding'}
                    onClick={() => setActiveTab('branding')}
                />
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-500">
                {activeTab === 'organization' && <TenantAdministration />}
                {activeTab === 'access' && <AccessGovernance userRole={userRole} setUserRole={setUserRole} />}
                {activeTab === 'integrations' && <BridgeRegistry />}
                {activeTab === 'blueprint' && <OrgChart />}
                {activeTab === 'branding' && <BrandingSettings />}
            </div>
        </div>
    );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border whitespace-nowrap ${active
            ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
            }`}
    >
        {icon}
        {label}
    </button>
);

export default TenantSettings;
