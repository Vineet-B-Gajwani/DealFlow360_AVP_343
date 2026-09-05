'use strict';

const { Router } = require('express');
const controller = require('./payment.controller');
const { recordPaymentRules, validate } = require('./payment.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

router.use(authenticate);

// Record payment (Internal roles only)
router.post(
  '/',
  authorize('ADMIN', 'SALES_MANAGER'),
  recordPaymentRules,
  validate,
  controller.recordPayment
);

// Get payments for an invoice
router.get(
  '/invoice/:invoiceId',
  controller.listInvoicePayments
);

module.exports = router;
