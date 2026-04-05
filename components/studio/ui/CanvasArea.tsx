/**
 * @file CanvasArea.tsx
 * @module NomosDesk/Studio/UI
 * @description The 'Managed Frame' engine for document composition.
 */

import React, { useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { StudioMode } from '../domain/documentTypes';
import { DocumentPage } from '../../../hooks/useDocumentState';
import { StudioPage } from './StudioPage';

interface CanvasAreaProps {
  activeMode: StudioMode;
  pages: DocumentPage[];
  zoom: number;
  matterId: string;
  showLineNumbers: boolean;
  showMargins: boolean;
  onUpdatePage: (id: string, content: any, html: string) => void;
  onPageOverflow: (content: any) => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  pages,
  zoom,
  matterId,
  showLineNumbers,
  showMargins,
  onUpdatePage,
  onPageOverflow
}) => {
  // Use a map to track all active TipTap instances for the Focus Bridge
  const editorsRef = useRef<Map<number, Editor>>(new Map());

  const handleEditorMount = useCallback((idx: number, editor: Editor) => {
    editorsRef.current.set(idx, editor);
  }, []);

  const handleFocusPrev = useCallback((idx: number) => {
    const prevEditor = editorsRef.current.get(idx);
    if (prevEditor) {
      prevEditor.commands.focus('end');
    }
  }, []);

  const handleFocusNext = useCallback((idx: number) => {
    const nextEditor = editorsRef.current.get(idx);
    if (nextEditor) {
      nextEditor.commands.focus('start');
    }
  }, []);

  return (
    <div 
      className="flex-1 overflow-y-auto bg-[#07090C] custom-scrollbar py-20 flex flex-col items-center"
      style={{ perspective: '1500px' }}
    >
      <div className="virtual-stack flex flex-col items-center w-full max-w-[8.5in] mx-auto">
        {pages.map((page, index) => (
          <StudioPage 
             key={page.id}
             page={page}
             pageIndex={index}
             zoom={zoom}
             showLineNumbers={showLineNumbers}
             showMargins={showMargins}
             onUpdate={onUpdatePage}
             onOverflow={onPageOverflow}
             onFocusPrevious={() => handleFocusPrev(index - 1)}
             onFocusNext={() => handleFocusNext(index + 1)}
             onEditorMount={handleEditorMount}
             isLastPage={index === pages.length - 1}
          />
        ))}

        {/* Add Page Button */}
        <button 
          onClick={() => onPageOverflow(null)}
          className="mt-8 mb-24 mx-auto block px-4 py-2 text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors border border-slate-800 rounded cursor-pointer"
        >
          + Insert Manual Page Break
        </button>
      </div>

      {/* Persistence Metatags */}
      <div className="fixed bottom-12 right-12 z-20 pointer-events-none text-right">
        <div className="text-[9px] font-mono text-slate-700 bg-black/40 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
          {matterId} ● MANAGED_FRAME_STACK
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .prose-legal .ProseMirror {
          outline: none !important;
          min-height: 1056px; /* Physical A4-Letter 11in limit within boundaries */
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 2.0;
          color: #1a1a1a;
          text-align: justify;
          user-select: text !important;
          -webkit-user-select: text !important;
          cursor: text;
        }
        
        .prose-legal .ProseMirror p {
          margin-bottom: 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .prose-legal .ProseMirror ::selection {
          background: rgba(var(--brand-primary-rgb), 0.2);
        }

        .vertical-text {
          writing-mode: vertical-rl;
        }
      `}} />
    </div>
  );
};

export default React.memo(CanvasArea);
