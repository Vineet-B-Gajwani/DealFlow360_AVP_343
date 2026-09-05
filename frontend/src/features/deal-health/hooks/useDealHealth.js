import { useState, useEffect, useCallback } from 'react';
import dealHealthApi from '../api/dealHealthApi';

export function useDealHealth() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await dealHealthApi.getAlerts();
      setAlerts(res.data?.data?.alerts || []);
    } catch (err) {
      console.error('Failed to load deal health alerts', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const runScan = async () => {
    try {
      await dealHealthApi.runScan();
      await fetchAlerts();
    } catch (err) {
      console.error('Failed to run scan', err);
    }
  };

  return { alerts, isLoading, refetch: fetchAlerts, runScan };
}
