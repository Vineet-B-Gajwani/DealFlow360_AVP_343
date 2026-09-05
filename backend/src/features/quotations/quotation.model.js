'use strict';

const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
//  Enumerations
// ─────────────────────────────────────────────────────────────────────────────

const QUOTATION_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SENT: 'SENT',
  NEGOTIATING: 'NEGOTIATING',
  CONFIRMED: 'CONFIRMED', // Customer accepted
  CANCELLED: 'CANCELLED',
});

// ─────────────────────────────────────────────────────────────────────────────
//  Line Item Schema
// ─────────────────────────────────────────────────────────────────────────────

const quotationLineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true, // Snapshot of price at creation
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Quotation Schema
// ─────────────────────────────────────────────────────────────────────────────

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
      index: true,
    },
    salesRepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sales Rep is required'],
      index: true,
    },
    priceList: {
      type: String,
      default: 'Standard Price List',
    },
    quotationRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuotationRequest',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(QUOTATION_STATUS),
      default: QUOTATION_STATUS.DRAFT,
      index: true,
    },
    lines: {
      type: [quotationLineSchema],
      default: [],
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totals
quotationSchema.pre('save', function (next) {
  let subTotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  this.lines.forEach(line => {
    const lineGross = line.unitPrice * line.quantity;
    subTotal += lineGross;
    discountTotal += line.discount;

    // Calculate tax on net (after discount) amount
    // If product is populated and has taxRate use it, otherwise assume 18%
    const product = line.productId;
    const taxRate = (product && typeof product === 'object' && product.taxRate != null)
      ? product.taxRate
      : 18; // fallback default
    const lineNet = lineGross - (line.discount || 0);
    taxTotal += (lineNet * taxRate) / 100;
  });

  this.subTotal = parseFloat(subTotal.toFixed(2));
  this.discountTotal = parseFloat(discountTotal.toFixed(2));
  this.taxTotal = parseFloat(taxTotal.toFixed(2));
  this.grandTotal = parseFloat((subTotal - discountTotal + taxTotal).toFixed(2));
  
  next();
});

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = { Quotation, QUOTATION_STATUS };
