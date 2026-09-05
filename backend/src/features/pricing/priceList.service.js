'use strict';

const { PriceList } = require('./priceList.model');
const { Product } = require('../products/product.model');

function makeError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Get effective price for a product given a customer tier and currency
 */
async function getEffectivePrice(productId, tier = 'Standard', currency = 'INR') {
  const product = await Product.findById(productId);
  if (!product) throw makeError('Product not found', 404);

  const priceList = await PriceList.findOne({ tier, currency, isActive: true });
  
  if (priceList) {
    const override = priceList.productOverrides.find(
      o => o.productId.toString() === productId.toString()
    );
    if (override) {
      return override.overridePrice;
    }
  }

  // Fallback to base price
  return product.basePrice;
}

/**
 * Create a new PriceList
 */
async function createPriceList(data) {
  // If active, deactivate others for same tier/currency
  if (data.isActive) {
    await PriceList.updateMany(
      { tier: data.tier, currency: data.currency },
      { isActive: false }
    );
  }
  
  const priceList = new PriceList(data);
  await priceList.save();
  return priceList;
}

/**
 * Get all PriceLists
 */
async function getPriceLists(query = {}) {
  return await PriceList.find(query).sort({ createdAt: -1 });
}

module.exports = {
  getEffectivePrice,
  createPriceList,
  getPriceLists
};
