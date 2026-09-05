import React, { useState } from 'react';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';

export default function SubscriptionPlansPage() {
  const { plans, loading, error, addPlan, toggleStatus } = useSubscriptionPlans();
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'MONTHLY',
    price: 0,
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPlan(formData);
      setShowForm(false);
      setFormData({ name: '', frequency: 'MONTHLY', price: 0, isActive: true });
    } catch (err) {
      alert('Failed to create plan');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Subscription Plans</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Manage billing frequency and base configurations.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Plan'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-base font-semibold text-white mb-5">Create New Plan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400">Plan Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Price</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">
                  Save Plan
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan._id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${plan.isActive ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400 font-medium">
                    {plan.frequency}
                  </p>
                  <p className="mt-4 text-2xl font-bold text-brand-400">
                    ${plan.price.toFixed(2)}
                  </p>
                  <div className="mt-4 text-xs text-slate-500 space-y-1">
                    <p>Proration: {plan.prorationConfiguration?.enabled ? 'Enabled' : 'Disabled'}</p>
                    <p>Notice: {plan.cancellationRules?.noticeDays} Days</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => toggleStatus(plan._id, plan.isActive)}
                    className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
            
            {plans.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500">
                No subscription plans found. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
