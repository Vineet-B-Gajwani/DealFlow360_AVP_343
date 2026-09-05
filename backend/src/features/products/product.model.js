'use strict';

const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
//  Enumerations
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_TYPES = Object.freeze({
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
  SUBSCRIPTION: 'SUBSCRIPTION',
});

const UNITS = Object.freeze({
  EACH: 'each',
  HOUR: 'hour',
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
  KG: 'kg',
  LITRE: 'litre',
  SET: 'set',
  BOX: 'box',
});

// ─────────────────────────────────────────────────────────────────────────────
//  Variant sub-schema
//
//  A product can have multiple variants (e.g. "Standard", "Premium").
//  Each variant carries an optional price modifier (absolute, not percentage).
//  Member 3 (Quotation feature) will select a variant when building a line item.
// ─────────────────────────────────────────────────────────────────────────────

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
      maxlength: [100, 'Variant name must not exceed 100 characters'],
    },
    priceModifier: {
      type: Number,
      default: 0,
      min: [0, 'Price modifier must be non-negative'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Product schema
// ─────────────────────────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────────

    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name must not exceed 200 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category must not exceed 100 characters'],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters'],
      default: null,
    },

    productType: {
      type: String,
      required: [true, 'Product type is required'],
      enum: {
        values: Object.values(PRODUCT_TYPES),
        message: `Product type must be one of: ${Object.values(PRODUCT_TYPES).join(', ')}`,
      },
      index: true,
    },

    // ── Pricing (base values — do NOT add order/quotation pricing here) ──────
    //
    //  basePrice : what is shown / quoted to the customer
    //  costPrice : internal cost (used for margin calculation by finance)
    //  taxRate   : percentage, e.g. 18 means 18 % GST
    //
    //  Pricing logic (margin, discounts, final price) belongs in the
    //  Quotation feature (Member 3).  Do not add pricing logic here.

    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price must be non-negative'],
    },

    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'Cost price must be non-negative'],
    },

    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate must be non-negative'],
      max: [100, 'Tax rate cannot exceed 100'],
    },

    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: {
        values: Object.values(UNITS),
        message: `Unit must be one of: ${Object.values(UNITS).join(', ')}`,
      },
      default: UNITS.EACH,
    },

    // ── Variants ──────────────────────────────────────────────────────────────
    //
    //  Optional list of product variants.  If empty the product is treated as
    //  a single-variant item.  The Quotation feature selects a variantId when
    //  building a line item.

    variants: {
      type: [variantSchema],
      default: [],
      validate: {
        validator(arr) {
          if (arr.length === 0) return true;
          const defaults = arr.filter((v) => v.isDefault);
          return defaults.length <= 1;
        },
        message: 'At most one variant may be marked as default',
      },
    },

    // ── Status ────────────────────────────────────────────────────────────────

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Text index for full-text search on name + description
productSchema.index({ name: 'text', description: 'text' });

// Compound index for common list queries
productSchema.index({ isActive: 1, category: 1, productType: 1 });

// ─────────────────────────────────────────────────────────────────────────────
//  Model
// ─────────────────────────────────────────────────────────────────────────────

const Product = mongoose.model('Product', productSchema);

module.exports = { Product, PRODUCT_TYPES, UNITS };
