import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * RiskHighlighter Extension
 * Identifies and highlights "risk areas" (BOG, Land Act, AML) in real-time
 * using Prosemirror Decorations (non-destructive).
 */

const RISK_KEYWORDS = [
  // Banking (BOG Act 930)
  { regex: /deposit-taking/gi, severity: 'high', label: 'BOG Regulation Risk' },
  { regex: /tier 1 capital/gi, severity: 'high', label: 'Capital Adequacy Concern' },
  { regex: /liquidity ratio/gi, severity: 'medium', label: 'BOG Liquidity Compliance' },
  { regex: /bog directive/gi, severity: 'high', label: 'BOG Regulatory Override' },
  { regex: /exposure limit/gi, severity: 'high', label: 'Lending Limit Risk' },
  { regex: /act 930/gi, severity: 'medium', label: 'Banking Act Reference' },

  // Real Estate (Land Act 2020)
  { regex: /land act 2020/gi, severity: 'medium', label: 'Land Act Compliance' },
  { regex: /act 1035/gi, severity: 'medium', label: 'Land Act Reference' },
  { regex: /stool land/gi, severity: 'high', label: 'Stool Land Title Risk' },
  { regex: /skin land/gi, severity: 'high', label: 'Skin Land Title Risk' },
  { regex: /allodial/gi, severity: 'high', label: 'Allodial Title Complexity' },
  { regex: /conveyance/gi, severity: 'medium', label: 'Conveyance Audit' },

  // AML / CFT
  { regex: /laundering/gi, severity: 'critical', label: 'AML Violation Risk' },
  { regex: /structuring/gi, severity: 'critical', label: 'Suspicious Structuring' },
  { regex: /suspicious deposit/gi, severity: 'critical', label: 'Money Laundering Signal' },
  { regex: /terrorist financing/gi, severity: 'critical', label: 'Sanctions Violation' },
];

export const RiskHighlighter = Extension.create({
  name: 'riskHighlighter',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('riskHighlighter'),
        state: {
          init(_, { doc }) {
            return findRiskDecorations(doc);
          },
          apply(tr, oldState) {
            return tr.docChanged ? findRiskDecorations(tr.doc) : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function findRiskDecorations(doc: any) {
  const decorations: Decoration[] = [];

  doc.descendants((node: any, pos: number) => {
    if (node.isText) {
      const text = node.text || '';
      
      RISK_KEYWORDS.forEach(risk => {
        let match;
        // Reset lastIndex for global regex
        risk.regex.lastIndex = 0;
        
        while ((match = risk.regex.exec(text)) !== null) {
          const start = pos + match.index;
          const end = start + match[0].length;

          const decoration = Decoration.inline(start, end, {
            class: `risk-mark risk-${risk.severity}`,
            'data-risk-label': risk.label,
            title: `[RISK] ${risk.label}: ${match[0]}`,
          });
          
          decorations.push(decoration);
        }
      });
    }
  });

  return DecorationSet.create(doc, decorations);
}
