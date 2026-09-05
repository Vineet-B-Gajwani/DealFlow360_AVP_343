'use strict';

const dealHealthService = require('./dealHealth.service');

async function getAlerts(req, res, next) {
  try {
    const alerts = await dealHealthService.getActiveAlerts(req.user.id);
    res.json({ success: true, data: { alerts } });
  } catch (err) {
    next(err);
  }
}

async function runScan(req, res, next) {
  try {
    const result = await dealHealthService.runHealthScan(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAlerts,
  runScan
};
