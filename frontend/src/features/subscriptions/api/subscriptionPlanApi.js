import axios from 'axios';

const BASE = '/api/subscriptions/plans';

function authHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchPlans = async (params = {}) => {
  const { data } = await axios.get(BASE, { params, headers: authHeader() });
  return data;
};

export const fetchPlan = async (id) => {
  const { data } = await axios.get(`${BASE}/${id}`, { headers: authHeader() });
  return data;
};

export const createPlan = async (payload) => {
  const { data } = await axios.post(BASE, payload, { headers: authHeader() });
  return data;
};

export const updatePlan = async (id, payload) => {
  const { data } = await axios.put(`${BASE}/${id}`, payload, { headers: authHeader() });
  return data;
};
