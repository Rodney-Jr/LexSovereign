
import React, { useState, useEffect } from 'react';
import {
    X,
    Scale,
    Building2,
    ShieldCheck,
    Plus,
    Eye,
    CheckCircle2,
    Zap,
    ChevronRight,
    Loader2,
    ArrowLeft,
    Briefcase,
    Lock,
    Lightbulb,
    Anchor,
    Home,
    Landmark
} from 'lucide-react';

interface RolePreview {
    name: string;
    description: string;
    permissionCount: number;
}

interface Template {
    id: string;
    name: string;
    roleCount: number;
    roles: RolePreview[];
}

interface RoleTemplateMarketplaceProps {
    isOpen: boolean;
    onClose: () => void;
    onApplySuccess: () => void;
}

const RoleTemplateMarketplace: React.FC<RoleTemplateMarketplaceProps> = ({ isOpen, onClose, onApplySuccess }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) fetchTemplates();
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/roles/templates', {
                headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('lexSovereign_session') || '{}').token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async (type: string) => {
        setIsApplying(true);
        try {
            const res = await fetch(`/api/roles/templates/${type}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('lexSovereign_session') || '{}').token}` }
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onApplySuccess();
                    onClose();
                    setSuccess(false);
                    setSelectedTemplate(null);
                }, 2000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsApplying(false);
        }
    };

    if (!isOpen) return null;

    const getIcon = (id: string) => {
        switch (id) {
            case 'LAW_FIRM': return <Scale size={24} className="text-blue-400" />;
            case 'BANKING': return <Building2 size={24} className="text-emerald-400" />;
            case 'INSURANCE': return <ShieldCheck size={24} className="text-purple-400" />;
            case 'INTELLECTUAL_PROPERTY': return <Lightbulb size={24} className="text-amber-400" />;
            case 'MARITIME_LAW': return <Anchor size={24} className="text-cyan-400" />;
            case 'REAL_ESTATE': return <Home size={24} className="text-orange-400" />;
            case 'PUBLIC_SECTOR': return <Landmark size={24} className="text-indigo-400" />;
            default: return <Briefcase size={24} className="text-slate-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-5xl h-[80vh] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col">

                {/* Background Deco */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] -mr-48 -mt-48 transition-all"></div>

                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        {selectedTemplate ? (
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                title="Back to Marketplace"
                                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        ) : (
                            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-600/30">
                                <Zap className="text-blue-400" size={24} />
                            </div>
                        )}
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                {selectedTemplate ? selectedTemplate.name : 'RBAC Marketplace'}
                            </h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                                {selectedTemplate ? 'Industrial Template Preview' : 'Select an Industry Blueprint'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} title="Close Marketplace" className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 relative z-10 scrollbar-hide">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                            <Loader2 className="animate-spin" size={40} />
                            <p className="text-sm font-bold uppercase tracking-widest">Scanning Repository...</p>
                        </div>
                    ) : success ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
                            <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 size={48} className="text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-3xl font-bold text-white">Template Applied</h4>
                                <p className="text-slate-400 max-w-sm">Tenant roles have been cryptographically rebalanced for {selectedTemplate?.name}.</p>
                            </div>
                        </div>
                    ) : selectedTemplate ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-4 duration-500 h-full">
                            <div className="space-y-8">
                                <div className="prose prose-invert">
                                    <p className="text-slate-400 leading-relaxed">
                                        This template provisions {selectedTemplate.roleCount} specialized roles for {selectedTemplate.name} operations. Each role comes pre-configured with jurisdictional safe-guards.
                                    </p>
                                </div>
                                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-inner">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="text-emerald-400" size={20} />
                                        <h5 className="font-bold text-white">Trust Assurance</h5>
                                    </div>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3 text-sm text-slate-500 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            "Roles are added without deleting existing configurations."
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-500 italic">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                            "Permissions are strictly scoped to resources available in your tier."
                                        </li>
                                    </ul>
                                    <button
                                        disabled={isApplying}
                                        onClick={() => handleApply(selectedTemplate.id)}
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:bg-slate-800 flex items-center justify-center gap-3"
                                    >
                                        {isApplying ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        Apply and Commit
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 overflow-y-auto pr-2 h-[400px] scrollbar-hide bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800">
                                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-4">Provisioning Trace</h5>
                                {selectedTemplate.roles.map((role, idx) => (
                                    <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Lock size={12} className="text-slate-600" />
                                                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase">{role.name}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-tight">{role.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-1 rounded-lg border border-emerald-400/10">
                                                {role.permissionCount} Perms
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-left hover:border-blue-500/40 hover:bg-slate-800/30 transition-all group relative overflow-hidden h-72 flex flex-col justify-between"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                                        <Zap size={80} />
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div className="p-4 bg-slate-800 rounded-2xl group-hover:scale-110 group-hover:bg-blue-600/20 transition-all w-fit border border-slate-700">
                                            {getIcon(template.id)}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{template.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-mono mt-1">{template.roleCount} Role Modules</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                                        <span>Explore Blueprint</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))}

                            <div className="bg-slate-950/40 border border-slate-800/40 border-dashed p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-40 grayscale h-72">
                                <Plus size={32} className="text-slate-600 mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Custom Industry<br />Blueprints</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleTemplateMarketplace;
