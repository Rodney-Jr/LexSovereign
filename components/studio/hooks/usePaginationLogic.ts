/**
 * @hook usePaginationLogic
 * @description Monitors editor height and triggers overflow to the next virtual page.
 */
import { useEffect } from 'react';
import { Editor } from '@tiptap/react';

export const usePaginationLogic = (
  editor: Editor | null,
  containerRef: React.RefObject<HTMLDivElement>,
  pageId: string,
  isLastPage: boolean,
  onOverflow: (content: any) => void
) => {
  useEffect(() => {
    if (!editor || !containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Strict Legal Frame Height Guard
        // 11 inches at 96 DPI = 1056px total page height.
        // We measure the ProseMirror DOM element within the 1-inch margins.
        // Available content height: (11 - (1in top + 1in bottom)) * 96 = 864px.
        const contentHeight = entry.target.clientHeight;

        if (contentHeight > 864) {
          const json = editor.getJSON();
          const nodes = json.content || [];

          if (nodes.length > 1 && isLastPage) {
            // Identify the last node to "handoff" to the next sheet
            const lastNode = nodes.pop();
            
            // 1. Mutate the current sheet to pull back the overflow
            editor.commands.setContent({
              ...json,
              content: nodes
            });

            // 2. Hydrate the next sheet via parent state
            onOverflow(lastNode);
            
            // 3. Move focus to the new page (handled by global store in StudioPage)
          }
        }
      }
    });

    const editorElement = containerRef.current.querySelector('.ProseMirror');
    if (editorElement) observer.observe(editorElement);

    return () => observer.disconnect();
  }, [editor, pageId, onOverflow, isLastPage]);
};
