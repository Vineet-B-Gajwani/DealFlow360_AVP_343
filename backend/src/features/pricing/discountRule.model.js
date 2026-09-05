'use strict';

const mongoose = require('mongoose');
const { REQUIRED_LEVEL } = require('../approvals/approval.model');

/**
 * DiscountRule Model
 * Defines the maximum allowed discount for a given customer tier and product category.
 * If exceeded, the specified approval level is required.
 */
const discountRuleSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold', 'Platinum'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    maxDiscountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    requiredApprovalLevel: {
      type: String,
      enum: Object.values(REQUIRED_LEVEL),
      default: REQUIRED_LEVEL.SALES_MANAGER,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique rule per tier and category combo
discountRuleSchema.index({ tier: 1, category: 1 }, { unique: true });

const DiscountRule = mongoose.model('DiscountRule', discountRuleSchema);

module.exports = { DiscountRule };
