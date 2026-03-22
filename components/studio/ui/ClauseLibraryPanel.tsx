import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, BookOpen, Plus, FileText, ChevronRight, X, Sparkles, Check } from 'lucide-react';
import { clauseApi, Clause } from '../../../utils/clauseApi';
import { useStudioStore } from '../hooks/useStudioStore';
import { useStudioToasts } from '../hooks/useStudioToasts';

const CATEGORIES = [
  'All',
  'NDA',
  'Employment',
  'Lease',
  'Banking',
  'Governance',
  'Indemnity',
  'Termination'
];

export const ClauseLibraryPanel: React.FC = () => {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const editor = useStudioStore((state) => state.editor);
  const { addToast } = useStudioToasts();

  const fetchClauses = useCallback(async () => {
    setLoading(true);
    try {
      const results = await clauseApi.list({
        search: searchQuery,
        category: category === 'All' ? undefined : category
      });
      setClauses(results);
    } catch (error) {
      console.error('Failed to fetch clauses:', error);
      addToast('Failed to load clause library', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, addToast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClauses();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchClauses]);

  const handleInsert = useCallback(async (clauseToInsert: Clause) => {
    if (!editor) {
      addToast('No active editor found', 'error');
      return;
    }

    try {
      // Fetch full content if not present
      const fullClause = await clauseApi.get(clauseToInsert.id);
      
      editor.chain().focus().insertContent(fullClause.content).run();
      
      addToast(`Inserted: ${fullClause.title}`, 'success');
      setIsPreviewOpen(false);
    } catch (error) {
      console.error('Insertion failed:', error);
      addToast('Failed to insert clause', 'error');
    }
  }, [editor, addToast]);

  return (
    <div className="flex flex-col h-full bg-[#07090C] text-slate-100 overflow-hidden relative">
      {/* 🔍 Search & Filter Bar */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search clauses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10px] whitespace-nowrap border transition-all ${
                category === cat 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 📚 Clause List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
             <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
             <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Scanning Repository...</span>
          </div>
        ) : clauses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center opacity-40 space-y-2">
            <BookOpen size={24} />
            <span className="text-xs">No clauses found</span>
          </div>
        ) : (
          clauses.map((clause) => (
            <button
              key={clause.id}
              onClick={() => {
                setSelectedClause(clause);
                setIsPreviewOpen(true);
              }}
              className="w-full text-left p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:border-emerald-500/30 hover:bg-slate-900 group transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col gap-1.5 isolate">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-wider">{clause.category}</span>
                  {clause.isGlobal && (
                    <span className="text-[8px] bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 text-slate-500">GLOBAL</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors line-clamp-1">{clause.title}</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {clause.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[8px] bg-slate-950/50 px-1.5 py-0.5 rounded text-slate-600">#{tag}</span>
                  ))}
                  {clause.tags.length > 2 && <span className="text-[8px] text-slate-600">+{clause.tags.length - 2}</span>}
                </div>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <ChevronRight size={14} className="text-emerald-500" />
              </div>
            </button>
          ))
        )}
      </div>

      {/* 🖼️ Side Preview Overlay */}
      {isPreviewOpen && selectedClause && (
        <div className="absolute inset-0 z-50 bg-[#07090C] border-l border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Clause Insight</span>
            </div>
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{selectedClause.category}</span>
              <h2 className="text-lg font-bold text-white tracking-tight">{selectedClause.title}</h2>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <FileText size={12} />
                PREVIEW PRE-RENDER
              </div>
              <div className="text-sm leading-relaxed text-slate-300 font-serif italic line-clamp-[12]">
                {/* We show a snippet message since we need to fetch full content during insertion */}
                Loading high-fidelity artifact content for precision insertion...
              </div>
            </div>

            <div className="space-y-3">
               <h5 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Attributes</h5>
               <div className="grid grid-cols-2 gap-2">
                 <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                   <div className="text-[8px] text-slate-500 uppercase">Jurisdiction</div>
                   <div className="text-[11px] font-bold">{selectedClause.jurisdiction}</div>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <div className="text-[8px] text-slate-500 uppercase">Usage Score</div>
                    <div className="text-[11px] font-bold text-emerald-500">{selectedClause.usageCount} COMMITS</div>
                 </div>
               </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-white/5 grid grid-cols-1 gap-3">
             <button
               onClick={() => handleInsert(selectedClause)}
               className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               <Plus size={14} /> Insert Into Artifact
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
