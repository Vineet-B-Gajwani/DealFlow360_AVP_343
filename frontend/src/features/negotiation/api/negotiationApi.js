import apiClient from '../../auth/api/auth.api';

export const negotiationApi = {
  /**
   * GET /api/negotiation/quotation/:quotationId
   */
  getNegotiations: (quotationId) => 
    apiClient.get(`/negotiation/quotation/${quotationId}`),

  /**
   * POST /api/negotiation
   * payload: { quotationId, quotationLineId, type, message, requestedValue }
   */
  submitNegotiation: (payload) => 
    apiClient.post('/negotiation', payload),
};

export default negotiationApi;
