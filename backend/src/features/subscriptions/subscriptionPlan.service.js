'use strict';

const { SubscriptionPlan } = require('./subscriptionPlan.model');

function makeError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function createPlan(data) {
  const plan = new SubscriptionPlan(data);
  await plan.save();
  return plan;
}

async function listPlans(query = {}) {
  const filter = {};
  if (query.isActive !== undefined) filter.isActive = query.isActive;
  
  return await SubscriptionPlan.find(filter).sort({ createdAt: -1 });
}

async function getPlanById(id) {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) throw makeError('Plan not found', 404);
  return plan;
}

async function updatePlan(id, data) {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!plan) throw makeError('Plan not found', 404);
  return plan;
}

async function togglePlanStatus(id, isActive) {
  return await updatePlan(id, { isActive });
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
  togglePlanStatus,
};
