'use strict';

const fulfillmentService = require('./fulfillment.service');

async function getRecommendation(req, res, next) {
  try {
    const { productId, requestedQuantity, stockAvailability } = req.body;
    const recommendation = fulfillmentService.recommendSplit(productId, requestedQuantity, stockAvailability);
    res.status(200).json({ success: true, data: recommendation });
  } catch (err) {
    next(err);
  }
}

async function listBackorders(req, res, next) {
  try {
    const backorders = await fulfillmentService.listBackorders(req.query);
    res.status(200).json({ success: true, count: backorders.length, data: backorders });
  } catch (err) {
    next(err);
  }
}

async function createBackorder(req, res, next) {
  try {
    const backorder = await fulfillmentService.createBackorder(req.body);
    res.status(201).json({ success: true, data: backorder });
  } catch (err) {
    next(err);
  }
}

async function consolidateBackorders(req, res, next) {
  try {
    const { productId } = req.params;
    const consolidated = await fulfillmentService.consolidateBackorders(productId);
    res.status(200).json({ success: true, data: consolidated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRecommendation,
  listBackorders,
  createBackorder,
  consolidateBackorders,
};
