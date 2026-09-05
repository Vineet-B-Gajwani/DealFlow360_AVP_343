'use strict';

const { body, param, query, validationResult } = require('express-validator');

const createInvoiceRules = [
  body('sourceOrderId')
    .isMongoId()
    .withMessage('Valid sourceOrderId (Quotation) is required'),
  body('customerId')
    .isMongoId()
    .withMessage('Valid customerId is required'),
  body('lines')
    .isArray({ min: 1 })
    .withMessage('Invoice must contain at least one line item'),
  body('lines.*.productId')
    .isMongoId()
    .withMessage('Line item productId is required'),
  body('lines.*.productName')
    .trim()
    .notEmpty()
    .withMessage('Line item productName is required'),
  body('lines.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Line item quantity must be at least 1'),
  body('lines.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Line item unitPrice must be >= 0'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid dueDate is required'),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

module.exports = {
  createInvoiceRules,
  validate,
};
