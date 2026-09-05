import { useState, useEffect, useCallback } from 'react';
import invoiceApi from '../api/invoiceApi';

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await invoiceApi.getMyInvoices();
      setInvoices(res.data?.data?.invoices || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load invoices.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, isLoading, error, refetch: fetchInvoices };
}

export function useInvoice(invoiceId) {
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await invoiceApi.getInvoiceById(invoiceId);
      setInvoice(res.data?.data?.invoice || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load invoice.');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return { invoice, isLoading, error, refetch: fetchInvoice };
}
