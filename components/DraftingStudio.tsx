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
    Eraser,
    ToggleLeft,
    ToggleRight,
    Calendar,
    DollarSign,
    Type
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface FormField {
    key: string;
    label: string;
    type: 'text' | 'date' | 'number' | 'currency';
    placeholder?: string;
    multiline?: boolean;
    required?: boolean;
    default?: any;
    currency?: string;
}

interface FormSection {
    key: string;
    label: string;
    default: boolean;
}

interface TemplateStructure {
    fields: FormField[];
    sections: FormSection[];
}

interface Template {
    id: string;
    name: string;
    content: string;
    structure: TemplateStructure;
    // Fallback for legacy simple templates if any
    placeholders?: string[];
}

interface DraftingStudioProps {
    templateId: string;
    matterId: string | null;
    onClose: () => void;
    onSave: (name: string, content: string) => void;
}

const DraftingStudio: React.FC<DraftingStudioProps> = ({ templateId, matterId, onClose, onSave }) => {
    const [template, setTemplate] = useState<Template | null>(null);

    // State for Variable Fields
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    // State for Optional Sections (Toggles)
    const [sectionValues, setSectionValues] = useState<Record<string, boolean>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [isHydrating, setIsHydrating] = useState(false);
    const [previewContent, setPreviewContent] = useState('');

    useEffect(() => {
        fetchTemplate();
    }, [templateId]);

    const fetchTemplate = async () => {
        try {
            setIsLoading(true);
            const session = getSavedSession();
            if (!session?.token) return;

            const data = await authorizedFetch(`/api/document-templates/${templateId}`, {
                token: session.token
            });
            setTemplate(data);

            // Initialize State
            const initialFields: Record<string, string> = {};
            const initialSections: Record<string, boolean> = {};

            if (data.structure) {
                // New Structured Template
                data.structure.fields.forEach((f: FormField) => {
                    initialFields[f.key] = f.default || '';
                });
                data.structure.sections.forEach((s: FormSection) => {
                    initialSections[s.key] = s.default ?? false;
                });
            } else if (data.placeholders) {
                // Legacy Fallback
                data.placeholders.forEach((p: string) => initialFields[p] = '');
            }

            setFieldValues(initialFields);
            setSectionValues(initialSections);

            // Initial Compile
            setPreviewContent(compileTemplate(data.content, initialFields, initialSections));

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Mini-Template Engine
    const compileTemplate = (content: string, fields: Record<string, string>, sections: Record<string, boolean>) => {
        let output = content;

        // 1. Handle Sections (Conditional Blocks)
        // Matches {{#if key}} ... {{/if}} (non-nested for simplicity)
        output = output.replace(/{{\s*#if\s+(\w+)\s*}}([\s\S]*?){{\s*\/if\s*}}/g, (match, key, innerContent) => {
            const isVisible = sections[key];
            return isVisible ? innerContent : '';
        });

        // 2. Handle Variables
        // Matches {{key}}
        output = output.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
            return fields[key] || `[${key.toUpperCase().replace(/_/g, ' ')}]`;
        });

        return output;
    };

    const handleAIHydrate = async () => {
        if (!matterId) return;
        setIsHydrating(true);
        // Simulated AI extraction from Matter context
        setTimeout(() => {
            const newFields = { ...fieldValues };

            // Heuristic matching for demo. In real systems, LLM would map this.
            const heuristics: Record<string, string> = {
                'party_a_name': 'Acme Corp',
                'party_b_name': 'Beta Ltd',
                'effective_date': new Date().toLocaleDateString(),
                'start_date': new Date().toLocaleDateString(),
                'company_name': 'Sovereign Solutions',
                'governing_law': 'Ghana',
                'salary_amount': '120,000',
                'currency': 'USD'
            };

            Object.keys(newFields).forEach(key => {
                if (heuristics[key]) newFields[key] = heuristics[key];
            });

            setFieldValues(newFields);
            setPreviewContent(compileTemplate(template?.content || '', newFields, sectionValues));
            setIsHydrating(false);
        }, 1500);
    };

    const handleFieldChange = (key: string, val: string) => {
        const updated = { ...fieldValues, [key]: val };
        setFieldValues(updated);
        setPreviewContent(compileTemplate(template?.content || '', updated, sectionValues));
    };

    const handleSectionToggle = (key: string) => {
        const updated = { ...sectionValues, [key]: !sectionValues[key] };
        setSectionValues(updated);
        setPreviewContent(compileTemplate(template?.content || '', fieldValues, updated));
    };

    if (isLoading) return (
        <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
    );

    if (!template) return null;

    // Helper to get Icon for field type
    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'date': return <Calendar size={12} />;
            case 'currency': return <DollarSign size={12} />;
            case 'number': return <Terminal size={12} />;
            default: return <Type size={12} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-6 duration-500">
            {/* Top Bar */}
            <header className="h-20 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} title="Back" className="p-2 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{template.name}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Structured Drafting</p>
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
                    {/* Sections (Toggles) */}
                    {template.structure?.sections?.length > 0 && (
                        <div className="mb-8 space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                <ToggleLeft size={14} /> Optional Clauses
                            </h5>
                            {template.structure.sections.map(section => (
                                <div
                                    key={section.key}
                                    onClick={() => handleSectionToggle(section.key)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${sectionValues[section.key]
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <span className={`text-xs font-bold transition-colors ${sectionValues[section.key] ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {section.label}
                                    </span>
                                    {sectionValues[section.key] ? (
                                        <ToggleRight size={24} className="text-emerald-500" />
                                    ) : (
                                        <ToggleLeft size={24} className="text-slate-600 group-hover:text-slate-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fields (Inputs) */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Terminal size={14} /> Variables
                            </h5>
                            <button
                                onClick={() => {
                                    const reset = { ...fieldValues };
                                    Object.keys(reset).forEach(k => reset[k] = '');
                                    setFieldValues(reset);
                                    setPreviewContent(compileTemplate(template?.content || '', reset, sectionValues));
                                }}
                                className="text-[9px] text-slate-600 hover:text-red-400 uppercase font-bold transition-colors flex items-center gap-1"
                            >
                                <Eraser size={10} /> Clear
                            </button>
                        </div>

                        <div className="space-y-5">
                            {template.structure?.fields ? (
                                template.structure.fields.map(field => (
                                    <div key={field.key} className="space-y-2 group">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors flex items-center gap-1.5">
                                            {getFieldIcon(field.type)}
                                            {field.label}
                                        </label>

                                        {field.multiline ? (
                                            <textarea
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800 min-h-[80px]"
                                                placeholder={field.placeholder || `Enter ${field.label}...`}
                                                value={fieldValues[field.key]}
                                                onChange={e => handleFieldChange(field.key, e.target.value)}
                                            />
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type={field.type === 'date' ? 'date' : 'text'}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
                                                    placeholder={field.placeholder || `Enter ${field.label}...`}
                                                    value={fieldValues[field.key]}
                                                    onChange={e => handleFieldChange(field.key, e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                // Legacy Fallback
                                template.placeholders?.map(key => (
                                    <div key={key} className="space-y-2 group">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                            {key.replace('_', ' ')}
                                        </label>
                                        <input
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200"
                                            value={fieldValues[key]}
                                            onChange={e => handleFieldChange(key, e.target.value)}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-slate-950 border border-slate-800 rounded-[2rem] space-y-4">
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-bold uppercase">Compliance Lock</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                Core clauses in this template are locked. Only the variables and optional sections above can be modified to ensure compliance.
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
