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

// Customer endpoints
router.post(
  '/',
  authorize('CUSTOMER'),
  createNegotiationRules,
  validate,
  controller.createNegotiation
);

router.get(
  '/:quotationId',
  authorize('CUSTOMER', 'ADMIN', 'SALES_MANAGER'),
  controller.getNegotiationHistory
);

router.post(
  '/:quotationId/confirm',
  authorize('CUSTOMER'),
  confirmQuotationRules,
  validate,
  controller.confirmQuotation
);

module.exports = router;
