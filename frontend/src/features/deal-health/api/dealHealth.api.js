import axios from 'axios';

const API_BASE = '/api/deal-health';

const dealHealthApi = {
  getAlerts: () => axios.get(`${API_BASE}/alerts`),
  triggerScan: () => axios.post(`${API_BASE}/scan`),
  updateStatus: (id, status) => axios.patch(`${API_BASE}/alerts/${id}/status`, { status }),
};

export default dealHealthApi;
