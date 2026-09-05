import axios from 'axios';

const BASE = '/api/approvals';

/** Attach the stored JWT to every request. */
function authHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Submit a new approval request.
 * @param {{ quotationId: string, riskScore: number, requiredLevel: string, requestedBy: string }} payload
 */
export const createApproval = async (payload) => {
  const { data } = await axios.post(BASE, payload, { headers: authHeader() });
  return data;
};

/**
 * List approvals — optional query filters.
 * @param {{ status?: string, quotationId?: string }} [params]
 */
export const fetchApprovals = async (params = {}) => {
  const { data } = await axios.get(BASE, { params, headers: authHeader() });
  return data; // { success, count, data: [] }
};

/**
 * Fetch a single approval by ID.
 * @param {string} id
 */
export const fetchApproval = async (id) => {
  const { data } = await axios.get(`${BASE}/${id}`, { headers: authHeader() });
  return data; // { success, data: {} }
};

/**
 * Approve an approval.
 * @param {string} id
 * @param {{ reason?: string }} [payload]
 */
export const approveApproval = async (id, payload = {}) => {
  const { data } = await axios.post(`${BASE}/${id}/approve`, payload, {
    headers: authHeader(),
  });
  return data;
};

/**
 * Reject an approval.
 * @param {string} id
 * @param {{ reason?: string }} [payload]
 */
export const rejectApproval = async (id, payload = {}) => {
  const { data } = await axios.post(`${BASE}/${id}/reject`, payload, {
    headers: authHeader(),
  });
  return data;
};

/**
 * Return an approval for revision.
 * @param {string} id
 * @param {{ reason?: string }} [payload]
 */
export const returnForRevision = async (id, payload = {}) => {
  const { data } = await axios.post(`${BASE}/${id}/revision`, payload, {
    headers: authHeader(),
  });
  return data;
};
