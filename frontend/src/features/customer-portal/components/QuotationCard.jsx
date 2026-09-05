import React from 'react';
import { Link } from 'react-router-dom';
import QuotationStatusBadge from './QuotationStatusBadge';

function QuotationCard({ quotation }) {
  const lineCount = quotation.lines?.length ?? 0;
  const qId = quotation._id || quotation.id;

  function fmt(value) {
    if (value === null || value === undefined) return '0.00';
    return Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <Link
      to={`/portal/quotations/${qId}`}
      id={`quotation-card-${qId}`}
      className="quotation-card group block p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-brand-500 transition-colors relative"
      aria-label={`View quotation ${quotation.quotationNumber}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
            Quotation
          </p>
          <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors duration-150">
            {quotation.quotationNumber || `#${qId?.slice(-6)}`}
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
        <div className="text-right pr-6">
          <p className="text-xs text-slate-500 mb-0.5">Grand Total</p>
          <p className="text-sm font-bold text-brand-400">
            ₹{fmt(quotation.grandTotal)}
          </p>
        </div>
      </div>

      {/* Chevron */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-brand-400 transition-colors duration-150" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}

export default QuotationCard;
