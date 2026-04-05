/**
 * @file useDraggableWindow.ts
 * @module NomosDesk/Studio/Hooks
 * @description Hook for draggable floating window behavior with resize support.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isMinimized: boolean;
}

const DEFAULT_WIDTH = Math.min(window.innerWidth * 0.88, 1440);
const DEFAULT_HEIGHT = Math.min(window.innerHeight * 0.88, 900);

export const useDraggableWindow = () => {
  const [win, setWin] = useState<WindowState>({
    x: Math.max(0, (window.innerWidth - DEFAULT_WIDTH) / 2),
    y: Math.max(0, (window.innerHeight - DEFAULT_HEIGHT) / 2),
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    isMaximized: false,
    isMinimized: false,
  });

  const dragRef = useRef<{ active: boolean; startX: number; startY: number; winX: number; winY: number }>({
    active: false, startX: 0, startY: 0, winX: 0, winY: 0
  });

  const resizeRef = useRef<{ active: boolean; edge: string; startX: number; startY: number; startW: number; startH: number; startWinX: number; startWinY: number } | null>(null);

  // --- Drag Logic ---
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (win.isMaximized) return;
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
    document.body.style.userSelect = 'none'; // Prevent text selection bleed during drag
    e.preventDefault();
  }, [win]);

  // --- Resize Logic ---
  const onResizeStart = useCallback((e: React.MouseEvent, edge: string) => {
    resizeRef.current = {
      active: true, edge,
      startX: e.clientX, startY: e.clientY,
      startW: win.width, startH: win.height,
      startWinX: win.x, startWinY: win.y
    };
    document.body.style.userSelect = 'none'; // Prevent text selection bleed during resize
    e.preventDefault();
    e.stopPropagation();
  }, [win]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current.active) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setWin(prev => ({
          ...prev,
          x: Math.max(0, Math.min(window.innerWidth - prev.width, dragRef.current.winX + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.winY + dy)),
        }));
      }
      if (resizeRef.current?.active) {
        const r = resizeRef.current;
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        setWin(prev => {
          const next = { ...prev };
          if (r.edge.includes('e')) next.width = Math.max(720, r.startW + dx);
          if (r.edge.includes('s')) next.height = Math.max(480, r.startH + dy);
          if (r.edge.includes('w')) {
            next.width = Math.max(720, r.startW - dx);
            next.x = Math.min(r.startWinX + r.startW - 720, r.startWinX + dx);
          }
          if (r.edge.includes('n')) {
            next.height = Math.max(480, r.startH - dy);
            next.y = Math.min(r.startWinY + r.startH - 480, r.startWinY + dy);
          }
          return next;
        });
      }
    };

    const onMouseUp = () => {
      dragRef.current.active = false;
      resizeRef.current = null;
      document.body.style.userSelect = ''; // Restore text selectability
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // --- Window Controls ---
  const maximize = useCallback(() => {
    setWin(prev => ({ ...prev, isMaximized: !prev.isMaximized, isMinimized: false }));
  }, []);

  const minimize = useCallback(() => {
    setWin(prev => ({ ...prev, isMinimized: !prev.isMinimized, isMaximized: false }));
  }, []);

  return { win, onDragStart, onResizeStart, maximize, minimize };
};
