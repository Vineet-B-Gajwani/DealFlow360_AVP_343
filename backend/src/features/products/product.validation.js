'use strict';

const { body, param, query, validationResult } = require('express-validator');
const { PRODUCT_TYPES, UNITS } = require('./product.model');

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared result-checker middleware.
 * Passes a structured 422 error to the centralised errorHandler.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.errors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(error);
  }
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
//  Create — POST /api/products
// ─────────────────────────────────────────────────────────────────────────────

const createProductRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('productType')
    .notEmpty()
    .withMessage('Product type is required')
    .isIn(Object.values(PRODUCT_TYPES))
    .withMessage(`Product type must be one of: ${Object.values(PRODUCT_TYPES).join(', ')}`),

  body('basePrice')
    .notEmpty()
    .withMessage('Base price is required')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a non-negative number'),

  body('costPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),

  body('taxRate')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),

  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(Object.values(UNITS))
    .withMessage(`Unit must be one of: ${Object.values(UNITS).join(', ')}`),

  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),

  body('variants.*.name')
    .if(body('variants').exists())
    .trim()
    .notEmpty()
    .withMessage('Variant name is required')
    .isLength({ max: 100 })
    .withMessage('Variant name must not exceed 100 characters'),

  body('variants.*.priceModifier')
    .if(body('variants').exists())
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Variant price modifier must be non-negative'),

  body('variants.*.isDefault')
    .if(body('variants').exists())
    .optional()
    .isBoolean()
    .withMessage('Variant isDefault must be a boolean'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// ─────────────────────────────────────────────────────────────────────────────
//  Update — PUT /api/products/:id
//  Same rules as create (all fields allowed), only id param added.
// ─────────────────────────────────────────────────────────────────────────────

const updateProductRules = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  ...createProductRules,
];

// ─────────────────────────────────────────────────────────────────────────────
//  Status toggle — PATCH /api/products/:id/status
// ─────────────────────────────────────────────────────────────────────────────

const patchStatusRules = [
  param('id').isMongoId().withMessage('Invalid product ID'),

  body('isActive')
    .notEmpty()
    .withMessage('isActive is required')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// ─────────────────────────────────────────────────────────────────────────────
//  List query — GET /api/products
// ─────────────────────────────────────────────────────────────────────────────

const listQueryRules = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query must not exceed 200 characters'),

  query('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category filter must not exceed 100 characters'),

  query('productType')
    .optional()
    .isIn([...Object.values(PRODUCT_TYPES), ''])
    .withMessage(`Product type filter must be one of: ${Object.values(PRODUCT_TYPES).join(', ')}`),

  query('isActive')
    .optional()
    .isIn(['true', 'false', ''])
    .withMessage('isActive filter must be true or false'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createProductRules,
  updateProductRules,
  patchStatusRules,
  listQueryRules,
  validate,
};
