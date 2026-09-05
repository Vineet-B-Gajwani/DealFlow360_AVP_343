'use strict';

const { body, param, validationResult } = require('express-validator');

const createNegotiationRules = [
  body('quotationId')
    .isMongoId()
    .withMessage('Valid quotationId is required'),
  body('type')
    .isIn(['LINE_COMMENT', 'CHANGE_REQUEST', 'COUNTER_DISCOUNT', 'CONFIRMATION'])
    .withMessage('Valid negotiation type is required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Message must not exceed 2000 characters'),
  body('quotationLineId')
    .optional({ nullable: true })
    .isString(),
  body('requestedValue')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Requested value must be a number'),
];

const confirmQuotationRules = [
  param('quotationId')
    .isMongoId()
    .withMessage('Valid quotationId parameter is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
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
  createNegotiationRules,
  confirmQuotationRules,
  validate,
};
