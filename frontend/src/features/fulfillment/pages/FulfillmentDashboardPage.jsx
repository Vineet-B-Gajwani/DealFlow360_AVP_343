import React, { useState, useEffect } from 'react';
import { useFulfillment } from '../hooks/useFulfillment';

export default function FulfillmentDashboardPage() {
  const { loading, error, recommend, loadBackorders, consolidate } = useFulfillment();
  const [backorders, setBackorders] = useState([]);
  
  // Recommend State
  const [recInput, setRecInput] = useState({
    productId: '',
    requestedQuantity: 0,
    stockAvailability: '[{"warehouseId":"W1","availableQuantity":10,"shippingCostWeight":5}]'
  });
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    fetchBackorders();
  }, []);

  const fetchBackorders = async () => {
    try {
      const data = await loadBackorders();
      setBackorders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    try {
      let stockArray = [];
      try {
        stockArray = JSON.parse(recInput.stockAvailability);
      } catch(err) {
        alert("Invalid JSON for stock availability");
        return;
      }
      
      const res = await recommend({
        productId: recInput.productId,
        requestedQuantity: Number(recInput.requestedQuantity),
        stockAvailability: stockArray
      });
      setRecommendation(res);
    } catch (err) {
      alert("Failed to get recommendation");
    }
  };

  const handleConsolidate = async (productId) => {
    try {
      await consolidate(productId);
      fetchBackorders();
      alert("Consolidation complete");
    } catch(err) {
      alert("Failed to consolidate");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Fulfillment & Backorders</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Manage warehouse split allocations and backorder consolidations.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommendation Engine */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-5">Allocation Engine</h2>
            <form onSubmit={handleRecommend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400">Product ID</label>
                <input
                  required
                  type="text"
                  value={recInput.productId}
                  onChange={(e) => setRecInput({ ...recInput, productId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Requested Quantity</label>
                <input
                  required
                  type="number"
                  value={recInput.requestedQuantity}
                  onChange={(e) => setRecInput({ ...recInput, requestedQuantity: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Stock Availability (JSON)</label>
                <textarea
                  required
                  rows="4"
                  value={recInput.stockAvailability}
                  onChange={(e) => setRecInput({ ...recInput, stockAvailability: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none font-mono text-sm"
                />
              </div>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 w-full">
                Get Recommendation
              </button>
            </form>

            {recommendation && (
              <div className="mt-6 p-4 rounded-lg border border-brand-800 bg-brand-900/20">
                <h3 className="text-brand-400 font-semibold mb-2">Recommendation Result</h3>
                <p className="text-sm text-slate-300">Shipments: {recommendation.shipmentCount}</p>
                <p className="text-sm text-slate-300">Estimated Cost Weight: {recommendation.estimatedCostWeight}</p>
                <p className="text-sm text-slate-300">Remaining / Backordered: {recommendation.remainingQuantity}</p>
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Allocations</h4>
                  <ul className="mt-2 space-y-1">
                    {recommendation.allocations.map((a, i) => (
                      <li key={i} className="text-sm bg-slate-800 px-2 py-1 rounded">
                        <span className="text-brand-300">{a.warehouseId}</span>: {a.quantity} units
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Backorders */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-white">Backorders</h2>
              <button onClick={fetchBackorders} className="text-sm text-brand-400 hover:text-brand-300">Refresh</button>
            </div>
            
            {backorders.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No backorders found.</p>
            ) : (
              <div className="space-y-4">
                {backorders.map(bo => (
                  <div key={bo._id} className="border border-slate-700 bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-white">Product: {bo.productId}</p>
                        <p className="text-xs text-slate-400 mt-1">Requested: {bo.requestedQuantity} | Fulfilled: {bo.fulfilledQuantity} | Remaining: {bo.remainingQuantity}</p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold ${
                          bo.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400' : 
                          bo.status === 'PARTIAL' ? 'bg-orange-900/50 text-orange-400' :
                          'bg-emerald-900/50 text-emerald-400'
                        }`}>
                          {bo.status}
                        </span>
                      </div>
                      {(bo.status === 'PENDING' || bo.status === 'PARTIAL') && (
                        <button 
                          onClick={() => handleConsolidate(bo.productId)}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
                        >
                          Consolidate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
