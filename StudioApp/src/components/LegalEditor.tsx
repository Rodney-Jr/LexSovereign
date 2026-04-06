import { useEffect, useRef, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark, selectAll } from 'prosemirror-commands';
import { history, undo, redo } from 'prosemirror-history';
import { DOMParser, DOMSerializer, Node as PMNode } from 'prosemirror-model';
import { legalSchema } from '../Schema/LegalSchema';
import { paginationPlugin } from '../Schema/paginationPlugin';
import { FormattingToolbar } from './FormattingToolbar';
import '../Styles/paged-legal.css';

interface LegalEditorProps {
  docId: string | null;
  content: string;
  onChange: (content: string) => void;
  onSave: (content: string) => void;
  onImport?: (content: string) => void;
  onSaveAsNew?: () => void;
}

/**
 * Parses raw HTML into a valid ProseMirror doc node.
 * If the HTML already contains .legal-page divs the schema parser handles them.
 * If it's flat HTML (e.g. from mammoth), we wrap all blocks into a single page
 * so the pagination plugin can split them correctly.
 */
function htmlToDoc(html: string): PMNode {
  const scratch = document.createElement('div');
  scratch.innerHTML = html || '<p></p>';

  // Check if content already has legal-page wrappers
  if (scratch.querySelector('.legal-page')) {
    return DOMParser.fromSchema(legalSchema).parse(scratch);
  }

  // Flat HTML — parse blocks then wrap in a single page
  const blocks = DOMParser.fromSchema(legalSchema).parse(scratch, {
    // topNode should be the page node so blocks parse as page content
    topNode: legalSchema.nodes.page.create(),
  });

  return legalSchema.nodes.doc.create(null, [blocks]);
}

export const LegalEditor = ({ content, onChange, onSave, onImport, onSaveAsNew }: LegalEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [, setRefresh] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;

    const doc = htmlToDoc(content);

    const state = EditorState.create({
        doc,
        schema: legalSchema,
        plugins: [
            history(),
            keymap({ 
                'Mod-z': undo, 
                'Mod-y': redo,
                'Mod-b': toggleMark(legalSchema.marks.strong),
                'Mod-i': toggleMark(legalSchema.marks.em),
                'Mod-u': toggleMark(legalSchema.marks.u),
                'Mod-a': selectAll,
                ...baseKeymap 
            }),
            paginationPlugin,
        ]
    });

    const newView = new EditorView(editorRef.current, {
        state,
        dispatchTransaction(transaction) {
            const newState = newView.state.apply(transaction);
            newView.updateState(newState);
            setRefresh(r => r + 1);

            if (transaction.docChanged) {
                const fragment = DOMSerializer.fromSchema(legalSchema).serializeFragment(newState.doc.content);
                const tmp = document.createElement('div');
                tmp.appendChild(fragment);
                onChange(tmp.innerHTML);
            }
        }
    });

    setView(newView);
    return () => newView.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync content prop when it changes externally (e.g. from AI, import, or revert)
  useEffect(() => {
    if (view && content !== undefined) {
        const newDoc = htmlToDoc(content);
        if (!view.state.doc.eq(newDoc)) {
            const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc.content);
            view.dispatch(tr);
        }
    }
  }, [content, view]);

  // Listen for cursor-aware insertion commands
  useEffect(() => {
    if (!view) return;

    const handleInsert = (e: Event) => {
      const customEvent = e as CustomEvent;
      const html = customEvent.detail;
      
      const element = document.createElement('div');
      element.innerHTML = html;
      
      const slice = DOMParser.fromSchema(legalSchema).parseSlice(element);
      const tr = view.state.tr.replaceSelection(slice);
      view.dispatch(tr);
      view.focus();
    };

    window.addEventListener('editor:insert', handleInsert);
    return () => window.removeEventListener('editor:insert', handleInsert);
  }, [view]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 flex flex-col items-center py-6">
      {/* Sticky Formatting Toolbar */}
      <div className="sticky top-0 z-10 w-[8.5in] mb-6 flex justify-center">
        <FormattingToolbar 
          view={view} 
          onImport={onImport}
          onSaveAsNew={onSaveAsNew}
          onSave={() => onSave(content)}
        />
      </div>

      {/* ProseMirror mounts here — pages render as .legal-page divs */}
      <div className="w-[8.5in] relative pb-20">
        <div ref={editorRef} className="ProseMirror-container" />
      </div>
    </div>
  );
};

