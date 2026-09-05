'use strict';

const mongoose = require('mongoose');

/**
 * PriceList Model
 * Supports customer-tier pricing, currency-aware pricing, and product-specific pricing.
 */
const priceListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Price list name is required'],
      trim: true,
      maxlength: 100,
    },
    tier: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold', 'Platinum'],
      required: true,
      index: true,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Product specific overrides
    productOverrides: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        overridePrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure only one active price list per tier/currency combo
priceListSchema.index({ tier: 1, currency: 1, isActive: 1 }, { unique: true });

const PriceList = mongoose.model('PriceList', priceListSchema);

module.exports = { PriceList };
