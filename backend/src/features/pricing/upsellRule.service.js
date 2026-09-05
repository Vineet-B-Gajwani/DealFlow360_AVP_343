'use strict';

const { UpsellRule } = require('./upsellRule.model');

/**
 * Get recommendations based on current quotation line items and overall margin
 */
async function getRecommendations(productIds, currentMarginPercent = 100) {
  // Find all active rules where the primary product is in the quotation
  // and the min margin threshold is satisfied
  const rules = await UpsellRule.find({
    primaryProductId: { $in: productIds },
    isActive: true,
    minMarginThreshold: { $lte: currentMarginPercent }
  }).populate('recommendedProductId');

  // Filter out recommendations for products already in the cart
  const recommendations = rules
    .map(r => r.recommendedProductId)
    .filter(rec => rec && !productIds.includes(rec._id.toString()));

  // Deduplicate
  const uniqueRecs = [];
  const seen = new Set();
  for (const rec of recommendations) {
    if (!seen.has(rec._id.toString())) {
      seen.add(rec._id.toString());
      uniqueRecs.push(rec);
    }
  }

  return uniqueRecs;
}

/**
 * Create or update an upsell rule
 */
async function upsertUpsellRule(data) {
  const { primaryProductId, recommendedProductId, minMarginThreshold, isActive } = data;
  return await UpsellRule.findOneAndUpdate(
    { primaryProductId, recommendedProductId },
    { minMarginThreshold, isActive },
    { new: true, upsert: true }
  );
}

/**
 * List all upsell rules
 */
async function listUpsellRules() {
  return await UpsellRule.find({})
    .populate('primaryProductId', 'name category')
    .populate('recommendedProductId', 'name category basePrice')
    .sort({ createdAt: -1 });
}

module.exports = {
  getRecommendations,
  upsertUpsellRule,
  listUpsellRules,
};
