import { useState, useEffect, useCallback } from 'react';
import reportingApi from '../api/reportingApi';

export function useReporting() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await reportingApi.getDashboard();
      setReport(res.data?.data?.report || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load reporting data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { report, isLoading, error, refetch: fetchReport };
}
