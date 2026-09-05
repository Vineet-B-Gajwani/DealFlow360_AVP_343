'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./quotation.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const ALL_ROLES = ['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN', 'CUSTOMER'];
const SALES_ROLES = ['SALES_REP', 'SALES_MANAGER', 'ADMIN'];

// POST /api/quotations
router.post('/', authenticate, authorize(...SALES_ROLES), controller.createQuotation);

// GET /api/quotations
router.get('/', authenticate, authorize(...ALL_ROLES), controller.getQuotations);

// GET /api/quotations/customers — must come BEFORE /:id to avoid param collision
router.get('/customers', authenticate, authorize(...SALES_ROLES), controller.listCustomers);

// ── Customer Product Demands / Quote Requests routes ───────────────────────────
const requestController = require('./quotationRequest.controller');

router.get('/requests', authenticate, authorize(...SALES_ROLES), requestController.getPendingRequests);
router.post('/requests/:id/convert', authenticate, authorize(...SALES_ROLES), requestController.convertRequestToQuotation);

// GET /api/quotations/:id
router.get('/:id', authenticate, authorize(...ALL_ROLES), controller.getQuotationById);

// PUT /api/quotations/:id
router.put('/:id', authenticate, authorize(...SALES_ROLES), controller.updateQuotation);

// POST /api/quotations/:id/lines
router.post('/:id/lines', authenticate, authorize(...SALES_ROLES), controller.addQuotationLine);

// PUT /api/quotations/:id/lines/:lineId
router.put('/:id/lines/:lineId', authenticate, authorize(...SALES_ROLES), controller.updateQuotationLine);

// DELETE /api/quotations/:id/lines/:lineId
router.delete('/:id/lines/:lineId', authenticate, authorize(...SALES_ROLES), controller.removeQuotationLine);

// POST /api/quotations/:id/submit
router.post('/:id/submit', authenticate, authorize(...SALES_ROLES), controller.submitQuotation);

// POST /api/quotations/:id/confirm
router.post('/:id/confirm', authenticate, authorize(...ALL_ROLES), controller.confirmQuotation);

// GET /api/quotations/:id/recommendations — upsell/cross-sell
router.get('/:id/recommendations', authenticate, authorize(...SALES_ROLES), controller.getRecommendations);

module.exports = router;
