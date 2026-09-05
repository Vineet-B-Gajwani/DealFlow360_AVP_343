import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';
import apiClient from '../../auth/api/auth.api';

function QuotationCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/quotations/customers');
      if (res.data?.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
      setError(err.response?.data?.message || 'Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    setCreating(true);
    setError('');

    try {
      const res = await apiClient.post('/quotations', {
        customerId: selectedCustomerId,
        notes,
      });
      if (res.data?.success) {
        // Redirect back to the Quotations section as requested
        navigate('/quotations');
      } else {
        setError(res.data?.message || 'Failed to create quotation');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating quotation');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-slate-600 dark:text-slate-300 font-medium animate-pulse text-base">
          Loading customer data...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Quotation</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create a draft quotation for a customer</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Customer *</label>
          <select
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
          >
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>
                {c.companyName || c.userId?.name || c._id} — {c.tier}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes (optional)</label>
          <textarea
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 min-h-[90px] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes for this quotation..."
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-medium rounded-lg disabled:opacity-50 shadow-md shadow-brand-500/20 transition-colors text-sm"
          >
            {creating ? 'Creating...' : 'Create Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuotationCreatePage;
