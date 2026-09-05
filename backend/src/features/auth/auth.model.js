'use strict';

const mongoose = require('mongoose');

/**
 * Allowed roles for DealFlow360 internal users.
 * CUSTOMER is defined here for schema completeness but the customer portal
 * feature is NOT implemented in M1-F1.
 */
const ROLES = Object.freeze({
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE_OPERATIONS: 'FINANCE_OPERATIONS',
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // never returned by default in queries
    },

    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: `Role must be one of: ${Object.values(ROLES).join(', ')}`,
      },
      required: [true, 'Role is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Hashed refresh token stored server-side.
     * Nulled out on logout, enabling single-session invalidation
     * without a separate token blocklist (sufficient for localhost use).
     */
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/**
 * Export the ROLES constant so other features can import it
 * without duplicating the enum values.
 */
const User = mongoose.model('User', userSchema);

module.exports = { User, ROLES };
