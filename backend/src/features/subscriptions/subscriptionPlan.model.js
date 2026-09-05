'use strict';

const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    applicableProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    prorationConfiguration: {
      enabled: { type: Boolean, default: true },
    },
    cancellationRules: {
      allowed: { type: Boolean, default: true },
      noticeDays: { type: Number, default: 30 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

module.exports = { SubscriptionPlan };
