/**
 * @file DraftingStudio.tsx
 * @module NomosDesk/Studio
 * @description Enterprise-grade floating legal drafting studio.
 * Features: Draggable window, resizable panels, TipTap engine.
 */

import React, { useEffect, useCallback, useState } from 'react';
import { Maximize2, Minimize2, Minus, Move, X, Sparkles } from 'lucide-react';
import { useDocumentState } from '../hooks/useDocumentState';
import { DraftingStudioProps } from './studio/domain/documentTypes';

// --- Modular UI Architecture ---
import { ModeSwitcher } from './studio/ui/ModeSwitcher';
import { LeftNavigator } from './studio/ui/LeftNavigator';
import { CanvasArea } from './studio/ui/CanvasArea';
import { RightPanel } from './studio/ui/RightPanel';
import { TopToolbar } from './studio/ui/TopToolbar';
import { SavingOverlay } from './studio/ui/SavingOverlay';
import { StudioToasts } from './studio/ui/StudioToasts';
import { ResizableDivider } from './studio/ui/ResizableDivider';

// --- Enterprise Logic Hooks ---
import { useStudioState } from './studio/hooks/useStudioState';
import { useDocumentMetrics } from './studio/hooks/useDocumentMetrics';
import { useVaultCommit } from './studio/hooks/useVaultCommit';
import { useStudioToasts } from './studio/hooks/useStudioToasts';
import { useDraggableWindow } from './studio/hooks/useDraggableWindow';

export const DraftingStudio: React.FC<DraftingStudioProps> = ({ 
  initialData, 
  onSave, 
  onClose 
}) => {
  const [templateLoading, setTemplateLoading] = useState(false);
  // --- Helix 1: Canonical State Machine ---
  const { rawContent, diffs, metadata, actions } = useDocumentState(initialData?.content || "");
  
  // --- Helix 2: Workspace Logic Architecture ---
  const { activeMode, panels, zoom, isSaving, isSearching, actions: studioActions } = useStudioState();
  const metrics = useDocumentMetrics(rawContent);
  const { toasts, addToast, removeToast } = useStudioToasts();
  const { commitToVault, isCommitLoading } = useVaultCommit(onSave);

  // --- Helix 3: Window & Panel Geometry ---
  const { win, onDragStart, onResizeStart, maximize, minimize } = useDraggableWindow();
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(320);

  const handleResizeLeft = useCallback((delta: number) => {
    setLeftWidth(prev => Math.max(160, Math.min(400, prev + delta)));
  }, []);

  const handleResizeRight = useCallback((delta: number) => {
    setRightWidth(prev => Math.max(200, Math.min(480, prev - delta)));
  }, []);

  // --- Handlers ---
  const handleCommit = useCallback(async () => {
    await commitToVault(
      initialData?.name || "UNTITLED", 
      rawContent, 
      diffs, 
      addToast, 
      initialData?.id
    );
  }, [commitToVault, initialData?.name, initialData?.id, rawContent, diffs, addToast]);

  const handlePrint = useCallback(() => {
    addToast('Initializing physical rendering engine...', 'info');
    window.print();
  }, [addToast]);

  const handleSmartFill = useCallback(async () => {
    const matterId = initialData?.matterId;
    if (!matterId) {
      addToast('No matter context found for Smart Fill. Please associate a matter first.', 'warning');
      return;
    }
    const success = await actions.performSmartFill(matterId);
    if (success) {
      addToast('Drafting Enclave: Smart Fill Completed Successfully.', 'success');
    } else {
      addToast('Drafting Enclave: Smart Fill Failed. Check your AI credits.', 'error');
    }
  }, [initialData?.matterId, actions, addToast]);

  useEffect(() => {
    console.log(`[STUDIO] Initialized for Matter: ${metadata.matterId}`);
  }, [metadata.matterId]);

  // --- Window Geometry ---
  const windowStyle: React.CSSProperties = win.isMaximized
    ? { position: 'fixed', inset: 0, zIndex: 1000, borderRadius: 0 }
    : win.isMinimized
    ? { 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        width: 320, 
        height: 48, 
        zIndex: 1000,
        overflow: 'hidden'
      }
    : {
        position: 'fixed',
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: 1000,
      };

  return (
    <>
      {/* Backdrop blur overlay */}
      <div 
        className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Floating Window */}
      <div
        style={windowStyle}
        className="flex flex-col bg-[#07090C] text-slate-100 font-sans shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-slate-700/60 rounded-2xl overflow-hidden transition-[border-radius] duration-300"
      >
        {/* === Resize Handles (outer edges) === */}
        {!win.isMaximized && !win.isMinimized && (
          <>
            {/* Right edge */}
            <div onMouseDown={(e) => onResizeStart(e, 'e')} className="absolute right-0 top-4 bottom-4 w-1.5 cursor-e-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            {/* Left edge */}
            <div onMouseDown={(e) => onResizeStart(e, 'w')} className="absolute left-0 top-4 bottom-4 w-1.5 cursor-w-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            {/* Bottom edge */}
            <div onMouseDown={(e) => onResizeStart(e, 's')} className="absolute bottom-0 left-4 right-4 h-1.5 cursor-s-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            {/* Top edge */}
            <div onMouseDown={(e) => onResizeStart(e, 'n')} className="absolute top-0 left-4 right-4 h-1.5 cursor-n-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            {/* Corners */}
            <div onMouseDown={(e) => onResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20" />
            <div onMouseDown={(e) => onResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-20" />
            <div onMouseDown={(e) => onResizeStart(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-20" />
            <div onMouseDown={(e) => onResizeStart(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-20" />
          </>
        )}

        {/* === Window Chrome (Draggable Title Bar) === */}
        <div
          onMouseDown={onDragStart}
          className="h-10 flex-shrink-0 flex items-center justify-between px-4 bg-slate-950/70 border-b border-slate-800/60 cursor-grab active:cursor-grabbing select-none backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5">
            <Move size={12} className="text-slate-600" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Sovereign Legal Studio
            </span>
            <span className="text-[9px] font-mono text-brand-primary/60 bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
              v2.0
            </span>
            {metadata.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/40" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={minimize}
              title={win.isMinimized ? 'Restore' : 'Minimize'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={maximize}
              title={win.isMaximized ? 'Restore' : 'Maximize'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
            >
              {win.isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button
              onClick={onClose}
              title="Close Studio"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-900/60 hover:border-red-700/40 border border-transparent transition-all active:scale-90"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Hide content when minimized */}
        {!win.isMinimized && (
          <>
            {/* 🚀 Mode Governance */}
            <div className="h-12 bg-slate-950 flex items-center justify-center border-b border-slate-800 px-6 flex-shrink-0">
              <ModeSwitcher 
                activeMode={activeMode} 
                onModeChange={studioActions.setMode} 
              />
            </div>

            {/* === Main 3-Panel Layout === */}
            <main className="flex-1 flex overflow-hidden min-h-0">
              
              {/* 🧭 Left Navigator (Resizable) */}
              {panels.left && (
                <>
                  <LeftNavigator 
                    isVisible={panels.left}
                    style={{ width: leftWidth, flexShrink: 0 }}
                    onToggle={() => studioActions.togglePanel('left')} 
                  />
                  <ResizableDivider onResize={handleResizeLeft} />
                </>
              )}

              {/* 📝 Canvas Area */}
              <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
                <TopToolbar 
                  onToggleLeft={() => studioActions.togglePanel('left')}
                  onToggleRight={() => studioActions.togglePanel('right')}
                  onPrint={handlePrint}
                  onCommit={handleCommit}
                />
                <CanvasArea 
                  activeMode={activeMode}
                  rawContent={rawContent}
                  diffs={diffs}
                  zoom={zoom}
                  onUpdate={actions.updateContent}
                />
                <footer className="h-8 flex-shrink-0 border-t border-slate-800/60 bg-slate-950/80 flex items-center justify-between px-5">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-tighter">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/10" />
                      Words: <span className="text-white font-bold">{metrics.wordCount}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-tighter">
                      Read: <span className="text-white font-bold">{metrics.readingTime}m</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
                    DAS-256 <span className="text-emerald-500/50">●</span>
                  </div>
                </footer>
              </div>

              {/* 🧠 Right Intelligence Panel (Resizable) */}
              {panels.right && (
                <>
                  <ResizableDivider onResize={handleResizeRight} />
                  <RightPanel 
                    isVisible={panels.right}
                    activeMode={activeMode}
                    diffs={diffs}
                    rawContent={rawContent}
                    isSearching={isSearching}
                    onAccept={(id) => actions.acceptChange(id)}
                    onReject={(id) => actions.rejectChange(id)}
                    onSmartFill={handleSmartFill}
                    onToggle={() => studioActions.togglePanel('right')}
                    style={{ width: rightWidth, flexShrink: 0 }}
                  />
                </>
              )}
            </main>

            {/* 💾 Overlays */}
            <SavingOverlay isSaving={isCommitLoading} />
            <StudioToasts toasts={toasts} onRemove={removeToast} />
          </>
        )}
      </div>
    </>
  );
};

export default DraftingStudio;
