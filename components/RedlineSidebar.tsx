import React from 'react';
import { Check, X, Clock, BrainCircuit, ShieldAlert } from 'lucide-react';
import { TextDiff } from '../hooks/useDocumentState';

interface RedlineSidebarProps {
  diffs: TextDiff[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const RedlineSidebar: React.FC<RedlineSidebarProps> = ({ 
  diffs, 
  onAccept, 
  onReject 
}) => {
  const pendingDiffs = diffs.filter(d => d.status === 'pending');

  return (
    <div className="redline-sidebar flex flex-col h-full bg-[#0E1117] border-l border-slate-800 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
          <BrainCircuit size={16} /> Audit Trail
        </h3>
        <span className="bg-slate-800 text-slate-400 text-[9px] px-2 py-0.5 rounded-full font-mono">
          {pendingDiffs.length} PENDING
        </span>
      </div>

      {pendingDiffs.length === 0 ? (
        <div className="empty-state h-[400px] flex flex-col items-center justify-center text-center px-4">
          <ShieldAlert size={32} className="text-slate-700 mb-4 opacity-20" />
          <p className="text-[11px] text-slate-500 italic leading-relaxed">
            The document is functionally congruent. No unresolved tracked changes detected.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingDiffs.map((diff) => (
            <div 
              key={diff.id} 
              className={`change-card p-4 rounded-xl border border-slate-800 transition-all ${diff.type === 'insert' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}
            >
              {/* Card Meta */}
              <div className="flex items-center justify-between mb-3 text-[9px] uppercase font-black tracking-widest">
                <span className={diff.type === 'insert' ? 'text-emerald-400' : 'text-red-400'}>
                  {diff.type === 'insert' ? 'Addition' : 'Deletion'}
                </span>
                <span className="text-slate-500 flex items-center gap-1 opacity-60">
                  <Clock size={10} /> {new Date(diff.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Author & Context */}
              <div className="text-[12px] text-white font-bold mb-2 flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                    {diff.author[0]}
                 </div>
                 <span>Counsel: {diff.author}</span>
              </div>

              {/* Excerpt */}
              <div className="text-[11px] text-slate-400 leading-relaxed italic mb-4 p-3 bg-black/20 rounded-lg border border-white/5">
                "{diff.value.length > 80 ? diff.value.substring(0, 80) + '...' : diff.value}"
              </div>

              {/* Governance Actions */}
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => onAccept(diff.id)}
                   className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-lg hover:bg-emerald-400 transition-all"
                 >
                   <Check size={14} /> Accept
                 </button>
                 <button 
                   onClick={() => onReject(diff.id)}
                   className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-slate-800 text-slate-300 text-[10px] font-black uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all border border-white/5"
                 >
                   <X size={14} /> Reject
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Persistence Note */}
      <div className="mt-12 p-4 rounded-xl bg-slate-900 border border-slate-800 opacity-60">
        <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-tighter">
          Unresolved changes prevent "Commit to Vault" operations. Ensuring structural integrity before final hashing.
        </p>
      </div>
    </div>
  );
};
