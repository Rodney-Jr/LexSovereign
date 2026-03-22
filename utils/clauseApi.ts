import { authorizedFetch } from './api';

export interface Clause {
  id: string;
  title: string;
  category: string;
  jurisdiction: string;
  content: any;
  tags: string[];
  usageCount: number;
  isGlobal: boolean;
  updatedAt: string;
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

export const clauseApi = {
  /**
   * List clauses with optional filtering
   */
  async list(params: { search?: string; category?: string; tags?: string } = {}): Promise<Clause[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.tags) query.append('tags', params.tags);
    
    return await authorizedFetch(`/api/clauses?${query.toString()}`, {
      token: getAuthToken()
    });
  },

  /**
   * Get a single clause by ID
   */
  async get(id: string): Promise<Clause> {
    return await authorizedFetch(`/api/clauses/${id}`, {
      token: getAuthToken()
    });
  },

  /**
   * Create a new clause
   */
  async create(data: Partial<Clause>): Promise<Clause> {
    return await authorizedFetch('/api/clauses', {
      method: 'POST',
      body: JSON.stringify(data),
      token: getAuthToken()
    });
  },

  /**
   * Update an existing clause
   */
  async update(id: string, data: Partial<Clause>): Promise<Clause> {
    return await authorizedFetch(`/api/clauses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token: getAuthToken()
    });
  },

  /**
   * Delete a clause
   */
  async delete(id: string): Promise<{ message: string }> {
    return await authorizedFetch(`/api/clauses/${id}`, {
      method: 'DELETE',
      token: getAuthToken()
    });
  }
};
