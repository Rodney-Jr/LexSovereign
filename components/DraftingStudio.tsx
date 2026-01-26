
import React, { useState, useEffect } from 'react';
import {
    X,
    FileText,
    Save,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    ArrowLeft,
    Loader2,
    Copy,
    Download,
    Terminal,
    Eraser
} from 'lucide-react';

interface Template {
    id: string;
    name: string;
    content: string;
    placeholders: string[];
}

interface DraftingStudioProps {
    templateId: string;
    matterId: string | null;
    onClose: () => void;
    onSave: (name: string, content: string) => void;
}

const DraftingStudio: React.FC<DraftingStudioProps> = ({ templateId, matterId, onClose, onSave }) => {
    const [template, setTemplate] = useState<Template | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isHydrating, setIsHydrating] = useState(false);
    const [previewContent, setPreviewContent] = useState('');

    useEffect(() => {
        fetchTemplate();
    }, [templateId]);

    const fetchTemplate = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/document-templates/${templateId}`, {
                headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('lexSovereign_session') || '{}').token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTemplate(data);
                // Initialize placeholders
                const initial: Record<string, string> = {};
                data.placeholders.forEach((p: string) => initial[p] = '');
                setValues(initial);
                setPreviewContent(data.content);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAIHydrate = async () => {
        if (!matterId) return;
        setIsHydrating(true);
        // Simulated AI extraction from Matter context
        setTimeout(() => {
            const newValues = { ...values };
            if (values.hasOwnProperty('PARTY_A')) newValues['PARTY_A'] = 'LexSovereign Ltd';
            if (values.hasOwnProperty('EFFECTIVE_DATE')) newValues['EFFECTIVE_DATE'] = new Date().toLocaleDateString();
            if (values.hasOwnProperty('PROJECT_NAME')) newValues['PROJECT_NAME'] = 'Matter-772 Integration';
            if (values.hasOwnProperty('ASSIGNOR_NAME')) newValues['ASSIGNOR_NAME'] = 'Kofi Mensah';
            if (values.hasOwnProperty('CURRENCY')) newValues['CURRENCY'] = 'GHS';
            if (values.hasOwnProperty('AMOUNT')) newValues['AMOUNT'] = '150,000';
            setValues(newValues);
            updatePreview(newValues);
            setIsHydrating(false);
        }, 1500);
    };

    const updatePreview = (newValues: Record<string, string>) => {
        if (!template) return;
        let content = template.content;
        Object.entries(newValues).forEach(([key, val]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, val || `[${key}]`);
        });
        setPreviewContent(content);
    };

    const handleInputChange = (key: string, val: string) => {
        const updated = { ...values, [key]: val };
        setValues(updated);
        updatePreview(updated);
    };

    if (isLoading) return (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
    );

    if (!template) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-6 duration-500">
            {/* Top Bar */}
            <header className="h-20 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{template.name}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Drafting Studio v2.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleAIHydrate}
                        disabled={!matterId || isHydrating}
                        className="px-6 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-40"
                    >
                        {isHydrating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        AI Auto-Hydrate
                    </button>
                    <button
                        onClick={() => onSave(`${template.name} - Draft`, previewContent)}
                        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
                    >
                        <Save size={14} /> Commit to Vault
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Input Sidebar */}
                <aside className="w-[400px] border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-8 scrollbar-hide">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Terminal size={14} /> Data Definitions
                            </h5>
                            <button
                                onClick={() => {
                                    const reset = { ...values };
                                    Object.keys(reset).forEach(k => reset[k] = '');
                                    setValues(reset);
                                    updatePreview(reset);
                                }}
                                className="text-[9px] text-slate-600 hover:text-red-400 uppercase font-bold transition-colors flex items-center gap-1"
                            >
                                <Eraser size={10} /> Clear
                            </button>
                        </div>

                        <div className="space-y-6">
                            {template.placeholders.map(key => (
                                <div key={key} className="space-y-2 group">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">
                                        {key.replace('_', ' ')}
                                    </label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
                                        placeholder={`e.g. [${key}]`}
                                        value={values[key]}
                                        onChange={e => handleInputChange(key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-950 border border-slate-800 rounded-[2rem] space-y-4">
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-bold uppercase">Compliance Check</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                LexSovereign AI will scan this draft for jurisdictional conflicts upon committing.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Right: Live Preview */}
                <main className="flex-1 bg-slate-950 p-12 overflow-y-auto scrollbar-hide flex justify-center">
                    <div className="w-full max-w-[800px] bg-white text-slate-900 min-h-[1056px] shadow-2xl rounded-sm p-20 relative animate-in fade-in zoom-in-95 duration-700 origin-top">
                        {/* Watermark */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-45 select-none text-9xl font-black">
                            LEX SOVEREIGN
                        </div>

                        <div className="relative z-10 whitespace-pre-wrap font-serif text-[15px] leading-relaxed">
                            {previewContent}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DraftingStudio;
