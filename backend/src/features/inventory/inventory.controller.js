'use strict';

const inventoryService = require('./inventory.service');

async function listInventory(req, res, next) {
  try {
    const inventory = await inventoryService.listInventory(req.query);
    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    next(err);
  }
}

async function getProductStockView(req, res, next) {
  try {
    const inventory = await inventoryService.getProductStockView(req.params.productId);
    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    next(err);
  }
}

async function getWarehouseStockView(req, res, next) {
  try {
    const inventory = await inventoryService.getWarehouseStockView(req.params.warehouseId);
    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    next(err);
  }
}

async function upsertStock(req, res, next) {
  try {
    const inventory = await inventoryService.upsertStock(req.body);
    res.status(200).json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listInventory,
  getProductStockView,
  getWarehouseStockView,
  upsertStock,
};
