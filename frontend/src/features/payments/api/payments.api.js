import apiClient from '../../auth/api/auth.api';

const API_BASE = '/payments';

const paymentsApi = {
  record: (data) => apiClient.post(API_BASE, data),
  getByInvoice: (invoiceId) => apiClient.get(`${API_BASE}/invoice/${invoiceId}`),
};

export default paymentsApi;
