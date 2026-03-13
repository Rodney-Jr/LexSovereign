
import React, { useState } from 'react';
import { X, Search, FileText, ChevronRight, Shield, MapPin, Loader2 } from 'lucide-react';
import { DocumentMetadata } from '../types';

interface DocumentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    documents: DocumentMetadata[];
    onSelect: (doc: DocumentMetadata) => void;
}

const DocumentSelectorModal: React.FC<DocumentSelectorModalProps> = ({ isOpen, onClose, documents, onSelect }) => {
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        (doc.matterId?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );

    const handleSelect = (doc: DocumentMetadata) => {
        setIsLoading(true);
        // We set loading because the parent will fetch content usually
        onSelect(doc);
        setTimeout(() => setIsLoading(false), 800);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[80vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Vault Selection</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Select an artifact to mount in the Studio</p>
                    </div>
                    <button onClick={onClose} title="Close Selector" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-slate-800/50 bg-slate-950/30">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search Vault by filename or matter..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredDocs.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border border-slate-700/50">
                                <Search size={24} className="text-slate-600" />
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No matching artifacts found</p>
                        </div>
                    ) : (
                        filteredDocs.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => !isLoading && handleSelect(doc)}
                                className={`group p-4 bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${isLoading ? 'opacity-50' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                                        <FileText size={20} className="text-slate-400 group-hover:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{doc.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[150px]">{doc.matterId || 'MT-GENERAL'}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                                            <div className="flex items-center gap-1 text-[9px] text-slate-600">
                                                <MapPin size={10} />
                                                <span>{doc.region} SILO</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                        {doc.classification}
                                    </span>
                                    <ChevronRight size={16} className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        {filteredDocs.length} Artifacts Visible
                    </span>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                            <Loader2 className="animate-spin" size={12} />
                            Fetching Enclave Data
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentSelectorModal;
