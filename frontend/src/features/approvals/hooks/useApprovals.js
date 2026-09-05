import { useState, useEffect, useCallback } from 'react';
import { fetchApprovals } from '../api/approvalApi';

/**
 * Hook for the approval list page.
 * Supports optional server-side filtering by status or quotationId.
 *
 * @param {{ status?: string, quotationId?: string }} [initialFilters]
 */
export function useApprovals(initialFilters = {}) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApprovals(filters);
      setApprovals(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  return { approvals, loading, error, reload: load, filters, setFilters };
}
