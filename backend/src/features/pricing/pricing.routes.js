'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./pricing.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

// Only Admins and Sales Managers can configure pricing rules
const CONFIG_ROLES = ['ADMIN', 'SALES_MANAGER'];

// Price Lists
router.get('/price-lists', authenticate, controller.getPriceLists);
router.post('/price-lists', authenticate, authorize(...CONFIG_ROLES), controller.createPriceList);

// Discount Rules
router.get('/discount-rules', authenticate, controller.getDiscountRules);
router.post('/discount-rules', authenticate, authorize(...CONFIG_ROLES), controller.upsertDiscountRule);

// Upsell Rules
router.get('/upsell-rules', authenticate, controller.getUpsellRules);
router.post('/upsell-rules', authenticate, authorize(...CONFIG_ROLES), controller.upsertUpsellRule);

module.exports = router;
