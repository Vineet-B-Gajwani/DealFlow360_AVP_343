import React from 'react';
import PortalHeader from '../../customer-portal/components/PortalHeader';
import { useReporting } from '../hooks/useReporting';

function ReportingDashboard() {
  const { report, isLoading, error, refetch } = useReporting();

  return (
    <div className="portal-layout">
      <PortalHeader />

      <main className="portal-main">
        <div className="portal-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Spend Analytics</h1>
              <p className="text-slate-400 text-sm mt-1">Overview of your purchases and payments.</p>
            </div>
            <button onClick={refetch} className="btn-secondary text-sm flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Refresh
            </button>
          </div>

          {isLoading && (
            <div className="portal-loading py-12">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && error && (
            <div className="portal-error-state" role="alert">
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button onClick={refetch} className="btn-primary max-w-xs text-sm">Retry</button>
            </div>
          )}

          {!isLoading && !error && report && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="portal-card bg-brand-900/10 border-brand-700/30">
                <h3 className="text-sm font-semibold text-brand-400 mb-1">Total Invoiced</h3>
                <p className="text-3xl font-bold text-white">₹{report.totalInvoiced?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-400 mt-2">Across {report.invoiceCount} invoices</p>
              </div>

              <div className="portal-card bg-emerald-900/10 border-emerald-700/30">
                <h3 className="text-sm font-semibold text-emerald-400 mb-1">Total Paid</h3>
                <p className="text-3xl font-bold text-white">₹{report.totalPaid?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-400 mt-2">Across {report.paymentCount} payments</p>
              </div>

              <div className="portal-card bg-amber-900/10 border-amber-700/30">
                <h3 className="text-sm font-semibold text-amber-400 mb-1">Outstanding Balance</h3>
                <p className="text-3xl font-bold text-white">₹{report.outstandingBalance?.toLocaleString('en-IN')}</p>
              </div>

              <div className="portal-card lg:col-span-3">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Savings from Discounts</h3>
                <p className="text-3xl font-bold text-emerald-400">₹{report.totalDiscounts?.toLocaleString('en-IN')}</p>
                <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                  This represents the total amount you have saved through negotiated discounts and promotions across all your finalized invoices.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ReportingDashboard;
