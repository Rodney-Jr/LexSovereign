/**
 * @file StudioHeader.tsx
 * @module NomosDesk/Studio/UI
 * @description The high-fidelity top-level navigation and brand header.
 */

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface StudioHeaderProps {
  matterId: string;
  firmId: string;
  isDirty: boolean;
  onClose?: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({ 
  matterId, 
  firmId, 
  isDirty, 
  onClose 
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <ShieldCheck className="text-emerald-500" size={20} />
        </div>
        <div>
          <h2 className="text-xs font-black text-white tracking-widest uppercase">Drafting Studio <span className="text-slate-600">v2.0</span></h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-mono">{matterId}</span>
            <span className="text-[10px] text-slate-500 font-mono tracking-tighter">/ {firmId}</span>
            {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Unsaved Changes"></span>}
          </div>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-95"
      >
        <X size={20} />
      </button>
    </header>
  );
};

export default React.memo(StudioHeader);
