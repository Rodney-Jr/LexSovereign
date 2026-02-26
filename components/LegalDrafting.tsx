
import React, { useState } from 'react';
import { Sparkles, FileText, ChevronRight, Search, Edit3, Shield, Scale } from 'lucide-react';
import DocumentTemplateMarketplace from './DocumentTemplateMarketplace';
import DraftingStudio from './DraftingStudio';
import BlankDocumentEditor from './BlankDocumentEditor';
import { DocumentMetadata, Region, PrivilegeStatus } from '../types';

interface LegalDraftingProps {
    onAddDocument: (doc: DocumentMetadata) => Promise<any> | void;
    matterId?: string | null;
}

const LegalDrafting: React.FC<LegalDraftingProps> = ({ onAddDocument, matterId }) => {
    const [showMarketplace, setShowMarketplace] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [showBlankEditor, setShowBlankEditor] = useState(false);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActionCard
                    icon={<Edit3 className="text-emerald-400" />}
                    title="Blank Document"
                    description="Start from scratch with a freeform editor for custom drafting."
                    onClick={() => setShowBlankEditor(true)}
                />
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
                    matterId={matterId || null}
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

            {showBlankEditor && (
                <BlankDocumentEditor
                    onClose={() => setShowBlankEditor(false)}
                    onSave={(name, content) => {
                        onAddDocument({
                            id: `DOC-BLANK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                            name,
                            type: 'Draft',
                            size: `${(new Blob([content]).size / 1024).toFixed(1)} KB`,
                            uploadedBy: 'User',
                            uploadedAt: new Date().toLocaleTimeString(),
                            region: Region.PRIMARY,
                            matterId: 'UNCATEGORIZED',
                            privilege: PrivilegeStatus.PRIVILEGED,
                            classification: 'Confidential',
                            encryption: 'DAS',
                            content: content
                        });
                        setShowBlankEditor(false);
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

export default LegalDrafting;
