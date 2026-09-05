'use strict';

const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'QUOTATION_STATUS_CHANGED',
  'DEAL_HEALTH_ALERT',
  'INVOICE_ISSUED'
];

/**
 * Notification Model
 * 
 * Feature 9: Tracks in-app notifications for the customer portal.
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '', // Route to navigate to when clicked
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, NOTIFICATION_TYPES };
