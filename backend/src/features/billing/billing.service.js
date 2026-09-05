'use strict';

const { Subscription } = require('./subscription.model');
const { SubscriptionPlan } = require('../subscriptions/subscriptionPlan.model');

function makeError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Helper to add months to a date
 */
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Create a new billing subscription and generate initial schedule
 */
async function createSubscription(data) {
  const { quotationId, subscriptionPlanId, productId, quantity, startDate } = data;

  const plan = await SubscriptionPlan.findById(subscriptionPlanId);
  if (!plan) throw makeError('Subscription Plan not found', 404);

  const baseAmount = plan.price * (quantity || 1);
  const start = new Date(startDate || Date.now());
  
  let nextBillingDate;
  if (plan.frequency === 'MONTHLY') nextBillingDate = addMonths(start, 1);
  else if (plan.frequency === 'QUARTERLY') nextBillingDate = addMonths(start, 3);
  else if (plan.frequency === 'YEARLY') nextBillingDate = addMonths(start, 12);

  const subscription = new Subscription({
    quotationId,
    subscriptionPlanId,
    productId,
    frequency: plan.frequency,
    quantity: quantity || 1,
    amount: baseAmount,
    startDate: start,
    nextBillingDate,
    billingSchedule: [
      {
        date: start,
        amount: baseAmount,
        status: 'PENDING',
        isProrated: false,
      }
    ]
  });

  await subscription.save();
  return subscription;
}

/**
 * Cancel a subscription and calculate proration refund/credit if applicable
 * 
 * Proration logic:
 * - If cancelled before the next billing date, calculate the unused days.
 * - refundAmount = (unusedDays / totalDaysInCycle) * cycleAmount
 */
async function cancelSubscription(id, cancelDateStr) {
  const subscription = await Subscription.findById(id).populate('subscriptionPlanId');
  if (!subscription) throw makeError('Subscription not found', 404);
  
  if (subscription.status === 'CANCELLED') {
    throw makeError('Subscription is already cancelled', 400);
  }

  const cancelDate = new Date(cancelDateStr || Date.now());
  const nextBilling = new Date(subscription.nextBillingDate);
  
  let refundAmount = 0;
  
  // Calculate proration if enabled and cancel date is before next billing date
  const plan = subscription.subscriptionPlanId;
  if (plan && plan.prorationConfiguration?.enabled && cancelDate < nextBilling) {
    // Find the start of the current cycle
    let cycleStart;
    if (subscription.frequency === 'MONTHLY') cycleStart = addMonths(nextBilling, -1);
    else if (subscription.frequency === 'QUARTERLY') cycleStart = addMonths(nextBilling, -3);
    else if (subscription.frequency === 'YEARLY') cycleStart = addMonths(nextBilling, -12);

    const totalCycleMs = nextBilling.getTime() - cycleStart.getTime();
    const unusedMs = nextBilling.getTime() - cancelDate.getTime();
    
    // Ensure we don't refund more than 100% or less than 0%
    if (unusedMs > 0 && totalCycleMs > 0) {
      const unusedRatio = unusedMs / totalCycleMs;
      refundAmount = parseFloat((subscription.amount * unusedRatio).toFixed(2));
    }
  }

  subscription.status = 'CANCELLED';
  
  // Void any pending future bills
  subscription.billingSchedule.forEach(bill => {
    if (bill.status === 'PENDING' && new Date(bill.date) >= cancelDate) {
      bill.status = 'VOIDED';
    }
  });

  await subscription.save();

  return {
    subscription,
    proration: {
      refundAmount,
      currency: 'USD', // Assumed default
    }
  };
}

/**
 * List active subscriptions
 */
async function listSubscriptions(query = {}) {
  return await Subscription.find(query).sort({ createdAt: -1 });
}

module.exports = {
  createSubscription,
  cancelSubscription,
  listSubscriptions,
};
