import apiClient from '../../auth/api/auth.api';

const API_BASE = '/invoices';

const invoicesApi = {
  list: (params) => apiClient.get(API_BASE, { params }),
  getById: (id) => apiClient.get(`${API_BASE}/${id}`),
  create: (data) => apiClient.post(API_BASE, data),
  updateStatus: (id, status) => apiClient.patch(`${API_BASE}/${id}/status`, { status }),
  downloadPDF: (id) => apiClient.get(`${API_BASE}/${id}/pdf`, { responseType: 'blob' }),
};

export default invoicesApi;
