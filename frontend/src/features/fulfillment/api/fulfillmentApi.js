import axios from 'axios';

const BASE = '/api/fulfillment';

function authHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getRecommendation = async (payload) => {
  const { data } = await axios.post(`${BASE}/recommend`, payload, { headers: authHeader() });
  return data;
};

export const fetchBackorders = async (params = {}) => {
  const { data } = await axios.get(`${BASE}/backorders`, { params, headers: authHeader() });
  return data;
};

export const createBackorder = async (payload) => {
  const { data } = await axios.post(`${BASE}/backorders`, payload, { headers: authHeader() });
  return data;
};

export const consolidateBackorders = async (productId) => {
  const { data } = await axios.post(`${BASE}/backorders/consolidate/${productId}`, {}, { headers: authHeader() });
  return data;
};
