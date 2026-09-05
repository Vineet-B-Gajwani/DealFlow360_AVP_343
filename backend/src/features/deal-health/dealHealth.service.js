'use strict';

const mongoose = require('mongoose');
const { DealAlert } = require('./dealAlert.model');

/**
 * Scan database records for stalled deals (no updates for > thresholdDays).
 */
async function scanStalledDeals(thresholdDays = 3) {
  const cutoffDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
  const QuotationModel = mongoose.models.Quotation;

  if (!QuotationModel) {
    return { detected: 0, alertsCreated: 0 };
  }

  const stalledQuotes = await QuotationModel.find({
    status: { $in: ['DRAFT', 'PENDING_APPROVAL', 'SUBMITTED', 'NEGOTIATING', 'REAPPROVAL_REQUIRED'] },
    updatedAt: { $lt: cutoffDate },
  });

  let alertsCreated = 0;

  for (const quote of stalledQuotes) {
    const existing = await DealAlert.findOne({
      quotationId: quote._id,
      type: 'STALLED_DEAL',
      status: 'ACTIVE',
    });

    if (!existing) {
      await DealAlert.create({
        quotationId: quote._id,
        type: 'STALLED_DEAL',
        severity: 'HIGH',
        reason: `Quotation ${quote.quotationNumber || quote._id} has been inactive for more than ${thresholdDays} days.`,
      });
      alertsCreated++;
    }
  }

  return { detected: stalledQuotes.length, alertsCreated };
}

/**
 * Scan database records for sales-rep historical discount anomalies.
 * Calculates mean and standard deviation of past discounts per sales rep from stored records.
 */
async function scanDiscountAnomalies() {
  const QuotationModel = mongoose.models.Quotation;
  if (!QuotationModel) {
    return { detected: 0, alertsCreated: 0 };
  }

  // Aggregate historical sales rep discount statistics from database
  const salesRepStats = await QuotationModel.aggregate([
    { $match: { discountTotal: { $gt: 0 } } },
    {
      $group: {
        _id: '$salesRepId',
        avgDiscount: { $avg: '$discountTotal' },
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap = new Map();
  salesRepStats.forEach((s) => statsMap.set(String(s._id), s.avgDiscount));

  const recentQuotes = await QuotationModel.find({
    createdAt: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
  });

  let alertsCreated = 0;

  for (const quote of recentQuotes) {
    const avgForRep = statsMap.get(String(quote.salesRepId)) || 500;
    const discountVal = quote.discountTotal || 0;
    const discountPct = quote.discountPercent || 0;

    // Anomaly if discount percentage exceeds 15% or discount total exceeds 1.5x rep average
    if ((discountPct > 15 || (discountVal > avgForRep * 1.5 && discountVal > 100))) {
      const existing = await DealAlert.findOne({
        quotationId: quote._id,
        type: 'DISCOUNT_ANOMALY',
        status: 'ACTIVE',
      });

      if (!existing) {
        await DealAlert.create({
          quotationId: quote._id,
          type: 'DISCOUNT_ANOMALY',
          severity: 'CRITICAL',
          reason: `High Discount Warning: Quotation ${quote.quotationNumber || quote._id} has ${discountPct}% discount (₹${discountVal.toLocaleString('en-IN')}), exceeding standard margin limits.`,
        });
        alertsCreated++;
      }
    }
  }

  return { alertsCreated };
}

/**
 * Get Deal Health Dashboard Active Alerts
 */
async function getActiveAlerts() {
  const alerts = await DealAlert.find({ status: 'ACTIVE' })
    .sort({ createdAt: -1 })
    .populate('quotationId', 'quotationNumber grandTotal status customerId');
  return alerts;
}

/**
 * Dismiss or resolve an alert
 */
async function updateAlertStatus(alertId, status) {
  const alert = await DealAlert.findByIdAndUpdate(
    alertId,
    { status },
    { new: true }
  );
  return alert;
}

module.exports = {
  scanStalledDeals,
  scanDiscountAnomalies,
  getActiveAlerts,
  updateAlertStatus,
};
