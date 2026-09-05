'use strict';

const mongoose = require('mongoose');

/**
 * UpsellRule Model
 * Configuration for automated product recommendations during quote building.
 */
const upsellRuleSchema = new mongoose.Schema(
  {
    primaryProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    recommendedProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    /** Minimum required margin percentage on the quote to trigger this recommendation */
    minMarginThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Ensure unique recommendation pairing
upsellRuleSchema.index({ primaryProductId: 1, recommendedProductId: 1 }, { unique: true });

const UpsellRule = mongoose.model('UpsellRule', upsellRuleSchema);

module.exports = { UpsellRule };
