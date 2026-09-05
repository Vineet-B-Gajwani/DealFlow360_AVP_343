'use strict';

const mongoose = require('mongoose');

const INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'CANCELLED'];
const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID'];

const invoiceLineSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // From M1
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lineTotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

/**
 * Invoice Model
 * 
 * Feature 5: Tracks financial invoices.
 * References the originating quotation/order (`sourceOrderId`) from M1/M2.
 */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sourceOrderId: {
      type: mongoose.Schema.Types.ObjectId, // Could be Quotation ID or Order ID
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    lines: [invoiceLineSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: INVOICE_STATUSES,
      default: 'DRAFT',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'UNPAID',
    },
    issueDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = { Invoice, INVOICE_STATUSES, PAYMENT_STATUSES };
