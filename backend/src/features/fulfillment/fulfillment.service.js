'use strict';

/**
 * Fulfillment Allocation Engine
 * 
 * Attempts to allocate requested stock across available warehouses.
 * Prioritizes:
 * 1. Minimizing the number of shipments (warehouses used).
 * 2. Minimizing the total shippingCostWeight.
 * 
 * @param {string} productId 
 * @param {number} requestedQuantity 
 * @param {Array<{ warehouseId: string, availableQuantity: number, shippingCostWeight: number }>} stockAvailability 
 */
function recommendSplit(productId, requestedQuantity, stockAvailability) {
  let remaining = requestedQuantity;
  const allocations = [];

  // Filter out empty warehouses
  const availableStock = stockAvailability.filter(s => s.availableQuantity > 0);

  // Check if any single warehouse can fulfill the entire order
  const fullFulfillers = availableStock.filter(s => s.availableQuantity >= requestedQuantity);
  
  if (fullFulfillers.length > 0) {
    // Pick the one with lowest shipping cost weight
    fullFulfillers.sort((a, b) => a.shippingCostWeight - b.shippingCostWeight);
    const chosen = fullFulfillers[0];
    
    return {
      allocations: [{
        warehouseId: chosen.warehouseId,
        quantity: requestedQuantity,
      }],
      shipmentCount: 1,
      estimatedCostWeight: chosen.shippingCostWeight,
      remainingQuantity: 0,
    };
  }

  // If no single warehouse can fulfill it, we have to split it.
  // For simplicity, a greedy approach: take as much as possible from warehouses
  // starting with the largest available quantity to minimize shipment count.
  // Sort by availableQuantity DESC, then shippingCostWeight ASC
  availableStock.sort((a, b) => {
    if (b.availableQuantity !== a.availableQuantity) {
      return b.availableQuantity - a.availableQuantity;
    }
    return a.shippingCostWeight - b.shippingCostWeight;
  });

  let estimatedCostWeight = 0;

  for (const stock of availableStock) {
    if (remaining <= 0) break;
    
    const take = Math.min(stock.availableQuantity, remaining);
    allocations.push({
      warehouseId: stock.warehouseId,
      quantity: take,
    });
    
    remaining -= take;
    estimatedCostWeight += stock.shippingCostWeight;
  }

  return {
    allocations,
    shipmentCount: allocations.length,
    estimatedCostWeight,
    remainingQuantity: remaining, // Anything > 0 will become a backorder
  };
}

const { Backorder } = require('./backorder.model');
const { Inventory } = require('../inventory/inventory.model'); // Need inventory for backorder consolidation

/**
 * Creates a backorder.
 */
async function createBackorder(data) {
  const { productId, warehouseId, requestedQuantity } = data;
  
  const backorder = new Backorder({
    productId,
    warehouseId,
    requestedQuantity,
    remainingQuantity: requestedQuantity,
    status: 'PENDING'
  });
  
  await backorder.save();
  return backorder;
}

/**
 * Attempts to consolidate pending backorders for a product 
 * when new stock becomes available.
 */
async function consolidateBackorders(productId) {
  const pendingBackorders = await Backorder.find({
    productId,
    status: { $in: ['PENDING', 'PARTIAL'] }
  }).sort({ createdAt: 1 }); // oldest first
  
  if (pendingBackorders.length === 0) return [];
  
  const consolidated = [];
  
  for (const backorder of pendingBackorders) {
    // Look for inventory that can fulfill this
    const inventory = await Inventory.findOne({
      productId,
      availableQuantity: { $gt: 0 }
    });
    
    if (!inventory) break; // no stock left
    
    const take = Math.min(inventory.availableQuantity, backorder.remainingQuantity);
    
    // Update inventory
    inventory.availableQuantity -= take;
    // (In reality, we would allocate it or reserve it. Let's decrement available)
    await inventory.save();
    
    // Update backorder
    backorder.fulfilledQuantity += take;
    backorder.remainingQuantity -= take;
    
    if (backorder.remainingQuantity <= 0) {
      backorder.status = 'FULFILLED';
    } else {
      backorder.status = 'PARTIAL';
    }
    
    await backorder.save();
    consolidated.push(backorder);
  }
  
  return consolidated;
}

/**
 * List backorders
 */
async function listBackorders(query = {}) {
  return await Backorder.find(query).sort({ createdAt: -1 });
}

module.exports = {
  recommendSplit,
  createBackorder,
  consolidateBackorders,
  listBackorders,
};
