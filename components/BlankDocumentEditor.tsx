import React, { useState, useRef, useEffect } from 'react';
import {
    X, Save, FileText, Sparkles, Download, Copy, Loader2, Edit3, Eye,
    Bold, Italic, Underline, Strikethrough, Heading1, Heading2,
    List, ListOrdered, Quote, Link, Minus, AlignCenter, AlignLeft, AlignRight
} from 'lucide-react';
import { DocumentMetadata, Region, PrivilegeStatus } from '../types';

interface BlankDocumentEditorProps {
    onClose: () => void;
    onSave: (name: string, content: string) => void;
}

const BlankDocumentEditor: React.FC<BlankDocumentEditorProps> = ({ onClose, onSave }) => {
    const [documentName, setDocumentName] = useState('Untitled Document');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split');
    const [editorWidth, setEditorWidth] = useState(50); // Percentage
    const [isResizing, setIsResizing] = useState(false);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    const handleFormatting = (prefix: string, suffix: string = '') => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);

        const before = text.substring(0, start);
        const after = text.substring(end);

        const newContent = before + prefix + selection + suffix + after;
        setContent(newContent);

        // Reset focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length
            );
        }, 0);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > 20 && newWidth < 80) {
                setEditorWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        handleFormatting('**', '**');
                        break;
                    case 'i':
                        e.preventDefault();
                        handleFormatting('*', '*');
                        break;
                    case 'u':
                        e.preventDefault();
                        handleFormatting('<u>', '</u>');
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [content]);

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

    const wordCount = content.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const charCount = content.length;

    const renderPreviewContent = (text: string) => {
        if (!text) return null;

        // Simple regex-based markdown/HTML for legal preview
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2">$1</h3>')
            .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/>\s+(.*$)/gm, '<blockquote class="border-l-4 border-slate-200 pl-4 italic my-4">$1</blockquote>')
            .replace(/---/g, '<hr class="my-6 border-slate-100" />')
            .replace(/\n\n/g, '<br /><br />')
            .replace(/\n/g, '<br />');

        return <div className="prose-slate prose-lg max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-6 duration-500">
            {/* Top Bar */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8">
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
                    {/* Layout Controls */}
                    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-2xl border border-slate-700 mr-2">
                        <button
                            onClick={() => setLayout('editor')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${layout === 'editor' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Edit3 size={14} className="inline mr-1" /> Editor
                        </button>
                        <button
                            onClick={() => setLayout('split')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${layout === 'split' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Split
                        </button>
                        <button
                            onClick={() => setLayout('preview')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${layout === 'preview' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Eye size={14} className="inline mr-1" /> Preview
                        </button>
                    </div>

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
                {(layout === 'split' || layout === 'editor') && (
                    <div
                        className={`flex flex-col bg-slate-900/30 transition-all duration-500 ${layout === 'editor' ? 'w-full overflow-y-auto' : ''}`}
                        style={{ width: layout === 'split' ? `${editorWidth}%` : '100%' }}
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles size={14} className="text-emerald-400" />
                                Markdown Editor
                            </h4>
                            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                                <ToolbarButton icon={<Bold size={14} />} onClick={() => handleFormatting('**', '**')} title="Bold (Ctrl+B)" />
                                <ToolbarButton icon={<Italic size={14} />} onClick={() => handleFormatting('*', '*')} title="Italic (Ctrl+I)" />
                                <ToolbarButton icon={<Underline size={14} />} onClick={() => handleFormatting('<u>', '</u>')} title="Underline" />
                                <ToolbarButton icon={<Strikethrough size={14} />} onClick={() => handleFormatting('~~', '~~')} title="Strikethrough" />
                                <div className="w-px h-4 bg-slate-700 mx-1" />
                                <ToolbarButton icon={<Heading1 size={14} />} onClick={() => handleFormatting('# ', '')} title="Heading 1" />
                                <ToolbarButton icon={<Heading2 size={14} />} onClick={() => handleFormatting('## ', '')} title="Heading 2" />
                                <div className="w-px h-4 bg-slate-700 mx-1" />
                                <ToolbarButton icon={<List size={14} />} onClick={() => handleFormatting('- ', '')} title="Bullet List" />
                                <ToolbarButton icon={<ListOrdered size={14} />} onClick={() => handleFormatting('1. ', '')} title="Numbered List" />
                                <div className="w-px h-4 bg-slate-700 mx-1" />
                                <ToolbarButton icon={<AlignLeft size={14} />} onClick={() => handleFormatting('<div align="left">\n', '\n</div>')} title="Align Left" />
                                <ToolbarButton icon={<AlignCenter size={14} />} onClick={() => handleFormatting('<div align="center">\n', '\n</div>')} title="Align Center" />
                                <ToolbarButton icon={<AlignRight size={14} />} onClick={() => handleFormatting('<div align="right">\n', '\n</div>')} title="Align Right" />
                                <div className="w-px h-4 bg-slate-700 mx-1" />
                                <ToolbarButton icon={<Quote size={14} />} onClick={() => handleFormatting('> ', '')} title="Quote" />
                                <ToolbarButton icon={<Link size={14} />} onClick={() => handleFormatting('[', '](url)')} title="Link" />
                                <ToolbarButton icon={<Minus size={14} />} onClick={() => handleFormatting('\n---\n', '')} title="Horizontal Rule" />
                            </div>
                        </div>

                        <div className={`flex-1 flex justify-center py-12 overflow-y-auto scrollbar-hide ${layout === 'editor' ? 'bg-slate-950 px-8' : 'bg-slate-900/50'}`}>
                            <div className={`${layout === 'editor'
                                ? 'w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-[25mm] mb-20 relative mx-auto'
                                : 'w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl rounded-sm p-[20mm] mb-12 relative mx-auto flex flex-col'
                                }`}>
                                <textarea
                                    ref={editorRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Start drafting your legal document here..."
                                    className={`${layout === 'editor'
                                        ? 'w-full h-full min-h-[247mm] bg-transparent text-slate-900 font-serif text-[15px] leading-relaxed focus:outline-none placeholder:text-slate-300 resize-none'
                                        : 'flex-1 bg-transparent text-slate-900 p-0 font-serif text-[14px] leading-relaxed focus:outline-none placeholder:text-slate-400 resize-none'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Resize Handle */}
                {layout === 'split' && (
                    <div
                        onMouseDown={() => setIsResizing(true)}
                        className={`w-1.5 h-full cursor-col-resize hover:bg-emerald-500/40 transition-colors z-20 flex-shrink-0 -ml-[3px] ${isResizing ? 'bg-emerald-500/60' : 'bg-slate-800'}`}
                    />
                )}

                {/* Live Preview Pane */}
                {(layout === 'split' || layout === 'preview') && (
                    <div
                        className={`bg-slate-950 border-l border-slate-800 flex flex-col transition-all duration-500 ${layout === 'preview' ? 'w-full border-l-0' : ''}`}
                        style={{ width: layout === 'split' ? `${100 - editorWidth}%` : '100%' }}
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText size={14} className="text-blue-400" />
                                Live Preview
                            </h4>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 scrollbar-hide flex justify-center bg-slate-950">
                            <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-[25mm] mb-20 relative mx-auto">
                                {/* Watermark */}
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-45 select-none text-9xl font-black">
                                    LEX SOVEREIGN
                                </div>

                                <div className="relative z-10 font-serif text-[15px] leading-relaxed">
                                    {content ? renderPreviewContent(content) : (
                                        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-30">
                                            <FileText size={48} />
                                            <p className="italic text-center">
                                                Your document preview will appear here as you type...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ToolbarButton = ({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title: string }) => (
    <button
        onClick={onClick}
        title={title}
        className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
    >
        {icon}
    </button>
);

export default BlankDocumentEditor;
