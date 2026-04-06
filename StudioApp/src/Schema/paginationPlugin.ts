/**
 * @file paginationPlugin.ts
 * @description ProseMirror plugin that enforces A4/Letter page boundaries.
 * After every document change, it measures each legal-page div. If a page's
 * scrollHeight exceeds its clientHeight it moves the last overflowing block
 * node into a new page. Runs until no page overflows.
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { legalSchema } from './LegalSchema';



export const paginationPluginKey = new PluginKey('pagination');

export const paginationPlugin = new Plugin({
  key: paginationPluginKey,

  view(editorView) {
    let scheduled = false;

    const repaginate = () => {
      scheduled = false;
      const { state, dispatch } = editorView;
      const { doc, tr } = state;
      const domNode = editorView.dom;

      // Get all rendered .legal-page elements
      const pageEls = domNode.querySelectorAll<HTMLElement>('.legal-page');
      if (!pageEls.length) return;

      let changed = false;

      doc.forEach((pageNode, pageOffset, pageIndex) => {
        const el = pageEls[pageIndex];
        if (!el) return;

        // If this page is not overflowing, skip
        if (el.scrollHeight <= el.clientHeight + 2) return;

        // The page is overflowing — we need to move the last block into the next page
        const childCount = pageNode.childCount;
        if (childCount <= 1) return; // can't split a single-child page

        // Move the last child node to the beginning of the next page (or a new page)
        const lastChild = pageNode.child(childCount - 1);
        const lastChildOffset = pageOffset + pageNode.nodeSize - 1 - lastChild.nodeSize;

        // Check if a next page exists
        const nextPageIndex = pageIndex + 1;
        const nextPageExists = nextPageIndex < doc.childCount;

        const insertPos = pageOffset + pageNode.nodeSize;

        if (nextPageExists) {
          // Move the node to start of the next page
          tr.delete(lastChildOffset, lastChildOffset + lastChild.nodeSize);
          // After deletion, the next page starts at insertPos - lastChild.nodeSize
          const adjustedInsert = insertPos - lastChild.nodeSize + 1;
          tr.insert(adjustedInsert, lastChild);
        } else {
          // Create a brand-new page with this node
          const newPage = legalSchema.nodes.page.create(null, [lastChild]);
          tr.delete(lastChildOffset, lastChildOffset + lastChild.nodeSize);
          tr.insert(tr.mapping.map(insertPos), newPage);
        }

        changed = true;
      });

      // Remove any empty pages (except the first one)
      if (!changed) {
        let emptyRemoved = false;
        doc.forEach((pageNode, pageOffset) => {
          if (pageNode.childCount === 0 && doc.childCount > 1) {
            tr.delete(tr.mapping.map(pageOffset), tr.mapping.map(pageOffset + pageNode.nodeSize));
            emptyRemoved = true;
          }
        });
        if (emptyRemoved) {
          dispatch(tr.setMeta('pagination', true));
        }
        return;
      }

      dispatch(tr.setMeta('pagination', true));
    };

    return {
      update(view, prevState) {
        if (view.state.doc.eq(prevState.doc)) return;
        // Debounce to let DOM render first
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(repaginate);
        }
      },
    };
  },
});
