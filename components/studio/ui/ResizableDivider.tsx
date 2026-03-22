/**
 * @file ResizableDivider.tsx
 * @module NomosDesk/Studio/UI
 * @description Drag handle between resizable panels.
 */

import React, { useCallback, useRef } from 'react';

interface ResizableDividerProps {
  onResize: (delta: number) => void;
  orientation?: 'vertical' | 'horizontal';
}

export const ResizableDivider: React.FC<ResizableDividerProps> = ({ 
  onResize,
  orientation = 'vertical'
}) => {
  const isDragging = useRef(false);
  const lastPos = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = orientation === 'vertical' ? e.clientX : e.clientY;
    e.preventDefault();

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const pos = orientation === 'vertical' ? ev.clientX : ev.clientY;
      const delta = pos - lastPos.current;
      lastPos.current = pos;
      onResize(delta);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onResize, orientation]);

  if (orientation === 'vertical') {
    return (
      <div
        onMouseDown={onMouseDown}
        className="w-1 flex-shrink-0 relative group cursor-col-resize select-none z-10"
        title="Drag to resize"
      >
        {/* Invisible wider hit-target */}
        <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
        {/* Visible indicator that brightens on hover */}
        <div className="h-full w-full bg-slate-800 group-hover:bg-brand-primary/60 transition-colors duration-150" />
        {/* Center dot indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {[0,1,2].map(i => (
            <div key={i} className="w-0.5 h-3 bg-brand-primary/80 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseDown={onMouseDown}
      className="h-1 flex-shrink-0 relative group cursor-row-resize select-none z-10"
      title="Drag to resize"
    >
      <div className="absolute inset-x-0 -top-1.5 -bottom-1.5" />
      <div className="w-full h-full bg-slate-800 group-hover:bg-brand-primary/60 transition-colors duration-150" />
    </div>
  );
};

export default React.memo(ResizableDivider);
