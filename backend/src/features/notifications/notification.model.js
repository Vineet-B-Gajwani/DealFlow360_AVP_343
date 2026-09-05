'use strict';

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    recipientRole: {
      type: String,
      index: true,
      default: null,
    },
    type: {
      type: String,
      enum: [
        'APPROVAL_REQUIRED',
        'CUSTOMER_NEGOTIATION',
        'QUOTATION_STATUS',
        'FULFILLMENT_ISSUE',
        'INVOICE_PAYMENT',
        'STALLED_DEAL',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification };
