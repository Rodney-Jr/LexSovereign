/**
 * @file documentTypes.ts
 * @module NomosDesk/Studio/Domain
 * @description Strict type definitions for the Legal Drafting Studio.
 */

import { TextDiff } from '../../../hooks/useDocumentState';

export type StudioMode = 'draft' | 'review' | 'compare' | 'studio';

export interface StudioPanels {
  left: boolean;
  right: boolean;
}

export interface StudioState {
  activeMode: StudioMode;
  panels: StudioPanels;
  zoom: number;
  isSaving: boolean;
  isSearching: boolean;
}

export interface DocumentMetrics {
  wordCount: number;
  charCount: number;
  readingTime: number; // in minutes
  pageCount: number;
}

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  unresolvedPlaceholders: string[];
  pendingChangesCount: number;
}

export interface DraftingStudioProps {
  initialData?: {
    id?: string;
    name?: string;
    content?: any;
    matterId?: string | null;
  };
  templateId?: string;
  onSave?: (name: string, content: string, id?: string) => void;
  onClose?: () => void;
}
