/**
 * @file aiApi.ts
 * @module NomosDesk/Utils
 * @description Frontend API bridge for AI Copilot features.
 */

import { authorizedFetch } from './api';

export interface AISuggestion {
  title: string;
  previewText: string;
  reason: string;
  clause: any;
}

export interface AIRisk {
  id: string;
  severity: 'CRITICAL' | 'WARNING';
  title: string;
  description: string;
  actionLabel: string;
}

export interface AIContext {
  sectionName: string;
  documentType: string;
  jurisdiction: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

const getAuthToken = () => {
  if (typeof window === 'undefined') return '';
  const session = localStorage.getItem('nomosdesk_session');
  try {
    return session ? JSON.parse(session).token : '';
  } catch (e) {
    return '';
  }
};

export const aiApi = {
  /**
   * Identify Drafting Context
   */
  identifyContext: async (content: string): Promise<AIContext> => {
    return authorizedFetch('/api/ai/context', {
      method: 'POST',
      body: JSON.stringify({ content }),
      token: getAuthToken()
    });
  },

  /**
   * Get clause suggestions
   */
  suggestClauses: async (content: string, jurisdiction: string = 'Ghana'): Promise<AISuggestion[]> => {
    return authorizedFetch('/api/ai/suggestions', {
      method: 'POST',
      body: JSON.stringify({ content, jurisdiction }),
      token: getAuthToken()
    });
  },

  /**
   * Detect drafting risks (High Fidelity)
   */
  detectRisks: async (content: string): Promise<AIRisk[]> => {
    return authorizedFetch('/api/ai/risk-analysis', {
      method: 'POST',
      body: JSON.stringify({ content }),
      token: getAuthToken()
    });
  },

  /**
   * Process Natural Language Command
   */
  processCommand: async (command: string, context: string): Promise<any> => {
    return authorizedFetch('/api/ai/command', {
      method: 'POST',
      body: JSON.stringify({ command, context }),
      token: getAuthToken()
    });
  }
};
