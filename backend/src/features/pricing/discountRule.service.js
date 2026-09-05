'use strict';

const { DiscountRule } = require('./discountRule.model');

/**
 * Get discount rules for a specific tier
 */
async function getRulesForTier(tier) {
  return await DiscountRule.find({ tier });
}

/**
 * Create or update a discount rule
 */
async function upsertDiscountRule(data) {
  const { tier, category, maxDiscountPercent, requiredApprovalLevel } = data;
  
  return await DiscountRule.findOneAndUpdate(
    { tier, category },
    { maxDiscountPercent, requiredApprovalLevel },
    { new: true, upsert: true }
  );
}

module.exports = {
  getRulesForTier,
  upsertDiscountRule
};
