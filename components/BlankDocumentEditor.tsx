import React, { useState } from 'react';
import { X, Save, FileText, Sparkles, Download, Copy, Loader2 } from 'lucide-react';
import { DocumentMetadata, Region, PrivilegeStatus } from '../types';

interface BlankDocumentEditorProps {
    onClose: () => void;
    onSave: (name: string, content: string) => void;
}

const BlankDocumentEditor: React.FC<BlankDocumentEditorProps> = ({ onClose, onSave }) => {
    const [documentName, setDocumentName] = useState('Untitled Document');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        if (!documentName.trim() || !content.trim()) {
            alert('Please provide both a document name and content.');
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            onSave(documentName, content);
            setIsSaving(false);
        }, 500);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(content);
        alert('Content copied to clipboard!');
    };

    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = content.length;

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-6 duration-500">
            {/* Top Bar */}
            <header className="h-20 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} title="Close" className="p-2 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <FileText className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                                className="text-xl font-bold text-white tracking-tight bg-transparent border-none outline-none focus:outline-none w-[400px]"
                                placeholder="Document Name"
                            />
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Freeform Drafting</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="text-[10px] text-slate-500 font-mono">
                            <span className="font-bold text-slate-400">{wordCount}</span> words
                        </div>
                        <div className="w-px h-4 bg-slate-700"></div>
                        <div className="text-[10px] text-slate-500 font-mono">
                            <span className="font-bold text-slate-400">{charCount}</span> chars
                        </div>
                    </div>
                    <button
                        onClick={handleCopyToClipboard}
                        disabled={!content.trim()}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-40"
                    >
                        <Copy size={14} />
                        Copy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !documentName.trim() || !content.trim()}
                        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-40"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        {isSaving ? 'Saving...' : 'Save to Vault'}
                    </button>
                </div>
            </header>

            {/* Main Editor */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                <div className="flex-1 flex flex-col bg-slate-900/30">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Sparkles size={14} className="text-emerald-400" />
                            Markdown Editor
                        </h4>
                        <p className="text-[9px] text-slate-600 italic">Supports plain text and basic markdown formatting</p>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start drafting your legal document here...

You can use markdown formatting:
# Heading 1
## Heading 2
**Bold Text**
*Italic Text*

1. Numbered lists
- Bullet points

---
Horizontal rules"
                        className="flex-1 bg-slate-950 text-slate-200 p-12 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-700 scrollbar-hide"
                    />
                </div>

                {/* Live Preview Pane */}
                <div className="flex-1 bg-slate-950 border-l border-slate-800 flex flex-col">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText size={14} className="text-blue-400" />
                            Live Preview
                        </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-12 scrollbar-hide flex justify-center">
                        <div className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl rounded-sm p-20 relative">
                            {/* Watermark */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-45 select-none text-9xl font-black">
                                LEX SOVEREIGN
                            </div>

                            <div className="relative z-10 whitespace-pre-wrap font-serif text-[15px] leading-relaxed">
                                {content || (
                                    <p className="text-slate-400 italic text-center py-20">
                                        Your document preview will appear here as you type...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlankDocumentEditor;
