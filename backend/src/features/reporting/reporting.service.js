'use strict';

const mongoose = require('mongoose');
const { Invoice } = require('../invoices/invoice.model');
const { Payment } = require('../payments/payment.model');

/**
 * Perform MongoDB aggregations across Quotations, Invoices, and Payments
 */
async function getSummaryReport({ startDate, endDate, category, salesRepId }) {
  const matchStage = {};

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  if (salesRepId) {
    matchStage.salesRepId = new mongoose.Types.ObjectId(salesRepId);
  }

  // 1. Aggregate Invoices & Payments (Actual stored billing data)
  const invoiceMetrics = await Invoice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInvoiced: { $sum: '$total' },
        totalInvoices: { $sum: 1 },
        avgInvoiceValue: { $avg: '$total' },
      },
    },
  ]);

  const paymentMetrics = await Payment.aggregate([
    { $match: { status: 'COMPLETED' } },
    {
      $group: {
        _id: null,
        totalCollected: { $sum: '$amount' },
        totalPayments: { $sum: 1 },
      },
    },
  ]);

  // 2. Aggregate Quotations if model registered
  let quotationSummary = {
    totalQuotations: 0,
    totalPipelineValue: 0,
    avgDiscount: 0,
  };

  const QuotationModel = mongoose.models.Quotation;
  if (QuotationModel) {
    const quoteMetrics = await QuotationModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalQuotations: { $sum: 1 },
          totalPipelineValue: { $sum: '$grandTotal' },
          avgDiscount: { $avg: '$discountTotal' },
        },
      },
    ]);

    if (quoteMetrics.length > 0) {
      quotationSummary = {
        totalQuotations: quoteMetrics[0].totalQuotations || 0,
        totalPipelineValue: quoteMetrics[0].totalPipelineValue || 0,
        avgDiscount: quoteMetrics[0].avgDiscount || 0,
      };
    }
  }

  const invoiced = invoiceMetrics[0] || { totalInvoiced: 0, totalInvoices: 0, avgInvoiceValue: 0 };
  const payments = paymentMetrics[0] || { totalCollected: 0, totalPayments: 0 };

  return {
    overview: {
      quotationsCount: quotationSummary.totalQuotations,
      pipelineValue: quotationSummary.totalPipelineValue,
      invoicesCount: invoiced.totalInvoices,
      totalInvoiced: invoiced.totalInvoiced,
      totalCollected: payments.totalCollected,
      outstandingAR: Math.max(0, invoiced.totalInvoiced - payments.totalCollected),
    },
    analytics: {
      avgDiscountValue: quotationSummary.avgDiscount,
      avgInvoiceValue: Math.round(invoiced.avgInvoiceValue || 0),
    },
  };
}

module.exports = {
  getSummaryReport,
};
