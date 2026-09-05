'use strict';

const mongoose = require('mongoose');

const backorderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    fulfilledQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'FULFILLED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Backorder = mongoose.model('Backorder', backorderSchema);

module.exports = { Backorder };
