'use strict';

const dealHealthService = require('./dealHealth.service');

async function getActiveAlerts(req, res, next) {
  try {
    const alerts = await dealHealthService.getActiveAlerts();
    res.json({
      success: true,
      data: { alerts },
    });
  } catch (err) {
    next(err);
  }
}

async function triggerScan(req, res, next) {
  try {
    const stalled = await dealHealthService.scanStalledDeals();
    const anomaly = await dealHealthService.scanDiscountAnomalies();
    res.json({
      success: true,
      message: 'Deal health scan completed',
      data: { stalled, anomaly },
    });
  } catch (err) {
    next(err);
  }
}

async function updateAlertStatus(req, res, next) {
  try {
    const alert = await dealHealthService.updateAlertStatus(
      req.params.id,
      req.body.status
    );
    res.json({
      success: true,
      message: 'Alert status updated',
      data: { alert },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getActiveAlerts,
  triggerScan,
  updateAlertStatus,
};
