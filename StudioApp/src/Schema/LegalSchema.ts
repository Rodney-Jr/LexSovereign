import { Schema } from 'prosemirror-model';
import type { NodeSpec, MarkSpec } from 'prosemirror-model';

const docNode: NodeSpec = {
  content: 'page+'
};

const pageNode: NodeSpec = {
  content: 'block+',
  defining: true,
  toDOM() { return ['div', { class: 'legal-page' }, 0] },
  parseDOM: [{ tag: 'div.legal-page' }]
};

const headingNode: NodeSpec = {
  attrs: { 
    level: { default: 1 },
    align: { default: 'left' }
  },
  content: 'inline*',
  group: 'block',
  defining: true,
  parseDOM: [
    { tag: 'h1', attrs: { level: 1 } }, 
    { tag: 'h2', attrs: { level: 2 } }, 
    { tag: 'h3', attrs: { level: 3 } }
  ],
  toDOM(node) { 
    return ['h' + node.attrs.level, { style: `text-align: ${node.attrs.align}` }, 0]; 
  }
};

const paragraphNode: NodeSpec = {
  attrs: { 
    align: { default: 'left' }
  },
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p' }],
  toDOM(node) { 
    return ['p', { style: `text-align: ${node.attrs.align}` }, 0]; 
  }
};

const textNode: NodeSpec = {
  group: 'inline'
};

const boldMark: MarkSpec = {
  parseDOM: [{ tag: 'b' }, { tag: 'strong' }],
  toDOM() { return ['strong', 0]; }
};

const emMark: MarkSpec = {
  parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
  toDOM() { return ['em', 0]; }
};

const underlineMark: MarkSpec = {
  parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
  toDOM() { return ['u', 0]; }
};

const fontFamilyMark: MarkSpec = {
  attrs: { family: {} },
  parseDOM: [{ style: 'font-family', getAttrs: value => ({ family: value }) }],
  toDOM(mark) { return ['span', { style: `font-family: ${mark.attrs.family}` }, 0]; }
};

const fontSizeMark: MarkSpec = {
  attrs: { size: {} },
  parseDOM: [{ style: 'font-size', getAttrs: value => ({ size: value }) }],
  toDOM(mark) { return ['span', { style: `font-size: ${mark.attrs.size}` }, 0]; }
};

export const legalSchema = new Schema({
  nodes: {
    doc: docNode,
    page: pageNode,
    heading: headingNode,
    paragraph: paragraphNode,
    text: textNode
  },
  marks: {
    strong: boldMark,
    em: emMark,
    u: underlineMark,
    fontFamily: fontFamilyMark,
    fontSize: fontSizeMark
  }
});
