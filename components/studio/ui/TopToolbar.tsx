/**
 * @file TopToolbar.tsx
 * @module NomosDesk/Studio/UI
 * @description Document-specific action toolbar (Zoom, Print, Save).
 */

import React from 'react';
import { 
  Printer, Save, Download, 
  ZoomIn, ZoomOut, Maximize2, Minimize2,
  GitBranch, Sparkles, Wand2,
  Bold, Italic, Type, List, ListOrdered,
  Menu, PanelLeft, PanelRight
} from 'lucide-react';
import { StudioMode } from '../domain/documentTypes';
import { useStudioStore } from '../hooks/useStudioStore';

interface TopToolbarProps {
  // Added toggle handlers for panels
  onToggleLeft?: () => void;
  onToggleRight?: () => void;
  onPrint: () => void;
  onCommit: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ 
  onToggleLeft,
  onToggleRight,
  onPrint, 
  onCommit 
}) => {
  const { 
    activeMode, zoom, isSaving, 
    toggleBold, toggleItalic, toggleHeading, 
    setZoom 
  } = useStudioStore();

  const handleZoom = (delta: number) => {
    setZoom(Math.min(1.5, Math.max(0.4, zoom + delta)));
  };

  return (
    <div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 z-10 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Toggle Left Sidebar */}
        <button 
          onClick={onToggleLeft}
          title="Toggle Navigator / Library"
          className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-500 transition-all active:scale-90 border border-transparent hover:border-slate-700/50"
        >
          <PanelLeft size={18} />
        </button>

        <div className="flex items-center gap-6 border-l border-slate-800/50 pl-4">
          {/* Workspace Controls */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 shadow-inner">
              <button 
                title="Zoom Out"
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <ZoomOut size={16} />
              </button>
              <div className="w-12 flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button 
                title="Zoom In"
                onClick={() => handleZoom(0.1)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Formatting Controls (TipTap Powered) */}
          <div className="flex items-center gap-1 pl-6 border-l border-slate-800/50">
            <button 
              onClick={toggleBold}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={toggleItalic}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button 
              onClick={() => toggleHeading(1)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
              title="Heading 1"
            >
              <Type size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-slate-800/50">
          {activeMode === 'studio' && (
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-500" size={14} />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">AI Synthesis Active</span>
            </div>
          )}
        </div>

        <button 
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700 shadow-lg active:scale-95"
        >
          <Printer size={16} />
          <span className="hidden sm:inline">Print</span>
        </button>
        <button 
          onClick={onCommit}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-xl ${
            isSaving 
              ? 'bg-slate-800 text-slate-600 grayscale' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? 'Vaulting...' : 'Commit'}</span>
        </button>

        {/* Toggle Right Sidebar */}
        <button 
          onClick={onToggleRight}
          title="Toggle Intelligence Sidebar"
          className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-amber-500 transition-all active:scale-90 border border-transparent hover:border-slate-700/50"
        >
          <PanelRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(TopToolbar);
