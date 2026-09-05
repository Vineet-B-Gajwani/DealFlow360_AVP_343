import React, { useEffect, useState } from 'react';
import useAuth from '../../auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function QuotationListPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:5000/api/quotations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setQuotations(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch quotations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  if (loading) return <div className="text-white p-4">Loading quotations...</div>;

  // Group by status
  const columns = {
    DRAFT: quotations.filter(q => q.status === 'DRAFT'),
    PENDING_APPROVAL: quotations.filter(q => q.status === 'PENDING_APPROVAL'),
    APPROVED: quotations.filter(q => q.status === 'APPROVED'),
    NEGOTIATING: quotations.filter(q => q.status === 'NEGOTIATING' || q.status === 'SENT'),
    CONFIRMED: quotations.filter(q => q.status === 'CONFIRMED'),
  };

  return (
    <div className="max-w-7xl mx-auto h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Quotation Pipeline</h1>
        {(user?.role === 'SALES_REP' || user?.role === 'ADMIN') && (
          <button 
            className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded font-medium shadow-md shadow-brand-500/20"
            onClick={() => navigate('/quotations/new')}
          >
            + New Quotation
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {Object.entries(columns).map(([status, quotes]) => (
          <div key={status} className="bg-slate-900/50 border border-slate-800 rounded-lg min-w-[300px] w-[300px] flex flex-col">
            <div className="p-3 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <h3 className="font-semibold text-slate-200 text-sm">{status.replace('_', ' ')}</h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{quotes.length}</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {quotes.map(quote => (
                <div 
                  key={quote._id} 
                  className="bg-slate-800 border border-slate-700 p-4 rounded shadow-sm hover:border-brand-500 cursor-pointer transition-colors"
                  onClick={() => navigate(`/quotations/${quote._id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-brand-400">{quote.quotationNumber}</span>
                    <span className="text-xs text-slate-400">{new Date(quote.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-medium text-white text-sm mb-2">${quote.grandTotal?.toFixed(2) || '0.00'}</h4>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{quote.lines?.length || 0} items</span>
                  </div>
                </div>
              ))}
              {quotes.length === 0 && (
                <div className="text-center text-slate-500 text-xs py-4 border border-dashed border-slate-700 rounded">
                  No deals
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuotationListPage;
