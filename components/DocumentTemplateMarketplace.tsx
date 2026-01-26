
import React, { useState, useEffect } from 'react';
import {
    X,
    FileText,
    Search,
    MapPin,
    Tag,
    Sparkles,
    ChevronRight,
    Loader2,
    ArrowLeft,
    Briefcase,
    Gavel,
    History,
    Building,
    CheckCircle2,
    FileEdit
} from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    jurisdiction: string;
    placeholders: string[];
    version: string;
}

interface DocumentTemplateMarketplaceProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (templateId: string) => void;
}

const DocumentTemplateMarketplace: React.FC<DocumentTemplateMarketplaceProps> = ({ isOpen, onClose, onSelect }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) fetchTemplates();
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/document-templates', {
                headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('lexSovereign_session') || '{}').token}` }
            });
            if (res.ok) {
                setTemplates(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const categories = Array.from(new Set(templates.map(t => t.category)));

    const filtered = templates.filter(t => {
        const matchesFilter = t.name.toLowerCase().includes(filter.toLowerCase()) ||
            t.description.toLowerCase().includes(filter.toLowerCase());
        const matchesCat = selectedCategory ? t.category === selectedCategory : true;
        return matchesFilter && matchesCat;
    });

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'CORPORATE': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'REAL_ESTATE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'LITIGATION': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-6xl h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600/20 rounded-2xl border border-emerald-600/30">
                            <FileText className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Template Marketplace</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Standard Industry Blueprints</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                                type="text"
                                placeholder="Search blueprints..."
                                className="bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 w-64 transition-all"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Sidebar & Grid */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Categories Sidebar */}
                    <aside className="w-64 border-r border-slate-800 p-8 space-y-6 hidden lg:block">
                        <div>
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Focus Area</h5>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${!selectedCategory ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    All Jurisdictions
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {cat.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-800/50">
                            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <Sparkles size={14} />
                                    <span className="text-[10px] font-bold uppercase">Sovereign AI</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed">AI can automatically extract matter data into these templates.</p>
                            </div>
                        </div>
                    </aside>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-500">
                                <Loader2 className="animate-spin" size={32} />
                                <span className="text-xs font-bold uppercase tracking-widest">Scanning Vault Templates...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                <History size={48} className="opacity-20" />
                                <p className="text-sm font-bold">No blueprints found in this sector.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filtered.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => onSelect(template.id)}
                                        className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] text-left hover:border-emerald-500/40 hover:bg-slate-800/30 transition-all group relative flex flex-col justify-between h-64 shadow-xl"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase border ${getCategoryColor(template.category)}`}>
                                                    {template.category}
                                                </span>
                                                <div className="text-[9px] font-mono text-slate-600">v{template.version}</div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                                                    {template.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                                                    {template.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-slate-500">
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    <MapPin size={12} className="shrink-0" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{template.jurisdiction}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Tag size={12} className="shrink-0" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{template.placeholders.length} Fields</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentTemplateMarketplace;
