import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalHeader from '../../customer-portal/components/PortalHeader';
import { useInvoice } from '../hooks/useInvoices';
import PaymentModal from '../../payments/components/PaymentModal';
import PaymentHistory from '../../payments/components/PaymentHistory';

function InvoiceDetailPage() {
  const { id } = useParams();
  const { invoice, isLoading, error, refetch } = useInvoice(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (isLoading) return <div className="portal-layout"><PortalHeader /><main className="portal-main flex justify-center py-24"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></main></div>;

  if (error || !invoice) return (
    <div className="portal-layout">
      <PortalHeader />
      <main className="portal-main flex flex-col items-center py-24">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl text-white mb-2">Unable to load invoice</h1>
        <p className="text-slate-400 mb-6">{error || 'Not found'}</p>
        <Link to="/portal/invoices" className="btn-secondary">Back to Invoices</Link>
      </main>
    </div>
  );

  return (
    <div className="portal-layout">
      <PortalHeader />
      <main className="portal-main">
        <div className="portal-container max-w-4xl">
          <Link to="/portal/invoices" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Invoices
          </Link>

          <div className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-10 border-b border-slate-700/60 flex flex-col md:flex-row md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">INVOICE</h1>
                <p className="text-slate-400 text-sm">Ref: {invoice.invoiceNumber}</p>
                <div className="mt-4 flex gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    invoice.status === 'ISSUED' ? 'bg-brand-900/40 text-brand-400' : 'bg-slate-800 text-slate-300'
                  }`}>{invoice.status}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    invoice.paymentStatus === 'PAID' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'
                  }`}>{invoice.paymentStatus}</span>
                </div>
              </div>
              <div className="text-left md:text-right text-sm text-slate-400 space-y-1">
                <p>Issue Date: <span className="text-slate-200">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '—'}</span></p>
                <p>Due Date: <span className="text-slate-200">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</span></p>
              </div>
            </div>

            {/* Lines Table */}
            <div className="p-6 md:p-10 overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-700/60 text-slate-400">
                    <th className="pb-3 font-semibold">Item</th>
                    <th className="pb-3 text-right font-semibold">Qty</th>
                    <th className="pb-3 text-right font-semibold">Price</th>
                    <th className="pb-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {invoice.lines.map((line, idx) => (
                    <tr key={idx} className="text-slate-300">
                      <td className="py-4 text-white font-medium">{line.productName}</td>
                      <td className="py-4 text-right">{line.quantity}</td>
                      <td className="py-4 text-right">₹{line.unitPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-4 text-right font-semibold">₹{line.lineTotal?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="p-6 md:p-10 bg-slate-800/30 border-t border-slate-700/60 flex flex-col md:items-end">
              <div className="w-full md:w-64 space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-300">₹{invoice.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {invoice.discountTotal > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Discount</span>
                    <span className="text-emerald-400">-₹{invoice.discountTotal?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax</span>
                  <span className="text-slate-300">₹{invoice.taxTotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-700/60 text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-brand-400">₹{invoice.grandTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payments section */}
            <PaymentHistory invoiceId={id} refreshTrigger={refreshTrigger} />

            {/* Pay Button (only if not fully paid) */}
            {invoice.paymentStatus !== 'PAID' && (
              <div className="p-6 md:p-10 border-t border-slate-700/60 bg-slate-900 flex justify-end">
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                  Make a Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <PaymentModal 
          invoiceId={id} 
          maxAmount={invoice.grandTotal} // simplified max amount for demo
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
            refetch(); // re-fetch invoice to update status
          }}
        />
      )}
    </div>
  );
}

export default InvoiceDetailPage;
