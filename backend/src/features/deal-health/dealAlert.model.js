'use strict';

const mongoose = require('mongoose');

const ALERT_TYPES = ['STALLED_DEAL', 'DISCOUNT_ANOMALY', 'DELIVERY_SLIPPAGE'];
const ALERT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ALERT_STATUSES = ['ACTIVE', 'RESOLVED', 'IGNORED'];

/**
 * DealAlert Model
 * 
 * Feature 7: Deal Health & Anomaly Detection
 * Tracks automated health warnings for quotations/deals.
 */
const dealAlertSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ALERT_TYPES,
      required: true,
    },
    severity: {
      type: String,
      enum: ALERT_SEVERITIES,
      default: 'MEDIUM',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ALERT_STATUSES,
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

const DealAlert = mongoose.model('DealAlert', dealAlertSchema);

module.exports = { DealAlert, ALERT_TYPES, ALERT_SEVERITIES, ALERT_STATUSES };
