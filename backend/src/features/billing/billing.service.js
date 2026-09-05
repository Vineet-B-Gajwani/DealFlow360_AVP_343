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
      currency: 'INR', // Assumed default
    }
  };
}

/**
 * List subscriptions based on query filters.
 * Supports optional pagination via limit and skip.
 */
async function listSubscriptions(query = {}) {
  const { limit, skip, ...filters } = query;
  const cursor = Subscription.find(filters)
    .populate('subscriptionPlanId')
    .populate('productId')
    .populate('quotationId');
  if (skip) cursor.skip(parseInt(skip, 10));
  if (limit) cursor.limit(parseInt(limit, 10));
  return await cursor.exec();
}


/**
 * Update a subscription (upgrade/downgrade) and calculate prorated credit/charge
 */
async function updateSubscription(id, updateData, changeDateStr) {
  const subscription = await Subscription.findById(id).populate('subscriptionPlanId');
  if (!subscription) throw makeError('Subscription not found', 404);
  if (subscription.status === 'CANCELLED') throw makeError('Cannot update cancelled subscription', 400);

  const plan = subscription.subscriptionPlanId;
  const changeDate = new Date(changeDateStr || Date.now());
  const nextBilling = new Date(subscription.nextBillingDate);
  
  let prorationCredit = 0;
  let newAmount = subscription.amount; // defaults to old amount

  if (updateData.quantity) {
    newAmount = plan.price * updateData.quantity;
  }

  // Calculate proration for the remaining days of the current cycle
  if (plan.prorationConfiguration?.enabled && changeDate < nextBilling) {
    let cycleStart;
    if (subscription.frequency === 'MONTHLY') cycleStart = addMonths(nextBilling, -1);
    else if (subscription.frequency === 'QUARTERLY') cycleStart = addMonths(nextBilling, -3);
    else if (subscription.frequency === 'YEARLY') cycleStart = addMonths(nextBilling, -12);

    const totalCycleMs = nextBilling.getTime() - cycleStart.getTime();
    const unusedMs = nextBilling.getTime() - changeDate.getTime();
    
    if (unusedMs > 0 && totalCycleMs > 0) {
      const unusedRatio = unusedMs / totalCycleMs;
      const oldRemainingValue = subscription.amount * unusedRatio;
      const newRemainingValue = newAmount * unusedRatio;
      
      // If negative, it's a credit to the customer. If positive, they owe more.
      prorationCredit = parseFloat((oldRemainingValue - newRemainingValue).toFixed(2));
    }
  }

  // Update subscription fields
  if (updateData.quantity) subscription.quantity = updateData.quantity;
  subscription.amount = newAmount;

  // Re-write pending bills
  subscription.billingSchedule = subscription.billingSchedule.map(bill => {
    if (bill.status === 'PENDING' && new Date(bill.date) >= changeDate) {
      return { ...bill.toObject(), amount: newAmount };
    }
    return bill;
  });

  // Inject a one-time proration adjustment record if applicable
  if (prorationCredit !== 0) {
    subscription.billingSchedule.push({
      date: changeDate,
      amount: -prorationCredit, // Negative means charge, positive means credit
      status: 'PENDING',
      isProrated: true,
    });
  }

  await subscription.save();

  return {
    subscription,
    proration: {
      creditAmount: prorationCredit,
      currency: 'INR',
    }
  };
}

module.exports = {
  createSubscription,
  cancelSubscription,
  listSubscriptions,
  updateSubscription,
};
