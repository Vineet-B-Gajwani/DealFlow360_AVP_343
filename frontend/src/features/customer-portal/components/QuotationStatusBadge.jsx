import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  Status config — maps API status strings to visual treatment
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    className: 'qstatus-draft',
    dot: 'bg-slate-400',
  },
  PENDING_APPROVAL: {
    label: 'Waiting for Final Approval',
    className: 'qstatus-pending',
    dot: 'bg-amber-400',
  },
  APPROVED: {
    label: 'Approved',
    className: 'qstatus-approved',
    dot: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'qstatus-rejected',
    dot: 'bg-red-400',
  },
  SENT_TO_CUSTOMER: {
    label: 'Sent to You',
    className: 'qstatus-sent',
    dot: 'bg-brand-400',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'qstatus-expired',
    dot: 'bg-slate-500',
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'qstatus-accepted',
    dot: 'bg-teal-400',
  },
};

/**
 * QuotationStatusBadge
 *
 * Renders a coloured pill badge for a quotation status string.
 *
 * Props:
 *   status {string} — One of the STATUS_CONFIG keys, or any unknown string
 *   size   {'sm'|'md'} — badge size (default: 'md')
 */
function QuotationStatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status ?? 'Unknown',
    className: 'qstatus-unknown',
    dot: 'bg-slate-500',
  };

  return (
    <span className={`quotation-status-badge ${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default QuotationStatusBadge;
