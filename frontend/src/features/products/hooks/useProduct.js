import { useState, useEffect, useCallback } from 'react';
import productsApi from '../api/products.api';

/**
 * useProduct
 *
 * Fetches a single product by ID.
 *
 * Returns:
 *   - product    {object|null}  The product document
 *   - isLoading  {boolean}
 *   - error      {string|null}
 *   - refetch    {function}
 */
function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await productsApi.getById(id);
      setProduct(data.data.product);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load product.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { product, isLoading, error, refetch: fetch };
}

export default useProduct;
