/**
 * Customer Portal API
 *
 * Uses the shared apiClient (pre-configured Axios instance from Member 1's
 * auth.api.js) which automatically:
 *   - Attaches the JWT access token from localStorage
 *   - Silently refreshes the access token on 401 responses
 *
 * All requests go to /api/portal/* (proxied to localhost:5000 by Vite).
 */
import apiClient from '../../auth/api/auth.api';

export const portalApi = {
  /**
   * GET /api/portal/me
   * Returns the authenticated customer's identity and business profile.
   */
  getMyProfile: () => apiClient.get('/portal/me'),

  /**
   * GET /api/portal/status
   * Returns portal status metadata (activation date, placeholder counts).
   */
  getPortalStatus: () => apiClient.get('/portal/status'),
};

export default portalApi;
