/**
 * @file useSovereignEditor.ts
 * @module NomosDesk/Studio/Hooks
 * @description Centralized TipTap initialization for the Sovereign Drafting Studio.
 */

import React, { useMemo } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Table as TableExtension } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';

// --- Custom Extensions ---
import { Clause } from '../extensions/Clause';
import { Insertion, Deletion, TrackChanges } from '../extensions/Redline';
import { AIInline } from '../extensions/AIInline';
import { RiskHighlighter } from '../extensions/RiskHighlighter';

// --- Types ---
import { StudioMode } from '../domain/documentTypes';

interface UseSovereignEditorProps {
  content: any;
  onUpdate?: (json: any, html: string) => void;
  activeMode?: StudioMode;
}

export const useSovereignEditor = ({ content, onUpdate, activeMode }: UseSovereignEditorProps): Editor | null => {
  const extensions = useMemo(() => [
    StarterKit.configure({
      // Disable StarterKit's built-in underline to prevent duplicate
      // extension name collision with the standalone @tiptap/extension-underline
      // that provides richer configuration options.
      underline: false,
    }),
    Underline,
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
    Highlight.configure({
      multicolor: true,
    }),
    Clause,
    Insertion,
    Deletion,
    TrackChanges,
    AIInline,
    RiskHighlighter,
  ], []);

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      if (onUpdate) onUpdate(editor.getJSON(), editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose-legal max-w-none focus:outline-none text-slate-900 editor-surface relative z-10',
      },
    },
  }, [extensions]); // Dependency on the memoized extensions

  return editor;
};

export default useSovereignEditor;
