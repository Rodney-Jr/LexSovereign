import React from 'react';
import { BookOpen, BookCheck, ExternalLink, ChevronRight } from 'lucide-react';

interface ClauseMatch {
  id: string;
  title: string;
  category: string;
  content: any;
}

interface ClauseMatchesProps {
  matches: ClauseMatch[];
  onSelect: (match: ClauseMatch) => void;
  onPreview: (match: ClauseMatch) => void;
}

export const ClauseMatches: React.FC<ClauseMatchesProps> = ({ matches, onSelect, onPreview }) => {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Sovereign Standard Matches
        </h3>
      </div>

      <div className="space-y-2.5">
        {matches.map((match) => (
          <div 
            key={match.id}
            className="group flex flex-col p-3.5 bg-slate-900 border border-slate-700/50 hover:border-blue-500/30 rounded-xl transition-all hover:bg-slate-800/80 cursor-pointer shadow-sm relative overflow-hidden"
          >
            {/* Hover Accent */}
            <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase font-black text-blue-400/70 tracking-tighter">
                {match.category} Standard
              </span>
              <BookCheck className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>

            <div className="flex justify-between items-center group-hover:translate-x-1.5 transition-transform duration-300">
              <h4 className="text-sm font-semibold text-slate-100 line-clamp-1 flex-1">
                {match.title}
              </h4>
              <div className="flex items-center gap-1.5 ml-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPreview(match); }}
                  className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full text-center py-2 text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest font-bold border-t border-slate-800 mt-2 transition-colors">
        Browse Library (Full Enclave)
      </button>
    </div>
  );
};
