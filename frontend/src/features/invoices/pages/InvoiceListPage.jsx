import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import invoicesApi from '../api/invoices.api';
import apiClient from '../../auth/api/auth.api';

function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Create Invoice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [customTax, setCustomTax] = useState(18);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await invoicesApi.list();
      const list = data?.data?.invoices || data?.invoices || [];
      setInvoices(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openCreateModal = async () => {
    setShowCreateModal(true);
    try {
      const res = await apiClient.get('/quotations');
      if (res.data?.success) {
        const qList = res.data.data?.quotations || res.data.data || [];
        setQuotations(qList);
        if (qList.length > 0) setSelectedQuotationId(qList[0]._id);
      }
    } catch (err) {
      console.error('Failed to load quotations for invoice generation:', err);
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    const qObj = quotations.find(q => q._id === selectedQuotationId);
    if (!qObj) {
      alert('Please select a quotation.');
      return;
    }

    const lineItems = (qObj.lineItems || qObj.items || []).map(item => ({
      productId: item.productId?._id || item.productId || 'PROD-01',
      productName: item.productName || item.productId?.name || 'Product Item',
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice || 0),
      discount: Number(item.discount || 0),
    }));

    if (lineItems.length === 0) {
      lineItems.push({
        productId: 'PROD-CUSTOM',
        productName: 'Quotation Commercial Package',
        quantity: 1,
        unitPrice: qObj.grandTotal || qObj.totalAmount || 10000,
        discount: 0,
      });
    }

    try {
      await invoicesApi.create({
        sourceOrderId: qObj._id,
        customerId: qObj.customerId?._id || qObj.customerId,
        lines: lineItems,
        tax: Number(customTax),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setShowCreateModal(false);
      alert('Invoice generated successfully!');
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  // KPIs
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.grandTotal || inv.total || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'PAID');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.grandTotal || inv.total || 0), 0);
  const unpaidInvoices = invoices.filter(inv => inv.paymentStatus !== 'PAID');
  const outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + (inv.grandTotal || inv.total || 0), 0);

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === 'PAID') return inv.paymentStatus === 'PAID';
    if (statusFilter === 'PARTIAL') return inv.paymentStatus === 'PARTIAL';
    if (statusFilter === 'UNPAID') return inv.paymentStatus === 'UNPAID';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Commercial Invoices & Receivables
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Generate customer invoices, monitor payment statuses, and audit commercial receivables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchInvoices}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="rounded-lg bg-brand-600 hover:bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              ⚡ + Generate Invoice
            </button>
          </div>
        </div>

        {/* KPI Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue Invoiced</span>
            <p className="text-2xl font-bold font-mono text-white mt-2">
              ₹{totalInvoiced.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Cumulative gross invoice value</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Collected / Paid</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
              ₹{totalPaid.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Settled customer payments</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Receivables</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-2">
              ₹{outstandingBalance.toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Pending & partial collections</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unpaid Invoices</span>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-2">
              {unpaidInvoices.length}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting customer payment</span>
          </div>
        </div>

        {/* Generate Invoice Modal */}
        {showCreateModal && (
          <div className="rounded-2xl border border-brand-500/40 bg-slate-900 p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Generate Invoice from Quotation</h2>
            </div>
            
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Select Commercial Quotation
                  </label>
                  <select
                    required
                    value={selectedQuotationId}
                    onChange={(e) => setSelectedQuotationId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    {quotations.map(q => (
                      <option key={q._id} value={q._id}>
                        Quote #{q.quotationNumber || q._id.slice(-6)} — ₹{(q.grandTotal || q.totalAmount || 0).toLocaleString('en-IN')} ({q.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Tax Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customTax}
                    onChange={(e) => setCustomTax(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-colors"
                >
                  Generate Invoice Document →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex gap-2">
            {['ALL', 'UNPAID', 'PARTIAL', 'PAID'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === tab
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {tab} ({tab === 'ALL' ? invoices.length : invoices.filter(i => i.paymentStatus === tab).length})
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">Showing {filteredInvoices.length} invoices</span>
        </div>

        {/* Invoices List Table */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 flex justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-rose-400 bg-rose-950/20 border border-rose-800 rounded-xl">{error}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="text-4xl mb-2">📄</div>
            <h3 className="text-base font-semibold text-white">No invoices found</h3>
            <p className="text-xs text-slate-500 mt-1">Generate a commercial invoice to begin collection tracking.</p>
          </div>
        ) : (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Issue Date</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Total Amount</th>
                  <th className="px-6 py-3.5 text-center">Payment Status</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-brand-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {inv.customerId?.companyName || 'Corporate Client'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(inv.issueDate || inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">
                      ₹{(inv.grandTotal || inv.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-tight ${
                        inv.paymentStatus === 'PAID'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          : inv.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/invoices/${inv._id}`}
                        className="text-brand-400 hover:text-brand-300 font-bold text-xs hover:underline"
                      >
                        View Details →
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
