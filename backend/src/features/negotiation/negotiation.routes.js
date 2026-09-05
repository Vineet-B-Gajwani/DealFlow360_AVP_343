'use strict';

const { Router } = require('express');
const controller = require('./negotiation.controller');
const authenticate = require('../../middleware/authenticate');
const { requireCustomer } = require('../../middleware/requireCustomer');

const router = Router();

// Apply auth and CUSTOMER role check to all negotiation routes
router.use(authenticate, requireCustomer);

/**
 * GET /api/negotiation/quotation/:quotationId
 * Get all negotiations for a specific quotation.
 */
router.get('/quotation/:quotationId', controller.getNegotiations);

/**
 * POST /api/negotiation
 * Submit a new negotiation (comment, change request, counter-discount).
 */
router.post('/', controller.submitNegotiation);

module.exports = router;
