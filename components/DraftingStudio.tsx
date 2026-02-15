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
import { BrandingProfile } from '../types';
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

interface Clause {
    clause_key: string;
    clause_title: string;
    clause_text: string;
    clause_type: 'locked' | 'variable' | 'optional';
}

interface FormSection {
    key: string;
    label: string;
    default: boolean;
}

interface TemplateStructure {
    fields?: FormField[];
    sections?: FormSection[];
    clauses?: Clause[];
}

interface Template {
    id: string;
    name: string;
    content: string;
    structure: TemplateStructure | Clause[]; // Can be object or direct array
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
    const [branding, setBranding] = useState<Partial<BrandingProfile>>({
        watermarkText: 'LEX SOVEREIGN',
        primaryFont: 'serif',
        headerText: '',
        footerText: ''
    });

    // State for Variable Fields
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    // State for Optional Sections (Toggles)
    const [sectionValues, setSectionValues] = useState<Record<string, boolean>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [isHydrating, setIsHydrating] = useState(false);
    const [isAssembling, setIsAssembling] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            if (newWidth >= 300 && newWidth <= 800) {
                setSidebarWidth(newWidth);
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
        fetchTemplate();
        fetchBranding();
    }, [templateId]);

    const fetchBranding = async () => {
        const session = getSavedSession();
        if (!session?.token) return;
        try {
            const profiles = await authorizedFetch('/api/branding-profiles', { token: session.token });
            if (Array.isArray(profiles) && profiles.length > 0) {
                const profile = profiles[0];
                setBranding({
                    watermarkText: profile.watermarkText || profile.name?.toUpperCase() || 'LEX SOVEREIGN',
                    primaryFont: profile.primaryFont || 'serif',
                    headerText: profile.headerText || '',
                    footerText: profile.footerText || ''
                });
            }
        } catch (e) {
            console.error("Failed to load branding", e);
        }
    };

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
                const structure = data.structure;

                // Case 1: Array of Clauses (New Granular Model)
                if (Array.isArray(structure)) {
                    structure.forEach((c: Clause) => {
                        // Extract variables: {{variable_name}}
                        const vars = c.clause_text.match(/{{\s*(\w+)\s*}}/g);
                        if (vars) {
                            vars.forEach((v: string) => {
                                const key = v.replace(/{{\s*|\s*}}/g, '');
                                initialFields[key] = ''; // No default for extracted vars
                            });
                        }
                        if (c.clause_type === 'optional') {
                            initialSections[c.clause_key] = false;
                        }
                    });

                    // Synthesize content if missing
                    if (!data.content) {
                        data.content = structure.map(c => {
                            if (c.clause_type === 'optional') {
                                return `{{#if ${c.clause_key}}}\n### ${c.clause_title}\n${c.clause_text}\n{{/if}}`;
                            }
                            return `### ${c.clause_title}\n${c.clause_text}`;
                        }).join('\n\n');
                    }
                }
                // Case 2: Structured Object (Hybrid Model)
                else {
                    if (structure.fields) {
                        structure.fields.forEach((f: FormField) => {
                            initialFields[f.key] = f.default || '';
                        });
                    }
                    if (structure.sections) {
                        structure.sections.forEach((s: FormSection) => {
                            initialSections[s.key] = s.default ?? false;
                        });
                    }
                    // Handle hybrid clauses within object
                    if (structure.clauses) {
                        structure.clauses.forEach((c: Clause) => {
                            // Extract variables if not already defined in fields
                            const vars = c.clause_text.match(/{{\s*(\w+)\s*}}/g);
                            if (vars) {
                                vars.forEach((v: string) => {
                                    const key = v.replace(/{{\s*|\s*}}/g, '');
                                    if (!(key in initialFields)) {
                                        initialFields[key] = '';
                                    }
                                });
                            }
                            if (c.clause_type === 'optional') {
                                if (!(c.clause_key in initialSections)) {
                                    initialSections[c.clause_key] = false;
                                }
                            }
                        });

                        // Synthesize content if missing
                        if (!data.content) {
                            data.content = structure.clauses.map((c: Clause) => {
                                if (c.clause_type === 'optional') {
                                    return `{{#if ${c.clause_key}}}\n### ${c.clause_title}\n${c.clause_text}\n{{/if}}`;
                                }
                                return `### ${c.clause_title}\n${c.clause_text}`;
                            }).join('\n\n');
                        }
                    }
                }
            } else if (data.placeholders) {
                // Legacy Fallback
                data.placeholders.forEach((p: string) => initialFields[p] = '');
            }

            setFieldValues(initialFields);
            setSectionValues(initialSections);

            // Initial Compile
            setPreviewContent(compileTemplate(data.content, initialFields, initialSections));
            setValidationErrors([]);

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
        try {
            setIsHydrating(true);
            const session = getSavedSession();
            if (!session?.token) return;

            const data = await authorizedFetch(`/api/document-templates/${templateId}/hydrate`, {
                method: 'POST',
                token: session.token,
                body: JSON.stringify({ matterId })
            });

            if (data.error) throw new Error(data.error);
            const aiFields = data;

            const newFields = { ...fieldValues, ...aiFields };
            setFieldValues(newFields);
            setPreviewContent(compileTemplate(template?.content || '', newFields, sectionValues));
        } catch (e) {
            console.error(e);
        } finally {
            setIsHydrating(false);
        }
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

    const handleAssembleAndSave = async () => {
        try {
            setIsAssembling(true);
            setValidationErrors([]);
            const session = getSavedSession();
            if (!session?.token) return;

            // Prepare metadata
            const metadata = {
                firm_name: 'Lex Sovereign Firm', // Should ideally come from context
                draft_id: `DRFT-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
                generation_date: new Date().toLocaleDateString()
            };

            const selectedOptionalKeys = Object.keys(sectionValues).filter(k => sectionValues[k]);

            const result = await authorizedFetch('/api/documents/assemble', {
                method: 'POST',
                token: session.token,
                body: JSON.stringify({
                    template: {
                        template_name: template?.name,
                        version: (template as any).version || '1.0.0',
                        clauses: Array.isArray(template?.structure) ? template?.structure : []
                    },
                    variables: fieldValues,
                    selectedOptionalKeys,
                    metadata
                })
            });

            if (result.status === 'FAIL') {
                setValidationErrors(result.validation_errors);
                return;
            }

            // If PASS, call onSave with the fully assembled document
            onSave(`${template?.name} - Finalized`, result.assembled_document);
        } catch (e: any) {
            console.error(e);
            setValidationErrors([e.message]);
        } finally {
            setIsAssembling(false);
        }
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
        <div className="fixed inset-0 z-[120] bg-brand-bg flex flex-col animate-in slide-in-from-bottom-6 duration-500">
            {/* Top Bar */}
            <header className="h-20 border-b border-brand-border bg-brand-sidebar/50 flex items-center justify-between px-8">
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
                        title={!matterId ? "Select a matter in the Vault to enable AI hydration" : "Automatically fill variables using AI"}
                        className="px-6 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-40"
                    >
                        {isHydrating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        AI Auto-Hydrate
                    </button>
                    <button
                        onClick={handleAssembleAndSave}
                        disabled={isAssembling}
                        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-40"
                    >
                        {isAssembling ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        {isAssembling ? 'Validating...' : 'Commit to Vault'}
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left: Input Sidebar */}
                <aside
                    className="border-r border-brand-border bg-brand-sidebar/30 overflow-y-auto p-8 scrollbar-hide shrink-0"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    {/* Sections (Toggles) */}
                    {((template.structure as any).sections?.length > 0 || (Array.isArray(template.structure) && template.structure.some(c => c.clause_type === 'optional'))) && (
                        <div className="mb-8 space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                                <ToggleLeft size={14} /> Optional Clauses
                            </h5>
                            {Array.isArray(template.structure) ? (
                                template.structure.filter(c => c.clause_type === 'optional').map(clause => (
                                    <div
                                        key={clause.clause_key}
                                        onClick={() => handleSectionToggle(clause.clause_key)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${sectionValues[clause.clause_key]
                                            ? 'bg-brand-primary/10 border-brand-primary/30'
                                            : 'bg-brand-bg border-brand-border hover:border-brand-primary/20'
                                            }`}
                                    >
                                        <span className={`text-xs font-bold transition-colors ${sectionValues[clause.clause_key] ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            {clause.clause_title}
                                        </span>
                                        {sectionValues[clause.clause_key] ? (
                                            <ToggleRight size={24} className="text-emerald-500" />
                                        ) : (
                                            <ToggleLeft size={24} className="text-slate-600 group-hover:text-slate-500" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                (template.structure as any).sections.map((section: any) => (
                                    <div
                                        key={section.key}
                                        onClick={() => handleSectionToggle(section.key)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${sectionValues[section.key]
                                            ? 'bg-brand-primary/10 border-brand-primary/30'
                                            : 'bg-brand-bg border-brand-border hover:border-brand-primary/20'
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
                                ))
                            )}
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
                                className="text-[9px] text-brand-muted hover:text-red-400 uppercase font-bold transition-colors flex items-center gap-1"
                            >
                                <Eraser size={10} /> Clear
                            </button>
                        </div>

                        <div className="space-y-5">
                            {Array.isArray(template.structure) ? (
                                Object.keys(fieldValues).map(key => (
                                    <div key={key} className="space-y-2 group">
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1 group-focus-within:text-brand-primary transition-colors flex items-center gap-1.5 text-ellipsis overflow-hidden">
                                            {getFieldIcon(key.includes('date') ? 'date' : key.includes('currency') || key.includes('amount') ? 'currency' : 'text')}
                                            {key.replace(/_/g, ' ')}
                                        </label>
                                        <input
                                            type={key.includes('date') ? 'date' : 'text'}
                                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-brand-muted/20"
                                            placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                                            value={fieldValues[key]}
                                            onChange={e => handleFieldChange(key, e.target.value)}
                                        />
                                    </div>
                                ))
                            ) : template.structure?.fields ? (
                                template.structure.fields.map(field => (
                                    <div key={field.key} className="space-y-2 group">
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1 group-focus-within:text-brand-primary transition-colors flex items-center gap-1.5">
                                            {getFieldIcon(field.type)}
                                            {field.label}
                                        </label>

                                        {field.multiline ? (
                                            <textarea
                                                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-brand-muted/20 min-h-[80px]"
                                                placeholder={field.placeholder || `Enter ${field.label}...`}
                                                value={fieldValues[field.key]}
                                                onChange={e => handleFieldChange(field.key, e.target.value)}
                                            />
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type={field.type === 'date' ? 'date' : 'text'}
                                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-brand-muted/20"
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
                                        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest ml-1">
                                            {key.replace('_', ' ')}
                                        </label>
                                        <input
                                            aria-label={key}
                                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text"
                                            value={fieldValues[key]}
                                            onChange={e => handleFieldChange(key, e.target.value)}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Validation Errors Overlay */}
                    {validationErrors.length > 0 && (
                        <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 rounded-[2rem] space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Validation Blocked</span>
                            </div>
                            <ul className="space-y-1.5">
                                {validationErrors.map((err, idx) => (
                                    <li key={idx} className="text-[11px] text-red-300/80 flex items-start gap-2">
                                        <span className="shrink-0 mt-1 w-1 h-1 bg-red-400 rounded-full" />
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="p-6 bg-brand-bg border border-brand-border rounded-[2rem] space-y-4 shadow-inner mt-8">
                        <div className="flex items-center gap-2 text-amber-500">
                            <AlertTriangle size={14} />
                            <span className="text-[10px] font-bold uppercase">Compliance Lock</span>
                        </div>
                        <p className="text-[10px] text-brand-muted leading-relaxed italic">
                            Core clauses in this template are locked. Only the variables and optional sections above can be modified to ensure compliance.
                        </p>
                    </div>
                </aside>

                {/* Resize Handle */}
                <div
                    className={`w-1.5 h-full cursor-col-resize hover:bg-brand-primary/40 transition-colors z-20 flex-shrink-0 -ml-[3px] ${isResizing ? 'bg-brand-primary/60' : ''}`}
                    onMouseDown={() => setIsResizing(true)}
                />

                {/* Right: Live Preview */}
                <main className="flex-1 bg-brand-bg p-12 overflow-y-auto scrollbar-hide flex justify-center">
                    <div className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl rounded-sm p-20 relative animate-in fade-in zoom-in-95 duration-700 origin-top flex flex-col min-h-[1120px]">
                        {/* Header Branding */}
                        <div className="absolute top-8 right-8 text-slate-300 text-[10px] font-mono uppercase text-right leading-tight">
                            {branding.headerText}
                        </div>

                        {/* Watermark */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center rotate-45 select-none text-6xl md:text-[10rem] font-black whitespace-nowrap overflow-hidden z-0 pointer-events-none">
                            {branding.watermarkText}
                        </div>

                        <div
                            className="relative z-10 whitespace-pre-wrap flex-1 text-[15px] leading-relaxed"
                            style={{ fontFamily: branding.primaryFont }}
                        >
                            {previewContent}
                        </div>

                        {/* Footer Branding */}
                        <div className="mt-20 pt-8 border-t border-slate-100 text-center text-slate-300 text-[10px] font-mono uppercase tracking-[0.2em]">
                            {branding.footerText}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DraftingStudio;
