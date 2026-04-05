/**
 * @file usePagination.ts
 * @module NomosDesk/Studio/Hooks
 * @description Monitors editor height and triggers a "Page Overflow" event 
 * when content exceeds the 11-inch (1056px) limit.
 */

import { useEffect } from 'react';
import { Editor } from '@tiptap/react';

export const usePagination = (editor: Editor | null, pageIndex: number, onOverflow: (data: any) => void) => {
  const PAGE_HEIGHT_PX = 1056; // 11 inches at 96 DPI

  useEffect(() => {
    if (!editor) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Use contentRect height if available, or fallback to scrollHeight
        const height = entry.contentRect.height || (entry.target as HTMLElement).scrollHeight;
        
        if (height > PAGE_HEIGHT_PX) {
          // 1. Identify the overflowing content
          const json = editor.getJSON();
          if (!json.content || json.content.length <= 1) return;

          const lastNode = json.content[json.content.length - 1];

          // 2. Trigger the SaaS event to move this node to pageIndex + 1
          onOverflow({
            overflowNode: lastNode,
            pageIndex
          });
          
          // 3. Remove the node from the current editor to "pull back" the text
          // Using document size as the range for removal
          const from = editor.state.doc.content.size - 2;
          const to = editor.state.doc.content.size;
          
          if (from >= 0) {
            editor.commands.deleteRange({ from, to });
          }
        }
      }
    });

    // Target the actual editable DOM element (ProseMirror contenteditable)
    const editorDom = editor.view.dom;
    if (editorDom) {
      observer.observe(editorDom);
    }

    return () => observer.disconnect();
  }, [editor, pageIndex, onOverflow]);
};

export default usePagination;
