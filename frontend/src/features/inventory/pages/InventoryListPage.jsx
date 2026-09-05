import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';

export default function InventoryListPage() {
  const { inventory, loading, error, reload, updateStock } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    availableQuantity: 0,
    reservedQuantity: 0,
    backorderedQuantity: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStock(formData);
      setShowForm(false);
      setFormData({ productId: '', warehouseId: '', availableQuantity: 0, reservedQuantity: 0, backorderedQuantity: 0 });
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Inventory Management</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Manage product stock across warehouses.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
          >
            {showForm ? 'Cancel' : 'Update Stock'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-base font-semibold text-white mb-5">Update Stock Levels</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400">Product ID</label>
                  <input
                    required
                    type="text"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Warehouse ID</label>
                  <input
                    required
                    type="text"
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Available Qty</label>
                  <input
                    type="number"
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({ ...formData, availableQuantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Reserved Qty</label>
                  <input
                    type="number"
                    value={formData.reservedQuantity}
                    onChange={(e) => setFormData({ ...formData, reservedQuantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">
                  Save Changes
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
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product ID</th>
                  <th className="px-6 py-4 font-semibold">Warehouse ID</th>
                  <th className="px-6 py-4 font-semibold">Available</th>
                  <th className="px-6 py-4 font-semibold">Reserved</th>
                  <th className="px-6 py-4 font-semibold">Backordered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/20">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{item.productId}</td>
                      <td className="px-6 py-4">{item.warehouseId}</td>
                      <td className="px-6 py-4">{item.availableQuantity}</td>
                      <td className="px-6 py-4">{item.reservedQuantity}</td>
                      <td className="px-6 py-4 text-red-400">{item.backorderedQuantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
