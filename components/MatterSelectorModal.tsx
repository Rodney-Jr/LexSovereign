import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    Filter,
    ArrowRight,
    Plus,
    Briefcase,
    Scale,
    FileText,
    Clock,
    User,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { authorizedFetch, getSavedSession } from '../utils/api';
import { Matter, AppMode } from '../types';
import MatterCreationModal from './MatterCreationModal';
import CaseIntakeModal from './CaseIntakeModal';
import CLMIntakeModal from './CLMIntakeModal';

interface MatterSelectorModalProps {
    targetType: 'CASE' | 'CLM';
    onClose: () => void;
    onSelected: (matter: Matter) => void;
}

const MatterSelectorModal: React.FC<MatterSelectorModalProps> = ({ targetType, onClose, onSelected }) => {
    const [matters, setMatters] = useState<Matter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreation, setShowCreation] = useState(false);
    const [specializingMatter, setSpecializingMatter] = useState<Matter | null>(null);

    useEffect(() => {
        fetchMatters();
    }, []);

    const fetchMatters = async () => {
        setLoading(true);
        try {
            const session = getSavedSession();
            if (!session?.token) return;

            const data = await authorizedFetch('/api/matters', { token: session.token });
            if (Array.isArray(data)) {
                setMatters(data);
            }
        } catch (e) {
            console.error("Failed to fetch matters:", e);
        } finally {
            setLoading(false);
        }
    };

    const filteredMatters = matters.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAction = (matter: Matter) => {
        const isSpecialized = (targetType === 'CASE' && matter.type === 'Case') ||
            (targetType === 'CLM' && matter.type === 'Contract');

        if (isSpecialized) {
            onSelected(matter);
        } else {
            // Needs promotion
            setSpecializingMatter(matter);
        }
    };

    if (showCreation) {
        return (
            <MatterCreationModal
                mode={targetType === 'CASE' ? AppMode.LAW_FIRM : AppMode.ENTERPRISE}
                userId={(getSavedSession() as any)?.userId}
                tenantId={(getSavedSession() as any)?.tenantId}
                onClose={() => setShowCreation(false)}
                onCreated={(m) => {
                    setShowCreation(false);
                    fetchMatters();
                }}
            />
        );
    }

    if (specializingMatter) {
        if (targetType === 'CASE') {
            return (
                <CaseIntakeModal
                    existingMatterId={specializingMatter.id}
                    initialData={{ name: specializingMatter.name, client: specializingMatter.client }}
                    onClose={() => setSpecializingMatter(null)}
                    onCreated={(m) => {
                        onSelected(m);
                    }}
                />
            );
        } else {
            return (
                <CLMIntakeModal
                    existingMatterId={specializingMatter.id}
                    initialData={{
                        name: specializingMatter.name,
                        client: specializingMatter.client,
                        description: specializingMatter.description
                    }}
                    onClose={() => setSpecializingMatter(null)}
                    onCreated={(m) => {
                        onSelected(m);
                    }}
                />
            );
        }
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#0a0c10] border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-10 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl border ${targetType === 'CASE' ? 'bg-sky-500/10 border-sky-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            {targetType === 'CASE' ? <Scale className="text-sky-400" size={32} /> : <FileText className="text-emerald-400" size={32} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Select Record to Manage</h2>
                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Target Focus: {targetType === 'CASE' ? 'Litigation & Advisory' : 'Contract Lifecycle'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} title="Close Selector" className="p-3 hover:bg-slate-800/50 rounded-2xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-slate-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Sub-Header / Search */}
                <div className="px-10 py-6 border-b border-slate-800/30 flex items-center gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={20} />
                        <input
                            placeholder="Search by Matter ID, Title, or Client..."
                            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-2xl py-4 pl-16 pr-8 text-white text-sm outline-none transition-all placeholder:text-slate-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowCreation(true)}
                        title="Incept New Matter"
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest text-white transition-all active:scale-95"
                    >
                        <Plus size={18} /> Incept New Matter
                    </button>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-10 h-10 border-4 border-slate-800 border-t-white rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scanning Sovereign Index...</p>
                        </div>
                    ) : filteredMatters.length > 0 ? (
                        filteredMatters.map(matter => {
                            const isSpecialized = (targetType === 'CASE' && matter.type === 'Case') ||
                                (targetType === 'CLM' && matter.type === 'Contract');
                            const isWrongSpec = (targetType === 'CASE' && matter.type === 'Contract') ||
                                (targetType === 'CLM' && matter.type === 'Case');

                            if (isWrongSpec) return null; // Hide mismatched specialized records

                            return (
                                <button
                                    key={matter.id}
                                    title={`Manage ${matter.name}`}
                                    onClick={() => handleAction(matter)}
                                    className="w-full p-6 bg-slate-900/30 border border-slate-800/50 hover:border-slate-600 rounded-[2rem] flex items-center justify-between group transition-all text-left"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${isSpecialized ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-600 group-hover:text-amber-400'} transition-all`}>
                                            <Briefcase size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{matter.name}</h4>
                                                {isSpecialized ? (
                                                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Active {targetType}</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500 uppercase tracking-tighter">Ready for Specialization</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><User size={12} /> {matter.client}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> Established {new Date(matter.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pr-4">
                                        <span className={`text-[9px] font-black uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100 ${isSpecialized ? 'text-emerald-400' : 'text-blue-400'}`}>
                                            {isSpecialized ? 'Access Dashboard' : 'Specialize Record'}
                                        </span>
                                        <div className="p-2 rounded-xl bg-slate-900 text-slate-700 group-hover:text-white transition-all group-hover:translate-x-1">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                            <div className="p-8 bg-slate-950 rounded-full border border-slate-900">
                                <SearchX size={48} className="text-slate-700" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold text-white uppercase italic tracking-tight">No Matching Records</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                    The enclave could not find any matters matching your criteria. Try adjusting your search or initiate a new inception protocol.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-8 border-t border-slate-800/50 bg-slate-900/10 flex items-center justify-between">
                    <p className="text-[10px] text-slate-600 font-mono italic">
                        "Sovereign Record Selector | Validating tokens for <b>{filteredMatters.length}</b> candidates"
                    </p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Index: Syncing Nominal
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatterSelectorModal;
