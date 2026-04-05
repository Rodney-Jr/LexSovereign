/**
 * @hook useCrossPageNavigation
 * @description Logic for cursor traversal across multiple virtual sheets.
 */
import { useEffect } from 'react';
import { Editor } from '@tiptap/react';

export const useCrossPageNavigation = (
  editor: Editor | null,
  pageIndex: number,
  onFocusPrevious: (idx: number) => void,
  onFocusNext: (idx: number) => void
) => {
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (view: any, event: KeyboardEvent) => {
      const { selection } = editor.state;
      const isAtStart = selection.from === 1; // Position 1 is right before the first node
      const isAtEnd = selection.to === editor.state.doc.content.size - 1;

      // 1. Backspace at start of page 2+ → move to end of page 1
      if (event.key === 'Backspace' && isAtStart && pageIndex > 0) {
        onFocusPrevious(pageIndex - 1);
        return true; // We handled the event (prevents actual backspace in current page)
      }

      // 2. Arrow Up at start → move to end of previous page
      if (event.key === 'ArrowUp' && isAtStart && pageIndex > 0) {
        onFocusPrevious(pageIndex - 1);
        return true;
      }

      // 3. Arrow Down at end → move to start of next page
      if (event.key === 'ArrowDown' && isAtEnd) {
        onFocusNext(pageIndex + 1);
        return true;
      }

      return false;
    };

    editor.setOptions({
      editorProps: {
        handleKeyDown,
      },
    });
  }, [editor, pageIndex, onFocusPrevious, onFocusNext]);
};
