import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hooks/useAuth';

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
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/quotations/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
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
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5000/api/quotations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/quotations/${data.data._id}`);
      } else {
        setError(data.message || 'Failed to create quotation');
      }
    } catch (err) {
      setError('Network error creating quotation');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Quotation</h1>
        <p className="text-slate-400 mt-1">Create a draft quotation for a customer</p>
      </div>

      <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Customer *</label>
          <select
            className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
          <textarea
            className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2.5 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes for this quotation..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="px-4 py-2.5 border border-slate-700 text-slate-300 rounded hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 bg-brand-500 text-white font-medium rounded hover:bg-brand-400 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-colors"
          >
            {creating ? 'Creating...' : 'Create Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuotationCreatePage;
