'use strict';

const productService = require('./product.service');

// ─────────────────────────────────────────────────────────────────────────────
//  Product Controllers
//
//  Controllers are thin HTTP adapters.  All business logic is in product.service.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/products
 * Create a new product.
 * Roles: ADMIN, SALES_MANAGER
 */
async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products
 * List products with optional search / filter / pagination.
 * Roles: Any authenticated internal user
 */
async function listProducts(req, res, next) {
  try {
    const result = await productService.listProducts(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/categories
 * Return a distinct sorted list of all categories.
 * Roles: Any authenticated internal user
 */
async function listCategories(req, res, next) {
  try {
    const categories = await productService.listCategories();
    res.json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Get a single product by ID.
 * Roles: Any authenticated internal user
 */
async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:id
 * Full update of a product.
 * Roles: ADMIN, SALES_MANAGER
 */
async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/products/:id/status
 * Toggle active / inactive status.
 * Roles: ADMIN, SALES_MANAGER
 */
async function patchStatus(req, res, next) {
  try {
    const isActive = req.body.isActive === true || req.body.isActive === 'true';
    const product = await productService.setProductStatus(req.params.id, isActive);
    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProduct,
  listProducts,
  listCategories,
  getProduct,
  updateProduct,
  patchStatus,
};
