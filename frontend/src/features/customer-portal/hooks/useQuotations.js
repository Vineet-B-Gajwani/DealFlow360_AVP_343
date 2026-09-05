import { useState, useEffect, useCallback } from 'react';
import { quotationApi } from '../api/quotationApi';

/**
 * useQuotations
 *
 * Fetches all quotations for the authenticated customer.
 *
 * Returns:
 *   - quotations   {Array}         List of quotation summaries
 *   - isLoading    {boolean}
 *   - error        {string|null}
 *   - integrationAvailable {boolean} false = backend endpoint not yet live
 *   - refetch      {function}
 *
 * When Member 1's quotation endpoint is not yet available, the backend
 * returns an empty array and integrationAvailable remains true once live.
 */
function useQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [integrationAvailable, setIntegrationAvailable] = useState(true);

  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await quotationApi.getMyQuotations();
      const { quotations: data = [], integrationAvailable: avail = true } =
        res.data?.data ?? {};
      setQuotations(data);
      setIntegrationAvailable(avail);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load quotations. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  return { quotations, isLoading, error, integrationAvailable, refetch: fetchQuotations };
}

export default useQuotations;
