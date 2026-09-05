'use strict';

const express = require('express');
const router = express.Router();

const inventoryController = require('./inventory.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

// Only ADMIN and FINANCE_OPERATIONS have write access to inventory for now. Read access to all internal.
const ALL_INTERNAL = ['SALES_REP', 'SALES_MANAGER', 'FINANCE_OPERATIONS', 'ADMIN'];
const OPS = ['FINANCE_OPERATIONS', 'ADMIN'];

// POST /api/inventory
router.post(
  '/',
  authenticate,
  authorize(...OPS),
  inventoryController.upsertStock
);

// GET /api/inventory
router.get(
  '/',
  authenticate,
  authorize(...ALL_INTERNAL),
  inventoryController.listInventory
);

// GET /api/inventory/product/:productId
router.get(
  '/product/:productId',
  authenticate,
  authorize(...ALL_INTERNAL),
  inventoryController.getProductStockView
);

// GET /api/inventory/warehouse/:warehouseId
router.get(
  '/warehouse/:warehouseId',
  authenticate,
  authorize(...ALL_INTERNAL),
  inventoryController.getWarehouseStockView
);

module.exports = router;
