import apiClient from '../../auth/api/auth.api';

export const negotiationApi = {
  getNegotiations: (quotationId) => 
    apiClient.get(`/negotiation/${quotationId}`),

  getHistory: (quotationId) => 
    apiClient.get(`/negotiation/${quotationId}`),

  submitNegotiation: (payload) => 
    apiClient.post('/negotiation', payload),

  create: (payload) => 
    apiClient.post('/negotiation', payload),
};

export default negotiationApi;
