import apiClient from '../../auth/api/auth.api';

const API_BASE = '/deal-health';

const dealHealthApi = {
  getAlerts: () => apiClient.get(`${API_BASE}/alerts`),
  triggerScan: () => apiClient.post(`${API_BASE}/scan`),
  updateStatus: (id, status) => apiClient.patch(`${API_BASE}/alerts/${id}/status`, { status }),
};

export default dealHealthApi;
