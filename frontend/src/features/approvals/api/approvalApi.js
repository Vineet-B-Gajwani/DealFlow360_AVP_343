import apiClient from '../../auth/api/auth.api';

const BASE = '/approvals';

export const createApproval = async (payload) => {
  const { data } = await apiClient.post(BASE, payload);
  return data;
};

export const fetchApprovals = async (params = {}) => {
  const { data } = await apiClient.get(BASE, { params });
  return data;
};

export const fetchApproval = async (id) => {
  const { data } = await apiClient.get(`${BASE}/${id}`);
  return data;
};

export const approveApproval = async (id, payload = {}) => {
  const { data } = await apiClient.post(`${BASE}/${id}/approve`, payload);
  return data;
};

export const rejectApproval = async (id, payload = {}) => {
  const { data } = await apiClient.post(`${BASE}/${id}/reject`, payload);
  return data;
};

export const returnForRevision = async (id, payload = {}) => {
  const { data } = await apiClient.post(`${BASE}/${id}/revision`, payload);
  return data;
};

export const escalateApproval = async (id, payload = {}) => {
  const { data } = await apiClient.post(`${BASE}/${id}/escalate`, payload);
  return data;
};

export const fetchApprovalSummary = async () => {
  const { data } = await apiClient.get(`${BASE}/summary`);
  return data;
};
