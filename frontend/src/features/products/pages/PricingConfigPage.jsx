import React, { useState, useEffect } from 'react';
import useAuth from '../../auth/hooks/useAuth';
import apiClient from '../../auth/api/auth.api';

function PricingConfigPage() {
  const [discountRules, setDiscountRules] = useState([]);
  const [tier, setTier] = useState('Standard');
  const [loading, setLoading] = useState(true);

  // Form state
  const [category, setCategory] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [approvalLevel, setApprovalLevel] = useState('SALES_MANAGER');

  const { user } = useAuth();

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/pricing/discount-rules?tier=${tier}`);
      if (res.data?.success) {
        setDiscountRules(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [tier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/pricing/discount-rules', {
        tier,
        category,
        maxDiscountPercent: parseFloat(maxDiscount),
        requiredApprovalLevel: approvalLevel
      });
      if (res.data?.success) {
        setCategory('');
        setMaxDiscount('');
        fetchRules();
      } else {
        alert(res.data?.message || 'Error saving rule');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save rule');
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'SALES_MANAGER') {
    return (
      <div className="p-8 text-slate-800 dark:text-white font-medium text-center">
        Unauthorized access
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing & Discount Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Configure discount thresholds and approval rules by tier</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          {['Standard', 'Silver', 'Gold', 'Platinum'].map(t => (
            <button 
              key={t}
              onClick={() => setTier(t)} 
              className={`px-4 py-2 font-medium text-sm transition-colors ${tier === t ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-medium text-slate-900 dark:text-white">Discount Limits for {tier}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Define maximum allowable discounts per category before requiring approval.</p>

        {loading ? (
          <p className="text-slate-400 text-sm animate-pulse">Loading discount rules...</p>
        ) : (
          <div className="space-y-2">
            {discountRules.map(rule => (
              <div key={rule._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-900 dark:text-white text-sm">{rule.category}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Max: <strong className="text-slate-900 dark:text-white font-semibold">{rule.maxDiscountPercent}%</strong> • Requires: <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">{rule.requiredApprovalLevel}</span></span>
              </div>
            ))}
            {discountRules.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm py-2">No rules defined for this tier.</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap md:flex-nowrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Category (e.g. Hardware, Service)</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={category} onChange={e => setCategory(e.target.value)}
            />
          </div>
          <div className="w-28">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Max %</label>
            <input 
              type="number" min="0" max="100" required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">If Exceeded Requires</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={approvalLevel} onChange={e => setApprovalLevel(e.target.value)}
            >
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="FINANCE">Finance</option>
            </select>
          </div>
          <button type="submit" className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
            Save Rule
          </button>
        </form>
      </div>
    </div>
  );
}

export default PricingConfigPage;
