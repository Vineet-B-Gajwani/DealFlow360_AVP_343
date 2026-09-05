import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import QuotationStatusBadge from '../components/QuotationStatusBadge';
import QuotationLineTable from '../components/QuotationLineTable';
import QuotationTotals from '../components/QuotationTotals';
import useQuotation from '../hooks/useQuotation';
import NegotiationPanel from '../../negotiation/components/NegotiationPanel';
import apiClient from '../../auth/api/auth.api';

/**
 * QuotationDetailPage
 *
 * Full quotation detail view at /portal/quotations/:id.
 * Protected by CustomerPortalRoute (requires CUSTOMER role).
 */
function QuotationDetailPage() {
  const { id } = useParams();
  const { quotation, isLoading, error, refetch } = useQuotation(id);
  const [confirming, setConfirming] = useState(false);

  const handleConfirmQuotation = async () => {
    try {
      setConfirming(true);
      const res = await apiClient.post(`/negotiation/${id}/confirm`, {
        message: 'Quotation accepted and confirmed by customer'
      });
      if (res.data?.success) {
        alert('🎉 Quotation confirmed successfully! Order fulfillment, invoice, and contract provisioning have been triggered.');
        refetch();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to confirm quotation');
    } finally {
      setConfirming(false);
    }
  };

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
                    {quotation.requestedDeliveryDate && (
                      <p className="text-xs text-brand-300 font-mono mt-1.5 flex items-center gap-1.5">
                        <span>📅 Requested Delivery Date:</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {new Date(quotation.requestedDeliveryDate).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0" id="quotation-status-badge">
                    <QuotationStatusBadge status={quotation.status} />
                  </div>
                </div>
              </div>

              {/* Confirm Quotation Action Banner for Approved/Sent Proposals */}
              {(quotation.status === 'APPROVED' || quotation.status === 'SENT' || quotation.status === 'NEGOTIATING') && (
                <div className="p-5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>✅ Proposal Approved & Ready for Final Confirmation</span>
                    </h3>
                    <p className="text-xs text-emerald-200 mt-1">
                      Review the line items and pricing below. Click Confirm Quotation to finalize the commercial deal.
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmQuotation}
                    disabled={confirming}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 text-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    {confirming ? 'Confirming Deal...' : 'Confirm Quotation'}
                  </button>
                </div>
              )}

              {/* Status Banner when Pending Final Approval */}
              {quotation.status === 'PENDING_APPROVAL' && (
                <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-xl text-amber-200 text-xs font-medium flex items-center gap-3 shadow-lg">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <span className="font-bold block text-sm text-white">Waiting for Final Approval</span>
                    <span>This proposal has been submitted by your sales representative and is currently awaiting final manager approval before it can be confirmed.</span>
                  </div>
                </div>
              )}

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

