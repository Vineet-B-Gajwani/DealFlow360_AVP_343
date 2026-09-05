'use strict';

const { Router } = require('express');
const controller = require('./invoice.controller');
const { createInvoiceRules, validate } = require('./invoice.validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = Router();

router.use(authenticate);

// List invoices (Customer sees their own; Admin/SalesManager sees all)
router.get('/', controller.listInvoices);

// Get single invoice
router.get('/:id', controller.getInvoiceById);

// Internal write endpoints
router.post(
  '/',
  authorize('ADMIN', 'SALES_MANAGER'),
  createInvoiceRules,
  validate,
  controller.createInvoice
);

router.patch(
  '/:id/status',
  authorize('ADMIN', 'SALES_MANAGER'),
  controller.updateInvoiceStatus
);

module.exports = router;
