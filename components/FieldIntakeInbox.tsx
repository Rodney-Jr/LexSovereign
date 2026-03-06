import React, { useState } from 'react';
import { FieldIntakeDocument, Matter } from '../types';
import { FileUp, Link2, CheckCircle, Trash2, Tag } from 'lucide-react';

interface FieldIntakeInboxProps {
    documents: FieldIntakeDocument[];
    matters: Matter[];
    onAttach: (docId: string, matterId: string) => void;
    onReject: (docId: string) => void;
}

const FieldIntakeInbox: React.FC<FieldIntakeInboxProps> = ({ documents, matters, onAttach, onReject }) => {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [targetMatter, setTargetMatter] = useState<string>('');

    const pendingDocs = documents.filter(d => d.status === 'PENDING');

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <FileUp className="text-blue-400 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-white">Global Field Intake Inbox</h2>
                </div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    {pendingDocs.length} Pending Documents
                </span>
            </div>

            <div className="divide-y divide-slate-800">
                {pendingDocs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Inbox is clear. All field documents have been triaged.</p>
                    </div>
                ) : (
                    pendingDocs.map((doc) => (
                        <div key={doc.id} className="p-4 hover:bg-slate-800/50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700">
                                        {doc.previewUrl ? (
                                            <img src={doc.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <FileUp className="text-slate-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">{doc.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400">By: {doc.uploadedBy}</span>
                                            <span className="text-xs text-slate-500">•</span>
                                            <span className="text-xs text-slate-400">{doc.uploadedAt}</span>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                                                <Tag size={10} /> {doc.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        aria-label="Select Matter"
                                        className="bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                                        value={selectedDoc === doc.id ? targetMatter : ''}
                                        onChange={(e) => {
                                            setSelectedDoc(doc.id);
                                            setTargetMatter(e.target.value);
                                        }}
                                    >
                                        <option value="">Select Matter...</option>
                                        {matters.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>

                                    <button
                                        disabled={!targetMatter || selectedDoc !== doc.id}
                                        onClick={() => onAttach(doc.id, targetMatter)}
                                        className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
                                        title="Attach to Matter"
                                    >
                                        <Link2 size={18} />
                                    </button>

                                    <button
                                        onClick={() => onReject(doc.id)}
                                        className="p-2 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                        title="Reject/Archive"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            {doc.notes && (
                                <div className="mt-3 p-2 bg-slate-950/50 rounded text-xs text-slate-400 border-l-2 border-blue-500/50">
                                    Note: {doc.notes}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FieldIntakeInbox;
