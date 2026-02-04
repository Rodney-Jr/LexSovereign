
import React, { useState } from 'react';
import { Sparkles, FileText, ChevronRight, Search } from 'lucide-react';
import DocumentTemplateMarketplace from './DocumentTemplateMarketplace';
import DraftingStudio from './DraftingStudio';
import { DocumentMetadata, Region, PrivilegeStatus } from '../types';

interface LegalDraftingProps {
    onAddDocument: (doc: DocumentMetadata) => Promise<any> | void;
}

const LegalDrafting: React.FC<LegalDraftingProps> = ({ onAddDocument }) => {
    const [showMarketplace, setShowMarketplace] = useState(true);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-brand-secondary/10 rounded-xl border border-brand-secondary/20">
                            <Sparkles className="text-brand-secondary" size={24} />
                        </div>
                        Legal Drafting Studio
                    </h3>
                    <p className="text-slate-400 text-sm">Compose jurisdictional legal artifacts with AI-assisted hydration.</p>
                </div>
                <button
                    onClick={() => setShowMarketplace(true)}
                    className="px-6 py-2.5 bg-brand-secondary/10 hover:bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-brand-secondary/10"
                >
                    <Search size={14} /> Browse Templates
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                    icon={<FileText className="text-brand-primary" />}
                    title="New Contract"
                    description="Start from a standard merger or acquisition template."
                    onClick={() => setShowMarketplace(true)}
                />
                <ActionCard
                    icon={<Shield className="text-blue-400" />}
                    title="Compliance Policy"
                    description="Draft internal policies with regulatory cross-checks."
                    onClick={() => setShowMarketplace(true)}
                />
                <ActionCard
                    icon={<Scale className="text-purple-400" />}
                    title="Litigation Deed"
                    description="Generate jurisdictional deeds and court filings."
                    onClick={() => setShowMarketplace(true)}
                />
            </div>

            <DocumentTemplateMarketplace
                isOpen={showMarketplace}
                onClose={() => setShowMarketplace(false)}
                onSelect={(id) => {
                    setSelectedTemplateId(id);
                    setShowMarketplace(false);
                }}
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
                            encryption: 'DAS',
                            content: content
                        });
                        setSelectedTemplateId(null);
                    }}
                />
            )}
        </div>
    );
};

const ActionCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) => (
    <div
        onClick={onClick}
        className="bg-brand-sidebar border border-brand-border p-8 rounded-[2rem] hover:border-brand-secondary/40 transition-all cursor-pointer group shadow-xl hover:shadow-brand-secondary/5"
    >
        <div className="p-3 bg-brand-bg rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
        <p className="text-xs text-brand-muted leading-relaxed mb-6">{description}</p>
        <div className="flex items-center gap-2 text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em]">
            Initialize Draft <ChevronRight size={14} />
        </div>
    </div>
);

// Mock icons for the card
const Shield = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
);
const Scale = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /></svg>
);

export default LegalDrafting;
