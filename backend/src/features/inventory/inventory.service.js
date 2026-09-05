'use strict';

const { Inventory } = require('./inventory.model');

function makeError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * List inventory stock. Optionally filter by productId or warehouseId.
 */
async function listInventory(query = {}) {
  const filter = {};
  if (query.productId) filter.productId = query.productId;
  if (query.warehouseId) filter.warehouseId = query.warehouseId;

  return await Inventory.find(filter).sort({ createdAt: -1 });
}

/**
 * Get inventory stock view by productId across all warehouses.
 */
async function getProductStockView(productId) {
  return await Inventory.find({ productId });
}

/**
 * Get inventory stock view by warehouseId for all products.
 */
async function getWarehouseStockView(warehouseId) {
  return await Inventory.find({ warehouseId });
}

/**
 * Create or update stock for a product in a warehouse.
 * Expected data: { productId, warehouseId, availableQuantity, reservedQuantity, backorderedQuantity }
 */
async function upsertStock(data) {
  const { productId, warehouseId, availableQuantity, reservedQuantity, backorderedQuantity } = data;

  const update = {};
  if (availableQuantity !== undefined) update.availableQuantity = availableQuantity;
  if (reservedQuantity !== undefined) update.reservedQuantity = reservedQuantity;
  if (backorderedQuantity !== undefined) update.backorderedQuantity = backorderedQuantity;

  const inventory = await Inventory.findOneAndUpdate(
    { productId, warehouseId },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  return inventory;
}

module.exports = {
  listInventory,
  getProductStockView,
  getWarehouseStockView,
  upsertStock,
};
