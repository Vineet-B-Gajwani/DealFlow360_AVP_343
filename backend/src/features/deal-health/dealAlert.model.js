'use strict';

const mongoose = require('mongoose');

const dealAlertSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: [true, 'quotationId is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['STALLED_DEAL', 'DISCOUNT_ANOMALY', 'DELIVERY_SLIPPAGE'],
      required: [true, 'Alert type is required'],
      index: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'DISMISSED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const DealAlert = mongoose.model('DealAlert', dealAlertSchema);

module.exports = { DealAlert };
