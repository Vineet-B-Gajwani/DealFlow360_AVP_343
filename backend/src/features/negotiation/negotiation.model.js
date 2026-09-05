'use strict';

const mongoose = require('mongoose');

const NEGOTIATION_TYPES = [
  'LINE_COMMENT',
  'CHANGE_REQUEST',
  'COUNTER_DISCOUNT',
  'CONFIRMATION'
];

const NEGOTIATION_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'RESOLVED'
];

/**
 * Negotiation Model
 * 
 * Tracks customer negotiation actions against quotations.
 * This satisfies both Feature 3 (Negotiation) and Feature 4 (Reapproval Prep).
 * 
 * The structured `requestedValue` and `type` allow internal M1/M2 systems 
 * to consume these records later for reapproval/discount recalculation.
 */
const negotiationSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'quotationId is required'],
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'customerId is required'],
      index: true,
    },
    quotationLineId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // Only applicable if negotiating a specific line item
    },
    type: {
      type: String,
      enum: NEGOTIATION_TYPES,
      required: [true, 'Negotiation type is required'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    requestedValue: {
      type: Number,
      default: null, // e.g. the specific discount % requested in COUNTER_DISCOUNT
    },
    status: {
      type: String,
      enum: NEGOTIATION_STATUSES,
      default: 'PENDING',
    }
  },
  {
    timestamps: true,
  }
);

const Negotiation = mongoose.model('Negotiation', negotiationSchema);

module.exports = { Negotiation, NEGOTIATION_TYPES, NEGOTIATION_STATUSES };
