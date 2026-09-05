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
      setNegotiations(res.data?.data?.negotiations || []);
    } catch (err) {
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
      const message = err.response?.data?.message || 'Failed to submit.';
      alert(message); // simple alert for now
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { negotiations, isLoading, error, submitAction, isSubmitting };
}

export default useNegotiation;
