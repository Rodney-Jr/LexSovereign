
import React, { useState } from 'react';
import { Settings, Building2, Key, GitBranch, Plug, Droplet, ShieldCheck, Eye, MessageSquare, Database } from 'lucide-react';
import TenantAdministration from './TenantAdministration';
import AccessGovernance from './AccessGovernance';
import BridgeRegistry from './BridgeRegistry';
import OrgChart from './OrgChart';
import BrandingSettings from './BrandingSettings';
import ApiKeysDashboard from './ApiKeysDashboard';
import SovereignResidencySettings from './SovereignResidencySettings';
import UiVisibilityPanel from './UiVisibilityPanel';
import ChatbotStudio from './ChatbotStudio';
import { LegalRepositoryTab } from './LegalRepositoryTab';
import { UserRole } from '../types';

interface TenantSettingsProps {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
}

type SettingsTab = 'organization' | 'access' | 'integrations' | 'agent' | 'blueprint' | 'branding' | 'chatbot' | 'knowledgebase' | 'sovereignty' | 'ui-visibility';

const TenantSettings: React.FC<TenantSettingsProps> = ({ userRole, setUserRole }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const params = new URLSearchParams(window.location.search);
        return (params.get('tab') as SettingsTab) || 'organization';
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                            <Settings className="text-purple-400" size={32} />
                        </div>
                        Tenant Settings
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Configure organizational structure, AI behavior, and global security policies
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 shrink-0 space-y-8 lg:sticky lg:top-8 z-10">
                    
                    {/* Organization & Access */}
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-3">Organization</h3>
                        <div className="space-y-1">
                            <TabButton icon={<Building2 size={16} />} label="Staff Registry" active={activeTab === 'organization'} onClick={() => setActiveTab('organization')} />
                            <TabButton icon={<GitBranch size={16} />} label="Blueprint / Org Chart" active={activeTab === 'blueprint'} onClick={() => setActiveTab('blueprint')} />
                            <TabButton icon={<Key size={16} />} label="Access & Roles" active={activeTab === 'access'} onClick={() => setActiveTab('access')} />
                            <TabButton icon={<Eye size={16} />} label="UI Visibility" active={activeTab === 'ui-visibility'} onClick={() => setActiveTab('ui-visibility')} />
                            <TabButton icon={<Droplet size={16} />} label="Branding & White-label" active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
                        </div>
                    </div>

                    {/* AI & Infrastructure */}
                    <div className="space-y-1 pt-2">
                        <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-3">Sovereign AI Config</h3>
                        <div className="space-y-1">
                            <TabButton icon={<MessageSquare size={16} />} label="Chatbot Studio" active={activeTab === 'chatbot'} onClick={() => setActiveTab('chatbot')} />
                            <TabButton icon={<Database size={16} />} label="Legal Knowledgebase" active={activeTab === 'knowledgebase'} onClick={() => setActiveTab('knowledgebase')} />
                        </div>
                    </div>

                    {/* Security & Endpoints */}
                    <div className="space-y-1 pt-2">
                        <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-3">DevOps & Edge</h3>
                        <div className="space-y-1">
                            <TabButton icon={<ShieldCheck size={16} />} label="Data Residency" active={activeTab === 'sovereignty'} onClick={() => setActiveTab('sovereignty')} />
                            <TabButton icon={<Plug size={16} />} label="App Integrations" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
                        </div>
                    </div>

                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {activeTab === 'organization' && <TenantAdministration />}
                        {activeTab === 'access' && <AccessGovernance userRole={userRole} setUserRole={setUserRole} />}
                        {activeTab === 'integrations' && <BridgeRegistry />}
                        {activeTab === 'agent' && <ApiKeysDashboard />}
                        {activeTab === 'blueprint' && <OrgChart />}
                        {activeTab === 'branding' && <BrandingSettings />}
                        {activeTab === 'chatbot' && <ChatbotStudio />}
                        {activeTab === 'knowledgebase' && <LegalRepositoryTab userRole={userRole} />}
                        {activeTab === 'sovereignty' && <SovereignResidencySettings />}
                        {activeTab === 'ui-visibility' && <UiVisibilityPanel />}
                    </div>
                </div>
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
        className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-start gap-3 border ${active
            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
            : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
    >
        <div className={active ? "text-purple-400" : "text-slate-600"}>
            {icon}
        </div>
        {label}
        {active && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        )}
    </button>
);

export default TenantSettings;
