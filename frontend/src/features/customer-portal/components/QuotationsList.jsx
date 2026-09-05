import React from 'react';
import QuotationCard from './QuotationCard';
import useQuotations from '../hooks/useQuotations';

/**
 * QuotationsList
 *
 * Displays all quotations for the authenticated customer on the dashboard.
 * Replaces the M3-F1 QuotationsPlaceholder.
 *
 * States:
 *   - Loading: spinner
 *   - Error: error message + retry
 *   - Empty (integration not yet live): "No quotations yet" state
 *   - Empty (integration live, no quotations): same empty state
 *   - Populated: grid of QuotationCard components
 */
function QuotationsList() {
  const { quotations, isLoading, error, refetch } = useQuotations();

  return (
    <div className="portal-card" id="quotations-list-section">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-100">Your Quotations</h2>
        {!isLoading && quotations.length > 0 && (
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            {quotations.length} quotation{quotations.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="portal-loading py-12" id="quotations-loading">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm mt-3">Loading quotations…</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="portal-error-state py-10" id="quotations-error" role="alert">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            id="quotations-retry-btn"
            onClick={refetch}
            className="btn-primary max-w-xs text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && quotations.length === 0 && (
        <div className="portal-empty-state" id="quotations-empty">
          <div className="portal-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-300 mb-2">
            No quotations yet
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Your quotations will appear here once your sales representative
            has shared one with you.
          </p>
        </div>
      )}

      {/* Quotation cards */}
      {!isLoading && !error && quotations.length > 0 && (
        <div className="quotations-grid" id="quotations-grid">
          {quotations.map((q) => (
            <QuotationCard key={q.id} quotation={q} />
          ))}
        </div>
      )}
    </div>
  );
}

export default QuotationsList;
