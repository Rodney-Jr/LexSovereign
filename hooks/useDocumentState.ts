/**
 * @file useDocumentState.ts
 * @module NomosDesk/Core
 * @description The central state machine for the Drafting Studio.
 * Handles content hydration, tracked changes, and legal metadata.
 */

import { useState, useMemo } from 'react';

// --- Types & Interfaces ---

export type ChangeAuthor = 'User' | 'AI' | 'Partner' | 'System';

export interface TextDiff {
  id: string;
  type: 'insert' | 'delete' | 'equal';
  value: string;
  author: ChangeAuthor;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DocumentMetadata {
  matterId: string;
  firmId: string;
  isDirty: boolean;
  lastSaved: number | null;
}

// --- The Hook ---

export const useDocumentState = (initialContent: any = "") => {
  // --- Migration Logic (Plain Text to TipTap JSON) ---
  const hydrateContent = (input: any) => {
    if (typeof input === 'string') {
      return {
        type: 'doc',
        content: input.split('\n\n').filter(Boolean).map(p => ({
          type: 'paragraph',
          content: [{ type: 'text', text: p }]
        }))
      };
    }
    return input;
  };

  const [rawContent, setRawContent] = useState<any>(hydrateContent(initialContent));
  const [diffs, setDiffs] = useState<TextDiff[]>([]);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    matterId: 'UNTITLED',
    firmId: 'NOMOS-DEMO',
    isDirty: false,
    lastSaved: null
  });

  // 1. Derived Compiled View
  const compiledView = useMemo(() => {
    if (typeof rawContent === 'string') return rawContent;
    // For TipTap JSON, the state machine exposes the structure.
    // Compilation logic for variables can be added here or in the editor.
    return rawContent;
  }, [rawContent]);

  // 2. State Actions
  const updateContent = (newContent: any) => {
    // Ensure that incoming strings (from templates or AI) are hydrated into TipTap JSON
    const reconciledContent = typeof newContent === 'string' ? hydrateContent(newContent) : newContent;
    setRawContent(reconciledContent);
    setMetadata(prev => ({ ...prev, isDirty: true }));
  };

  const acceptChange = (diffId: string) => {
    setDiffs(prev => prev.map(d => d.id === diffId ? { ...d, status: 'accepted' } : d));
    // Implementation Note: In Phase 3, accepted changes will be merged into rawContent
  };

  const rejectChange = (diffId: string) => {
    setDiffs(prev => prev.map(d => d.id === diffId ? { ...d, status: 'rejected' } : d));
  };

  return {
    rawContent,
    compiledView,
    diffs,
    metadata,
    actions: {
      updateContent,
      acceptChange,
      rejectChange,
      setMetadata
    }
  };
};
