import axios from 'axios';

const API_BASE = '/api/reporting';

const reportingApi = {
  getSummary: (params) => axios.get(`${API_BASE}/summary`, { params }),
  exportReport: (params) => axios.get(`${API_BASE}/export`, { params, responseType: 'blob' }),
};

export default reportingApi;
