/**
 * @file documentMetrics.ts
 * @module NomosDesk/Studio/Domain
 * @description Domain logic for document statistics.
 */

import { DocumentMetrics } from './documentTypes';

/**
 * extractTextFromJson:
 * Recursively extracts plain text from a TipTap JSON structure.
 */
const extractTextFromJson = (json: any): string => {
  if (!json) return '';
  if (typeof json === 'string') return json;
  if (json.text) return json.text;
  if (Array.isArray(json.content)) {
    return json.content.map(extractTextFromJson).join(' ');
  }
  if (json.content) {
    return extractTextFromJson(json.content);
  }
  return '';
};

/**
 * calculateMetrics:
 * Computes word count, character count, and estimated reading time.
 */
export const calculateMetrics = (content: any): DocumentMetrics => {
  const text = typeof content === 'string' ? content : extractTextFromJson(content);
  
  if (!text || text.trim().length === 0) {
    return {
      wordCount: 0,
      charCount: 0,
      readingTime: 0,
      pageCount: 1
    };
  }

  // 1. Character Count (with spaces)
  const charCount = text.length;

  // 2. Word Count (using regex for accuracy across line breaks)
  const wordCount = text.trim().split(/\s+/).length || 0;

  // 3. Reading Time (Standard speed: 200 words per minute)
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(wordCount / wordsPerMinute) || 1;

  // 4. Page Count (A4 estimation: ~3200 chars per page as per our canvas engine)
  const charsPerPage = 3200;
  const pageCount = Math.max(1, Math.ceil(charCount / charsPerPage));

  return {
    wordCount,
    charCount,
    readingTime,
    pageCount
  };
};
