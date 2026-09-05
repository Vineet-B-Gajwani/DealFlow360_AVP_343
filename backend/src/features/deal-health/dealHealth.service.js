'use strict';

const { DealAlert } = require('./dealAlert.model');
const { Negotiation } = require('../negotiation/negotiation.model');
const { Customer } = require('../customer-portal/customer.model');

async function getCustomerIdForUser(userId) {
  const customer = await Customer.findOne({ userId });
  if (!customer) {
    const err = new Error('Customer profile not found');
    err.statusCode = 404;
    throw err;
  }
  return customer._id;
}

/**
 * Get active alerts for the authenticated customer.
 */
async function getActiveAlerts(userId) {
  const customerId = await getCustomerIdForUser(userId);
  const alerts = await DealAlert.find({ customerId, status: 'ACTIVE' }).sort({ detectedAt: -1 });
  return alerts;
}

/**
 * Engine function to detect anomalies and create alerts.
 * In a real environment, this might run on a cron job or be triggered by events.
 * For this demo, we can expose an endpoint to trigger it manually or run it internally.
 */
async function runHealthScan(userId) {
  const customerId = await getCustomerIdForUser(userId);

  // 1. Discount Anomaly Detection
  // Example rule: Find counter-discounts requested by this customer > 20%
  const anomalousNegotiations = await Negotiation.find({
    customerId,
    type: 'COUNTER_DISCOUNT',
    requestedValue: { $gt: 20 },
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  });

  for (const neg of anomalousNegotiations) {
    // Check if an alert already exists for this quotation
    const existing = await DealAlert.findOne({
      quotationId: neg.quotationId,
      type: 'DISCOUNT_ANOMALY',
      status: 'ACTIVE'
    });

    if (!existing) {
      await DealAlert.create({
        quotationId: neg.quotationId,
        customerId,
        type: 'DISCOUNT_ANOMALY',
        severity: 'HIGH',
        reason: `High counter-discount requested: ${neg.requestedValue}%`,
      });
    }
  }

  // 2. Stalled Deal Detection
  // Example rule: Pending negotiations older than 7 days
  const stalledDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stalledNegotiations = await Negotiation.find({
    customerId,
    status: 'PENDING',
    createdAt: { $lt: stalledDate }
  });

  for (const neg of stalledNegotiations) {
    const existing = await DealAlert.findOne({
      quotationId: neg.quotationId,
      type: 'STALLED_DEAL',
      status: 'ACTIVE'
    });

    if (!existing) {
      await DealAlert.create({
        quotationId: neg.quotationId,
        customerId,
        type: 'STALLED_DEAL',
        severity: 'MEDIUM',
        reason: 'Negotiation has been pending for over 7 days.',
      });
    }
  }

  return { message: 'Scan complete' };
}

module.exports = {
  getActiveAlerts,
  runHealthScan
};
