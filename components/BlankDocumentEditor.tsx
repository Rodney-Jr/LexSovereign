import React, { useState, useRef, useEffect } from 'react';
import {
    X, Save, FileText, Sparkles, Download, Copy, Loader2, Edit3, Eye,
    Bold, Italic, Underline, Strikethrough, Heading1, Heading2,
    List, ListOrdered, Quote, Link, Minus, AlignCenter, AlignLeft, AlignRight,
    ZoomIn, ZoomOut, Maximize2, Minimize2, ArrowLeft, ShieldCheck, MessageSquare,
    Library, BrainCircuit, Wand2, Info, History as HistoryIcon, Search, Highlighter, Type, Calendar, DollarSign, BookOpen
} from 'lucide-react';
import { DocumentMetadata, Region, PrivilegeStatus } from '../types';

interface BlankDocumentEditorProps {
    onClose: () => void;
    onSave: (name: string, content: string, id?: string) => void;
    initialId?: string;
    initialName?: string;
    initialContent?: string;
}

const BlankDocumentEditor: React.FC<BlankDocumentEditorProps> = ({
    onClose,
    onSave,
    initialId,
    initialName = 'Untitled Document',
    initialContent = ''
}) => {
    const [documentName, setDocumentName] = useState(initialName);
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);
    const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split');
    const [editorWidth, setEditorWidth] = useState(50); // Percentage
    const [isResizing, setIsResizing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fontSize, setFontSize] = useState(15);
    const [lineSpacing, setLineSpacing] = useState(1.5);
    const [fontSerif, setFontSerif] = useState(true);
    const [showSymbols, setShowSymbols] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [editorMode, setEditorMode] = useState<'draft' | 'review' | 'compare' | 'ai'>('draft');
    const [panels, setPanels] = useState({ left: true, right: true });
    const [chatInput, setChatInput] = useState('');
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "I'm your Legal Copilot. How can I help you draft or review this document today?" }
    ]);
    const [selectedText, setSelectedText] = useState('');
    const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
    const [isClauseLibraryOpen, setIsClauseLibraryOpen] = useState(false);

    const editorRef = useRef<HTMLTextAreaElement>(null);

    const insertAtCursor = (text: string) => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = textarea.value;
        const newContent = currentContent.substring(0, start) + text + currentContent.substring(end);

        setContent(newContent);

        // Reset focus and position cursor after inserted text
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
    };

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
        if (editorRef.current) {
            editorRef.current.style.height = 'auto';
            editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
        }
    }, [content]);

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
            onSave(documentName, content, initialId);
            setIsSaving(false);
        }, 500);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(content);
        alert('Content copied to clipboard!');
    };

    const wordCount = content.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const charCount = content.length;

    const handleChatSend = () => {
        if (!chatInput.trim()) return;
        setAiMessages(prev => [...prev, { role: 'user', content: chatInput }]);
        const input = chatInput;
        setChatInput('');

        // Simulate AI response
        setTimeout(() => {
            setAiMessages(prev => [...prev, { 
                role: 'ai', 
                content: `Analyzing your draft of "${documentName}"... I've detected that the dispute resolution section could be strengthened by specifying the seat of arbitration as Accra to ensure local jurisdictional alignment.` 
            }]);
            if (riskLevel === 'LOW') setRiskLevel('MEDIUM');
        }, 1000);
    };

    const getOutline = () => {
        const text = content || '';
        const lines = text.split('\n');
        const headers = lines
            .filter(l => l.startsWith('#'))
            .map(l => l.replace(/#/g, '').trim())
            .slice(0, 10);
        
        return headers.length > 0 ? headers : ["Introduction", "Parties", "Clauses", "Execution"];
    };

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
            .replace(/§(\d+)/g, '<strong>§$1</strong>') // Legal section highlighting
            .replace(/Article (\d+)/g, '<span class="font-bold text-lg block mt-6 mb-2 underline">Article $1</span>')
            .replace(/\n\n/g, '<br /><br />')
            .replace(/\n/g, '<br />');

        return <div className="prose-slate prose-lg max-w-none text-slate-800 selection:bg-cyan-100" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="fixed inset-0 z-[120] bg-[#0A0C10] flex flex-col animate-in slide-in-from-bottom-6 duration-500 text-slate-200">
            {/* Top Bar */}
            <header className="h-16 border-b border-brand-border bg-[#0E1117]/50 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} title="Back to Dashboard" className="p-2 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            <FileText className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={documentName}
                                    onChange={(e) => setDocumentName(e.target.value)}
                                    className="text-xl font-bold text-white tracking-tight bg-transparent border-none outline-none focus:outline-none w-[300px]"
                                    placeholder="Document Name"
                                />
                                <div className={`px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-lg ${
                                    riskLevel === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5' :
                                    riskLevel === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/5' :
                                    'bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/5'
                                }`}>
                                    <ShieldCheck size={11} />
                                    {riskLevel} RISK
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sovereign Workspace v3.0 • {wordCount} words</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Primary Mode Switcher */}
                    <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-2xl border border-slate-700 mr-2 backdrop-blur-md">
                        {[
                            { id: 'draft', label: 'Draft', icon: <Edit3 size={14} />, title: "Switch to Draft Mode" },
                            { id: 'review', label: 'Review', icon: <MessageSquare size={14} />, title: "Switch to Review Mode" },
                            { id: 'compare', label: 'Compare', icon: <Copy size={14} />, title: "Switch to Compare Mode" },
                            { id: 'ai', label: 'AI Studio', icon: <Sparkles size={14} />, title: "Switch to AI Studio" }
                        ].map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setEditorMode(mode.id as any)}
                                title={mode.title}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${editorMode === mode.id ? 'bg-[#5B21B6] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {mode.icon}
                                <span className={editorMode === mode.id ? 'block' : 'hidden'}>{mode.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-slate-800 mx-2" />

                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setPanels(p => ({ ...p, left: !p.left }))}
                            title="Toggle Navigator" 
                            className={`p-2.5 rounded-xl transition-all ${panels.left ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:text-white'}`}
                        >
                            <Library size={16} />
                        </button>
                        <button 
                            onClick={() => setPanels(p => ({ ...p, right: !p.right }))}
                            title="Toggle Intelligence"
                            className={`p-2.5 rounded-xl transition-all ${panels.right ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:text-white'}`}
                        >
                            <BrainCircuit size={16} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-800" />

                    <button
                        onClick={handleSave}
                        disabled={isSaving || !documentName.trim()}
                        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-40"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        {isSaving ? 'Synching...' : 'Commit to Vault'}
                    </button>
                </div>
            </header>

            {/* Three-Panel Professional Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* 1. Navigator Panel (Left - 20%) */}
                {panels.left && (
                    <aside className="w-[20%] border-r border-slate-800/50 bg-[#0E1117]/30 flex flex-col animate-in slide-in-from-left duration-300 shrink-0">
                        <div className="p-4 border-b border-slate-800/50 bg-[#0A0C10]/50 flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Library size={14} />
                                Navigator
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                            {/* Formatting Tools (Now in Sidebar for Blank Editor) */}
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Formatting</h4>
                                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-800/40 rounded-xl border border-slate-700">
                                    <ToolbarButton icon={<Bold size={12} />} onClick={() => handleFormatting('**', '**')} title="Bold" />
                                    <ToolbarButton icon={<Italic size={12} />} onClick={() => handleFormatting('*', '*')} title="Italic" />
                                    <ToolbarButton icon={<Underline size={12} />} onClick={() => handleFormatting('<u>', '</u>')} title="Underline" />
                                    <ToolbarButton icon={<Heading1 size={12} />} onClick={() => handleFormatting('# ', '')} title="H1" />
                                    <ToolbarButton icon={<List size={12} />} onClick={() => handleFormatting('- ', '')} title="List" />
                                    <ToolbarButton icon={<Quote size={12} />} onClick={() => handleFormatting('> ', '')} title="Quote" />
                                    <ToolbarButton icon={<Link size={12} />} onClick={() => handleFormatting('[', '](url)')} title="Link" />
                                    <ToolbarButton icon={<span className="font-bold text-[10px]">§</span>} onClick={() => insertAtCursor('§')} title="Legal Symbol" />
                                </div>
                            </div>

                            {/* Document Outline */}
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Outline</h4>
                                <div className="space-y-1">
                                    {getOutline().map((header, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-all group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-emerald-500 border border-slate-600 transition-all" />
                                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">{header}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

                {/* 2. Primary Editor (Center - 60%) */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#0A0C10]/5">
                    {/* Secondary Context Toolbar */}
                    <div className="h-12 border-b border-slate-800/50 bg-[#0E1117]/80 backdrop-blur-sm flex items-center justify-between px-6 z-20 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                                <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-all" title="Insert Clause" onClick={() => setIsClauseLibraryOpen(true)}>
                                    <BookOpen size={14} />
                                </button>
                                <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-all font-serif font-bold text-[10px]" onClick={() => setFontSerif(!fontSerif)} title="Toggle Serif Font">
                                    {fontSerif ? 'Ser' : 'Sans'}
                                </button>
                                <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-all" title="Add Highlight">
                                    <Highlighter size={14} />
                                </button>
                                <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-all" title="View Version History" onClick={() => setIsVersionHistoryOpen(true)}>
                                    <HistoryIcon size={14} />
                                </button>
                            </div>
                            <div className="h-4 w-px bg-slate-800" />
                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest px-2">
                                {editorMode.toUpperCase()} MODE
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 bg-slate-800/50 p-0.5 rounded-lg border border-slate-700">
                                <button
                                    onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
                                    title="Zoom Out"
                                    className="p-1 text-slate-400 hover:text-white"
                                >
                                    <ZoomOut size={12} />
                                </button>
                                <span className="text-[9px] font-mono text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
                                <button
                                    onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                                    title="Zoom In"
                                    className="p-1 text-slate-400 hover:text-white"
                                >
                                    <ZoomIn size={12} />
                                </button>
                            </div>
                            <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-all ml-2" title="Print Document" onClick={() => window.print()}>
                                <Download size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 paper-workspace p-12 overflow-y-auto scrollbar-hide bg-[#0A0C10]/20 flex flex-col items-center">
                        <div className="relative mx-auto transition-transform duration-500 ease-in-out origin-top" style={{ width: '210mm', transform: `scale(${zoom})` }}>
                            {/* 1. The Physical Sheet Stack (Real Borders) */}
                            <div className="flex flex-col gap-10 relative z-0">
                                {[...Array(Math.max(1, Math.ceil(content.length / 3000) + 1))].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-sm pointer-events-none" 
                                        style={{ width: '210mm', height: '297mm' }}
                                    >
                                        <div className="absolute bottom-6 right-10 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                            Page {i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 2. Seamless Text Canvas (Floating on top) */}
                            <div className="absolute top-0 left-0 w-full h-full z-10 p-[25mm]">
                                <textarea
                                    ref={editorRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full bg-transparent text-slate-900 focus:outline-none placeholder:text-slate-300 resize-none leading-relaxed selection:bg-emerald-100"
                                    style={{ 
                                        fontFamily: fontSerif ? 'Georgia, "Times New Roman", serif' : 'Inter, system-ui, sans-serif',
                                        fontSize: `${fontSize}px`,
                                        lineHeight: lineSpacing,
                                    }}
                                    placeholder="Start drafting your legal document..."
                                    onMouseUp={() => {
                                        const sel = window.getSelection()?.toString();
                                        if (sel) setSelectedText(sel);
                                        else setSelectedText('');
                                    }}
                                />
                            </div>

                            {/* Selection Floating Actions */}
                            {selectedText && (
                                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#0E1117] border border-slate-700 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-4 z-[200] animate-in fade-in slide-in-from-bottom-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-800 pr-4">AI Copilot</span>
                                    <button onClick={() => setChatInput(`Rewrite this: ${selectedText}`)} title="AI Rewrite" className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all">
                                        <Wand2 size={14} /> Rewrite
                                    </button>
                                    <button onClick={() => setChatInput(`Simplify this: ${selectedText}`)} title="AI Simplify" className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-all">
                                        <Info size={14} /> Simplify
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* 3. Intelligence Panel (Right - 20%) */}
                {panels.right && (
                    <aside className="w-[20%] border-l border-slate-800/50 bg-[#0E1117]/30 flex flex-col animate-in slide-in-from-right duration-300 shrink-0">
                        <div className="p-4 border-b border-slate-800/50 bg-[#0A0C10]/50 flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <BrainCircuit size={14} />
                                Intelligence
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Connected</span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Intelligence Tabs */}
                            <div className="flex border-b border-slate-800 h-10 shrink-0">
                                <button className="flex-1 text-[9px] font-bold uppercase tracking-widest border-b-2 border-[#8B5CF6] text-white">Copilot</button>
                                <button className="flex-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300">Insights</button>
                                <button className="flex-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300">Risks</button>
                            </div>

                            {/* Chat View */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                                    {aiMessages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[90%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#5B21B6] text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-300 rounded-tl-none border border-slate-700/50'}`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[8px] text-slate-600 mt-1 uppercase font-black tracking-widest">{msg.role === 'user' ? 'Counsel' : 'Sovereign AI'}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 border-t border-slate-800 bg-[#0A0C10]/50">
                                    <div className="relative group">
                                        <textarea
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSend())}
                                            placeholder="Ask Copilot..."
                                            className="w-full bg-[#0E1117]/70 border border-slate-700/50 rounded-xl px-4 py-3 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder:text-slate-700 resize-none transition-all"
                                            rows={2}
                                        />
                                        <button 
                                            onClick={handleChatSend}
                                            title="Send Message"
                                            disabled={!chatInput.trim()}
                                            className="absolute right-3 bottom-3 p-1.5 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-all shadow-lg disabled:opacity-40"
                                        >
                                            <Wand2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Modals & Overlays (Mirroring DraftingStudio) */}
            {isClauseLibraryOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
                    <div className="bg-[#0E1117] border border-brand-border w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 h-[600px]">
                        <div className="p-8 border-b border-brand-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl"><Library className="text-emerald-400" size={24} /></div>
                                <h3 className="text-xl font-bold text-white">Clause Library</h3>
                            </div>
                            <button onClick={() => setIsClauseLibraryOpen(false)} title="Close" className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-all"><X size={24} /></button>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input type="text" placeholder="Search clauses..." className="w-full bg-[#0A0C10]/50 border border-slate-700 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none" />
                            </div>
                            {["Indemnification (Standard)", "Force Majeure (International)", "Governing Law (Ghana)", "Confidentiality (Strict)"].map((c, i) => (
                                <div key={i} className="p-4 bg-[#0A0C10]/40 border border-slate-700 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
                                    <span className="text-sm text-slate-300 group-hover:text-emerald-400 transition-colors">{c}</span>
                                    <button 
                                        onClick={() => { insertAtCursor(`\n\n### ${c}\n[Clause Text for ${c} goes here...]\n`); setIsClauseLibraryOpen(false); }}
                                        className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase transition-all hover:bg-emerald-500 hover:text-white"
                                    >
                                        Insert
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isVersionHistoryOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
                    <div className="bg-[#0E1117] border border-brand-border w-full max-w-md rounded-[3rem] shadow-2xl p-8 animate-in slide-in-from-bottom-8 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <HistoryIcon size={24} className="text-blue-400" /> Timeline
                            </h3>
                            <button onClick={() => setIsVersionHistoryOpen(false)} title="Close" className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-all"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                                <p className="text-xs font-bold text-white">v1.0.1 (Current)</p>
                                <p className="text-[10px] text-slate-400">Edited by you • Just now</p>
                            </div>
                            <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl opacity-50">
                                <p className="text-xs font-bold text-white">v1.0.0</p>
                                <p className="text-[10px] text-slate-400">Initialized • 1h ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
