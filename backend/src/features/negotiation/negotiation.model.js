'use strict';

const mongoose = require('mongoose');

/**
 * Negotiation Model
 *
 * Persists customer negotiation messages, line comments, counter-discounts,
 * change requests, and commercial quotation confirmations.
 */
const negotiationSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
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
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      enum: ['LINE_COMMENT', 'CHANGE_REQUEST', 'COUNTER_DISCOUNT', 'CONFIRMATION'],
      required: [true, 'Negotiation type is required'],
    },
    message: {
      type: String,
      trim: true,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    requestedValue: {
      type: Number,
      default: null,
    },
    requestedDeliveryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'RESOLVED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Negotiation = mongoose.model('Negotiation', negotiationSchema);

module.exports = { Negotiation };
