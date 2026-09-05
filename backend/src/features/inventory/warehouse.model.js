'use strict';

const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    shippingCostWeight: {
      type: Number,
      default: 1,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = { Warehouse };
