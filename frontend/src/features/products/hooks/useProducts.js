import { useState, useEffect, useCallback, useRef } from 'react';
import productsApi from '../api/products.api';

/**
 * useProducts
 *
 * Fetches and manages the paginated product list with search/filter support.
 *
 * Returns:
 *   - products      {Product[]}    Current page of products
 *   - total         {number}       Total count matching the current filter
 *   - page          {number}       Current page number
 *   - totalPages    {number}       Total number of pages
 *   - isLoading     {boolean}      True while fetch is in-flight
 *   - error         {string|null}  Error message if fetch failed
 *   - filters       {object}       Current filter state
 *   - setFilters    {function}     Update filters (resets to page 1)
 *   - setPage       {function}     Navigate to a page
 *   - refetch       {function}     Re-trigger the fetch manually
 *   - categories    {string[]}     All known categories (for filter dropdown)
 */
function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFiltersState] = useState({
    search: '',
    category: '',
    productType: '',
    isActive: '',
    limit: 20,
    ...initialFilters,
  });

  // Use a ref to track whether the component is mounted
  const cancelRef = useRef(false);

  const fetchProducts = useCallback(async (currentFilters, currentPage) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = { ...currentFilters, page: currentPage };
      // Remove empty string params to keep the query clean
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null || params[k] === undefined) {
          delete params[k];
        }
      });

      const { data } = await productsApi.list(params);
      if (!cancelRef.current) {
        setProducts(data.data.products);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch (err) {
      if (!cancelRef.current) {
        setError(
          err.response?.data?.message || 'Failed to load products. Please try again.'
        );
      }
    } finally {
      if (!cancelRef.current) setIsLoading(false);
    }
  }, []);

  // Fetch categories once on mount
  useEffect(() => {
    cancelRef.current = false;
    productsApi.listCategories().then(({ data }) => {
      if (!cancelRef.current) setCategories(data.data.categories);
    }).catch(() => {});
    return () => { cancelRef.current = true; };
  }, []);

  // Re-fetch when filters or page change
  useEffect(() => {
    fetchProducts(filters, page);
  }, [filters, page, fetchProducts]);

  const setFilters = useCallback((newFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPageState(1); // reset to first page on filter change
  }, []);

  const setPage = useCallback((p) => setPageState(p), []);

  const refetch = useCallback(() => {
    fetchProducts(filters, page);
  }, [fetchProducts, filters, page]);

  return {
    products,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    refetch,
    categories,
  };
}

export default useProducts;
