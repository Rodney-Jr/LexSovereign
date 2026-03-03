import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    X,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    FileSearch,
    CheckCircle,
    AlertCircle,
    Clock,
    Zap
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';

interface AIIntelligenceSidebarProps {
    matterId: string;
    onClose: () => void;
    isOpen: boolean;
}

const AIIntelligenceSidebar: React.FC<AIIntelligenceSidebarProps> = ({ matterId, onClose, isOpen }) => {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [summary, setSummary] = useState<string>('');

    useEffect(() => {
        if (isOpen && matterId) {
            triggerAnalysis();
        }
    }, [isOpen, matterId]);

    const triggerAnalysis = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            // In a real scenario, we might check if analysis already exists.
            // For this demo, we trigger a fresh one.
            const res = await authorizedFetch('/api/ai/analyze-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matterId, content: "Full document body would go here..." }),
                token: session.token
            });

            setAnalysis(res);

            const summaryRes = await authorizedFetch('/api/ai/summarize-case', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matterId }),
                token: session.token
            });
            setSummary(summaryRes.summary);

        } catch (e) {
            console.error("AI Analysis Failed", e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed right-0 top-0 h-full w-[450px] bg-[#0a0c10] border-l border-slate-800 shadow-2xl z-[150] transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-sky-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-500/10 rounded-2xl">
                            <Sparkles className="text-sky-400 animate-pulse" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Sovereign Intelligence</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Advisory Layer | Active Analysis</p>
                        </div>
                    </div>
                    <button
                        title="Close Intelligence Sidebar"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-6">
                            <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                            <p className="text-xs text-slate-500 font-bold tracking-[0.2em] animate-pulse">ORCHESTRATING LLM PIPELINE...</p>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
                            {/* Risk Score */}
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all scale-150">
                                    <ShieldAlert size={100} />
                                </div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Exposure Score</h4>
                                <div className="flex items-end gap-4">
                                    <h2 className={`text-6xl font-black tracking-tighter ${analysis?.score > 0.7 ? 'text-rose-500' :
                                        analysis?.score > 0.4 ? 'text-amber-500' : 'text-emerald-500'
                                        }`}>
                                        {Math.round((analysis?.score || 0) * 100)}%
                                    </h2>
                                    <div className="mb-2 pb-1">
                                        {analysis?.score > 0.5 ? (
                                            <div className="flex items-center gap-1 text-rose-400 font-black text-[10px] uppercase">
                                                <TrendingUp size={12} /> Elevated Risk
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-emerald-400 font-black text-[10px] uppercase">
                                                <TrendingDown size={12} /> Low Exposure
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed italic">
                                    "AI Analysis indicates potential liability bottlenecks in standard indemnification clauses. Manual validation recommended."
                                </p>
                            </div>

                            {/* Auto Summary */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <FileSearch size={14} className="text-sky-400" />
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Automated Matter Summary</h4>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] text-sm text-slate-400 leading-relaxed italic border-l-4 border-l-sky-500 shadow-inner font-medium">
                                    {summary || "Analyzing matter documents to generate executive brief..."}
                                </div>
                            </div>

                            {/* Key Clauses */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <Zap size={14} className="text-amber-400" />
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identified Risks & Clauses</h4>
                                </div>
                                <div className="space-y-4">
                                    {analysis?.clauses?.map((clause: any, i: number) => (
                                        <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-start gap-4 hover:border-slate-700 transition-all">
                                            <div className={`p-2 rounded-lg ${clause.risk === 'High' ? 'bg-rose-500/20 text-rose-500' : 'bg-sky-500/20 text-sky-500'
                                                }`}>
                                                <AlertCircle size={16} />
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="text-xs font-bold text-white uppercase tracking-tight">{clause.type}</h5>
                                                <p className="text-[11px] text-slate-500 leading-relaxed">{clause.suggestion}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Advisory Disclaimer */}
                            <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-start gap-4">
                                <Clock className="text-slate-600 shrink-0 mt-1" size={18} />
                                <div className="space-y-1">
                                    <h5 className="font-bold text-[9px] text-slate-500 uppercase tracking-widest">ADVISORY PRINCIPLE</h5>
                                    <p className="text-[9px] text-slate-700 leading-relaxed italic uppercase">
                                        "NomosDesk AI generates insights for informational purposes ONLY. Final legal determination must be certified by human counsel."
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-800 bg-[#0c0e14] space-y-4">
                    <button className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-sky-900/20 flex items-center justify-center gap-3 active:scale-[0.98]">
                        <CheckCircle size={16} /> Certify Analysis
                    </button>
                    <button className="w-full py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98]">
                        Request Deep Peer Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIIntelligenceSidebar;
