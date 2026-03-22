/**
 * @file documentValidator.ts
 * @module NomosDesk/Studio/Domain
 * @description Pure domain logic for document hygiene and validation.
 */

import { ValidationReport } from './documentTypes';
import { TextDiff } from '../../../hooks/useDocumentState';

/**
 * validateDocumentHygiene:
 * Scans the document for unresolved placeholders and non-canonical states.
 */
export const validateDocumentHygiene = (
  content: any, 
  diffs: TextDiff[]
): ValidationReport => {
  const extractText = (json: any): string => {
    if (typeof json === 'string') return json;
    if (json?.text) return json.text;
    if (Array.isArray(json?.content)) return json.content.map(extractText).join(' ');
    return '';
  };

  const textContent = extractText(content);
  const unresolvedPlaceholders: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Scan for standard placeholders like [MISSING: FIELD] or {{placeholder}}
  const placeholderRegex = /\[MISSING:\s*[^\]]+\]|\{\{([^}]+)\}\}/gi;
  let match;
  while ((match = placeholderRegex.exec(textContent)) !== null) {
    unresolvedPlaceholders.push(match[0]);
  }

  // 2. Check for pending redlines (insert/delete that aren't accepted/rejected)
  const pendingChanges = diffs.filter(d => d.status === 'pending');

  if (unresolvedPlaceholders.length > 0) {
    errors.push(`Found ${unresolvedPlaceholders.length} unresolved placeholders.`);
  }

  if (pendingChanges.length > 0) {
    warnings.push(`There are ${pendingChanges.length} pending tracked changes.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    unresolvedPlaceholders,
    pendingChangesCount: pendingChanges.length
  };
};
