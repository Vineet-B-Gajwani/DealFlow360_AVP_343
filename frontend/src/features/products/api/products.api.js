/**
 * Products API
 *
 * Uses the shared apiClient from auth.api.js which automatically:
 *   - Attaches JWT access token from localStorage
 *   - Silently refreshes on 401 responses
 *
 * All requests go to /api/products/* (proxied to localhost:5000 by Vite).
 */
import apiClient from '../../auth/api/auth.api';

export const productsApi = {
  /**
   * POST /api/products
   * Create a new product.
   */
  create: (data) => apiClient.post('/products', data),

  /**
   * GET /api/products
   * List products with optional filters.
   * @param {object} params - { search, category, productType, isActive, page, limit }
   */
  list: (params = {}) => apiClient.get('/products', { params }),

  /**
   * GET /api/products/categories
   * Return all distinct categories (for filter dropdowns).
   */
  listCategories: () => apiClient.get('/products/categories'),

  /**
   * GET /api/products/:id
   * Get a single product by ID.
   */
  getById: (id) => apiClient.get(`/products/${id}`),

  /**
   * PUT /api/products/:id
   * Full replacement update of a product.
   */
  update: (id, data) => apiClient.put(`/products/${id}`, data),

  /**
   * PATCH /api/products/:id/status
   * Toggle active / inactive status.
   * @param {string} id
   * @param {boolean} isActive
   */
  setStatus: (id, isActive) =>
    apiClient.patch(`/products/${id}/status`, { isActive }),
};

export default productsApi;
