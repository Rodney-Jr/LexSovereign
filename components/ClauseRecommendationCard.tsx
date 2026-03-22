/**
 * @file ClauseRecommendationCard.tsx
 * @module NomosDesk/Studio/UI
 * @description Card component for displaying clause recommendations.
 */

import React from 'react';
import { ArrowLeftRight, FileText, Plus, ShieldCheck } from 'lucide-react';

interface ClauseRecommendationCardProps {
  title: string;
  similarity: number;
  onCompare: () => void;
  onSwap: () => void;
}

const ClauseRecommendationCard: React.FC<ClauseRecommendationCardProps> = ({
  title,
  similarity,
  onCompare,
  onSwap
}) => {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all group overflow-hidden relative shadow-lg">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-all"></div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{title}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
            <ShieldCheck size={10} className="text-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary">{similarity}% Match</span>
          </div>
        </div>
        
        <p className="text-[11px] text-slate-400 leading-relaxed font-serif line-clamp-2 italic">
          High-fidelity jurisdictional compliance detected. Recommended replacement for standard liability limitations.
        </p>

        <div className="flex gap-2 pt-1">
          <button 
            onClick={onCompare}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeftRight size={12} /> Compare
          </button>
          <button 
            onClick={onSwap}
            className="flex-1 py-1.5 bg-brand-primary text-brand-bg hover:opacity-90 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-brand-primary/10 flex items-center justify-center gap-2"
          >
            <Plus size={12} /> Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ClauseRecommendationCard);
