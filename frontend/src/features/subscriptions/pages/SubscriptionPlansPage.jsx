import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans';

export default function SubscriptionPlansPage() {
  const { plans, loading, error, addPlan, toggleStatus } = useSubscriptionPlans();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'MONTHLY',
    price: 0,
    isActive: true,
    prorationEnabled: true,
    noticeDays: 30,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPlan({
        name: formData.name,
        frequency: formData.frequency,
        price: Number(formData.price),
        isActive: formData.isActive,
        prorationConfiguration: { enabled: formData.prorationEnabled },
        cancellationRules: { noticeDays: Number(formData.noticeDays) }
      });
      setShowForm(false);
      setFormData({
        name: '',
        frequency: 'MONTHLY',
        price: 0,
        isActive: true,
        prorationEnabled: true,
        noticeDays: 30,
      });
      alert('Subscription plan created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create plan');
    }
  };

  const activePlans = plans.filter(p => p.isActive);
  const monthlyPlans = plans.filter(p => p.frequency === 'MONTHLY');
  const yearlyPlans = plans.filter(p => p.frequency === 'YEARLY');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Subscription Plans & Rules
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Configure recurring billing frequencies, base price structures, and proration policies.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
          >
            {showForm ? 'Cancel' : '⚡ + Create New Plan'}
          </button>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Plans</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">{activePlans.length}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Ready for customer provisioning</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Billing Cycles</span>
            <p className="text-2xl font-bold font-mono text-brand-400 mt-2">{monthlyPlans.length}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Recurring monthly frequency</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Yearly / Enterprise Cycles</span>
            <p className="text-2xl font-bold font-mono text-indigo-400 mt-2">{yearlyPlans.length}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Annual billing frequency</span>
          </div>
        </div>

        {/* Form Modal/Card */}
        {showForm && (
          <div className="rounded-2xl border border-brand-500/40 bg-slate-900/90 p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Create New Subscription Plan</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Plan Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Enterprise Tier 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Billing Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Base Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Notice Days on Cancellation</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.noticeDays}
                    onChange={(e) => setFormData({ ...formData, noticeDays: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="prorationEnabled"
                    checked={formData.prorationEnabled}
                    onChange={(e) => setFormData({ ...formData, prorationEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-slate-800"
                  />
                  <label htmlFor="prorationEnabled" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Enable Auto-Proration Calculation
                  </label>
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
                  Save Subscription Plan →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading / Error States */}
        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-900/20 p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Plans Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan._id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                      plan.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-brand-950/60 border border-brand-800/50 text-brand-300 mb-4 uppercase tracking-wider font-mono">
                    {plan.frequency} CYCLE
                  </span>

                  <div className="text-3xl font-bold text-white font-mono mb-4">
                    ₹{plan.price?.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-sans font-normal">/ {plan.frequency?.toLowerCase()}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <p className="flex justify-between">
                      <span>Auto Proration:</span>
                      <span className="font-semibold text-slate-200">{plan.prorationConfiguration?.enabled !== false ? '✅ Enabled' : '❌ Disabled'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Notice Required:</span>
                      <span className="font-semibold text-slate-200">{plan.cancellationRules?.noticeDays || 30} Days</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <button 
                    onClick={() => toggleStatus(plan._id, plan.isActive)}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    {plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                  </button>

                  <button
                    onClick={() => navigate('/billing')}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                  >
                    Provision Subscription →
                  </button>
                </div>
              </div>
            ))}
            
            {plans.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                <div className="text-4xl mb-2">📄</div>
                <h3 className="text-base font-semibold text-white">No subscription plans found</h3>
                <p className="text-xs text-slate-500 mt-1">Create your first recurring billing plan above.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
