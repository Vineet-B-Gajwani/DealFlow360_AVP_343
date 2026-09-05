'use strict';

const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────────────────────────────────────
//  Validation rule chains
// ─────────────────────────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),
    // NOTE: Do NOT call .normalizeEmail() here.
    // The User schema already has `lowercase: true` which normalises the email
    // at the Mongoose layer consistently. Using normalizeEmail() here would
    // strip "+" tags and alter the value before it reaches the model, causing
    // login mismatches for users whose email was not already lowercase.

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'])
    .withMessage(
      'Role must be one of: SALES_REP, SALES_MANAGER, FINANCE_OPERATIONS, ADMIN'
    ),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),
    // NOTE: No .normalizeEmail() — see registerRules comment above.

  body('password').notEmpty().withMessage('Password is required'),
];

// ─────────────────────────────────────────────────────────────────────────────
//  Result handler — call this as middleware after the rule chain
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collects express-validator errors and, if any exist, passes a structured
 * error to the next middleware (caught by errorHandler).
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

module.exports = { registerRules, loginRules, validate };
