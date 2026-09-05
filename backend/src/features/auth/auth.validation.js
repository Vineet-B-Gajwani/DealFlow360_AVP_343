'use strict';

const { body, validationResult } = require('express-validator');

// Validation rule chains

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
    .withMessage('Valid email required'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN', 'CUSTOMER'])
    .withMessage('Role must be one of: SALES_REP, SALES_MANAGER, FINANCE_OPERATIONS, ADMIN, CUSTOMER'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email required'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),

  body('role')
    .optional()
    .isIn(['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN', 'CUSTOMER'])
    .withMessage('Role must be one of: SALES_REP, SALES_MANAGER, FINANCE_OPERATIONS, ADMIN, CUSTOMER'),
];

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
