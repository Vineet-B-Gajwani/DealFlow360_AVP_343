import apiClient from '../../auth/api/auth.api';

const API_BASE = '/reporting';

export const reportingApi = {
  getSummary: (params) => apiClient.get(`${API_BASE}/summary`, { params }),
  getDashboard: (params) => apiClient.get(`${API_BASE}/summary`, { params }),
  exportReport: (params) => apiClient.get(`${API_BASE}/export`, { params, responseType: 'blob' }),
};

export default reportingApi;
