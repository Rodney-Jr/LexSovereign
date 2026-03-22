/**
 * @file SavingOverlay.tsx
 * @module NomosDesk/Studio/UI
 * @description Professional saving indicator with cryptographic hashing simulation.
 */

import React from 'react';
import { Loader2, ShieldCheck, Database } from 'lucide-react';

interface SavingOverlayProps {
  isSaving: boolean;
  isCompleted?: boolean;
}

export const SavingOverlay: React.FC<SavingOverlayProps> = ({ 
  isSaving, 
}) => {
  if (!isSaving) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="text-slate-600" size={24} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white tracking-tight uppercase">Vaulting Artifact</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Generating cryptographic hash and initializing redundant storage silos...
          </p>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-progress origin-left"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SavingOverlay);
