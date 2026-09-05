import apiClient from '../../auth/api/auth.api';

export const reportingApi = {
  getDashboard: () => apiClient.get('/reporting/dashboard'),
};

export default reportingApi;
