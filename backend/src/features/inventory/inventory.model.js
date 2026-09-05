'use strict';

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Assuming Product model exists elsewhere or will exist
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    backorderedQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a product can only have one inventory record per warehouse
inventorySchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = { Inventory };
