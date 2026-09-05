'use strict';

const { body, param, validationResult } = require('express-validator');

const recordPaymentRules = [
  body('invoiceId')
    .isMongoId()
    .withMessage('Valid invoiceId is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('method')
    .optional()
    .isIn(['CASH', 'BANK', 'ONLINE', 'OTHER'])
    .withMessage('Valid payment method is required'),
  body('reference')
    .optional({ nullable: true })
    .trim(),
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
  recordPaymentRules,
  validate,
};
