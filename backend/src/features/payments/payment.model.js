'use strict';

const mongoose = require('mongoose');

const PAYMENT_METHODS = ['CASH', 'BANK', 'ONLINE', 'OTHER'];
const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED'];

/**
 * Payment Model
 * 
 * Feature 6: Local demo payment recording.
 * Tracks payments against specific invoices.
 */
const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Payment amount must be greater than zero'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
      default: '', // e.g. transaction ID, cheque number
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'COMPLETED', // default to completed for this local demo unless otherwise specified
    }
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment, PAYMENT_METHODS, PAYMENT_STATUSES };
