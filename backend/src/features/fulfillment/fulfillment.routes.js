'use strict';

const express = require('express');
const router = express.Router();

const fulfillmentController = require('./fulfillment.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const OPS = ['SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];
const ALL_INTERNAL = ['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];

// POST /api/fulfillment/recommend
router.post(
  '/recommend',
  authenticate,
  authorize(...ALL_INTERNAL),
  fulfillmentController.getRecommendation
);

// GET /api/fulfillment/backorders
router.get(
  '/backorders',
  authenticate,
  authorize(...ALL_INTERNAL),
  fulfillmentController.listBackorders
);

// POST /api/fulfillment/backorders
router.post(
  '/backorders',
  authenticate,
  authorize(...OPS),
  fulfillmentController.createBackorder
);

// POST /api/fulfillment/backorders/consolidate/:productId
router.post(
  '/backorders/consolidate/:productId',
  authenticate,
  authorize(...OPS),
  fulfillmentController.consolidateBackorders
);

module.exports = router;
