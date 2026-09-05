'use strict';

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Quotation', // Assumed from integration spec
    },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionPlan',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED', 'PAST_DUE'],
      default: 'ACTIVE',
    },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    amount: {
      type: Number, // Amount per cycle
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    billingSchedule: [
      {
        date: Date,
        amount: Number,
        status: { type: String, enum: ['PENDING', 'PAID', 'VOIDED'], default: 'PENDING' },
        isProrated: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = { Subscription };
