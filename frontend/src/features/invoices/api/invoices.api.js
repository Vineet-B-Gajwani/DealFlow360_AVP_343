import axios from 'axios';

const API_BASE = '/api/invoices';

const invoicesApi = {
  list: (params) => axios.get(API_BASE, { params }),
  getById: (id) => axios.get(`${API_BASE}/${id}`),
  create: (data) => axios.post(API_BASE, data),
  updateStatus: (id, status) => axios.patch(`${API_BASE}/${id}/status`, { status }),
};

export default invoicesApi;
