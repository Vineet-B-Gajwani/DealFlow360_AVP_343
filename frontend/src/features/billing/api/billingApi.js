import apiClient from '../../auth/api/auth.api';

const BASE = '/billing/subscriptions';

export const fetchBillingSubscriptions = async (params = {}) => {
  const { data } = await apiClient.get(BASE, { params });
  return data;
};

export const createBillingSubscription = async (payload) => {
  const { data } = await apiClient.post(BASE, payload);
  return data;
};

export const cancelBillingSubscription = async (id, payload) => {
  const { data } = await apiClient.post(`${BASE}/${id}/cancel`, payload);
  return data;
};
