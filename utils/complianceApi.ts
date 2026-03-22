import { authorizedFetch } from './api';

export interface ComplianceIssue {
    id: string;
    category: 'governance' | 'legal' | 'risk' | 'audit';
    severity: 'critical' | 'warning' | 'advisory';
    title: string;
    description: string;
    recommendation: string;
    action: 'fix' | 'review' | 'escalate';
}

export interface ComplianceResponse {
    score: number;
    status: 'compliant' | 'partially_compliant' | 'non_compliant';
    issues: ComplianceIssue[];
}

const getAuthToken = () => {
  if (typeof window === 'undefined') return '';
  const session = localStorage.getItem('nomosdesk_session');
  try {
    const data = session ? JSON.parse(session) : null;
    return data ? data.token : '';
  } catch (e) {
    return '';
  }
};

export const checkCompliance = async (matterId: string, content: string): Promise<ComplianceResponse> => {
    return authorizedFetch('/api/compliance/check', {
        method: 'POST',
        body: JSON.stringify({ matterId, content }),
        token: getAuthToken()
    });
};
