'use strict';

const mongoose = require('mongoose');

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Possible statuses of an approval record.
 * Exported so the service, controller, and frontend contract can share them.
 */
const APPROVAL_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
});

/**
 * Required approval levels.
 *
 * NONE           → Auto-approved immediately; no human action needed.
 * SALES_MANAGER  → One round of manager approval required.
 * FINANCE        → Manager approval first, then Finance operations approval.
 */
const REQUIRED_LEVEL = Object.freeze({
  NONE: 'NONE',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE: 'FINANCE',
});

// ── History entry sub-document ────────────────────────────────────────────────

const historyEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATED', 'APPROVED', 'REJECTED', 'REVISION_REQUIRED', 'RESUBMITTED'],
    },
    /** The user id string who performed this action (matches req.user.id). */
    user: {
      type: String,
      required: true,
    },
    /** Human-readable label (email or display name) stored for readability. */
    userLabel: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: false }
);

// ── Approval schema ───────────────────────────────────────────────────────────

const approvalSchema = new mongoose.Schema(
  {
    /**
     * External reference to the quotation this approval covers.
     * Stored as a plain string so the approval feature stays independent of
     * the Quotation collection (which does not exist yet).
     * When the Quotation feature is built, this will map to Quotation._id.
     */
    quotationId: {
      type: String,
      required: [true, 'quotationId is required'],
      trim: true,
      index: true,
    },

    /**
     * Numeric risk score (0–100) provided by the discount/risk engine.
     * Not calculated here — accepted as-is from the integration caller.
     */
    riskScore: {
      type: Number,
      required: [true, 'riskScore is required'],
      min: [0, 'riskScore cannot be less than 0'],
      max: [100, 'riskScore cannot exceed 100'],
    },

    /** Which approval chain is required for this record. */
    requiredLevel: {
      type: String,
      required: [true, 'requiredLevel is required'],
      enum: {
        values: Object.values(REQUIRED_LEVEL),
        message: `requiredLevel must be one of: ${Object.values(REQUIRED_LEVEL).join(', ')}`,
      },
    },

    /**
     * Which level of the chain is currently active.
     * Starts at NONE and advances as approvals are granted.
     */
    currentLevel: {
      type: String,
      enum: Object.values(REQUIRED_LEVEL),
      default: REQUIRED_LEVEL.NONE,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(APPROVAL_STATUS),
        message: `status must be one of: ${Object.values(APPROVAL_STATUS).join(', ')}`,
      },
      default: APPROVAL_STATUS.PENDING,
      index: true,
    },

    /** User id of the person who initiated the approval request. */
    requestedBy: {
      type: String,
      required: [true, 'requestedBy is required'],
      trim: true,
    },

    /**
     * User id of whoever is currently expected to act.
     * Null when the approval is terminal (APPROVED / REJECTED).
     */
    currentReviewer: {
      type: String,
      default: null,
    },

    /** Full audit trail. Every state change appends an entry. */
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

// Compound index — fast lookup by quotation
approvalSchema.index({ quotationId: 1, status: 1 });

const Approval = mongoose.model('Approval', approvalSchema);

module.exports = { Approval, APPROVAL_STATUS, REQUIRED_LEVEL };
