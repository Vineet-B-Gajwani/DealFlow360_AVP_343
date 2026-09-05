'use strict';

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────────────────────────────────────
//  Customer Portal Validation Rules
//
//  Current portal routes (GET /me, GET /status) are read-only and carry no
//  body parameters, so there are no input validation rules needed at this stage.
//
//  This file is the extension point for future customer-facing write operations
//  (e.g., updating profile contact details when that feature is added).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validation rules for updating a customer's own profile.
 * Reserved for future use — not yet wired to any route.
 *
 * All fields are optional (partial update / PATCH semantics).
 */
const updateProfileRules = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number must not exceed 30 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
];

/**
 * Collects express-validator errors and, if any exist, passes a structured
 * error object to the centralized error handler (errorHandler.js).
 *
 * Matches the validate() pattern used in auth.validation.js.
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

module.exports = { updateProfileRules, validate };
