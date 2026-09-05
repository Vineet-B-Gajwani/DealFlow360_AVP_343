import React from 'react';
import { Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import CustomerIdentityCard from '../components/CustomerIdentityCard';
import PortalStatusCard from '../components/PortalStatusCard';
import QuotationsList from '../components/QuotationsList';
import useCustomerPortal from '../hooks/useCustomerPortal';
import DealHealthWidget from '../../deal-health/components/DealHealthWidget';

import CustomerInvoicesList from '../components/CustomerInvoicesList';

/**
 * PortalDashboardPage
 *
 * Main customer portal dashboard at /portal.
 * Protected by CustomerPortalRoute (requires CUSTOMER role).
 */
function PortalDashboardPage() {
  const { profile, status, isLoading, error, refetch } = useCustomerPortal();

  return (
    <div className="portal-layout">
      <PortalHeader />

      <main className="portal-main" id="portal-main-content">
        <div className="portal-container">

          {/* Page heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {profile?.identity?.name
                  ? `Welcome back, ${profile.identity.name.split(' ')[0]}`
                  : 'Your Portal'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage your account, view quotations, and track invoices &amp; receipts
              </p>
            </div>
            <Link
              to="/portal/buy"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 inline-flex items-center gap-2 transition-all"
            >
              <span>🛒</span> Request New Products / Buy
            </Link>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="portal-loading" id="portal-loading-indicator">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm mt-4">Loading your portal…</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="portal-error-state" id="portal-error-message" role="alert">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg font-semibold text-slate-200 mb-2">
                Unable to load portal
              </h2>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button
                id="portal-retry-btn"
                onClick={refetch}
                className="btn-primary max-w-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Dashboard content */}
          {!isLoading && !error && (
            <div className="portal-grid">
              {/* Left column: Identity + Status + Health */}
              <div className="portal-sidebar space-y-6">
                <CustomerIdentityCard profile={profile} />
                <PortalStatusCard status={status} />
                <DealHealthWidget />
              </div>

              {/* Right column: Quotations + Invoices */}
              <div className="portal-content-area space-y-6">
                <QuotationsList />
                <CustomerInvoicesList />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PortalDashboardPage;
