/**
 * @file ModeSwitcher.tsx
 * @module NomosDesk/Studio/UI
 * @description Config-driven dynamic switcher for Legal Workspace modes.
 */

import React from 'react';
import { Edit3, Eye, GitBranch, Sparkles } from 'lucide-react';
import { StudioMode } from '../domain/documentTypes';

export const MODES_CONFIG = {
  draft: { label: 'Draft', icon: Edit3, color: 'emerald' },
  review: { label: 'Review', icon: Eye, color: 'blue' },
  compare: { label: 'Compare', icon: GitBranch, color: 'purple' },
  studio: { label: 'AI Studio', icon: Sparkles, color: 'amber' }
} as const;

interface ModeSwitcherProps {
  activeMode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ 
  activeMode, 
  onModeChange 
}) => {
  return (
    <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
      {(Object.keys(MODES_CONFIG) as StudioMode[]).map((mode) => {
        const config = MODES_CONFIG[mode];
        const Icon = config.icon;
        const isActive = activeMode === mode;
        const activeClass = mode === 'draft' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5' :
                            mode === 'review' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/5' :
                            mode === 'compare' ? 'bg-purple-500/20 text-purple-400 border-purple-500/20 shadow-lg shadow-purple-500/5' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/5';

        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-300 font-bold border grow shrink-0 min-w-[124px] justify-center text-xs tracking-tight ${
              isActive ? activeClass : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <Icon size={16} />
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(ModeSwitcher);
