import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import invoicesApi from '../../invoices/api/invoices.api';

function CustomerInvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await invoicesApi.list();
      const list = res.data?.data?.invoices || res.data?.invoices || [];
      setInvoices(list);
    } catch (err) {
      console.error('Failed to fetch customer invoices:', err);
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      setDownloadingId(invoiceId);
      const response = await invoicesApi.downloadPDF(invoiceId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber || 'Paid'}_Receipt.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      alert(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="portal-card mt-6" id="customer-invoices-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>📄</span> Commercial Invoices &amp; Payment Receipts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View billing history and download official PDF receipts for confirmed payments.
          </p>
        </div>
        {!isLoading && invoices.length > 0 && (
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="portal-loading py-8" id="invoices-loading">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm mt-3">Loading invoices…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={fetchInvoices} className="text-white bg-rose-900 px-3 py-1 rounded text-xs">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && invoices.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm bg-slate-950/40 rounded-xl border border-slate-800/80">
          <p className="mb-1 text-slate-400">No invoices generated yet</p>
          <p className="text-xs">Once a proposal/order is confirmed, your invoices and receipts will appear here.</p>
        </div>
      )}

      {!isLoading && !error && invoices.length > 0 && (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const isPaid = inv.paymentStatus === 'PAID' || inv.status === 'PAID';
            const totalAmt = inv.grandTotal || inv.total || 0;

            return (
              <div 
                key={inv._id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">
                      {inv.invoiceNumber}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono tracking-tight ${
                      isPaid
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : inv.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                    }`}>
                      {inv.paymentStatus || inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Issue Date: {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : 'N/A'} • Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">
                      ₹{totalAmt.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/invoices/${inv._id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      View Invoice
                    </Link>

                    {isPaid ? (
                      <button
                        onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                        disabled={downloadingId === inv._id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {downloadingId === inv._id ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          '📥 Download PDF'
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        PDF unlock after payment
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomerInvoicesList;
