/**
 * @file LeftNavigator.tsx
 * @module NomosDesk/Studio/UI
 * @description Document Structure and Sector Navigator.
 */

import React from 'react';
import { Library, Info, ChevronRight, Bookmark, BookOpen } from 'lucide-react';

import { ClauseLibraryPanel } from './ClauseLibraryPanel';

interface LeftNavigatorProps {
  isVisible: boolean;
  onToggle: () => void;
  sections?: string[];
  style?: React.CSSProperties;
}

export const LeftNavigator: React.FC<LeftNavigatorProps> = ({ 
  isVisible, 
  onToggle, 
  sections = ['Preamble', 'Definitions', 'Obligations', 'Dispute Resolution', 'Execution'],
  style
}) => {
  const [activeTab, setActiveTab] = React.useState<'nav' | 'lib'>('nav');

  return (
    <aside 
      className={`h-full border-r border-slate-800 bg-[#07090C] overflow-hidden flex flex-col transition-colors duration-300`}
      style={style}
    >
      {/* 🧭 OS-Style Tab Switcher */}
      <div className="h-12 flex-shrink-0 grid grid-cols-2 border-b border-white/5 bg-slate-950/20">
        <button
          onClick={() => setActiveTab('nav')}
          className={`flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'nav' 
              ? 'text-emerald-500 bg-white/3' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Library size={12} /> Navigator
          {activeTab === 'nav' && <div className="absolute bottom-0 h-0.5 w-12 bg-emerald-500 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('lib')}
          className={`flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'lib' 
              ? 'text-emerald-500 bg-white/3' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookOpen size={12} /> Library
          {activeTab === 'lib' && <div className="absolute bottom-0 h-0.5 w-12 bg-emerald-500 rounded-full" />}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'nav' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2 py-6 custom-scrollbar">
            {sections.map((sec, i) => (
              <button 
                key={`${sec}-${i}`}
                className="w-full text-left p-4 rounded-2xl hover:bg-slate-900 group transition-all duration-300 border border-transparent hover:border-emerald-500/20 active:scale-[0.98] h-14 overflow-hidden relative"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-lg bg-slate-950 flex items-center justify-center text-[10px] font-mono text-slate-500 group-hover:text-emerald-400 border border-slate-800 transition-colors">
                    {i + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{sec}</span>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ChevronRight size={14} className="text-emerald-500" />
                </div>
              </button>
            ))}
            
            <div className="pt-8 px-2">
              <div className="p-5 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 space-y-3 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-all" />
                <div className="flex items-center gap-2 mb-2">
                  <Bookmark className="text-emerald-500" size={14} />
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Counselor Insight</h4>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500 font-medium">Standard A-3 type structure detected for regional jurisdictional compliance.</p>
              </div>
            </div>
          </div>
        ) : (
          <ClauseLibraryPanel />
        )}
      </div>
    </aside>
  );
};

export default React.memo(LeftNavigator);
