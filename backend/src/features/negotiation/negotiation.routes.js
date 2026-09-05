'use strict';

const { Router } = require('express');
const controller = require('./negotiation.controller');
const {
  createNegotiationRules,
  confirmQuotationRules,
  validate,
} = require('./negotiation.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

router.use(authenticate);

// Post new negotiation message / counter-offer (Customer or Sales Rep)
router.post(
  '/',
  authorize('CUSTOMER', 'SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  createNegotiationRules,
  validate,
  controller.createNegotiation
);

// Get negotiation history for a quotation (both /:quotationId and /quotation/:quotationId)
router.get(
  '/quotation/:quotationId',
  authorize('CUSTOMER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS'),
  controller.getNegotiationHistory
);

router.get(
  '/:quotationId',
  authorize('CUSTOMER', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPERATIONS'),
  controller.getNegotiationHistory
);

// Confirm quotation
router.post(
  '/:quotationId/confirm',
  authorize('CUSTOMER', 'SALES_REP', 'SALES_MANAGER', 'ADMIN'),
  confirmQuotationRules,
  validate,
  controller.confirmQuotation
);

module.exports = router;
