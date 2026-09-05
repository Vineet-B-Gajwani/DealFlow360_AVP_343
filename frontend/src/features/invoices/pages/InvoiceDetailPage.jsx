import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInvoice } from '../hooks/useInvoices';
import PaymentModal from '../../payments/components/PaymentModal';
import PaymentHistory from '../../payments/components/PaymentHistory';

function InvoiceDetailPage() {
  const { id } = useParams();
  const { invoice, isLoading, error, refetch } = useInvoice(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Unable to load invoice</h1>
        <p className="text-slate-400 mb-6">{error || 'Invoice record not found'}</p>
        <Link to="/invoices" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm font-semibold transition-colors">
          ← Back to Invoices List
        </Link>
      </div>
    );
  }

  const grandTotal = invoice.grandTotal || invoice.total || 0;
  const subtotal = invoice.subtotal || 0;
  const discountTotal = invoice.discountTotal || invoice.discount || 0;
  const taxTotal = invoice.taxTotal || invoice.tax || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Actions Bar */}
        <div className="flex justify-between items-center print:hidden">
          <Link
            to="/invoices"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Invoices List
          </Link>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              🖨️ Print / Save PDF
            </button>
            {invoice.paymentStatus !== 'PAID' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-brand-600/30 transition-colors"
              >
                ⚡ Record Payment
              </button>
            )}
          </div>
        </div>

        {/* Invoice Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header Section */}
          <div className="p-8 md:p-10 border-b border-slate-800 flex flex-col md:flex-row md:justify-between gap-6 bg-slate-900/90">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-white">COMMERCIAL INVOICE</h1>
              </div>
              <p className="text-slate-400 text-sm font-mono mt-1">Ref Number: <span className="text-brand-400 font-bold">{invoice.invoiceNumber}</span></p>
              
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono tracking-tight ${
                  invoice.status === 'ISSUED' ? 'bg-brand-950 text-brand-400 border border-brand-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  STATUS: {invoice.status}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono tracking-tight ${
                  invoice.paymentStatus === 'PAID'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                    : invoice.paymentStatus === 'PARTIAL'
                    ? 'bg-amber-950 text-amber-400 border border-amber-700/50'
                    : 'bg-rose-950 text-rose-400 border border-rose-700/50'
                }`}>
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right text-xs text-slate-400 space-y-1.5 font-mono bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <p className="text-slate-200 font-bold text-sm font-sans mb-1">
                {invoice.customerId?.companyName || 'Enterprise Customer'}
              </p>
              <p>Issue Date: <span className="text-slate-200">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '—'}</span></p>
              <p>Payment Due Date: <span className="text-amber-400 font-bold">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</span></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-6 md:p-10 overflow-x-auto">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Invoice Line Items</h3>
            <table className="w-full text-sm text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="pb-3">Item Description</th>
                  <th className="pb-3 text-right">Quantity</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Discount</th>
                  <th className="pb-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {(invoice.lines || []).map((line, idx) => (
                  <tr key={idx} className="text-slate-300">
                    <td className="py-4 text-white font-medium">{line.productName || 'Product Line Item'}</td>
                    <td className="py-4 text-right font-mono">{line.quantity}</td>
                    <td className="py-4 text-right font-mono">₹{(line.unitPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="py-4 text-right font-mono text-emerald-400">
                      {line.discount ? `${line.discount}%` : '—'}
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-white">
                      ₹{(line.lineTotal || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary / Totals Breakdown */}
          <div className="p-6 md:p-10 bg-slate-950/60 border-t border-slate-800 flex flex-col md:items-end">
            <div className="w-full md:w-80 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Gross Subtotal</span>
                <span className="text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Applied Discounts</span>
                  <span className="text-emerald-400">-₹{discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Tax (GST / Sales Tax)</span>
                <span className="text-slate-200">₹{taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-bold font-sans">
                <span className="text-white">Grand Total Amount</span>
                <span className="text-brand-400 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Payment History Component */}
          <div className="p-6 md:p-10 border-t border-slate-800 bg-slate-900/50">
            <PaymentHistory invoiceId={id} refreshTrigger={refreshTrigger} />
          </div>

        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <PaymentModal 
          invoiceId={id} 
          maxAmount={grandTotal}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
            refetch();
          }}
        />
      )}
    </div>
  );
}

export default InvoiceDetailPage;
