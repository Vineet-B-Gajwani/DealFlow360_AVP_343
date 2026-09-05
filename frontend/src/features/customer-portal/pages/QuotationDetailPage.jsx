import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import QuotationStatusBadge from '../components/QuotationStatusBadge';
import QuotationLineTable from '../components/QuotationLineTable';
import QuotationTotals from '../components/QuotationTotals';
import useQuotation from '../hooks/useQuotation';
import NegotiationPanel from '../../negotiation/components/NegotiationPanel';

/**
 * QuotationDetailPage
 *
 * Full quotation detail view at /portal/quotations/:id.
 * Protected by CustomerPortalRoute (requires CUSTOMER role).
 *
 * Displays:
 *   - Quotation number + status
 *   - Line items table (products, quantities, pricing, discounts)
 *   - Financial totals (subtotal, discount, tax, grand total)
 *
 * Does NOT implement negotiation — that is a later feature.
 */
function QuotationDetailPage() {
  const { id } = useParams();
  const { quotation, isLoading, error, refetch } = useQuotation(id);

  return (
    <div className="portal-layout">
      <PortalHeader />

      <main className="portal-main" id="quotation-detail-main">
        <div className="portal-container">

          {/* Back navigation */}
          <div className="mb-6">
            <Link
              to="/portal"
              id="back-to-portal-btn"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Portal
            </Link>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="portal-loading" id="quotation-loading">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm mt-4">Loading quotation…</p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="portal-error-state" id="quotation-error" role="alert">
              <div className="text-4xl mb-3">⚠️</div>
              <h1 className="text-lg font-semibold text-slate-200 mb-2">
                Unable to load quotation
              </h1>
              <p className="text-slate-400 text-sm mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  id="quotation-retry-btn"
                  onClick={refetch}
                  className="btn-primary max-w-xs"
                >
                  Retry
                </button>
                <Link to="/portal" className="btn-secondary max-w-xs">
                  Back to Portal
                </Link>
              </div>
            </div>
          )}

          {/* Quotation content */}
          {!isLoading && !error && quotation && (
            <div className="space-y-6">

              {/* Header card */}
              <div className="portal-card" id="quotation-header-card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Quotation
                    </p>
                    <h1 className="text-2xl font-bold text-white" id="quotation-number">
                      {quotation.quotationNumber || `#${quotation.id?.slice(-8)}`}
                    </h1>
                    {quotation.customerName && (
                      <p className="text-slate-400 text-sm mt-1">
                        Prepared for{' '}
                        <span className="text-slate-200 font-medium">
                          {quotation.customerName}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0" id="quotation-status-badge">
                    <QuotationStatusBadge status={quotation.status} />
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="portal-card" id="quotation-lines-card">
                <h2 className="text-base font-bold text-slate-100 mb-5">
                  Products &amp; Pricing
                </h2>
                <QuotationLineTable lines={quotation.lines} />
              </div>

              {/* Totals */}
              <div className="portal-card" id="quotation-totals-card">
                <h2 className="text-base font-bold text-slate-100 mb-5">Summary</h2>
                <div className="max-w-sm ml-auto">
                  <QuotationTotals quotation={quotation} />
                </div>
              </div>

              {/* Negotiation Panel */}
              <div id="negotiation-panel">
                <NegotiationPanel quotationId={id} />
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuotationDetailPage;

