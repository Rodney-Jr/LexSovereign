/**
 * @file LegalEditor.tsx
 * @module NomosDesk/Studio/UI
 * @description The next-generation structured legal editor powered by TipTap (ProseMirror).
 * Auto-fits zoom to the available canvas width so the page is never squished.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import { PageSheet } from '../../PageSheet';
import { useStudioStore } from '../hooks/useStudioStore';

// A4 width in pixels at 96dpi: 210mm / 25.4 * 96 ≈ 794px
const A4_PX = 794;
// Horizontal padding inside the scroll container (px each side)
const CANVAS_PADDING = 48;

interface LegalEditorProps {
  content: any;
  onUpdate: (json: any) => void;
  zoom?: number;
  collabRoom?: string;
  userInfo?: { name: string; color: string };
}

const DEFAULT_USER = { name: 'Sovereign Counselor', color: '#10b981' };

export const LegalEditor: React.FC<LegalEditorProps> = ({ 
  content, 
  onUpdate,
  zoom: externalZoom = 1,
  collabRoom,
  userInfo = DEFAULT_USER
}) => {
  const setStoreEditor = useStudioStore((state) => state.setEditor);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [autoZoom, setAutoZoom] = useState(1);
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  // --- Collaboration Lifecycle (Phase 1) ---
  useEffect(() => {
    if (!collabRoom) return;

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/collab/${collabRoom}`;
    const p = new WebsocketProvider(wsUrl, collabRoom, ydoc);
    
    setProvider(p);
    console.log(`[COLLAB] Enclave Active: ${collabRoom}`);

    return () => {
      p.destroy();
      console.log("[COLLAB] Enclave Disconnected.");
    };
  }, [collabRoom, ydoc]);

  // --- Auto-fit zoom using ResizeObserver (width axis only) ---
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const compute = () => {
      const availW = el.clientWidth - CANVAS_PADDING * 2;
      if (availW <= 0) return;
      setAutoZoom(Math.min(1, availW / A4_PX));
    };

    const observer = new ResizeObserver(compute);
    observer.observe(el);
    compute();
    return () => observer.disconnect();
  }, []);

  // External zoom (toolbar slider) multiplies the auto-fit base
  const effectiveZoom = autoZoom * externalZoom;
  
  // --- Helix: Stable Extension Schema ---
  const extensions = React.useMemo(() => {
    const list: any[] = [
      (StarterKit as any).configure({
        // Disable history if collaboration is active (Y.js handles it)
        history: collabRoom ? false : {},
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Begin drafting your legal artifact...',
      }),
    ];

    if (collabRoom && provider) {
      list.push(
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: userInfo,
        })
      );
    }
    return list;
  }, [collabRoom, provider, ydoc, userInfo]);

  const editor = useEditor({
    extensions,
    content: collabRoom ? null : content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-invert max-w-none focus:outline-none',
      },
    },
  }, [extensions]); // Dependency on the memoized extensions

  useEffect(() => {
    if (editor) {
      setStoreEditor(editor);
    }
    return () => {
      // Cleanup: only nullify if we are the current editor
      setStoreEditor(null);
    };
  }, [editor, setStoreEditor]);

  // --- External Content Sync (Hydration) ---
  useEffect(() => {
    if (editor && content && !collabRoom) {
      // Only set content if it's meaningfully different to avoid cursor jumps during active typing
      // Note: for JSON content, a deep check or stringify is needed
      const currentContent = JSON.stringify(editor.getJSON());
      const incomingContent = JSON.stringify(content);
      
      if (currentContent !== incomingContent) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content, collabRoom]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-500 animate-pulse">
        Initializing Sovereign Logic Engine...
      </div>
    );
  }

  return (
    <div 
      ref={wrapperRef}
      className="legal-editor-workspace flex-1 overflow-y-auto pt-6 pb-10 bg-[#0A0C10] flex flex-col items-center scroll-smooth"
    >
      <div 
        className="relative transition-transform duration-300 ease-in-out"
        style={{ 
          width: `${A4_PX}px`,
          transform: `scale(${effectiveZoom})`,
          transformOrigin: 'top center',
          marginBottom: effectiveZoom < 1 ? `${(effectiveZoom - 1) * 1123}px` : undefined
        }}
      >
        <PageSheet pageNumber={1} totalPageCount={1}>
          <EditorContent editor={editor} />
        </PageSheet>
      </div>
    </div>
  );
};

export default React.memo(LegalEditor);
