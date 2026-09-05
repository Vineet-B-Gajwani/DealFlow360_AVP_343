import axios from 'axios';

const API_BASE = '/api/payments';

const paymentsApi = {
  record: (data) => axios.post(API_BASE, data),
  getByInvoice: (invoiceId) => axios.get(`${API_BASE}/invoice/${invoiceId}`),
};

export default paymentsApi;
