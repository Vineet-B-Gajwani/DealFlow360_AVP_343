'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, ROLES } = require('./src/features/auth/auth.model');
const { Customer } = require('./src/features/customer-portal/customer.model');
const { Product, PRODUCT_TYPES } = require('./src/features/products/product.model');
const { DiscountRule } = require('./src/features/pricing/discountRule.model');
const { PriceList } = require('./src/features/pricing/priceList.model');
const { UpsellRule } = require('./src/features/pricing/upsellRule.model');
const { Approval, APPROVAL_STATUS, REQUIRED_LEVEL } = require('./src/features/approvals/approval.model');
const { ApprovalConfig } = require('./src/features/approvals/approvalConfig.model');
const { Warehouse } = require('./src/features/inventory/warehouse.model');
const { Inventory } = require('./src/features/inventory/inventory.model');
const { SubscriptionPlan } = require('./src/features/subscriptions/subscriptionPlan.model');
const { Quotation, QUOTATION_STATUS } = require('./src/features/quotations/quotation.model');
const { Negotiation } = require('./src/features/negotiation/negotiation.model');
const { Invoice } = require('./src/features/invoices/invoice.model');
const { Payment } = require('./src/features/payments/payment.model');

const SALT_ROUNDS = 12;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dealflow360');
  console.log('Connected to MongoDB');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Product.deleteMany({}),
    DiscountRule.deleteMany({}),
    PriceList.deleteMany({}),
    UpsellRule.deleteMany({}),
    ApprovalConfig.deleteMany({}),
    Warehouse.deleteMany({}),
    Inventory.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
    Quotation.deleteMany({}),
    Approval.deleteMany({}),
    Negotiation.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
  ]);
  console.log('Cleared collections');

  // ── 1. Create Users with PROPER bcrypt password hashes ──────────────────
  const defaultPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.ADMIN,
    isActive: true,
  });

  const salesRep = await User.create({
    name: 'Alice Sales',
    email: 'sales@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.SALES_REP,
    isActive: true,
  });

  const salesMgr = await User.create({
    name: 'Bob Manager',
    email: 'manager@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.SALES_MANAGER,
    isActive: true,
  });

  const finance = await User.create({
    name: 'Carol Finance',
    email: 'finance@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.FINANCE_OPERATIONS,
    isActive: true,
  });

  const customerUser = await User.create({
    name: 'Acme Gold Customer',
    email: 'customer@acme.local',
    passwordHash: defaultPassword,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  console.log('Users created');

  // ── 2. Create Customer Profile ──────────────────────────────────────────
  const customer = await Customer.create({
    userId: customerUser._id,
    companyName: 'Acme Corp',
    tier: 'Gold',
    phone: '+1-555-0100',
    address: '123 Acme Way, New York, NY 10001',
    portalActivatedAt: new Date(),
  });

  console.log('Customer profile created');

  // ── 3. Create Products ──────────────────────────────────────────────────
  const hardwareProduct = await Product.create({
    name: 'Enterprise Server X1',
    category: 'Hardware',
    productType: PRODUCT_TYPES.PRODUCT,
    basePrice: 5000,
    costPrice: 3500,
    taxRate: 18,
    unit: 'each',
    description: 'High-performance enterprise server with redundant power supplies',
    variants: [
      { name: 'Standard', priceModifier: 0, isDefault: true },
      { name: 'Premium (ECC RAM)', priceModifier: 500, isDefault: false },
    ],
  });

  const serviceProduct = await Product.create({
    name: 'Installation & Setup',
    category: 'Service',
    productType: PRODUCT_TYPES.SERVICE,
    basePrice: 1000,
    costPrice: 500,
    taxRate: 18,
    unit: 'each',
    description: 'Professional installation and configuration service',
  });

  const cloudSubProduct = await Product.create({
    name: 'Cloud Backup Service',
    category: 'Subscription',
    productType: PRODUCT_TYPES.SUBSCRIPTION,
    basePrice: 200,
    costPrice: 50,
    taxRate: 18,
    unit: 'month',
    description: 'Monthly cloud backup and disaster recovery service',
  });

  const networkProduct = await Product.create({
    name: 'Network Switch Pro 48',
    category: 'Hardware',
    productType: PRODUCT_TYPES.PRODUCT,
    basePrice: 2500,
    costPrice: 1800,
    taxRate: 18,
    unit: 'each',
    description: '48-port managed network switch',
  });

  const consultingProduct = await Product.create({
    name: 'IT Consulting',
    category: 'Service',
    productType: PRODUCT_TYPES.SERVICE,
    basePrice: 300,
    costPrice: 150,
    taxRate: 18,
    unit: 'hour',
    description: 'Expert IT consulting service',
  });

  console.log('Products created');

  // ── 4. Create Discount Rules ────────────────────────────────────────────
  await DiscountRule.create([
    { tier: 'Gold', category: 'Hardware', maxDiscountPercent: 15, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { tier: 'Gold', category: 'Service', maxDiscountPercent: 10, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { tier: 'Gold', category: 'Subscription', maxDiscountPercent: 5, requiredApprovalLevel: REQUIRED_LEVEL.FINANCE },
    { tier: 'Standard', category: 'Hardware', maxDiscountPercent: 5, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { tier: 'Standard', category: 'Service', maxDiscountPercent: 5, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { tier: 'Silver', category: 'Hardware', maxDiscountPercent: 10, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { tier: 'Silver', category: 'Service', maxDiscountPercent: 8, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { tier: 'Platinum', category: 'Hardware', maxDiscountPercent: 20, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { tier: 'Platinum', category: 'Service', maxDiscountPercent: 15, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
  ]);

  console.log('Discount rules created');

  // ── 5. Create ApprovalConfig ────────────────────────────────────────────
  await ApprovalConfig.create([
    { name: 'Manager Approval Threshold', minDiscountPercent: 10, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { name: 'Finance Approval Threshold', minDiscountPercent: 25, requiredApprovalLevel: REQUIRED_LEVEL.FINANCE },
  ]);

  console.log('Approval config created');

  // ── 6. Create Price List ────────────────────────────────────────────────
  await PriceList.create({
    name: 'Gold Tier 2026',
    tier: 'Gold',
    currency: 'USD',
    isActive: true,
    productOverrides: [
      { productId: hardwareProduct._id, overridePrice: 4800 },
      { productId: networkProduct._id, overridePrice: 2300 },
    ],
  });

  await PriceList.create({
    name: 'Standard Tier 2026',
    tier: 'Standard',
    currency: 'USD',
    isActive: true,
    productOverrides: [],
  });

  console.log('Price lists created');

  // ── 7. Create Upsell / Cross-sell Rules ─────────────────────────────────
  await UpsellRule.create([
    {
      primaryProductId: hardwareProduct._id,
      recommendedProductId: serviceProduct._id,
      minMarginThreshold: 0,
      isActive: true,
    },
    {
      primaryProductId: hardwareProduct._id,
      recommendedProductId: cloudSubProduct._id,
      minMarginThreshold: 10,
      isActive: true,
    },
    {
      primaryProductId: networkProduct._id,
      recommendedProductId: consultingProduct._id,
      minMarginThreshold: 0,
      isActive: true,
    },
  ]);

  console.log('Upsell rules created');

  // ── 8. Warehouses & Inventory ───────────────────────────────────────────
  const whEast = await Warehouse.create({
    name: 'East Coast DC',
    code: 'WH-EAST',
    address: '100 Industrial Pkwy, Newark, NJ 07102',
    shippingCostWeight: 1,
  });

  const whWest = await Warehouse.create({
    name: 'West Coast DC',
    code: 'WH-WEST',
    address: '200 Logistics Blvd, Los Angeles, CA 90001',
    shippingCostWeight: 1.5,
  });

  const whCentral = await Warehouse.create({
    name: 'Central DC',
    code: 'WH-CENTRAL',
    address: '300 Distribution Dr, Chicago, IL 60601',
    shippingCostWeight: 1.2,
  });

  await Inventory.create([
    { productId: hardwareProduct._id, warehouseId: whEast._id, availableQuantity: 12 },
    { productId: hardwareProduct._id, warehouseId: whWest._id, availableQuantity: 8 },
    { productId: networkProduct._id, warehouseId: whEast._id, availableQuantity: 25 },
    { productId: networkProduct._id, warehouseId: whCentral._id, availableQuantity: 15 },
  ]);

  console.log('Warehouses and inventory created');

  // ── 9. Subscription Plans ───────────────────────────────────────────────
  await SubscriptionPlan.create({
    name: 'Cloud Backup Monthly',
    frequency: 'MONTHLY',
    price: 200,
    applicableProductIds: [cloudSubProduct._id],
    prorationConfiguration: { enabled: true },
    cancellationRules: { allowed: true, noticeDays: 30 },
    isActive: true,
  });

  await SubscriptionPlan.create({
    name: 'Cloud Backup Quarterly',
    frequency: 'QUARTERLY',
    price: 540,
    applicableProductIds: [cloudSubProduct._id],
    prorationConfiguration: { enabled: true },
    cancellationRules: { allowed: true, noticeDays: 15 },
    isActive: true,
  });

  await SubscriptionPlan.create({
    name: 'Cloud Backup Yearly',
    frequency: 'YEARLY',
    price: 1920,
    applicableProductIds: [cloudSubProduct._id],
    prorationConfiguration: { enabled: true },
    cancellationRules: { allowed: true, noticeDays: 60 },
    isActive: true,
  });

  console.log('Subscription plans created');

  // ── 10. Sample Quotations & Approvals ──────────────────────────────────
  const q1 = await Quotation.create({
    quotationNumber: 'QT-2026-001',
    customerId: customer._id,
    salesRepId: salesRep._id,
    status: QUOTATION_STATUS.NEGOTIATING,
    lines: [
      { productId: hardwareProduct._id, quantity: 2, unitPrice: 5000, discount: 500, total: 9500 },
      { productId: serviceProduct._id, quantity: 1, unitPrice: 1000, discount: 100, total: 900 },
    ],
    subTotal: 11000,
    discountTotal: 600,
    taxTotal: 1872,
    grandTotal: 12272,
    notes: 'Primary enterprise server deployment quote for Acme Corp',
  });

  const q2 = await Quotation.create({
    quotationNumber: 'QT-2026-002',
    customerId: customer._id,
    salesRepId: salesRep._id,
    status: QUOTATION_STATUS.PENDING_APPROVAL,
    lines: [
      { productId: networkProduct._id, quantity: 5, unitPrice: 2500, discount: 3750, total: 8750 },
    ],
    subTotal: 12500,
    discountTotal: 3750,
    taxTotal: 1575,
    grandTotal: 10325,
    notes: 'Volume discount requested by client for 48-port switches',
  });

  const q3 = await Quotation.create({
    quotationNumber: 'QT-2026-003',
    customerId: customer._id,
    salesRepId: salesRep._id,
    status: QUOTATION_STATUS.APPROVED,
    lines: [
      { productId: cloudSubProduct._id, quantity: 12, unitPrice: 200, discount: 240, total: 2160 },
      { productId: consultingProduct._id, quantity: 10, unitPrice: 300, discount: 300, total: 2700 },
    ],
    subTotal: 5400,
    discountTotal: 540,
    taxTotal: 874.8,
    grandTotal: 5734.8,
    notes: 'Annual cloud backup and IT consulting package',
  });

  const q4 = await Quotation.create({
    quotationNumber: 'QT-2026-004',
    customerId: customer._id,
    salesRepId: salesRep._id,
    status: QUOTATION_STATUS.CONFIRMED,
    lines: [
      { productId: hardwareProduct._id, quantity: 1, unitPrice: 5000, discount: 250, total: 4750 },
    ],
    subTotal: 5000,
    discountTotal: 250,
    taxTotal: 855,
    grandTotal: 5605,
    notes: 'Confirmed hardware order',
  });

  console.log('Quotations created');

  // Approval for Q2
  await Approval.create({
    quotationId: q2._id.toString(),
    riskScore: 35,
    requiredLevel: REQUIRED_LEVEL.SALES_MANAGER,
    currentLevel: REQUIRED_LEVEL.SALES_MANAGER,
    status: APPROVAL_STATUS.PENDING,
    requestedBy: salesRep._id.toString(),
    history: [
      {
        action: 'CREATED',
        user: salesRep._id.toString(),
        userLabel: salesRep.name,
        reason: 'Line 1 discount (30%) exceeds Gold tier category ceiling (15%)',
      },
    ],
  });

  console.log('Approvals created');

  // ── 11. Negotiation Thread for Q1 ─────────────────────────────────────
  await Negotiation.create([
    {
      quotationId: q1._id,
      customerId: customer._id,
      type: 'CHANGE_REQUEST',
      message: 'Can we include free installation & setup with the Enterprise Server X1?',
      requestedValue: 0,
      status: 'PENDING',
    },
    {
      quotationId: q1._id,
      customerId: customer._id,
      type: 'COUNTER_DISCOUNT',
      message: 'Requesting an additional 5% discount on the server hardware.',
      requestedValue: 10,
      status: 'PENDING',
    },
  ]);

  console.log('Negotiations created');

  // ── 12. Invoices & Payments ───────────────────────────────────────────
  const inv1 = await Invoice.create({
    invoiceNumber: 'INV-2026-001',
    sourceOrderId: q4._id,
    customerId: customer._id,
    lines: [
      {
        productId: hardwareProduct._id,
        productName: hardwareProduct.name,
        quantity: 1,
        unitPrice: 5000,
        discount: 250,
        lineTotal: 4750,
      },
    ],
    subtotal: 5000,
    discount: 250,
    tax: 855,
    total: 5605,
    status: 'ISSUED',
    paymentStatus: 'PARTIAL',
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  });

  await Payment.create({
    invoiceId: inv1._id,
    amount: 3000,
    paymentDate: new Date(),
    method: 'BANK',
    reference: 'BANK-TRX-9921',
    status: 'COMPLETED',
  });

  console.log('Invoices and payments created');

  // ── Done ────────────────────────────────────────────────────────────────
  console.log('\n✅ Comprehensive seed completed successfully!\n');
  console.log('Login credentials (password for ALL accounts: password123):');
  console.log('  Admin:    admin@dealflow360.local');
  console.log('  Sales:    sales@dealflow360.local');
  console.log('  Manager:  manager@dealflow360.local');
  console.log('  Finance:  finance@dealflow360.local');
  console.log('  Customer: customer@acme.local');
  console.log('\nDirect Customer Portal URL: http://localhost:5173/portal/login');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
