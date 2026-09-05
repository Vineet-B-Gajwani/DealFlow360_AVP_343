import React, { useState, useEffect } from 'react';
import useAuth from '../../auth/hooks/useAuth';

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
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/pricing/discount-rules?tier=${tier}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDiscountRules(data.data);
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
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/pricing/discount-rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier,
          category,
          maxDiscountPercent: parseFloat(maxDiscount),
          requiredApprovalLevel: approvalLevel
        })
      });
      const data = await res.json();
      if (data.success) {
        setCategory('');
        setMaxDiscount('');
        fetchRules();
      } else {
        alert(data.message || 'Error saving rule');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'SALES_MANAGER') {
    return <div className="p-8 text-white">Unauthorized</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Pricing & Discount Configuration</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex gap-4 border-b border-slate-800 pb-4">
          <button onClick={() => setTier('Standard')} className={`px-4 py-2 font-medium ${tier === 'Standard' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400'}`}>Standard</button>
          <button onClick={() => setTier('Silver')} className={`px-4 py-2 font-medium ${tier === 'Silver' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400'}`}>Silver</button>
          <button onClick={() => setTier('Gold')} className={`px-4 py-2 font-medium ${tier === 'Gold' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400'}`}>Gold</button>
          <button onClick={() => setTier('Platinum')} className={`px-4 py-2 font-medium ${tier === 'Platinum' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400'}`}>Platinum</button>
        </div>

        <h2 className="text-lg font-medium text-white">Discount Limits for {tier}</h2>
        <p className="text-sm text-slate-400">Define maximum allowable discounts per category before requiring approval.</p>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-2">
            {discountRules.map(rule => (
              <div key={rule._id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded border border-slate-700">
                <span className="font-medium text-white">{rule.category}</span>
                <span className="text-sm text-slate-400">Max: <strong className="text-white">{rule.maxDiscountPercent}%</strong> • Requires: {rule.requiredApprovalLevel}</span>
              </div>
            ))}
            {discountRules.length === 0 && <p className="text-slate-500 text-sm">No rules defined for this tier.</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-800 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Category (e.g. Hardware, Service)</label>
            <input 
              type="text" required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
              value={category} onChange={e => setCategory(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="block text-xs text-slate-400 mb-1">Max %</label>
            <input 
              type="number" min="0" max="100" required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
              value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)}
            />
          </div>
          <div className="w-48">
            <label className="block text-xs text-slate-400 mb-1">If Exceeded Requires</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2"
              value={approvalLevel} onChange={e => setApprovalLevel(e.target.value)}
            >
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="FINANCE">Finance</option>
            </select>
          </div>
          <button type="submit" className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded font-medium">
            Save Rule
          </button>
        </form>
      </div>
    </div>
  );
}

export default PricingConfigPage;
