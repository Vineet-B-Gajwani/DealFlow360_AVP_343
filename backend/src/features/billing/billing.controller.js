'use strict';

const billingService = require('./billing.service');

async function createSubscription(req, res, next) {
  try {
    const subscription = await billingService.createSubscription(req.body);
    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
}

async function listSubscriptions(req, res, next) {
  try {
    const subscriptions = await billingService.listSubscriptions(req.query);
    res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (err) {
    next(err);
  }
}

async function cancelSubscription(req, res, next) {
  try {
    const { cancelDate } = req.body;
    const result = await billingService.cancelSubscription(req.params.id, cancelDate);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSubscription,
  listSubscriptions,
  cancelSubscription,
};
