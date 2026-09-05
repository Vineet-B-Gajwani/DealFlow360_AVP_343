import React, { useState, useEffect } from 'react';
import { useFulfillment } from '../hooks/useFulfillment';
import apiClient from '../../auth/api/auth.api';

const DEFAULT_WAREHOUSES = [
  'WH-EAST (East Coast DC)',
  'WH-WEST (West Coast DC)',
  'WH-CENTRAL (Central DC)',
  'WH-NORTH (North DC)',
];

export default function FulfillmentDashboardPage() {
  const { loading, error, recommend, loadBackorders, consolidate } = useFulfillment();
  const [backorders, setBackorders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Recommend Input State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductId, setCustomProductId] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState(10);
  const [viewJsonMode, setViewJsonMode] = useState(false);

  // Friendly Visual Stock Availability List
  const [stockLines, setStockLines] = useState([
    { warehouseId: 'WH-EAST (East Coast DC)', availableQuantity: 20, shippingCostWeight: 1.0 },
    { warehouseId: 'WH-WEST (West Coast DC)', availableQuantity: 15, shippingCostWeight: 1.5 },
    { warehouseId: 'WH-CENTRAL (Central DC)', availableQuantity: 25, shippingCostWeight: 1.2 },
  ]);

  const [rawJsonInput, setRawJsonInput] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [boData, prodRes] = await Promise.allSettled([
        loadBackorders(),
        apiClient.get('/products')
      ]);

      if (boData.status === 'fulfilled') {
        setBackorders(boData.value || []);
      }

      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        const raw = prodRes.value.data.data;
        const list = Array.isArray(raw) ? raw : (raw?.products || []);
        setProducts(list);
        if (list.length > 0) {
          setSelectedProductId(list[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStockLineChange = (index, field, value) => {
    const updated = [...stockLines];
    updated[index][field] = value;
    setStockLines(updated);
  };

  const handleAddStockLine = () => {
    setStockLines([
      ...stockLines,
      { warehouseId: `WH-LOCATION-${stockLines.length + 1}`, availableQuantity: 10, shippingCostWeight: 1.0 }
    ]);
  };

  const handleRemoveStockLine = (index) => {
    if (stockLines.length <= 1) {
      alert("At least one warehouse stock line is required.");
      return;
    }
    setStockLines(stockLines.filter((_, i) => i !== index));
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    const effectiveProductId = selectedProductId || customProductId || 'PRODUCT-01';

    let formattedStock = [];

    if (viewJsonMode) {
      try {
        formattedStock = JSON.parse(rawJsonInput);
      } catch (err) {
        alert("Invalid JSON format in raw stock input.");
        return;
      }
    } else {
      formattedStock = stockLines.map(line => ({
        warehouseId: line.warehouseId || 'Warehouse',
        availableQuantity: Math.max(0, parseInt(line.availableQuantity || 0, 10)),
        shippingCostWeight: Math.max(0, parseFloat(line.shippingCostWeight || 1))
      }));
    }

    try {
      const res = await recommend({
        productId: effectiveProductId,
        requestedQuantity: Math.max(1, parseInt(requestedQuantity || 1, 10)),
        stockAvailability: formattedStock
      });
      setRecommendation(res);
    } catch (err) {
      console.error(err);
      alert("Failed to calculate split allocation recommendation.");
    }
  };

  const handleConsolidate = async (productId) => {
    try {
      await consolidate(productId);
      const data = await loadBackorders();
      setBackorders(data || []);
      alert("Backorder consolidation completed!");
    } catch (err) {
      console.error(err);
      alert("Failed to consolidate backorder.");
    }
  };

  // Sync visual lines to JSON string when switching to JSON mode
  const toggleViewMode = () => {
    if (!viewJsonMode) {
      const jsonStr = JSON.stringify(
        stockLines.map(l => ({
          warehouseId: l.warehouseId,
          availableQuantity: Number(l.availableQuantity),
          shippingCostWeight: Number(l.shippingCostWeight)
        })),
        null,
        2
      );
      setRawJsonInput(jsonStr);
    } else {
      try {
        const parsed = JSON.parse(rawJsonInput);
        if (Array.isArray(parsed)) {
          setStockLines(parsed);
        }
      } catch (e) {
        // ignore parse error on toggle back
      }
    }
    setViewJsonMode(!viewJsonMode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Fulfillment & Backorders
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Smart multi-warehouse stock allocation engine and automated backorder consolidation.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Allocation Engine */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⚡ Allocation Engine</span>
              </h2>
              <button
                type="button"
                onClick={toggleViewMode}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                {viewJsonMode ? '📋 Switch to Visual Form' : '⚙️ Advanced JSON Mode'}
              </button>
            </div>

            <form onSubmit={handleRecommend} className="space-y-5">
              
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Product
                </label>
                {products.length > 0 ? (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.category}) — Base Price: ₹{p.basePrice?.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter Product ID (e.g. 6a9c3e1...)"
                    value={customProductId}
                    onChange={(e) => setCustomProductId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Requested Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Requested Order Quantity
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none font-mono font-medium"
                />
              </div>

              {/* Stock Availability Interface (Visual Form vs Raw JSON) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Warehouse Stock Availability
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {viewJsonMode ? 'Raw JSON format' : `${stockLines.length} Warehouses Configured`}
                  </span>
                </div>

                {!viewJsonMode ? (
                  <div className="space-y-3">
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold uppercase">
                            <th className="p-2.5">Warehouse Name / ID</th>
                            <th className="p-2.5 w-24 text-center">Available Stock</th>
                            <th className="p-2.5 w-24 text-center">Cost Weight</th>
                            <th className="p-2.5 w-12 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                          {stockLines.map((line, index) => (
                            <tr key={index} className="hover:bg-slate-800/30">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={line.warehouseId}
                                  onChange={(e) => handleStockLineChange(index, 'warehouseId', e.target.value)}
                                  placeholder="Warehouse Name"
                                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={line.availableQuantity}
                                  onChange={(e) => handleStockLineChange(index, 'availableQuantity', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-brand-500 font-mono font-bold"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={line.shippingCostWeight}
                                  onChange={(e) => handleStockLineChange(index, 'shippingCostWeight', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-brand-500 font-mono font-medium"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStockLine(index)}
                                  className="text-rose-400 hover:text-rose-300 text-sm font-bold p-1"
                                  title="Remove Warehouse"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStockLine}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 border-dashed rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      + Add Warehouse Stock Line
                    </button>
                  </div>
                ) : (
                  <div>
                    <textarea
                      required
                      rows="6"
                      value={rawJsonInput}
                      onChange={(e) => setRawJsonInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-white focus:border-brand-500 focus:outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-brand-600/30 transition-colors"
              >
                🔍 Get Allocation Recommendation
              </button>
            </form>

            {/* Recommendation Result Display */}
            {recommendation && (
              <div className="p-5 rounded-xl border border-brand-500/40 bg-brand-950/30 space-y-3 animate-fade-in shadow-lg">
                <div className="flex justify-between items-center border-b border-brand-800/60 pb-2">
                  <h3 className="text-brand-300 font-bold text-sm flex items-center gap-1.5">
                    <span>📦 Optimal Allocation Plan</span>
                  </h3>
                  <span className="text-xs bg-brand-900/60 border border-brand-700 text-brand-200 px-2.5 py-0.5 rounded-full font-mono">
                    {recommendation.shipmentCount} {recommendation.shipmentCount === 1 ? 'Shipment' : 'Split Shipments'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Shipments</span>
                    <span className="font-bold text-white text-sm font-mono">{recommendation.shipmentCount}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Cost Weight</span>
                    <span className="font-bold text-brand-300 text-sm font-mono">{recommendation.estimatedCostWeight}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Backordered</span>
                    <span className={`font-bold text-sm font-mono ${recommendation.remainingQuantity > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {recommendation.remainingQuantity}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                    Warehouse Fulfillment Breakdown
                  </h4>
                  <div className="space-y-1.5">
                    {recommendation.allocations.map((a, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg text-xs">
                        <span className="font-medium text-brand-300 font-mono">🏭 {a.warehouseId}</span>
                        <span className="font-bold text-white font-mono bg-brand-900/40 px-2 py-0.5 rounded border border-brand-700/50">
                          {a.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Backorders Management */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📋 Backorders Queue</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                  {backorders.length} Total
                </span>
              </h2>
              <button
                onClick={fetchInitialData}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
            
            {backorders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
                <div className="text-3xl mb-2">📦</div>
                <p className="text-slate-400 text-sm">No pending backorders in queue.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {backorders.map(bo => {
                  const prodObj = products.find(p => p._id === bo.productId);
                  const prodLabel = prodObj ? `${prodObj.name} (${prodObj.category})` : `Product ID: ${bo.productId}`;

                  return (
                    <div key={bo._id} className="border border-slate-800 bg-slate-900/90 p-4 rounded-xl space-y-3 shadow-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-white">{prodLabel}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                            <span>Req: {bo.requestedQuantity}</span>
                            <span>Done: {bo.fulfilledQuantity}</span>
                            <span className="text-amber-400 font-semibold">Rem: {bo.remainingQuantity}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-tight font-mono ${
                          bo.status === 'PENDING' ? 'bg-amber-900/50 text-amber-300 border border-amber-700/60' : 
                          bo.status === 'PARTIAL' ? 'bg-orange-900/50 text-orange-300 border border-orange-700/60' :
                          'bg-emerald-900/50 text-emerald-300 border border-emerald-700/60'
                        }`}>
                          {bo.status}
                        </span>
                      </div>

                      {(bo.status === 'PENDING' || bo.status === 'PARTIAL') && (
                        <button 
                          onClick={() => handleConsolidate(bo.productId)}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-brand-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          ⚡ Auto-Consolidate Backorder
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
