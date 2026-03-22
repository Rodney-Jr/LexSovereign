import { Mark, mergeAttributes, Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const Insertion = Mark.create({
  name: 'insertion',
  addAttributes() {
    return {
      author: { default: 'Counselor' },
      timestamp: { default: Date.now() },
    };
  },
  parseHTML: () => [{ tag: 'ins' }],
  renderHTML: ({ HTMLAttributes }) => ['ins', mergeAttributes(HTMLAttributes, { class: 'text-emerald-600 underline decoration-emerald-500/50 cursor-help' }), 0],
});

export const Deletion = Mark.create({
  name: 'deletion',
  addAttributes() {
    return {
      author: { default: 'Counselor' },
      timestamp: { default: Date.now() },
    };
  },
  parseHTML: () => [{ tag: 'del' }],
  renderHTML: ({ HTMLAttributes }) => ['del', mergeAttributes(HTMLAttributes, { class: 'text-rose-600 line-through decoration-rose-500/50 cursor-help' }), 0],
});

export const TrackChanges = Extension.create({
  name: 'trackChanges',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('trackChanges'),
        appendTransaction: (transactions, oldState, newState) => {
          // Note: Full implementation usually requires complex diffing logic
          // For now, we enable the Marks for manual/command-based redlining
          return null;
        },
      }),
    ];
  },
});
