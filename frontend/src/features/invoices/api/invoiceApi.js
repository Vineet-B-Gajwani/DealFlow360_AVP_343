import apiClient from '../../auth/api/auth.api';

export const invoiceApi = {
  getMyInvoices: () => apiClient.get('/invoices'),
  getInvoiceById: (id) => apiClient.get(`/invoices/${id}`),
};

export default invoiceApi;
