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

export interface DocumentPage {
  id: string;
  content: any; // TipTap JSON
  html: string; // The canonical generated HTML snippet
}

export interface DocumentMetadata {
  matterId: string;
  firmId: string;
  isDirty: boolean;
  lastSaved: number | null;
}

// --- The Hook ---

export const useDocumentState = (initialContent: any = "") => {
  // --- Migration Logic (Handle String -> Virtual Pages) ---
  const hydratePages = (input: any): DocumentPage[] => {
    if (Array.isArray(input)) return input;
    
    // Default hydration for legacy strings or new docs
    const content = typeof input === 'string' ? {
      type: 'doc',
      content: input ? input.split('\n\n').filter(Boolean).map(p => ({
        type: 'paragraph',
        content: [{ type: 'text', text: p }]
      })) : [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }]
    } : input;

    // Track original parsed HTML or default placeholder
    const html = typeof input === 'string' ? input : '';

    return [{ id: 'page-1', content, html }];
  };

  // --- Content Architecture ---
  const [pages, setPages] = useState<DocumentPage[]>(hydratePages(initialContent));
  const [diffs, setDiffs] = useState<TextDiff[]>([]);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    matterId: 'UNTITLED',
    firmId: 'NOMOS-DEMO',
    isDirty: false,
    lastSaved: null
  });

  const updatePageContent = (pageId: string, newContent: any, newHtml: string = "") => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, content: newContent, html: newHtml } : p));
    setMetadata(prev => ({ ...prev, isDirty: true }));
  };

  const addPage = (overflowContent: any = null) => {
    // Ensure the new page content is always at least a valid empty document
    // If overflowContent is just a node (paragraph), wrap it in a 'doc' type
    const content = overflowContent?.type === 'doc' 
      ? overflowContent 
      : { 
          type: 'doc', 
          content: overflowContent ? [overflowContent] : [{ type: 'paragraph' }] 
        };

    const newPage: DocumentPage = {
      id: `page-${pages.length + 1}`,
      content,
      html: "" // Will be populated immediately by the editor's first render or update
    };
    setPages(prev => [...prev, newPage]);
  };

  const removeLastPage = () => {
    if (pages.length <= 1) return;
    setPages(prev => prev.slice(0, -1));
  };

  /**
   * AI-Assisted Smart Fill: Hydrate placeholders via backend logic
   */
  const performSmartFill = async (matterId: string) => {
    try {
      const { authorizedFetch, getSavedSession } = await import('../utils/api');
      const session = getSavedSession();
      if (!session?.token) return;

      // Join pages for processing
      const combinedContent = pages.map(p => JSON.stringify(p.content)).join('\n');

      const response = await authorizedFetch('/api/ai/smart-fill', {
        method: 'POST',
        token: session.token,
        body: JSON.stringify({ matterId, content: combinedContent })
      });

      if (response && response.content) {
        // Simple hydration back to first page for now, or re-paginate
        updatePageContent('page-1', response.content);
        return true;
      }
    } catch (error) {
      console.error("[STUDIO-STATE] Smart Fill Failed:", error);
    }
    return false;
  };

  const acceptChange = (diffId: string) => {
    setDiffs(prev => prev.map(d => d.id === diffId ? { ...d, status: 'accepted' } : d));
  };

  const rejectChange = (diffId: string) => {
    setDiffs(prev => prev.map(d => d.id === diffId ? { ...d, status: 'rejected' } : d));
  };

  return {
    pages,
    diffs,
    metadata,
    actions: {
      updatePageContent,
      addPage,
      removeLastPage,
      performSmartFill,
      acceptChange,
      rejectChange,
      setMetadata,
      setPages
    }
  };
};
