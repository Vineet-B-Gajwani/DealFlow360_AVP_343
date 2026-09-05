import React from 'react';
import { Link } from 'react-router-dom';
import QuotationStatusBadge from './QuotationStatusBadge';

/**
 * QuotationCard
 *
 * Summary card for a single quotation shown in the list on the dashboard.
 * Links to /portal/quotations/:id for the full detail view.
 *
 * Props:
 *   quotation {object} — From the API contract:
 *     { id, quotationNumber, status, grandTotal, lines, customerName }
 */
function QuotationCard({ quotation }) {
  const lineCount = quotation.lines?.length ?? 0;

  function fmt(value) {
    if (value === null || value === undefined) return '—';
    return Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <Link
      to={`/portal/quotations/${quotation.id}`}
      id={`quotation-card-${quotation.id}`}
      className="quotation-card group"
      aria-label={`View quotation ${quotation.quotationNumber}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Quotation
          </p>
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors duration-150">
            {quotation.quotationNumber || `#${quotation.id?.slice(-6)}`}
          </h3>
        </div>
        <QuotationStatusBadge status={quotation.status} size="sm" />
      </div>

      {/* Details row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Items</p>
          <p className="text-sm font-semibold text-slate-300">{lineCount}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Grand Total</p>
          <p className="text-sm font-bold text-brand-400">
            ₹{fmt(quotation.grandTotal)}
          </p>
        </div>
      </div>

      {/* Chevron */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-brand-400 transition-colors duration-150" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}

export default QuotationCard;
