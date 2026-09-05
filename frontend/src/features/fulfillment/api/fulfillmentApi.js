import apiClient from '../../auth/api/auth.api';

const BASE = '/fulfillment';

export const getRecommendation = async (payload) => {
  const { data } = await apiClient.post(`${BASE}/recommend`, payload);
  return data;
};

export const fetchBackorders = async (params = {}) => {
  const { data } = await apiClient.get(`${BASE}/backorders`, { params });
  return data;
};

export const createBackorder = async (payload) => {
  const { data } = await apiClient.post(`${BASE}/backorders`, payload);
  return data;
};

export const consolidateBackorders = async (productId) => {
  const { data } = await apiClient.post(`${BASE}/backorders/consolidate/${productId}`, {});
  return data;
};
