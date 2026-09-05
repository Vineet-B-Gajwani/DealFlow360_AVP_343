import { useState, useEffect, useCallback } from 'react';
import { quotationApi } from '../api/quotationApi';

/**
 * useQuotation
 *
 * Fetches a single quotation detail by ID for the authenticated customer.
 * The backend enforces ownership — a 403 is returned if the customer
 * does not own the requested quotation.
 *
 * @param {string} quotationId  — from URL params (/:id)
 *
 * Returns:
 *   - quotation   {object|null}
 *   - isLoading   {boolean}
 *   - error       {string|null}
 *   - refetch     {function}
 */
function useQuotation(quotationId) {
  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotation = useCallback(async () => {
    if (!quotationId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await quotationApi.getQuotationById(quotationId);
      setQuotation(res.data?.data?.quotation ?? null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError('Quotation not found.');
      } else if (status === 403) {
        setError('You do not have access to this quotation.');
      } else {
        setError(
          err.response?.data?.message ||
            'Unable to load quotation. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [quotationId]);

  useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  return { quotation, isLoading, error, refetch: fetchQuotation };
}

export default useQuotation;
