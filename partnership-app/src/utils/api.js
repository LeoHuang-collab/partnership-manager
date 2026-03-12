const API_BASE_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

const api = {
  async request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || '请求失败');
    }

    return response.json();
  },

  auth: {
    login: (username, password) => 
      api.request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    register: (data) => 
      api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => 
      api.request('/auth/me'),
  },

  projects: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/projects${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.request(`/projects/${id}`),
    create: (data) => api.request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => api.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => api.request(`/projects/${id}`, { method: 'DELETE' }),
  },

  partners: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/partners${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.request(`/partners/${id}`),
    create: (data) => api.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => api.request(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => api.request(`/partners/${id}`, { method: 'DELETE' }),
  },

  reports: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/reports${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.request(`/reports/${id}`),
    create: (data) => api.request('/reports', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => api.request(`/reports/${id}`, { method: 'DELETE' }),
  },

  todos: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/todos${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.request(`/todos/${id}`),
    create: (data) => api.request('/todos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => api.request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => api.request(`/todos/${id}`, { method: 'DELETE' }),
  },
};

export default api;
