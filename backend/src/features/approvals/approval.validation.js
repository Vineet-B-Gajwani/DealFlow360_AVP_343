'use strict';

const { body, param } = require('express-validator');
const { REQUIRED_LEVEL } = require('./approval.model');

// ── Create ────────────────────────────────────────────────────────────────────

const validateCreate = [
  body('quotationId')
    .trim()
    .notEmpty()
    .withMessage('quotationId is required')
    .isString()
    .withMessage('quotationId must be a string'),

  body('riskScore')
    .notEmpty()
    .withMessage('riskScore is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('riskScore must be a number between 0 and 100'),

  body('requiredLevel')
    .notEmpty()
    .withMessage('requiredLevel is required')
    .isIn(Object.values(REQUIRED_LEVEL))
    .withMessage(
      `requiredLevel must be one of: ${Object.values(REQUIRED_LEVEL).join(', ')}`
    ),

  body('requestedBy')
    .trim()
    .notEmpty()
    .withMessage('requestedBy is required'),
];

// ── Approve / Reject / Revision — all accept an optional reason ───────────────

const validateAction = [
  body('reason')
    .optional()
    .trim()
    .isString()
    .withMessage('reason must be a string'),
];

// ── Mongo ObjectId param ──────────────────────────────────────────────────────

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid approval ID'),
];

module.exports = { validateCreate, validateAction, validateMongoId };
