import axios from 'axios';

const API_BASE = '/api/portal/negotiations';

const negotiationApi = {
  create: (data) => axios.post(API_BASE, data),
  getHistory: (quotationId) => axios.get(`${API_BASE}/${quotationId}`),
  confirmQuotation: (quotationId, message) =>
    axios.post(`${API_BASE}/${quotationId}/confirm`, { message }),
};

export default negotiationApi;
