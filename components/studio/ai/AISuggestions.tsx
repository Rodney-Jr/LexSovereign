import React from 'react';
import { Sparkles, Info, PlusCircle, Maximize2 } from 'lucide-react';

interface Suggestion {
  title: string;
  previewText: string;
  reason: string;
  clause: any;
}

interface AISuggestionsProps {
  suggestions: Suggestion[];
  onInsert: (suggestion: Suggestion) => void;
  onPreview: (suggestion: Suggestion) => void;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ 
  suggestions, 
  onInsert,
  onPreview 
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:animate-pulse" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Sovereign AI Suggestions
        </h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="group relative bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] ring-1 ring-white/5"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                {suggestion.title}
              </h4>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-black tracking-widest">RANK #1</span>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">
              "{suggestion.previewText}"
            </p>

            <div className="flex items-start gap-2 bg-black/30 p-2 rounded-lg mb-4 border border-white/5">
              <Info className="w-3.5 h-3.5 text-indigo-400 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-tight">
                <span className="text-indigo-400 font-bold uppercase tracking-tighter">Why this is suggested: </span>
                {suggestion.reason}
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onInsert(suggestion)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                INSERT NOW
              </button>
              <button 
                onClick={() => onPreview(suggestion)}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 transition-all hover:text-white"
                title="Preview full clause"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
