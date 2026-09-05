import React, { useState } from 'react';
import { useBilling } from '../hooks/useBilling';

export default function BillingDashboardPage() {
  const { subscriptions, loading, error, addSubscription, cancelSubscription } = useBilling();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    quotationId: '',
    subscriptionPlanId: '',
    productId: '',
    quantity: 1,
    startDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addSubscription(formData);
      setShowForm(false);
      setFormData({ quotationId: '', subscriptionPlanId: '', productId: '', quantity: 1, startDate: '' });
    } catch (err) {
      alert('Failed to create subscription');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      const res = await cancelSubscription(id, { cancelDate: new Date().toISOString() });
      if (res?.proration?.refundAmount > 0) {
        alert(`Subscription cancelled. A prorated refund of $${res.proration.refundAmount} has been calculated.`);
      } else {
        alert('Subscription cancelled successfully.');
      }
    } catch (err) {
      alert('Failed to cancel subscription');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Proration</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Manage active subscriptions and recurring billing schedules.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Subscription'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-base font-semibold text-white mb-5">Provision New Subscription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400">Quotation ID</label>
                  <input
                    required
                    type="text"
                    value={formData.quotationId}
                    onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Subscription Plan ID</label>
                  <input
                    required
                    type="text"
                    value={formData.subscriptionPlanId}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlanId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Product ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Quantity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Start Date</label>
                  <input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">
                  Provision Subscription
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No active subscriptions found.</div>
            ) : (
              subscriptions.map(sub => (
                <div key={sub._id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">Quotation: {sub.quotationId}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${sub.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <p>Plan: <span className="text-slate-300 font-mono">{sub.subscriptionPlanId}</span></p>
                      <p>Amount: <span className="text-brand-300 font-bold">${sub.amount.toFixed(2)}</span> / {sub.frequency.toLowerCase()}</p>
                      <p>Next Billing: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    {sub.status === 'ACTIVE' && (
                      <button 
                        onClick={() => handleCancel(sub._id)}
                        className="rounded bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-sm font-semibold transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
