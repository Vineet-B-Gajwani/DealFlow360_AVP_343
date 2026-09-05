import React from 'react';

/**
 * QuotationsPlaceholder
 *
 * Intentional empty-state component for the quotations section.
 *
 * This is NOT a fake implementation.
 * This is the correct "no data yet" state for M3-F1.
 *
 * The actual quotation feature will be implemented in M3-F2
 * (Customer Quotation Portal). At that point, this component
 * will be replaced with the real quotation list.
 */
function QuotationsPlaceholder() {
  return (
    <div className="portal-card" id="quotations-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-100">Quotations</h2>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
          Coming soon
        </span>
      </div>

      {/* Empty state */}
      <div className="portal-empty-state">
        <div className="portal-empty-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-300 mb-2">
          No quotations available
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Your quotations will appear here once your sales representative
          has shared one with you.
        </p>
        <div className="mt-4 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/40 inline-block">
          <p className="text-xs text-slate-500">
            Feature available in a future release
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuotationsPlaceholder;
