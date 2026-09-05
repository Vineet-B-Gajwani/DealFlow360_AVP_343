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

  const defaultPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  // ── 1. Multiple Company Staff Employees ──────────────────────────────────
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.ADMIN,
    isActive: true,
  });

  const adminOps = await User.create({
    name: 'Operations Admin',
    email: 'ops.admin@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.ADMIN,
    isActive: true,
  });

  const salesRep1 = await User.create({
    name: 'Alice Sales',
    email: 'sales@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.SALES_REP,
    isActive: true,
  });

  const salesRep2 = await User.create({
    name: 'David Representative',
    email: 'david.sales@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.SALES_REP,
    isActive: true,
  });

  const salesRep3 = await User.create({
    name: 'Emma Representative',
    email: 'emma.sales@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.SALES_REP,
    isActive: true,
  });

  const salesMgr1 = await User.create({
    name: 'Bob Manager',
    email: 'manager@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.SALES_MANAGER,
    isActive: true,
  });

  const salesMgr2 = await User.create({
    name: 'Sarah Manager',
    email: 'sarah.mgr@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.SALES_MANAGER,
    isActive: true,
  });

  const finance1 = await User.create({
    name: 'Carol Finance',
    email: 'finance@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.FINANCE_OPERATIONS,
    isActive: true,
  });

  const finance2 = await User.create({
    name: 'Frank Finance',
    email: 'frank.finance@dealflow360.local',
    passwordHash: defaultPassword,
    role: ROLES.FINANCE_OPERATIONS,
    isActive: true,
  });

  console.log('Multiple company employees created across all roles');

  // ── 2. Multiple Customers with Full Address, Tax & Proof Details ─────────
  const custUser1 = await User.create({
    name: 'Acme Gold Representative',
    email: 'customer@acme.local',
    passwordHash: defaultPassword,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  const custUser2 = await User.create({
    name: 'Cyberdyne Executive',
    email: 'customer@cyberdyne.local',
    passwordHash: defaultPassword,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  const custUser3 = await User.create({
    name: 'Stark Procurement Officer',
    email: 'customer@stark.local',
    passwordHash: defaultPassword,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  const custUser4 = await User.create({
    name: 'Wayne Logistics Director',
    email: 'customer@wayne.local',
    passwordHash: defaultPassword,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  const custUser5 = await User.create({
    name: 'Umbrella Buyer',
    email: 'customer@umbrella.local',
    passwordHash: defaultPassword,
    role: ROLES.CUSTOMER,
    isActive: true,
  });

  const custAcme = await Customer.create({
    userId: custUser1._id,
    companyName: 'Acme Corp',
    phone: '+1-555-0100',
    address: '123 Acme Way',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    taxId: 'US-TAX-998231',
    proofDocId: 'DOC-ACME-8831',
    tier: 'Gold',
    portalActivatedAt: new Date(),
  });

  const custCyberdyne = await Customer.create({
    userId: custUser2._id,
    companyName: 'Cyberdyne Systems Inc.',
    phone: '+1-555-0200',
    address: '101 Cyberdyne Tech Blvd',
    city: 'Sunnyvale',
    state: 'CA',
    zipCode: '94085',
    country: 'USA',
    taxId: 'US-TAX-772183',
    proofDocId: 'DOC-CYBER-1029',
    tier: 'Platinum',
    portalActivatedAt: new Date(),
  });

  const custStark = await Customer.create({
    userId: custUser3._id,
    companyName: 'Stark Industries',
    phone: '+1-555-0300',
    address: '200 Stark Tower Pkwy',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    country: 'USA',
    taxId: 'US-TAX-441092',
    proofDocId: 'DOC-STARK-4029',
    tier: 'Gold',
    portalActivatedAt: new Date(),
  });

  const custWayne = await Customer.create({
    userId: custUser4._id,
    companyName: 'Wayne Enterprises',
    phone: '+1-555-0400',
    address: '1 Wayne Plaza',
    city: 'Gotham',
    state: 'NJ',
    zipCode: '07001',
    country: 'USA',
    taxId: 'US-TAX-339182',
    proofDocId: 'DOC-WAYNE-9012',
    tier: 'Silver',
    portalActivatedAt: new Date(),
  });

  const custUmbrella = await Customer.create({
    userId: custUser5._id,
    companyName: 'Umbrella Corp',
    phone: '+1-555-0500',
    address: '500 Bio Tech Rd',
    city: 'Raccoon City',
    state: 'IL',
    zipCode: '60601',
    country: 'USA',
    taxId: 'US-TAX-118273',
    proofDocId: 'DOC-UMBRELLA-3392',
    tier: 'Standard',
    portalActivatedAt: new Date(),
  });

  console.log('Multiple customers with address, proof, and tax details created');

  // ── 3. Products Catalog ──────────────────────────────────────────────────
  const hardwareProduct = await Product.create({
    name: 'Enterprise Server X1',
    category: 'Hardware',
    productType: PRODUCT_TYPES.PRODUCT,
    basePrice: 5000,
    costPrice: 3500,
    taxRate: 18,
    unit: 'each',
    description: 'High-performance enterprise server with redundant power supplies',
  });

  const serviceProduct = await Product.create({
    name: 'Installation & Setup Service',
    category: 'Service',
    productType: PRODUCT_TYPES.SERVICE,
    basePrice: 1000,
    costPrice: 500,
    taxRate: 18,
    unit: 'each',
    description: 'Professional installation and configuration service',
  });

  const cloudSubProduct = await Product.create({
    name: 'Cloud Backup Subscription',
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
    name: 'IT Consulting Services',
    category: 'Service',
    productType: PRODUCT_TYPES.SERVICE,
    basePrice: 300,
    costPrice: 150,
    taxRate: 18,
    unit: 'hour',
    description: 'Expert IT consulting service',
  });

  console.log('Products created');

  // ── 4. Discount Rules & Governance ──────────────────────────────────────
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

  await ApprovalConfig.create([
    { name: 'Manager Approval Threshold', minDiscountPercent: 10, requiredApprovalLevel: REQUIRED_LEVEL.SALES_MANAGER },
    { name: 'Finance Approval Threshold', minDiscountPercent: 25, requiredApprovalLevel: REQUIRED_LEVEL.FINANCE },
  ]);

  // ── 5. Price Lists & Upsell Rules ───────────────────────────────────────
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
    name: 'Platinum Tier 2026',
    tier: 'Platinum',
    currency: 'USD',
    isActive: true,
    productOverrides: [
      { productId: hardwareProduct._id, overridePrice: 4500 },
      { productId: networkProduct._id, overridePrice: 2100 },
    ],
  });

  await UpsellRule.create([
    { primaryProductId: hardwareProduct._id, recommendedProductId: serviceProduct._id, minMarginThreshold: 0, isActive: true },
    { primaryProductId: hardwareProduct._id, recommendedProductId: cloudSubProduct._id, minMarginThreshold: 10, isActive: true },
    { primaryProductId: networkProduct._id, recommendedProductId: consultingProduct._id, minMarginThreshold: 0, isActive: true },
  ]);

  // ── 6. Warehouses & Stock ───────────────────────────────────────────────
  const whEast = await Warehouse.create({ name: 'East Coast DC', code: 'WH-EAST', address: '100 Industrial Pkwy, Newark, NJ 07102', shippingCostWeight: 1 });
  const whWest = await Warehouse.create({ name: 'West Coast DC', code: 'WH-WEST', address: '200 Logistics Blvd, Los Angeles, CA 90001', shippingCostWeight: 1.5 });
  const whCentral = await Warehouse.create({ name: 'Central DC', code: 'WH-CENTRAL', address: '300 Distribution Dr, Chicago, IL 60601', shippingCostWeight: 1.2 });

  await Inventory.create([
    { productId: hardwareProduct._id, warehouseId: whEast._id, availableQuantity: 20 },
    { productId: hardwareProduct._id, warehouseId: whWest._id, availableQuantity: 15 },
    { productId: networkProduct._id, warehouseId: whEast._id, availableQuantity: 30 },
    { productId: networkProduct._id, warehouseId: whCentral._id, availableQuantity: 25 },
  ]);

  // ── 7. Subscription Plans ───────────────────────────────────────────────
  await SubscriptionPlan.create({
    name: 'Cloud Backup Monthly Plan',
    frequency: 'MONTHLY',
    price: 200,
    applicableProductIds: [cloudSubProduct._id],
    prorationConfiguration: { enabled: true },
    cancellationRules: { allowed: true, noticeDays: 30 },
    isActive: true,
  });

  await SubscriptionPlan.create({
    name: 'Cloud Backup Yearly Plan',
    frequency: 'YEARLY',
    price: 1920,
    applicableProductIds: [cloudSubProduct._id],
    prorationConfiguration: { enabled: true },
    cancellationRules: { allowed: true, noticeDays: 60 },
    isActive: true,
  });

  // ── 8. Rich Quotations across Sales Reps & Customers ─────────────────────
  const q1 = await Quotation.create({
    quotationNumber: 'QT-2026-001',
    customerId: custAcme._id,
    salesRepId: salesRep1._id,
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
    customerId: custCyberdyne._id,
    salesRepId: salesRep2._id,
    status: QUOTATION_STATUS.PENDING_APPROVAL,
    lines: [
      { productId: networkProduct._id, quantity: 8, unitPrice: 2500, discount: 6000, total: 14000 },
    ],
    subTotal: 20000,
    discountTotal: 6000,
    taxTotal: 2520,
    grandTotal: 16520,
    notes: 'Volume discount (30%) requested by Cyberdyne Systems',
  });

  const q3 = await Quotation.create({
    quotationNumber: 'QT-2026-003',
    customerId: custStark._id,
    salesRepId: salesRep3._id,
    status: QUOTATION_STATUS.APPROVED,
    lines: [
      { productId: cloudSubProduct._id, quantity: 24, unitPrice: 200, discount: 480, total: 4320 },
      { productId: consultingProduct._id, quantity: 15, unitPrice: 300, discount: 450, total: 4050 },
    ],
    subTotal: 9300,
    discountTotal: 930,
    taxTotal: 1506.6,
    grandTotal: 9876.6,
    notes: 'Stark Industries cloud backup and consulting proposal',
  });

  const q4 = await Quotation.create({
    quotationNumber: 'QT-2026-004',
    customerId: custWayne._id,
    salesRepId: salesRep1._id,
    status: QUOTATION_STATUS.CONFIRMED,
    lines: [
      { productId: hardwareProduct._id, quantity: 1, unitPrice: 5000, discount: 250, total: 4750 },
    ],
    subTotal: 5000,
    discountTotal: 250,
    taxTotal: 855,
    grandTotal: 5605,
    notes: 'Confirmed hardware order for Wayne Enterprises',
  });

  const q5 = await Quotation.create({
    quotationNumber: 'QT-2026-005',
    customerId: custUmbrella._id,
    salesRepId: salesRep2._id,
    status: QUOTATION_STATUS.DRAFT,
    lines: [
      { productId: networkProduct._id, quantity: 2, unitPrice: 2500, discount: 100, total: 4900 },
    ],
    subTotal: 5000,
    discountTotal: 100,
    taxTotal: 882,
    grandTotal: 5782,
    notes: 'Draft proposal for Umbrella Corp switch upgrade',
  });

  console.log('Multiple quotations created');

  // Approvals
  await Approval.create({
    quotationId: q2._id.toString(),
    riskScore: 48,
    requiredLevel: REQUIRED_LEVEL.FINANCE,
    currentLevel: REQUIRED_LEVEL.SALES_MANAGER,
    status: APPROVAL_STATUS.PENDING,
    requestedBy: salesRep2._id.toString(),
    history: [
      {
        action: 'CREATED',
        user: salesRep2._id.toString(),
        userLabel: salesRep2.name,
        reason: 'Line 1 discount (30%) exceeds Platinum category limit (20%) and triggers Finance review.',
      },
    ],
  });

  // Negotiations
  await Negotiation.create([
    {
      quotationId: q1._id,
      customerId: custAcme._id,
      type: 'CHANGE_REQUEST',
      message: 'Can we include 1 year free maintenance with the Enterprise Server X1?',
      requestedValue: 0,
      status: 'PENDING',
    },
    {
      quotationId: q1._id,
      customerId: custAcme._id,
      type: 'COUNTER_DISCOUNT',
      message: 'Requesting an additional 5% discount on line item 1.',
      requestedValue: 10,
      status: 'PENDING',
    },
  ]);

  // Invoices & Payments
  const inv1 = await Invoice.create({
    invoiceNumber: 'INV-2026-001',
    sourceOrderId: q4._id,
    customerId: custWayne._id,
    lines: [
      { productId: hardwareProduct._id, productName: hardwareProduct.name, quantity: 1, unitPrice: 5000, discount: 250, lineTotal: 4750 },
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

  console.log('\n✅ Expanded seed completed successfully!\n');
  console.log('Login credentials (password for ALL accounts: password123):');
  console.log('  Sales Reps:');
  console.log('    • sales@dealflow360.local (Alice)');
  console.log('    • david.sales@dealflow360.local (David)');
  console.log('    • emma.sales@dealflow360.local (Emma)');
  console.log('  Sales Managers:');
  console.log('    • manager@dealflow360.local (Bob)');
  console.log('    • sarah.mgr@dealflow360.local (Sarah)');
  console.log('  Finance Ops:');
  console.log('    • finance@dealflow360.local (Carol)');
  console.log('    • frank.finance@dealflow360.local (Frank)');
  console.log('  Admins:');
  console.log('    • admin@dealflow360.local (System Admin)');
  console.log('    • ops.admin@dealflow360.local (Ops Admin)');
  console.log('  Customers:');
  console.log('    • customer@acme.local (Acme Corp)');
  console.log('    • customer@cyberdyne.local (Cyberdyne Systems)');
  console.log('    • customer@stark.local (Stark Industries)');
  console.log('    • customer@wayne.local (Wayne Enterprises)');
  console.log('    • customer@umbrella.local (Umbrella Corp)');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
