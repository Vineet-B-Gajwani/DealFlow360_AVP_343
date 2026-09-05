'use strict';

const mongoose = require('mongoose');
const { Quotation, QUOTATION_STATUS } = require('./quotation.model');
const { Product } = require('../products/product.model');
const { Customer } = require('../customer-portal/customer.model');
const approvalService = require('../approvals/approval.service');
const invoiceService = require('../invoices/invoice.service');
const fulfillmentService = require('../fulfillment/fulfillment.service');
const billingService = require('../billing/billing.service');
const { Inventory } = require('../inventory/inventory.model');
const { REQUIRED_LEVEL } = require('../approvals/approval.model');
const { DiscountRule } = require('../pricing/discountRule.model');

// Helper
function makeError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Generate unique quotation number
 */
async function generateQuotationNumber() {
  const count = await Quotation.countDocuments();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(4, '0');
  return `QT-${year}-${sequence}`;
}

/**
 * Create a new draft quotation
 */
async function createQuotation(data, actingUser) {
  const customer = await Customer.findById(data.customerId);
  if (!customer) throw makeError('Customer not found', 404);

  const quotationNumber = await generateQuotationNumber();
  
  const quotation = new Quotation({
    quotationNumber,
    customerId: customer._id,
    salesRepId: actingUser?.id || actingUser?._id || data.salesRepId,
    quotationRequestId: data.quotationRequestId || null,
    notes: data.notes || '',
  });

  await quotation.save();
  return quotation;
}

/**
 * Add a line to a quotation
 */
async function addQuotationLine(quotationId, { productId, quantity, discount = 0, discountPercent }) {
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw makeError('Quotation not found', 404);
  if (quotation.status !== QUOTATION_STATUS.DRAFT && quotation.status !== QUOTATION_STATUS.NEGOTIATING) {
    throw makeError(`Cannot add lines to a quotation in ${quotation.status} state`, 400);
  }

  const product = await Product.findById(productId);
  if (!product) throw makeError('Product not found', 404);

  // Determine percentage discount and absolute discount amount
  const lineQty = Math.max(1, parseInt(quantity || 1, 10));
  const unitPrice = product.basePrice;
  const lineSubtotal = unitPrice * lineQty;

  let finalDiscPercent = 0;
  let lineDiscountVal = 0;

  if (discountPercent !== undefined && discountPercent !== null) {
    finalDiscPercent = parseFloat(discountPercent) || 0;
    lineDiscountVal = (lineSubtotal * finalDiscPercent) / 100;
  } else {
    // If discount was passed as percent or absolute value:
    if (discount <= 100 && discount > 0) {
      finalDiscPercent = parseFloat(discount);
      lineDiscountVal = (lineSubtotal * finalDiscPercent) / 100;
    } else {
      lineDiscountVal = parseFloat(discount) || 0;
      finalDiscPercent = lineSubtotal > 0 ? (lineDiscountVal / lineSubtotal) * 100 : 0;
    }
  }

  const total = Math.max(0, lineSubtotal - lineDiscountVal);

  quotation.lines.push({
    productId,
    quantity: lineQty,
    unitPrice,
    discount: lineDiscountVal,
    discountPercent: parseFloat(finalDiscPercent.toFixed(2)),
    total,
  });

  await quotation.save();
  return await getQuotationById(quotation._id);
}

/**
 * Update an existing quotation line (Qty, Discount %)
 */
async function updateQuotationLine(quotationId, lineId, { quantity, discountPercent }) {
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw makeError('Quotation not found', 404);
  if (quotation.status !== QUOTATION_STATUS.DRAFT && quotation.status !== QUOTATION_STATUS.NEGOTIATING) {
    throw makeError(`Cannot update lines of a quotation in ${quotation.status} state`, 400);
  }

  const line = quotation.lines.id(lineId);
  if (!line) throw makeError('Line item not found', 404);

  if (quantity !== undefined && quantity !== null) {
    line.quantity = Math.max(1, parseInt(quantity, 10));
  }

  if (discountPercent !== undefined && discountPercent !== null) {
    line.discountPercent = Math.min(100, Math.max(0, parseFloat(discountPercent)));
  }

  const lineSubtotal = line.unitPrice * line.quantity;
  line.discount = (lineSubtotal * (line.discountPercent || 0)) / 100;
  line.total = Math.max(0, lineSubtotal - line.discount);

  await quotation.save();
  return await getQuotationById(quotation._id);
}

/**
 * Update quotation metadata (priceList, notes)
 */
async function updateQuotation(quotationId, { priceList, notes }) {
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw makeError('Quotation not found', 404);

  if (priceList !== undefined) quotation.priceList = priceList;
  if (notes !== undefined) quotation.notes = notes;

  await quotation.save();
  return await getQuotationById(quotation._id);
}

/**
 * Submit quotation for approval
 * Step 9 Integration: Sales -> Approval Integration (Blended Risk Engine)
 */
async function submitQuotation(quotationId, actingUser) {
  const quotation = await Quotation.findById(quotationId).populate('lines.productId');
  if (!quotation) throw makeError('Quotation not found', 404);
  
  if (quotation.lines.length === 0) {
    throw makeError('Cannot submit an empty quotation', 400);
  }

  const customer = await Customer.findById(quotation.customerId);
  const customerTier = customer?.tier || 'Standard';

  // 1. Fetch Discount Rules for the customer's tier
  const rules = await DiscountRule.find({ tier: customerTier });
  const rulesByCategory = {};
  for (const rule of rules) {
    rulesByCategory[rule.category] = rule;
  }

  let requiredLevel = REQUIRED_LEVEL.NONE;
  let totalExcessDiscount = 0;
  
  // 2. Evaluate Blended Discount Risk line by line
  for (const line of quotation.lines) {
    const product = line.productId;
    const category = product?.category;
    
    // Calculate the percentage discount given on this line
    const lineSubtotal = line.unitPrice * line.quantity;
    const lineDiscountPercent = lineSubtotal > 0 ? (line.discount / lineSubtotal) * 100 : 0;
    
    const rule = rulesByCategory[category];
    const maxAllowed = rule ? rule.maxDiscountPercent : 0; // default 0 if no rule

    if (lineDiscountPercent > maxAllowed) {
      totalExcessDiscount += (lineDiscountPercent - maxAllowed);
      
      // Determine required level from the rule (or default to FINANCE if missing rule but discounted)
      const ruleLevel = rule ? rule.requiredApprovalLevel : REQUIRED_LEVEL.FINANCE;
      
      // Upgrade requiredLevel if necessary (FINANCE > SALES_MANAGER > NONE)
      if (ruleLevel === REQUIRED_LEVEL.FINANCE) {
        requiredLevel = REQUIRED_LEVEL.FINANCE;
      } else if (ruleLevel === REQUIRED_LEVEL.SALES_MANAGER && requiredLevel !== REQUIRED_LEVEL.FINANCE) {
        requiredLevel = REQUIRED_LEVEL.SALES_MANAGER;
      }
    }
  }

  // Submitting a quotation always requires at least Sales Manager approval (or FINANCE if high discount rule applies)
  if (requiredLevel === REQUIRED_LEVEL.NONE) {
    requiredLevel = REQUIRED_LEVEL.SALES_MANAGER;
  }

  // Transition to PENDING_APPROVAL and create approval request
  quotation.status = QUOTATION_STATUS.PENDING_APPROVAL;
  await quotation.save();

  await approvalService.createApproval({
    quotationId: quotation._id.toString(),
    riskScore: Math.round(totalExcessDiscount), // Blended excess risk
    requiredLevel,
    requestedBy: actingUser?.id || actingUser?._id || quotation.salesRepId?.toString(),
  }, actingUser);

  return quotation;
}

/**
 * Confirm a quotation
 * Step 10 & 12 Integration: Approval -> Fulfillment & Billing
 */
async function confirmQuotation(quotationId) {
  const quotation = await Quotation.findById(quotationId).populate('lines.productId');
  if (!quotation) throw makeError('Quotation not found', 404);
  
  if (quotation.status !== QUOTATION_STATUS.APPROVED && quotation.status !== QUOTATION_STATUS.SENT && quotation.status !== QUOTATION_STATUS.NEGOTIATING) {
    throw makeError(`Cannot confirm quotation from status ${quotation.status}`, 400);
  }

  quotation.status = QUOTATION_STATUS.CONFIRMED;
  await quotation.save();

  // 1. Fulfillment Integration: Allocate Inventory / Create Backorders
  const productLines = [];
  const subscriptionLines = [];

  for (const line of quotation.lines) {
    if (line.productId.productType === 'SUBSCRIPTION') {
      subscriptionLines.push(line);
      continue; // Subscriptions do not get fulfilled via warehouse
    }
    productLines.push(line);

    // Find inventory across warehouses
    const inventories = await Inventory.find({ productId: line.productId._id });
    
    // Map to the format recommendSplit expects
    const stockAvailability = inventories.map(inv => ({
      warehouseId: inv.warehouseId,
      availableQuantity: inv.availableQuantity,
      shippingCostWeight: 1 // Default cost weight for now
    }));

    const split = fulfillmentService.recommendSplit(line.productId._id, line.quantity, stockAvailability);
    
    // Process allocations
    for (const alloc of split.allocations) {
      const inv = await Inventory.findOne({ productId: line.productId._id, warehouseId: alloc.warehouseId });
      if (inv) {
        inv.availableQuantity -= alloc.quantity;
        inv.reservedQuantity += alloc.quantity;
        await inv.save();
      }
    }

    // Process backorders
    if (split.remainingQuantity > 0) {
      // Pick first warehouse or a default one
      const targetWarehouseId = inventories.length > 0 ? inventories[0].warehouseId : new mongoose.Types.ObjectId();
      await fulfillmentService.createBackorder({
        productId: line.productId._id,
        warehouseId: targetWarehouseId,
        requestedQuantity: split.remainingQuantity
      });
    }
  }

  // 2. Billing Integration (Hybrid Billing)
  
  // A) Create Invoice for one-time products/services
  if (productLines.length > 0) {
    await invoiceService.createInvoice({
      sourceOrderId: quotation._id.toString(),
      customerId: quotation.customerId,
      lines: productLines.map(l => ({
        productId: l.productId._id,
        productName: l.productId.name || 'Product',
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discount: l.discount > 0 ? (l.discount / (l.unitPrice * l.quantity)) * 100 : 0 // Back to percentage
      })),
      tax: quotation.taxTotal, // simplified: ideally proportioned
    });
  }

  // B) Create Subscriptions for recurring items
  for (const subLine of subscriptionLines) {
    // We assume the subscription plan ID is passed in the line or derived
    // For this generic integration, we find the first plan that covers this product
    const { SubscriptionPlan } = require('../subscriptions/subscriptionPlan.model');
    const plan = await SubscriptionPlan.findOne({ applicableProductIds: subLine.productId._id });
    
    if (plan) {
      await billingService.createSubscription({
        quotationId: quotation._id.toString(),
        subscriptionPlanId: plan._id.toString(),
        productId: subLine.productId._id.toString(),
        quantity: subLine.quantity,
        startDate: new Date(),
      });
    }
  }

  return quotation;
}

/**
 * Get all quotations
 */
async function getQuotations(query = {}) {
  const filter = {};
  if (query.customerId) filter.customerId = query.customerId;
  if (query.salesRepId) filter.salesRepId = query.salesRepId;
  
  return await Quotation.find(filter).sort({ createdAt: -1 });
}

/**
 * Get quotation by id
 */
async function getQuotationById(id) {
  const quotation = await Quotation.findById(id)
    .populate({
      path: 'customerId',
      populate: { path: 'userId', select: 'name email' },
    })
    .populate({
      path: 'quotationRequestId',
      populate: { path: 'items.productId' },
    })
    .populate('lines.productId');

  if (!quotation) throw makeError('Quotation not found', 404);

  const customerTier = quotation.customerId?.tier || 'Standard';

  // Fetch ALL Discount Rules for all tiers
  const allRules = await DiscountRule.find({});
  const rulesByTierAndCategory = {};
  for (const rule of allRules) {
    if (!rulesByTierAndCategory[rule.tier]) {
      rulesByTierAndCategory[rule.tier] = {};
    }
    rulesByTierAndCategory[rule.tier][rule.category] = rule.maxDiscountPercent;
  }

  const rulesByCategory = rulesByTierAndCategory[customerTier] || {};

  // Format response JSON with limitPercent and live status
  const quotObj = quotation.toObject();
  quotObj.discountRules = rulesByTierAndCategory;
  
  quotObj.lines = (quotObj.lines || []).map((line) => {
    if (!line) return line;
    const category = line.productId?.category || 'Hardware';
    const lineSubtotal = (line.unitPrice || 0) * (line.quantity || 1);
    
    // Ensure discountPercent is computed if missing
    let discPercent = line.discountPercent;
    if (discPercent === undefined || discPercent === null) {
      discPercent = lineSubtotal > 0 ? ((line.discount || 0) / lineSubtotal) * 100 : 0;
    }
    discPercent = parseFloat(Number(discPercent || 0).toFixed(1));

    // Limit percent from discount rule or default fallback
    const limitPercent = rulesByCategory[category] !== undefined 
      ? rulesByCategory[category] 
      : (category === 'Service' ? 10 : 15);

    const excess = discPercent - limitPercent;
    const status = excess > 0 ? `OVER (+${Math.round(excess)}pt)` : 'OK';

    return {
      ...line,
      discountPercent: discPercent,
      limitPercent,
      status,
      isOverLimit: excess > 0,
    };
  });

  return quotObj;
}

/**
 * List all customers (for quotation creation form)
 */
async function listCustomers() {
  return await Customer.find({}).populate('userId', 'name email').sort({ companyName: 1 });
}

/**
 * Get upsell/cross-sell recommendations for a quotation
 */
async function getRecommendations(quotationId) {
  const upsellService = require('../pricing/upsellRule.service');
  
  const quotation = await Quotation.findById(quotationId).populate('lines.productId');
  if (!quotation) throw makeError('Quotation not found', 404);
  
  if (quotation.lines.length === 0) return [];

  // Calculate current margin
  let totalCost = 0;
  let totalRevenue = 0;
  const productIds = [];
  
  for (const line of quotation.lines) {
    const product = line.productId;
    if (product) {
      productIds.push(product._id.toString());
      totalCost += (product.costPrice || 0) * line.quantity;
      totalRevenue += line.total;
    }
  }
  
  const marginPercent = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 100;
  
  return await upsellService.getRecommendations(productIds, marginPercent);
}

/**
 * Remove a line from a quotation
 */
async function removeQuotationLine(quotationId, lineId) {
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) throw makeError('Quotation not found', 404);
  if (quotation.status !== QUOTATION_STATUS.DRAFT && quotation.status !== QUOTATION_STATUS.NEGOTIATING) {
    throw makeError(`Cannot remove lines from a quotation in ${quotation.status} state`, 400);
  }
  
  quotation.lines = quotation.lines.filter(l => l._id.toString() !== lineId);
  await quotation.save();
  return await getQuotationById(quotation._id);
}

module.exports = {
  createQuotation,
  addQuotationLine,
  updateQuotationLine,
  updateQuotation,
  submitQuotation,
  confirmQuotation,
  getQuotations,
  getQuotationById,
  listCustomers,
  getRecommendations,
  removeQuotationLine,
};
