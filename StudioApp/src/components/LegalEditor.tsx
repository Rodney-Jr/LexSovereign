import { useEffect, useRef, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, undo, redo } from 'prosemirror-history';
import { DOMParser, DOMSerializer } from 'prosemirror-model';
import { legalSchema } from '../Schema/LegalSchema';
import { FormattingToolbar } from './FormattingToolbar';

interface LegalEditorProps {
  docId: string | null;
  content: string;
  onChange: (content: string) => void;
  onSave: (content: string) => void;
  onImport?: (content: string) => void;
  onSaveAsNew?: () => void;
}

export const LegalEditor = ({ content, onChange, onSave, onImport, onSaveAsNew }: LegalEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [, setRefresh] = useState(0); // Trigger re-render on selection change for toolbar

  useEffect(() => {
    if (!editorRef.current) return;

    // Convert potential HTML string to ProseMirror Doc
    const element = document.createElement('div');
    element.innerHTML = content || '<p></p>';
    const doc = DOMParser.fromSchema(legalSchema).parse(element);

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
                ...baseKeymap 
            })
        ]
    });

    const newView = new EditorView(editorRef.current, {
        state,
        dispatchTransaction(transaction) {
            const newState = newView.state.apply(transaction);
            newView.updateState(newState);
            
            // Force toolbar update on selection/state change
            setRefresh(r => r + 1);

            // Convert back to HTML for the parent component if content changed
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
  }, []);

  // Sync content prop when it changes externally (e.g. from AI Insertion)
  useEffect(() => {
    if (view && content) {
        const element = document.createElement('div');
        element.innerHTML = content;
        const newDoc = DOMParser.fromSchema(legalSchema).parse(element);
        
        // Only update if the document is actually different
        if (!view.state.doc.eq(newDoc)) {
            const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc);
            view.dispatch(tr);
        }
    }
  }, [content, view]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 flex flex-col items-center py-6">
      {/* Floating/Fixed Toolbar */}
      <div className="sticky top-0 z-10 w-[8.5in] mb-6 flex justify-center">
        <FormattingToolbar 
          view={view} 
          onImport={onImport}
          onSaveAsNew={onSaveAsNew}
          onSave={() => onSave(content)}
        />
      </div>

      <div className="w-[8.5in] relative pb-20">
        <div ref={editorRef} className="ProseMirror-container shadow-2xl" />
      </div>
    </div>
  );
};

