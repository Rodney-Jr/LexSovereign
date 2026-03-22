/**
 * @file useStudioState.ts
 * @module NomosDesk/Studio/Hooks
 * @description Centralized UI state management for the Drafting Studio.
 */

import { useReducer, useCallback } from 'react';
import { StudioState, StudioMode } from '../domain/documentTypes';

type Action =
  | { type: 'SET_MODE'; payload: StudioMode }
  | { type: 'TOGGLE_PANEL'; payload: 'left' | 'right' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_SEARCHING'; payload: boolean };

const initialState: StudioState = {
  activeMode: 'draft',
  panels: { left: false, right: false },
  zoom: 1,
  isSaving: false,
  isSearching: false
};

const studioReducer = (state: StudioState, action: Action): StudioState => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, activeMode: action.payload };
    case 'TOGGLE_PANEL':
      return {
        ...state,
        panels: { ...state.panels, [action.payload]: !state.panels[action.payload] }
      };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload };
    default:
      return state;
  }
};

export const useStudioState = () => {
  const [state, dispatch] = useReducer(studioReducer, initialState);

  const setMode = useCallback((mode: StudioMode) => dispatch({ type: 'SET_MODE', payload: mode }), []);
  const togglePanel = useCallback((panel: 'left' | 'right') => dispatch({ type: 'TOGGLE_PANEL', payload: panel }), []);
  const setZoom = useCallback((zoom: number) => dispatch({ type: 'SET_ZOOM', payload: zoom }), []);
  const setSaving = useCallback((isSaving: boolean) => dispatch({ type: 'SET_SAVING', payload: isSaving }), []);
  const setSearch = useCallback((isSearching: boolean) => dispatch({ type: 'SET_SEARCHING', payload: isSearching }), []);

  return {
    ...state,
    actions: {
      setMode,
      togglePanel,
      setZoom,
      setSaving,
      setSearch
    }
  };
};
