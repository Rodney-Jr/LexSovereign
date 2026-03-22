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
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Table as TableExtension } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// --- Custom Extensions ---
import { Extension } from '@tiptap/react';
import { Clause } from '../extensions/Clause';
import { Insertion, Deletion, TrackChanges } from '../extensions/Redline';
import { AIInline } from '../extensions/AIInline';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize.replace(/['"]+/g, ''),
        renderHTML: (attributes: any) => {
          if (!attributes.fontSize) return {}
          return {
            style: `font-size: ${attributes.fontSize}`,
          }
        },
      },
    }
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
} as any);

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

/**
 * Transforms legacy Markdown-style hashes (###) into structured Clause nodes
 */
const preProcessContent = (content: any) => {
  if (typeof content !== 'string') return content;
  
  // Very basic transformation: split by `### ` and wrap in clause structure
  // In a production app, use a proper markdown parser + node mapper
  const parts = content.split(/^###\s+/m).filter(p => p.trim());
  if (parts.length <= 1 && !content.startsWith('###')) return content; // Not markdown or no hashes

  return {
    type: 'doc',
    content: parts.map((part, index) => {
      const lines = part.split('\n');
      const title = lines[0].trim();
      const body = lines.slice(1).join('\n').trim();

      return {
        type: 'clause',
        attrs: { id: `clause-${index}`, number: `${index + 1}`, title },
        content: [
          { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: title }] },
          { type: 'paragraph', content: [{ type: 'text', text: body || ' ' }] }
        ]
      };
    })
  };
};

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
      Placeholder.configure({
        placeholder: 'Begin drafting your legal artifact...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TableExtension.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      FontFamily,
      FontSize,
      Clause,
      Insertion,
      Deletion,
      TrackChanges,
      AIInline,
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
        class: 'prose prose-slate max-w-none focus:outline-none text-slate-900 editor-surface',
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
      const processed = preProcessContent(content);
      const currentContent = JSON.stringify(editor.getJSON());
      const incomingContent = JSON.stringify(processed);
      
      if (currentContent !== incomingContent) {
        editor.commands.setContent(processed);
      }
    }
  }, [editor, content, collabRoom]);

  // --- Dynamic Pagination Engine ---
  const [pageCount, setPageCount] = useState(1);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current?.querySelector('.ProseMirror');
    if (!el) return;

    const updatePages = () => {
      const height = el.scrollHeight;
      const a4_cycle = 1152; // 1128px A4 + 24px Gap
      const count = Math.max(1, Math.ceil(height / 1128)); // Measure against just the usable height
      if (count !== pageCount) setPageCount(count);
    };

    const observer = new ResizeObserver(updatePages);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageCount]);

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
      className="legal-editor-workspace flex-1 overflow-y-auto pt-10 pb-40 bg-[#07090C] flex flex-col items-center scroll-smooth scrollbar-hide antialiased"
      style={{ 
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      <div 
        className="relative transition-transform duration-300 ease-in-out"
        style={{ 
          width: `${A4_PX}px`,
          transform: `scale(${effectiveZoom})`,
          transformOrigin: 'top center',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          marginBottom: effectiveZoom < 1 ? `${(effectiveZoom - 1) * (pageCount * 1150)}px` : undefined
        }}
      >
        {/* Background Sheets (Physical Boundaries) */}
        <div className="absolute inset-x-0 top-0 flex flex-col items-center pointer-events-none z-0">
          <div className="flex flex-col gap-[24px]">
            {Array.from({ length: pageCount }).map((_, i) => (
              <div 
                key={i} 
                className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border-2 border-slate-300"
                style={{ height: '1128px', width: '794px' }}
              >
                  <PageSheet 
                    pageNumber={i + 1} 
                    totalPageCount={pageCount}
                    digitalHash={`S-ARTIFACT-H${i}-${(content?.id || 'UNV').substring(0,8)}`}
                    timestamp={Date.now()}
                  />
              </div>
            ))}
          </div>
        </div>

        {/* The Drafting Surface (Transparent Overlays with Grid-Aligned Gaps) */}
        <div 
           ref={editorRef}
           className="relative z-10"
           style={{ 
             paddingLeft: '96px', 
             paddingRight: '96px',
             paddingTop: '72px', // Initial Margin
             paddingBottom: '240px', 
             minHeight: `${pageCount * 1152}px`,
             width: '794px',
             margin: '0 auto',
             lineHeight: '24px',
             // THE GRID JUMP: 168px Dead Zone (Bottom Margin + Gap + Top Margin) every 1152px
             backgroundImage: `linear-gradient(to bottom, transparent 1056px, #07090C 1056px, #07090C 1224px)`,
             backgroundSize: `100% 1152px`,
             backgroundRepeat: 'repeat-y'
           }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(LegalEditor);
