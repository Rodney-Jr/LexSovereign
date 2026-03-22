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
  
  // Actions
  setEditor: (editor: Editor | null) => void;
  setMode: (mode: StudioMode) => void;
  setZoom: (zoom: number) => void;
  setSaving: (isSaving: boolean) => void;
  
  // Editor Commands
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleHeading: (level: 1 | 2 | 3) => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  editor: null,
  activeMode: 'draft',
  zoom: 1,
  isSaving: false,

  setEditor: (editor) => set({ editor }),
  setMode: (activeMode) => set({ activeMode }),
  setZoom: (zoom) => set({ zoom }),
  setSaving: (isSaving) => set({ isSaving }),

  toggleBold: () => get().editor?.chain().focus().toggleBold().run(),
  toggleItalic: () => get().editor?.chain().focus().toggleItalic().run(),
  toggleUnderline: () => get().editor?.chain().focus().toggleUnderline().run(),
  toggleHeading: (level) => get().editor?.chain().focus().toggleHeading({ level }).run(),
  toggleBulletList: () => get().editor?.chain().focus().toggleBulletList().run(),
  toggleOrderedList: () => get().editor?.chain().focus().toggleOrderedList().run(),
}));
