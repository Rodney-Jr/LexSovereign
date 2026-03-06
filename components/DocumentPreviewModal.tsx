
import React, { useState, useEffect } from 'react';
import { X, FileText, Download, ShieldCheck, Clock, Loader2, Sparkles, AlertCircle, MessageSquare, Send } from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface DocumentPreviewModalProps {
    documentId: string;
    onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ documentId, onClose }) => {
    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);

    useEffect(() => {
        const fetchDoc = async () => {
            const session = getSavedSession();
            if (!session?.token) return;
            try {
                setLoading(true);
                const data = await authorizedFetch(`/api/documents/${documentId}`, { token: session.token });
                setDoc(data);
            } catch (e) {
                console.error(e);
                setError("Failed to retrieve secure enclave artifact.");
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [documentId]);

    const handleDownload = async () => {
        if (!doc) return;
        try {
            const session = getSavedSession();
            const r = await fetch(`/api/export/${doc.id}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.token || ''}`
                },
                body: JSON.stringify({ format: 'PDF' })
            });
            if (!r.ok) throw new Error();
            const blob = await r.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${doc.name}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert("Secure export failed.");
        }
    }

    const handleSendFeedback = async () => {
        if (!feedback.trim() || !doc) return;
        setIsSendingFeedback(true);
        try {
            const session = getSavedSession();
            // Using the matter notes endpoint to store document feedback
            await fetch(`/api/matters/${doc.matterId}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.token || ''}`
                },
                body: JSON.stringify({ text: `[CLIENT FEEDBACK - ${doc.name}]: ${feedback}` })
            });
            setFeedback('');
            setShowFeedbackInput(false);
            alert("Feedback securely transmitted to your legal team.");
        } catch (e) {
            alert("Failed to transmit feedback.");
        } finally {
            setIsSendingFeedback(false);
        }
    };

    const renderContent = (text: string) => {
        if (!text) return null;
        // Simplified markdown-ish rendering for the preview
        const html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2">$1</h3>')
            .replace(/\n\n/g, '<br /><br />')
            .replace(/\n/g, '<br />');

        return <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-8">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <FileText className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{doc?.name || 'Secure Artifact'}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{doc?.jurisdiction || 'GH_ACC_1'} ENCLAVE</span>
                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <ShieldCheck size={10} /> HSM-PROTECTED
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${showFeedbackInput ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            <MessageSquare size={14} /> {showFeedbackInput ? 'Cancel Feedback' : 'Request Revision'}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                        >
                            <Download size={14} /> Download PDF
                        </button>
                        <button onClick={onClose} title="Close Preview" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-12 bg-slate-950/50 relative">
                    {showFeedbackInput && (
                        <div className="absolute inset-x-0 top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-8 pt-0 animate-in slide-in-from-top-4 duration-300">
                            <div className="max-w-3xl mx-auto space-y-4">
                                <div className="flex items-center gap-3 text-amber-500">
                                    <MessageSquare size={18} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Provide Detailed Feedback or Revision Requests</span>
                                </div>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Describe the clinical or structural changes required for this artifact..."
                                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none transition-all"
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowFeedbackInput(false)}
                                        className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        onClick={handleSendFeedback}
                                        disabled={isSendingFeedback || !feedback.trim()}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                    >
                                        {isSendingFeedback ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                        Transmit Revision Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Decrypting Vault Asset...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                            <AlertCircle className="text-red-500" size={48} />
                            <p className="text-slate-300 font-bold">{error}</p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto py-10">
                            {renderContent(doc.content || '')}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Clock size={12} /> Last Modified: {doc ? new Date(doc.updatedAt).toLocaleString() : '-'}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                        <span>Classification: {doc?.classification}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-blue-400"><Sparkles size={12} /> AI-VERIFIED WORK PRODUCT</span>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
