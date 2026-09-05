import React, { useState, useEffect } from 'react';
import { useBilling } from '../hooks/useBilling';
import apiClient from '../../auth/api/auth.api';

export default function BillingDashboardPage() {
  const { subscriptions, loading, error, reload, addSubscription, cancelSubscription } = useBilling();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Related data for dropdowns
  const [quotations, setQuotations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    quotationId: '',
    subscriptionPlanId: '',
    productId: '',
    quantity: 1,
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [qRes, pRes, prodRes] = await Promise.allSettled([
        apiClient.get('/quotations'),
        apiClient.get('/subscription-plans'),
        apiClient.get('/products')
      ]);

      if (qRes.status === 'fulfilled' && qRes.value.data?.success) {
        const qList = qRes.value.data.data?.quotations || qRes.value.data.data || [];
        setQuotations(qList);
        if (qList.length > 0) {
          setFormData(prev => ({ ...prev, quotationId: qList[0]._id }));
        }
      }

      if (pRes.status === 'fulfilled' && pRes.value.data?.success) {
        const pList = pRes.value.data.data || [];
        setPlans(pList);
        if (pList.length > 0) {
          setFormData(prev => ({ ...prev, subscriptionPlanId: pList[0]._id }));
        }
      }

      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        const prodData = prodRes.value.data.data;
        const prodList = Array.isArray(prodData) ? prodData : (prodData?.products || []);
        setProducts(prodList);
      }
    } catch (err) {
      console.error('Error fetching options for billing:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSubscription(formData);
      setShowForm(false);
      alert('Subscription provisioned successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subscription');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? Proration credit will be calculated.')) return;
    try {
      const res = await cancelSubscription(id, { cancelDate: new Date().toISOString() });
      if (res?.proration?.refundAmount > 0) {
        alert(`Subscription cancelled successfully. Calculated prorated refund: ₹${res.proration.refundAmount.toLocaleString('en-IN')}`);
      } else {
        alert('Subscription cancelled successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  // KPIs
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const cancelledSubs = subscriptions.filter(s => s.status === 'CANCELLED');
  const totalMRR = activeSubs.reduce((sum, s) => {
    let monthlyAmount = s.amount || 0;
    if (s.frequency === 'YEARLY') monthlyAmount = (s.amount || 0) / 12;
    if (s.frequency === 'QUARTERLY') monthlyAmount = (s.amount || 0) / 3;
    return sum + monthlyAmount;
  }, 0);

  const filteredSubs = subscriptions.filter(s => {
    if (statusFilter === 'ACTIVE') return s.status === 'ACTIVE';
    if (statusFilter === 'CANCELLED') return s.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Billing & Proration Management
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Provision recurring subscriptions, track monthly recurring revenue (MRR), and automate prorated refunds.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => reload()}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              {showForm ? 'Cancel' : '⚡ + Provision New Subscription'}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Recurring Revenue (MRR)</span>
            <p className="text-2xl font-bold font-mono text-brand-400 mt-2">
              ₹{Math.round(totalMRR).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Normalized monthly subscription yield</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Subscriptions</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
              {activeSubs.length}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Currently billing contracts</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cancelled / Expired</span>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-2">
              {cancelledSubs.length}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">Terminated subscriptions</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Subscriptions</span>
            <p className="text-2xl font-bold font-mono text-white mt-2">
              {subscriptions.length}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">All recorded contracts</span>
          </div>
        </div>

        {/* Provisioning Form Modal/Card */}
        {showForm && (
          <div className="rounded-2xl border border-brand-500/40 bg-slate-900/90 p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡ Provision New Billing Subscription</span>
              </h2>
              <span className="text-xs text-brand-300 bg-brand-950 border border-brand-800 px-2.5 py-1 rounded-full font-mono">
                Auto-Proration Enabled
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Select Quotation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Linked Quotation
                  </label>
                  {quotations.length > 0 ? (
                    <select
                      required
                      value={formData.quotationId}
                      onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                    >
                      {quotations.map(q => (
                        <option key={q._id} value={q._id}>
                          Quote #{q.quotationNumber || q._id.slice(-6)} — ₹{q.grandTotal?.toLocaleString('en-IN') || q.totalAmount?.toLocaleString('en-IN') || 0} ({q.status})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="text"
                      placeholder="Enter Quotation ID"
                      value={formData.quotationId}
                      onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
                    />
                  )}
                </div>

                {/* Select Subscription Plan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Subscription Plan
                  </label>
                  {plans.length > 0 ? (
                    <select
                      required
                      value={formData.subscriptionPlanId}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                    >
                      {plans.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} — ₹{p.price?.toLocaleString('en-IN')} / {p.frequency?.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="text"
                      placeholder="Enter Plan ID"
                      value={formData.subscriptionPlanId}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
                    />
                  )}
                </div>

                {/* Optional Product */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Product (Optional)
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">None / Custom Subscription</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    License / User Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Subscription Start Date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-colors"
                >
                  Provision & Activate Subscription →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === tab
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {tab} ({tab === 'ALL' ? subscriptions.length : subscriptions.filter(s => s.status === tab).length})
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">Showing {filteredSubs.length} subscriptions</span>
        </div>

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-800 bg-red-900/20 p-4 text-red-300 text-sm">
            {error}
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="text-4xl mb-2">💳</div>
            <h3 className="text-base font-semibold text-white">No subscriptions found</h3>
            <p className="text-xs text-slate-500 mt-1">Provision a new subscription to begin recurring billing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubs.map((sub) => {
              const planObj = sub.subscriptionPlanId;
              const planName = typeof planObj === 'object' && planObj?.name ? planObj.name : `Plan (${sub.subscriptionPlanId || 'Default'})`;
              const quoteObj = sub.quotationId;
              const quoteRef = typeof quoteObj === 'object' && quoteObj?.quotationNumber ? `Quote #${quoteObj.quotationNumber}` : `Quotation: ${sub.quotationId}`;
              const prodObj = sub.productId;
              const prodName = typeof prodObj === 'object' && prodObj?.name ? prodObj.name : null;

              return (
                <div key={sub._id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-mono font-medium text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/40">
                          {quoteRef}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1.5">{planName}</h3>
                        {prodName && (
                          <p className="text-xs text-slate-400">Linked Product: <span className="text-slate-300">{prodName}</span></p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-tight ${
                        sub.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                          : 'bg-rose-950 text-rose-400 border border-rose-700/50'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Billing Amount</span>
                        <span className="text-sm font-bold text-brand-300">
                          ₹{sub.amount?.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-sans">/ {sub.frequency?.toLowerCase()}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Quantity / Seats</span>
                        <span className="text-sm font-bold text-white">{sub.quantity} Units</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Start Date</span>
                        <span className="text-slate-300">{new Date(sub.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Next Cycle Date</span>
                        <span className="text-slate-300">{new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <span className="text-[11px] text-slate-500">
                      Proration: Enabled
                    </span>
                    {sub.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleCancel(sub._id)}
                        className="rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 px-3.5 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Cancel & Calculate Proration
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
