'use strict';

const reportingService = require('./reporting.service');

async function getSummaryReport(req, res, next) {
  try {
    const { startDate, endDate, category, salesRepId } = req.query;
    const report = await reportingService.getSummaryReport({
      startDate,
      endDate,
      category,
      salesRepId,
    });
    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

async function exportReport(req, res, next) {
  try {
    const { startDate, endDate, category, salesRepId, format } = req.query;
    const report = await reportingService.getSummaryReport({
      startDate,
      endDate,
      category,
      salesRepId,
    });

    // CSV export
    const rows = [
      ['Metric', 'Value'],
      ['Total Quotations', report.overview.quotationsCount],
      ['Pipeline Value', report.overview.pipelineValue],
      ['Total Invoices', report.overview.invoicesCount],
      ['Total Invoiced', report.overview.totalInvoiced],
      ['Total Collected', report.overview.totalCollected],
      ['Outstanding AR', report.overview.outstandingAR],
      ['Avg Discount Value', report.analytics.avgDiscountValue],
      ['Avg Invoice Value', report.analytics.avgInvoiceValue],
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dealflow360_report_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummaryReport,
  exportReport,
};
