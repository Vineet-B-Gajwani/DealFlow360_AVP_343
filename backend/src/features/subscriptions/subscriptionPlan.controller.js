'use strict';

const subscriptionPlanService = require('./subscriptionPlan.service');

async function createPlan(req, res, next) {
  try {
    const plan = await subscriptionPlanService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

async function listPlans(req, res, next) {
  try {
    const plans = await subscriptionPlanService.listPlans(req.query);
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    next(err);
  }
}

async function getPlanById(req, res, next) {
  try {
    const plan = await subscriptionPlanService.getPlanById(req.params.id);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

async function updatePlan(req, res, next) {
  try {
    const plan = await subscriptionPlanService.updatePlan(req.params.id, req.body);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
};
