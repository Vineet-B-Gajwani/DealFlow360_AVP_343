import { useState, useEffect, useCallback } from 'react';
import { fetchInventory, upsertStock } from '../api/inventoryApi';

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchInventory(filters);
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStock = async (payload) => {
    const res = await upsertStock(payload);
    load();
    return res;
  };

  return { inventory, loading, error, reload: load, filters, setFilters, updateStock };
}
