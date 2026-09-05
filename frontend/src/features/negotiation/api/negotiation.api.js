import apiClient from '../../auth/api/auth.api';

const API_BASE = '/negotiation';

const negotiationApi = {
  create: (data) => apiClient.post(API_BASE, data),
  getHistory: (quotationId) => apiClient.get(`${API_BASE}/${quotationId}`),
  getNegotiations: (quotationId) => apiClient.get(`${API_BASE}/${quotationId}`),
  submitNegotiation: (payload) => apiClient.post(API_BASE, payload),
  confirmQuotation: (quotationId, message) =>
    apiClient.post(`${API_BASE}/${quotationId}/confirm`, { message }),
};

export default negotiationApi;
