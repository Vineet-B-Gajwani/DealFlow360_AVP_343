'use strict';

const mongoose = require('mongoose');
const { DealAlert } = require('./dealAlert.model');

/**
 * Scan database records for stalled deals (no updates for > thresholdDays).
 */
async function scanStalledDeals(thresholdDays = 7) {
  const cutoffDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
  const QuotationModel = mongoose.models.Quotation;

  if (!QuotationModel) {
    return { detected: 0, alertsCreated: 0 };
  }

  const stalledQuotes = await QuotationModel.find({
    status: { $in: ['DRAFT', 'PENDING_APPROVAL', 'UNDER_NEGOTIATION'] },
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
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  let alertsCreated = 0;

  for (const quote of recentQuotes) {
    const avgForRep = statsMap.get(String(quote.salesRepId)) || 10;
    // Anomaly if discount exceeds 1.8x the historical average of that sales rep
    if (quote.discountTotal > avgForRep * 1.8 && quote.discountTotal > 500) {
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
          reason: `Discount of ₹${quote.discountTotal} on quote ${quote.quotationNumber || quote._id} significantly exceeds sales rep historical mean (₹${Math.round(avgForRep)}).`,
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
