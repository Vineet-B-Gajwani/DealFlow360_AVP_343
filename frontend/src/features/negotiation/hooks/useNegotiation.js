import { useState, useEffect, useCallback } from 'react';
import negotiationApi from '../api/negotiationApi';

/**
 * useNegotiation
 * 
 * Fetches negotiation history for a quotation and provides a method to submit new actions.
 * 
 * @param {string} quotationId 
 */
function useNegotiation(quotationId) {
  const [negotiations, setNegotiations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNegotiations = useCallback(async () => {
    if (!quotationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await negotiationApi.getNegotiations(quotationId);
      const list = res.data?.data?.negotiations || res.data?.data?.history || res.data?.data || res.data?.history || [];
      setNegotiations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error in fetchNegotiations:', err);
      setError('Unable to load negotiation history.');
    } finally {
      setIsLoading(false);
    }
  }, [quotationId]);

  useEffect(() => {
    fetchNegotiations();
  }, [fetchNegotiations]);

  const submitAction = async (payload) => {
    setIsSubmitting(true);
    try {
      await negotiationApi.submitNegotiation({ ...payload, quotationId });
      await fetchNegotiations(); // refresh list
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit negotiation.';
      alert(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { negotiations, isLoading, error, submitAction, isSubmitting, refetch: fetchNegotiations };
}

export default useNegotiation;
