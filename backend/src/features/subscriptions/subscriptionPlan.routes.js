'use strict';

const express = require('express');
const router = express.Router();

const subscriptionPlanController = require('./subscriptionPlan.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const ADMIN_ONLY = ['ADMIN'];
const ALL_INTERNAL = ['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];

// POST /api/subscriptions/plans
router.post(
  '/plans',
  authenticate,
  authorize(...ADMIN_ONLY),
  subscriptionPlanController.createPlan
);

// GET /api/subscriptions/plans
router.get(
  '/plans',
  authenticate,
  authorize(...ALL_INTERNAL),
  subscriptionPlanController.listPlans
);

// GET /api/subscriptions/plans/:id
router.get(
  '/plans/:id',
  authenticate,
  authorize(...ALL_INTERNAL),
  subscriptionPlanController.getPlanById
);

// PUT /api/subscriptions/plans/:id
router.put(
  '/plans/:id',
  authenticate,
  authorize(...ADMIN_ONLY),
  subscriptionPlanController.updatePlan
);

module.exports = router;
