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
import { Sparkles } from 'lucide-react';
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
import { RiskHighlighter } from '../extensions/RiskHighlighter';

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
  activeMode?: 'draft' | 'review' | 'structure';
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
  activeMode = 'draft',
  collabRoom,
  userInfo = DEFAULT_USER
}) => {
  const setStoreEditor = useStudioStore((state) => state.setEditor);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
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

  // Font-size based zoom (Professional Scaling)
  const baseFontSize = 16;
  const scaledFontSize = baseFontSize * externalZoom;
  
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
      RiskHighlighter,
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
          class: 'prose prose-slate max-w-none focus:outline-none text-slate-900 editor-surface relative z-10',
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

  // --- Responsive Geometry Calculation ---
  const MAX_WIDTH = `${A4_PX}px`;
  const PAGE_HEIGHT = 1128; // Standard A4 Height at this zoom scale
  const GAP_HEIGHT = 24;    // The inter-page gap height

  // --- 📏 Structural Pagination Engine (The Line Jump) ---
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    if (!editor) return;

    const alignContent = () => {
      const el = editorRef.current?.querySelector('.ProseMirror');
      if (!el) return;

      const nodes = el.querySelectorAll('.ProseMirror > *');
      let currentHeight = 0;
      let calculatedPageCount = 1;

      nodes.forEach((node: any) => {
        // Reset any previous jumps
        node.style.marginTop = '0px';
        const nodeHeight = node.offsetHeight;
        const nodeTop = node.offsetTop;
        const nodeBottom = nodeTop + nodeHeight;

        // Check if node crosses a page boundary
        // Boundaries are at 1128, 2256, etc.
        const pageBoundary = calculatedPageCount * PAGE_HEIGHT;

        if (nodeTop < pageBoundary && nodeBottom > pageBoundary) {
          // 🚀 THE JUMP: Push the node to the next page
          const pushAmount = pageBoundary - nodeTop + GAP_HEIGHT;
          node.style.marginTop = `${pushAmount}px`;
          
          // Recalculate based on the jump
          calculatedPageCount++;
        } else if (nodeTop >= pageBoundary) {
          // If the node already started after the boundary, we've moved to a new page
          calculatedPageCount = Math.max(calculatedPageCount, Math.floor(nodeTop / PAGE_HEIGHT) + 1);
        }
      });

      if (calculatedPageCount !== pageCount) {
        setPageCount(calculatedPageCount);
      }
    };

    const observer = new ResizeObserver(alignContent);
    observer.observe(editorRef.current!);
    
    // Also trigger on editor transaction
    editor.on('update', alignContent);
    
    return () => {
      observer.disconnect();
      editor.off('update', alignContent);
    };
  }, [editor, pageCount]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-slate-500">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="animate-pulse text-brand-primary" size={32} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Initializing Drafting Enclave...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={wrapperRef}
      className="legal-editor-engine w-full relative z-10 transition-all duration-300 ease-in-out"
      style={{ 
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        fontSize: `${scaledFontSize}px`,
        color: '#111827',
        lineHeight: '1.7',
        letterSpacing: '-0.01em',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}
    >
      <div ref={editorRef} className="w-full">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none prose-slate outline-none"
        />
      </div>
    </div>
  );
};

export default React.memo(LegalEditor);
