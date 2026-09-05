import axios from 'axios';

const BASE = '/api/billing/subscriptions';

function authHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchBillingSubscriptions = async (params = {}) => {
  const { data } = await axios.get(BASE, { params, headers: authHeader() });
  return data;
};

export const createBillingSubscription = async (payload) => {
  const { data } = await axios.post(BASE, payload, { headers: authHeader() });
  return data;
};

export const cancelBillingSubscription = async (id, payload) => {
  const { data } = await axios.post(`${BASE}/${id}/cancel`, payload, { headers: authHeader() });
  return data;
};
