import { useState, useCallback, useEffect } from 'react';
import { fetchBillingSubscriptions, createBillingSubscription, cancelBillingSubscription } from '../api/billingApi';

export function useBilling() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchBillingSubscriptions(params);
      setSubscriptions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch billing subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSubscription = async (payload) => {
    try {
      await createBillingSubscription(payload);
      load();
    } catch (err) {
      throw err;
    }
  };

  const cancelSubscription = async (id, payload) => {
    try {
      const res = await cancelBillingSubscription(id, payload);
      load();
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return { subscriptions, loading, error, reload: load, addSubscription, cancelSubscription };
}
