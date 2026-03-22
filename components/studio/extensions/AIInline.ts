import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface AIInlineOptions {
  suggestion: string;
}

export const AIInline = Extension.create<AIInlineOptions>({
  name: 'aiInline',

  addOptions() {
    return {
      suggestion: '',
    };
  },

  addProseMirrorPlugins() {
    const key = new PluginKey('aiInline');
    
    return [
      new Plugin({
        key,
        props: {
          decorations: (state) => {
            const { decorationSet, suggestion } = this.storage;
            if (suggestion) {
               const { from } = state.selection;
               const widget = document.createElement('span');
               widget.classList.add('ai-ghost-suggestion', 'text-slate-400', 'italic', 'opacity-50', 'pointer-events-none');
               widget.textContent = suggestion;
               return DecorationSet.create(state.doc, [
                 Decoration.widget(from, widget, { side: 1 })
               ]);
            }
            return DecorationSet.empty;
          },
        },
      }),
    ];
  },

  addStorage() {
    return {
      suggestion: '',
    };
  },

  addCommands() {
    return {
      setSuggestion: (text: string) => ({ editor }: any) => {
        this.storage.suggestion = text;
        editor.view.dispatch(editor.state.tr);
        return true;
      },
      clearSuggestion: () => ({ editor }: any) => {
        this.storage.suggestion = '';
        editor.view.dispatch(editor.state.tr);
        return true;
      },
      acceptSuggestion: () => ({ editor }: any) => {
        const text = this.storage.suggestion;
        if (text) {
          editor.chain().focus().insertContent(text).run();
          this.storage.suggestion = '';
        }
        return true;
      },
    };
  },
  
  addKeyboardShortcuts() {
    return {
      'Tab': () => {
        return (this.editor.commands as any).acceptSuggestion();
      },
      'Escape': () => {
        return (this.editor.commands as any).clearSuggestion();
      },
    };
  },
} as any);
