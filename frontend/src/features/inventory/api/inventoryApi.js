import axios from 'axios';

const BASE = '/api/inventory';

function authHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchInventory = async (params = {}) => {
  const { data } = await axios.get(BASE, { params, headers: authHeader() });
  return data;
};

export const upsertStock = async (payload) => {
  const { data } = await axios.post(BASE, payload, { headers: authHeader() });
  return data;
};
