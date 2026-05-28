const API_BASE = '/api';

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`, { headers: getHeaders() });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  post: async (path: string, body?: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  put: async (path: string, body?: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  delete: async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
