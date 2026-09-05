'use strict';

const mongoose = require('mongoose');

/**
 * ApprovalConfig Model
 * Stores the required approval level per discount tier or other criteria.
 * This can be extended in the future to include more dynamic rules.
 */
const approvalConfigSchema = new mongoose.Schema(
  {
    // Example: rule name or description
    name: { type: String, required: true, trim: true },
    // e.g., minimum discount percent to trigger this config
    minDiscountPercent: { type: Number, required: true, min: 0, max: 100 },
    // Required approval level from approvals.REQUIRED_LEVEL enum
    requiredApprovalLevel: { type: String, required: true },
  },
  { timestamps: true }
);

const ApprovalConfig = mongoose.model('ApprovalConfig', approvalConfigSchema);

module.exports = { ApprovalConfig };
