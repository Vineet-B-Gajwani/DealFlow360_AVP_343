'use strict';

const reportingService = require('./reporting.service');

async function getDashboard(req, res, next) {
  try {
    const report = await reportingService.getCustomerReporting(req.user.id);
    res.json({ success: true, data: { report } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
};
