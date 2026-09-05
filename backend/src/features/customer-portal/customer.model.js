'use strict';

const mongoose = require('mongoose');

/**
 * Customer Profile Model
 *
 * Holds customer-specific business profile data.
 * This model is intentionally separate from User (auth.model.js).
 *
 * Boundary:
 *   User  = identity & authentication (name, email, passwordHash, role, tokens)
 *   Customer = business profile (company, contact, portal metadata)
 *
 * Relationship: One-to-one with User.
 * The Customer document is created when a CUSTOMER user account is provisioned.
 *
 * Import from auth.model.js:
 *   const { User, ROLES } = require('../features/auth/auth.model');
 *
 * Do NOT add authentication fields here. Do NOT duplicate User fields.
 */
const customerSchema = new mongoose.Schema(
  {
    /**
     * Reference to the User document (identity record).
     * This is the authoritative link — never accept customerId from user input.
     * Always resolve from req.user.id (set by authenticate middleware).
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true, // One Customer profile per User account
      index: true,
    },

    /**
     * Company / organisation name for this customer account.
     */
    companyName: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name must not exceed 200 characters'],
      default: null,
    },

    /**
     * Primary contact phone number.
     */
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number must not exceed 30 characters'],
      default: null,
    },

    /**
     * Billing / primary address.
     */
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address must not exceed 500 characters'],
      default: null,
    },

    /**
     * City, State, Zip, Country details.
     */
    city: {
      type: String,
      trim: true,
      default: null,
    },
    state: {
      type: String,
      trim: true,
      default: null,
    },
    zipCode: {
      type: String,
      trim: true,
      default: null,
    },
    country: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Tax ID / Business Registration Number (e.g. GSTIN, EIN).
     */
    taxId: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Business Identity / Proof Document ID.
     */
    proofDocId: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Customer Tier (e.g. Standard, Silver, Gold, Platinum).
     * Used for Discount Rule evaluation and Price Lists.
     */
    tier: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold', 'Platinum'],
      default: 'Standard',
      index: true,
    },

    /**
     * Timestamp when the customer first activated their portal.
     * Null until the customer completes their first login.
     */
    portalActivatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };
