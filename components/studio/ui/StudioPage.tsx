/**
 * @file StudioPage.tsx
 * @module NomosDesk/Studio/UI
 * @description A physical 8.5x11 sheet with integrated legal typography and TipTap editor.
 */

import React, { useEffect, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { PleadingGutter } from './PleadingGutter';
import { DocumentPage } from '../../../hooks/useDocumentState';
import { useSovereignEditor } from '../hooks/useSovereignEditor';
import { useStudioStore } from '../hooks/useStudioStore';
import { usePaginationLogic } from '../hooks/usePaginationLogic';
import { useCrossPageNavigation } from '../hooks/useCrossPageNavigation';
import { StudioBubbleMenu } from './StudioBubbleMenu';

interface StudioPageProps {
  page: DocumentPage;
  pageIndex: number;
  zoom: number;
  showLineNumbers: boolean;
  showMargins: boolean;
  onUpdate: (id: string, content: any, html: string) => void;
  onOverflow: (content: any) => void;
  onFocusPrevious: (idx: number) => void;
  onFocusNext: (idx: number) => void;
  onEditorMount: (idx: number, editor: any) => void;
  isLastPage: boolean;
}

export const StudioPage: React.FC<StudioPageProps> = ({
  page,
  pageIndex,
  zoom,
  showLineNumbers,
  showMargins,
  onUpdate,
  onOverflow,
  onFocusPrevious,
  onFocusNext,
  onEditorMount,
  isLastPage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const setStoreEditor = useStudioStore((state) => state.setEditor);
  
  const editor = useSovereignEditor({
    content: page.content,
    onUpdate: (json, html) => {
      isInternalUpdate.current = true;
      onUpdate(page.id, json, html);
    },
  });

  // --- External Content Re-Hydration ---
  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (page.content) {
      editor.commands.setContent(page.content, { emitUpdate: false });
    }
  }, [page.content, editor]);

  // --- Managed Frame Logic (Pagination) ---
  usePaginationLogic(editor, containerRef as React.RefObject<HTMLDivElement>, page.id, isLastPage, onOverflow);

  // --- Cross-Page Traversal (Focus Bridge) ---
  useCrossPageNavigation(editor, pageIndex, onFocusPrevious, onFocusNext);

  // Call onEditorMount when editor is ready
  useEffect(() => {
    if (editor) {
      onEditorMount(pageIndex, editor);
    }
  }, [editor, pageIndex, onEditorMount]);

  // Sync active editor to store for global toolbar action
  useEffect(() => {
    if (editor && editor.isFocused) {
      setStoreEditor(editor);
    }
  }, [editor?.isFocused, setStoreEditor, editor]);

  // Initial primary editor sync
  useEffect(() => {
    if (editor && pageIndex === 0) {
      setStoreEditor(editor);
    }
  }, [editor, pageIndex, setStoreEditor]);

  return (
    <div 
      className="relative bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] transition-all duration-500 ease-in-out origin-top mb-12 last:mb-24 overflow-hidden"
      style={{
        width: '8.5in',
        height: '11in',
        padding: showMargins ? '1in 1in 1in 1.25in' : '0.5in',
        transform: `scale(${zoom})`,
        color: '#1A1A1A',
      }}
      ref={containerRef}
    >
      {showLineNumbers && (
        <div className="absolute left-0 top-0 bottom-0 w-[45px] border-r border-slate-100/60 pointer-events-none">
          <PleadingGutter />
        </div>
      )}

      <div className="prose-legal max-w-full h-full">
        {editor ? (
          <>
            <EditorContent editor={editor} />
            <StudioBubbleMenu editor={editor} pluginKey={`bubbleMenu-${page.id}`} />
          </>
        ) : (
          <div className="text-slate-200 italic text-sm py-20 text-center">
            Artifact Hydrating...
          </div>
        )}
      </div>

      <div className="absolute bottom-8 right-12 flex items-center gap-2 opacity-30 select-none">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-900">
          Nomos Studio
        </span>
        <div className="w-1 h-1 rounded-full bg-slate-400" />
        <span className="text-[9px] font-mono text-slate-900">
          Sheet {pageIndex + 1}
        </span>
      </div>

      <div className="absolute -right-16 top-0 text-[10px] font-mono text-slate-500 uppercase tracking-widest vertical-text opacity-20 select-none">
        VAULT_ID: {page.id.split('-')[1]}
      </div>
    </div>
  );
};

export default StudioPage;
