/**
 * @file useDocumentMetrics.ts
 * @module NomosDesk/Studio/Hooks
 * @description Memoized wrapper for compute word count and reading time.
 */

import { useMemo } from 'react';
import { calculateMetrics } from '../domain/documentMetrics';
import { DocumentMetrics } from '../domain/documentTypes';

/**
 * useDocumentMetrics:
 * Optimizes re-renders by memoizing the metrics calculation of the raw document.
 */
export const useDocumentMetrics = (content: string): DocumentMetrics => {
  return useMemo(() => {
    return calculateMetrics(content);
  }, [content]);
};
