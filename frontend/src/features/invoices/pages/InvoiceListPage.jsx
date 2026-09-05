import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import invoicesApi from '../api/invoices.api';

function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setIsLoading(true);
        const { data } = await invoicesApi.list();
        setInvoices(data.data.invoices);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-slate-400 text-sm">View and manage customer invoices and payment statuses.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading invoices...</div>
        ) : error ? (
          <div className="text-center py-12 text-rose-400">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            No invoices found.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-brand-400">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">{inv.customerId?.companyName || 'Customer'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(inv.issueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono font-semibold">₹{inv.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        inv.paymentStatus === 'PAID'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          : inv.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/invoices/${inv._id}`}
                        className="text-brand-400 hover:text-brand-300 font-medium text-xs underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceListPage;
