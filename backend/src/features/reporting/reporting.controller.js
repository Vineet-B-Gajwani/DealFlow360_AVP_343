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

module.exports = {
  getSummaryReport,
};
