import React from 'react';
import { Maximize2, Minimize2, Minus, Move, X, ExternalLink } from 'lucide-react';
import { DraftingStudioProps } from './studio/domain/documentTypes';
import { useDraggableWindow } from './studio/hooks/useDraggableWindow';

export const DraftingStudio: React.FC<DraftingStudioProps> = ({ 
  initialData, 
  matterId,
  onClose 
}) => {
  const { win, onDragStart, onResizeStart, maximize, minimize } = useDraggableWindow();

  const windowStyle: React.CSSProperties = win.isMaximized
    ? { position: 'fixed', inset: 0, zIndex: 1000, borderRadius: 0 }
    : win.isMinimized
    ? { position: 'fixed', bottom: 24, right: 24, width: 320, height: 48, zIndex: 1000, overflow: 'hidden' }
    : { position: 'fixed', left: win.x, top: win.y, width: win.width, height: win.height, zIndex: 1000 };

  const effectiveMatterId = initialData?.matterId || matterId || '';
  const docId = initialData?.id || '';
  
  const sessionStr = localStorage.getItem('nomosdesk_session');
  const token = sessionStr ? JSON.parse(sessionStr).token : '';
  const title = encodeURIComponent(initialData?.name || 'Untitled');
  
  const studioUrl = import.meta.env.VITE_STUDIO_URL || 'http://localhost:3006';
  const iframeUrl = `${studioUrl}?matterId=${effectiveMatterId}&docId=${docId}&token=${token}&title=${title}`;

  const handlePopOut = () => {
    window.open(iframeUrl, '_blank');
    if (onClose) onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm pointer-events-none" />
      <div style={windowStyle} className="flex flex-col bg-[#07090C] text-slate-100 font-sans shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-slate-700/60 rounded-2xl overflow-hidden transition-[border-radius] duration-300">
        {!win.isMaximized && !win.isMinimized && (
          <>
            <div onMouseDown={(e) => onResizeStart(e, 'e')} className="absolute right-0 top-4 bottom-4 w-1.5 cursor-e-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            <div onMouseDown={(e) => onResizeStart(e, 'w')} className="absolute left-0 top-4 bottom-4 w-1.5 cursor-w-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            <div onMouseDown={(e) => onResizeStart(e, 's')} className="absolute bottom-0 left-4 right-4 h-1.5 cursor-s-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            <div onMouseDown={(e) => onResizeStart(e, 'n')} className="absolute top-0 left-4 right-4 h-1.5 cursor-n-resize z-20 hover:bg-brand-primary/40 rounded transition-colors" />
            <div onMouseDown={(e) => onResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20" />
            <div onMouseDown={(e) => onResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-20" />
            <div onMouseDown={(e) => onResizeStart(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-20" />
            <div onMouseDown={(e) => onResizeStart(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-20" />
          </>
        )}

        <div onMouseDown={onDragStart} className="h-10 flex-shrink-0 flex items-center justify-between px-4 bg-slate-950/70 border-b border-slate-800/60 cursor-grab active:cursor-grabbing select-none backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <Move size={12} className="text-slate-600" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sovereign Legal Studio</span>
            <span className="text-[9px] font-mono text-brand-primary/60 bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">v3.0</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handlePopOut} title="Pop-out to new tab" className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-lg">
              <ExternalLink size={13} />
            </button>
            <button onClick={minimize} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
              <Minus size={13} />
            </button>
            <button onClick={maximize} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg">
              {win.isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-900/60 rounded-lg">
              <X size={13} />
            </button>
          </div>
        </div>

        {!win.isMinimized && (
          <main className="flex-1 flex overflow-hidden min-h-0 bg-[#07090C]">
            <iframe 
              src={iframeUrl}
              className="w-full h-full border-none" 
              title="Sovereign Legal Studio"
            />
          </main>
        )}
      </div>
    </>
  );
};

export default DraftingStudio;
