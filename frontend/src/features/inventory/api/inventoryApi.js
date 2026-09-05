import apiClient from '../../auth/api/auth.api';

const BASE = '/inventory';

export const fetchInventory = async (params = {}) => {
  const { data } = await apiClient.get(BASE, { params });
  return data;
};

export const upsertStock = async (payload) => {
  const { data } = await apiClient.post(BASE, payload);
  return data;
};
