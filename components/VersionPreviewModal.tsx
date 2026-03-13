import React, { useEffect, useState } from 'react';
import { X, Shield, Download, Clock, User, Eye } from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface VersionPreviewModalProps {
    documentId: string;
    versionId: string;
    onClose: () => void;
}

const VersionPreviewModal: React.FC<VersionPreviewModalProps> = ({ documentId, versionId, onClose }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVersionContent = async () => {
            const session = getSavedSession();
            if (!session?.token) return;

            try {
                const data = await authorizedFetch(`/api/documents/${documentId}/versions/${versionId}/content`, { 
                    token: session.token 
                });
                setContent(data.content);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVersionContent();
    }, [documentId, versionId]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-brand-sidebar border border-brand-border rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-in-center">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-brand-border bg-brand-bg/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl">
                            <Clock size={20} className="text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Sovereign Version Preview</h3>
                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Historical Artifact State Snapshot</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        title="Close Preview"
                        className="p-2 hover:bg-brand-border rounded-xl transition-colors text-brand-muted hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-brand-bg/20">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-brand-muted text-sm font-medium italic">
                            Decrypting historical enclave state...
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400 text-sm">
                            Verification Failure: {error}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 pb-6 border-b border-brand-border/50">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                    <Shield size={12} className="text-emerald-500" /> Integrity Validated
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                    <Eye size={12} className="text-blue-500" /> Read-Only Snaphot
                                </div>
                            </div>

                            <pre className="text-sm text-brand-muted leading-relaxed font-mono whitespace-pre-wrap bg-brand-bg/40 border border-brand-border rounded-2xl p-6">
                                {content}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-brand-border bg-brand-bg/50 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-brand-border hover:bg-brand-border/80 text-[11px] font-bold text-white rounded-xl transition-all uppercase tracking-widest"
                    >
                        Close Preview
                    </button>
                    <button 
                        disabled
                        className="px-6 py-2.5 bg-brand-primary/10 text-brand-primary cursor-not-allowed text-[11px] font-bold rounded-xl flex items-center gap-2 uppercase tracking-widest transition-all grayscale opacity-50"
                    >
                        <Download size={14} /> Restore to Current
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VersionPreviewModal;
