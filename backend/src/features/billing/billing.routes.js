'use strict';

const express = require('express');
const router = express.Router();

const billingController = require('./billing.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const OPS = ['SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];
const ALL_INTERNAL = ['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];

// POST /api/billing/subscriptions
router.post(
  '/subscriptions',
  authenticate,
  authorize(...OPS),
  billingController.createSubscription
);

// GET /api/billing/subscriptions
router.get(
  '/subscriptions',
  authenticate,
  authorize(...ALL_INTERNAL),
  billingController.listSubscriptions
);

// POST /api/billing/subscriptions/:id/cancel
router.post(
  '/subscriptions/:id/cancel',
  authenticate,
  authorize(...OPS),
  billingController.cancelSubscription
);

module.exports = router;
