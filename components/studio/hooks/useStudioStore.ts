/**
 * @file useStudioStore.ts
 * @module NomosDesk/Studio/Hooks
 * @description Zustand store for shared studio state and editor orchestration.
 */

import { create } from 'zustand';
import { Editor } from '@tiptap/react';
import { StudioMode } from '../domain/documentTypes';

interface StudioStore {
  editor: Editor | null;
  activeMode: StudioMode;
  zoom: number;
  isSaving: boolean;
  trackChanges: boolean;
  
  // Actions
  setEditor: (editor: Editor | null) => void;
  setMode: (mode: StudioMode) => void;
  setZoom: (zoom: number) => void;
  setSaving: (isSaving: boolean) => void;
  setTrackChanges: (active: boolean) => void;
  toggleTrackChanges: () => void;
  
  // Editor Commands
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleHighlight: (color?: string) => void;
  toggleHeading: (level: 1 | 2 | 3) => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  setTextAlign: (align: 'left' | 'center' | 'right' | 'justify') => void;
  insertTable: () => void;
  setLink: (url: string) => void;
  unsetLink: () => void;
  undo: () => void;
  redo: () => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: string) => void;
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  editor: null,
  activeMode: 'draft',
  zoom: 1,
  isSaving: false,
  trackChanges: false,

  setEditor: (editor) => set({ editor }),
  setMode: (activeMode) => set({ activeMode }),
  setZoom: (zoom) => set({ zoom }),
  setSaving: (isSaving) => set({ isSaving }),
  setTrackChanges: (trackChanges) => set({ trackChanges }),
  toggleTrackChanges: () => set((state) => ({ trackChanges: !state.trackChanges })),

  toggleBold: () => get().editor?.chain().focus().toggleBold().run(),
  toggleItalic: () => get().editor?.chain().focus().toggleItalic().run(),
  toggleUnderline: () => get().editor?.chain().focus().toggleUnderline().run(),
  toggleHighlight: (color = '#FEF08A') => get().editor?.chain().focus().toggleHighlight({ color }).run(),
  toggleHeading: (level) => get().editor?.chain().focus().toggleHeading({ level }).run(),
  toggleBulletList: () => get().editor?.chain().focus().toggleBulletList().run(),
  toggleOrderedList: () => get().editor?.chain().focus().toggleOrderedList().run(),
  setTextAlign: (align) => get().editor?.chain().focus().setTextAlign(align).run(),
  insertTable: () => get().editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  setLink: (url) => get().editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run(),
  unsetLink: () => get().editor?.chain().focus().extendMarkRange('link').unsetLink().run(),
  undo: () => get().editor?.chain().focus().undo().run(),
  redo: () => get().editor?.chain().focus().redo().run(),
  setFontFamily: (font) => get().editor?.chain().focus().setFontFamily(font).run(),
  setFontSize: (size) => (get().editor?.commands as any).setFontSize(size),
}));
