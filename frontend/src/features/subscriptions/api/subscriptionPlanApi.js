import apiClient from '../../auth/api/auth.api';

const BASE = '/subscriptions/plans';

export const fetchPlans = async (params = {}) => {
  const { data } = await apiClient.get(BASE, { params });
  return data;
};

export const fetchPlan = async (id) => {
  const { data } = await apiClient.get(`${BASE}/${id}`);
  return data;
};

export const createPlan = async (payload) => {
  const { data } = await apiClient.post(BASE, payload);
  return data;
};

export const updatePlan = async (id, payload) => {
  const { data } = await apiClient.put(`${BASE}/${id}`, payload);
  return data;
};
