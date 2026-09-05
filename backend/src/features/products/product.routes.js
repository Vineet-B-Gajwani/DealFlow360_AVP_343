'use strict';

const { Router } = require('express');
const controller = require('./product.controller');
const {
  createProductRules,
  updateProductRules,
  patchStatusRules,
  listQueryRules,
  validate,
} = require('./product.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

// ── All product routes require authentication ─────────────────────────────────
router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
//  Read — available to all authenticated internal users
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/products/categories
 * Return distinct sorted list of all product categories.
 * Must be declared BEFORE /:id to avoid being shadowed.
 */
router.get('/categories', controller.listCategories);

/**
 * GET /api/products
 * List all products with search, filter and pagination.
 * ?search=  &category=  &productType=  &isActive=  &page=  &limit=
 */
router.get('/', listQueryRules, validate, controller.listProducts);

/**
 * GET /api/products/:id
 * Get a single product by MongoDB _id.
 */
router.get('/:id', controller.getProduct);

// ─────────────────────────────────────────────────────────────────────────────
//  Write — restricted to ADMIN and SALES_MANAGER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/products
 * Create a new product.
 */
router.post(
  '/',
  authorize('ADMIN', 'SALES_MANAGER'),
  createProductRules,
  validate,
  controller.createProduct
);

/**
 * PUT /api/products/:id
 * Full replacement update of a product.
 */
router.put(
  '/:id',
  authorize('ADMIN', 'SALES_MANAGER'),
  updateProductRules,
  validate,
  controller.updateProduct
);

/**
 * PATCH /api/products/:id/status
 * Toggle a product's active / inactive status.
 * Body: { isActive: boolean }
 */
router.patch(
  '/:id/status',
  authorize('ADMIN', 'SALES_MANAGER'),
  patchStatusRules,
  validate,
  controller.patchStatus
);

module.exports = router;
