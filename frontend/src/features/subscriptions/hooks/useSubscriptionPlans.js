import { useState, useCallback, useEffect } from 'react';
import { fetchPlans, createPlan, updatePlan } from '../api/subscriptionPlanApi';

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPlans(params);
      setPlans(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPlan = async (payload) => {
    try {
      await createPlan(payload);
      load();
    } catch (err) {
      throw err;
    }
  };

  const editPlan = async (id, payload) => {
    try {
      await updatePlan(id, payload);
      load();
    } catch (err) {
      throw err;
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updatePlan(id, { isActive: !currentStatus });
      load();
    } catch (err) {
      throw err;
    }
  };

  return { plans, loading, error, reload: load, addPlan, editPlan, toggleStatus };
}
