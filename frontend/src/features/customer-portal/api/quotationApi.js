/**
 * Quotation API Adapter — Customer Portal
 *
 * This module is an adapter against the agreed quotation API contract.
 * It calls the portal backend proxy routes (/api/portal/quotations/*),
 * which in turn call Member 1's internal quotation endpoints with ownership
 * enforcement applied server-side.
 *
 * CONTRACT (GET /api/quotations/:id response shape):
 * {
 *   id, quotationNumber, customerId, customerName, status,
 *   subtotal, discountTotal, taxTotal, grandTotal, margin,
 *   lines: [{ productId, productName, quantity, unitPrice, discount, lineTotal }]
 * }
 *
 * INTEGRATION NOTE:
 * When Member 1's quotation backend is merged, the portal backend routes
 * (/api/portal/quotations/*) will automatically proxy to the live endpoints.
 * No changes are needed in this file at that point.
 *
 * Uses the shared apiClient from Member 1's auth.api.js for:
 *   - Automatic JWT access token attachment
 *   - Silent token refresh on 401
 */
import apiClient from '../../auth/api/auth.api';

export const quotationApi = {
  /**
   * GET /api/portal/quotations
   * Returns all quotations belonging to the authenticated customer.
   * No customerId parameter — resolved server-side from JWT.
   */
  getMyQuotations: () => apiClient.get('/portal/quotations'),

  /**
   * GET /api/portal/quotations/:id
   * Returns a single quotation. Backend enforces ownership.
   * @param {string} quotationId
   */
  getQuotationById: (quotationId) =>
    apiClient.get(`/portal/quotations/${quotationId}`),
};

export default quotationApi;
