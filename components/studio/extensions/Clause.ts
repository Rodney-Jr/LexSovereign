import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';

export interface ClauseOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clause: {
      /**
       * Set a clause
       */
      setClause: () => ReturnType;
    };
  }
}

export const Clause = Node.create<ClauseOptions>({
  name: 'clause',

  group: 'block',

  content: 'heading paragraph*',

  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-clause-id'),
        renderHTML: attributes => ({
          'data-style-id': attributes.id,
        }),
      },
      number: {
        default: '1',
        parseHTML: element => element.getAttribute('data-clause-number'),
        renderHTML: attributes => ({
          'data-clause-number': attributes.number,
        }),
      },
      title: {
        default: 'New Clause',
        parseHTML: element => element.getAttribute('data-clause-title'),
        renderHTML: attributes => ({
          'data-style-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'section[data-clause-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['section', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'clause-node' }), 0];
  },

  addCommands() {
    return {
      setClause: () => ({ commands }) => {
        return commands.setNode(this.name);
      },
    };
  },

  addInputRules() {
    return [
      // Match `### ` or `1. ` at the start of a line to transform the block into a structured Clause
      nodeInputRule({
        find: /^\s*###\s$/,
        type: this.type,
      }),
      nodeInputRule({
        find: /^\s*([0-9]+)\.\s$/,
        type: this.type,
        getAttributes: (match) => ({
          number: match[1],
        }),
      }),
    ];
  },
});
