import apiClient from '../../auth/api/auth.api';

export const dealHealthApi = {
  getAlerts: () => apiClient.get('/deal-health/alerts'),
  runScan: () => apiClient.post('/deal-health/scan'),
};

export default dealHealthApi;
