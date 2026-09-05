import apiClient from '../../auth/api/auth.api';

export const paymentApi = {
  getPaymentsByInvoice: (invoiceId) => apiClient.get(`/payments/invoice/${invoiceId}`),
  recordPayment: (payload) => apiClient.post('/payments', payload),
};

export default paymentApi;
