import React from 'react';
import { Link } from 'react-router-dom';
import PortalHeader from '../../customer-portal/components/PortalHeader';
import { useInvoices } from '../hooks/useInvoices';

function InvoiceListPage() {
  const { invoices, isLoading, error, refetch } = useInvoices();

  return (
    <div className="portal-layout">
      <PortalHeader />

      <main className="portal-main">
        <div className="portal-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Invoices</h1>
              <p className="text-slate-400 text-sm mt-1">View and manage your billing.</p>
            </div>
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

          {!isLoading && !error && invoices.length === 0 && (
            <div className="portal-empty-state">
              <h3 className="text-base font-semibold text-slate-300 mb-2">No invoices yet</h3>
              <p className="text-sm text-slate-500">Your invoices will appear here once an order is confirmed.</p>
            </div>
          )}

          {!isLoading && !error && invoices.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {invoices.map(invoice => (
                <Link
                  key={invoice._id}
                  to={`/portal/invoices/${invoice._id}`}
                  className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Issued: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-400">₹{invoice.grandTotal?.toLocaleString('en-IN')}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                        invoice.paymentStatus === 'PAID' ? 'bg-emerald-900/30 text-emerald-400' : 
                        invoice.paymentStatus === 'PARTIAL' ? 'bg-amber-900/30 text-amber-400' : 
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {invoice.paymentStatus}
                      </span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default InvoiceListPage;
