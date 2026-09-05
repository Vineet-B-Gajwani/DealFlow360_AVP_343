import { useState, useCallback } from 'react';
import { getRecommendation, fetchBackorders, createBackorder, consolidateBackorders } from '../api/fulfillmentApi';

export function useFulfillment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recommend = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecommendation(payload);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBackorders = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchBackorders(params);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch backorders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addBackorder = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createBackorder(payload);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create backorder');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const consolidate = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await consolidateBackorders(productId);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to consolidate backorders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, recommend, loadBackorders, addBackorder, consolidate };
}
