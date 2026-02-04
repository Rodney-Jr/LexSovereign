
import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    FileText,
    ChevronRight,
    Search,
    Zap,
    ShieldCheck,
    Filter,
    Download,
    Crown,
    Globe,
    Lock,
    ArrowRight,
    Star
} from 'lucide-react';
import { DocumentMetadata, Region, PrivilegeStatus, UserRole } from '../types';
import DocumentTemplateMarketplace from './DocumentTemplateMarketplace';
import RoleTemplateMarketplace from './RoleTemplateMarketplace';
import DraftingStudio from './DraftingStudio';

interface SovereignMarketplaceProps {
    onAddDocument: (doc: DocumentMetadata) => Promise<any> | void;
    userRole: UserRole;
}

const SovereignMarketplace: React.FC<SovereignMarketplaceProps> = ({ onAddDocument, userRole }) => {
    const [category, setCategory] = useState<'DOCUMENTS' | 'IDENTITY'>('DOCUMENTS');
    const [showDocMarketplace, setShowDocMarketplace] = useState(false);
    const [showRoleMarketplace, setShowRoleMarketplace] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const isTenantAdmin = userRole === UserRole.TENANT_ADMIN;


    return (
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24 px-4 lg:px-0">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-secondary/5 blur-[80px] -ml-32 -mb-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles size={12} /> Sovereign Ecosystem
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight text-center lg:text-left">
                            The Sovereign <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Blueprint Marketplace</span>
                        </h1>
                        <p className="text-slate-400 text-sm lg:text-lg leading-relaxed text-center lg:text-left">
                            Acquire jurisdictional legal logic, cryptographically-hardened role sets, and regional compliance blueprints instantly.
                        </p>
                        {isTenantAdmin && (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setCategory('DOCUMENTS')}
                                    className={`px-6 lg:px-8 py-3 rounded-2xl font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-2 ${category === 'DOCUMENTS' ? 'bg-brand-primary text-brand-bg shadow-xl shadow-brand-primary/20' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
                                >
                                    <FileText size={18} /> Legal Artifacts
                                </button>
                                <button
                                    onClick={() => setCategory('IDENTITY')}
                                    className={`px-6 lg:px-8 py-3 rounded-2xl font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-2 ${category === 'IDENTITY' ? 'bg-brand-secondary text-brand-bg shadow-xl shadow-brand-secondary/20' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
                                >
                                    <Zap size={18} /> Identity Blueprints
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:grid grid-cols-2 gap-4">
                        <FeatureStat icon={<Globe size={20} />} label="Jurisdictions" value="24+" />
                        <FeatureStat icon={<Lock size={20} />} label="Encrypted" value="100%" />
                        <FeatureStat icon={<ShieldCheck size={20} />} label="Audited" value="Verified" />
                        <FeatureStat icon={<Crown size={20} />} label="Sovereign" value="Native" />
                    </div>
                </div>
            </div>

            {/* Main Catalog View */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            {category === 'DOCUMENTS' ? (
                                <><FileText className="text-brand-primary" /> Premium Legal Blueprints</>
                            ) : (
                                <><Zap className="text-brand-secondary" /> Identity Module Registry</>
                            )}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {category === 'DOCUMENTS'
                                ? 'Standard industry templates refined for Sovereign jurisdictions.'
                                : 'Pre-configured RBAC modules for specialized industrial focus.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={category === 'DOCUMENTS' ? () => setShowDocMarketplace(true) : () => setShowRoleMarketplace(true)}
                            className="px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Search size={14} /> Open Full Registry
                        </button>
                    </div>
                </div>

                {category === 'DOCUMENTS' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <BlueprintCard
                            icon={<FileText className="text-blue-400" />}
                            title="Master Service Agreement"
                            desc="Standard MSA for cross-border service engagements."
                            region="PRIMARY"
                            price="Standard"
                            onDeploy={() => setSelectedTemplateId('template-master-service-agreement-(msa)')}
                        />
                        <BlueprintCard
                            icon={<FileText className="text-emerald-400" />}
                            title="Mutual NDA"
                            desc="Standard non-disclosure agreement for mutual exchange of information."
                            region="GLOBAL"
                            price="Standard"
                            onDeploy={() => setSelectedTemplateId('template-mutual-non-disclosure-agreement')}
                        />
                        <BlueprintCard
                            icon={<ShieldCheck className="text-purple-400" />}
                            title="Employment Contract"
                            desc="Comprehensive agreement for full-time staff members."
                            region="SECURE"
                            price="Standard"
                            onDeploy={() => setSelectedTemplateId('template-standard-employment-contract')}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <BlueprintCard
                            icon={<Zap className="text-amber-400" />}
                            title="Banking Core Alpha"
                            desc="Provision 12 roles including 'Audit Lead' and 'Compliance HSM Controller'."
                            region="GLOBAL"
                            price="System"
                            onDeploy={() => setShowRoleMarketplace(true)}
                        />
                        <BlueprintCard
                            icon={<Star className="text-blue-400" />}
                            title="Pharma R&D Enclave"
                            desc="Strictly blinded researcher roles for sensitive clinical data silos."
                            region="EU"
                            price="Premium"
                            onDeploy={() => setShowRoleMarketplace(true)}
                        />
                        <BlueprintCard
                            icon={<Box className="text-slate-400" />}
                            title="Standard Corporate"
                            desc="Baseline identity set for small to medium legal departments."
                            region="GLOBAL"
                            price="Free"
                            onDeploy={() => setShowRoleMarketplace(true)}
                        />
                    </div>
                )}
            </div>

            {/* Hidden Modals */}
            <DocumentTemplateMarketplace
                isOpen={showDocMarketplace}
                onClose={() => setShowDocMarketplace(false)}
                onSelect={(id) => {
                    setSelectedTemplateId(id);
                    setShowDocMarketplace(false);
                }}
            />

            <RoleTemplateMarketplace
                isOpen={showRoleMarketplace}
                onClose={() => setShowRoleMarketplace(false)}
                onApplySuccess={() => { }}
            />

            {selectedTemplateId && (
                <DraftingStudio
                    templateId={selectedTemplateId}
                    matterId={null}
                    onClose={() => setSelectedTemplateId(null)}
                    onSave={(name, content) => {
                        onAddDocument({
                            id: `DOC-GEN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                            name,
                            type: 'Draft',
                            size: `${(new Blob([content]).size / 1024).toFixed(1)} KB`,
                            uploadedBy: 'Sovereign AI',
                            uploadedAt: new Date().toLocaleTimeString(),
                            region: Region.PRIMARY,
                            matterId: 'UNCATEGORIZED',
                            privilege: PrivilegeStatus.PRIVILEGED,
                            classification: 'Confidential',
                            encryption: 'DAS'
                        });
                        setSelectedTemplateId(null);
                    }}
                />
            )}
        </div>
    );
};

const FeatureStat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl space-y-2 group hover:border-brand-primary/30 transition-all">
        <div className="text-slate-500 group-hover:scale-110 transition-transform">{icon}</div>
        <div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-lg font-black text-white">{value}</p>
        </div>
    </div>
);

const BlueprintCard = ({ icon, title, desc, region, price, onDeploy }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] space-y-6 lg:space-y-8 hover:border-brand-primary/40 transition-all group shadow-xl relative overflow-hidden flex flex-col justify-between h-[18rem] lg:h-80">
        <div className="space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:scale-110 transition-transform">{icon}</div>
                <div className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">{region} SILO</div>
            </div>
            <div className="space-y-2">
                <h4 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Pricing Tier</p>
                <p className="text-sm font-bold text-white uppercase italic">{price}</p>
            </div>
            <button
                onClick={onDeploy}
                title={`Deploy ${title}`}
                className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-bg transition-all shadow-lg"
            >
                <ArrowRight size={20} />
            </button>
        </div>
    </div>
);

// Mock Scale icon missing from props
const Scale = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /></svg>
);
// Mock Box icon
const Box = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);

export default SovereignMarketplace;
