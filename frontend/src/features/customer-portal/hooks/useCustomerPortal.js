import { useState, useEffect, useCallback } from 'react';
import portalApi from '../api/portalApi';

/**
 * useCustomerPortal
 *
 * Fetches and manages the authenticated customer's portal data.
 *
 * Returns:
 *   - profile      {object|null}  Combined identity + business profile
 *   - status       {object|null}  Portal status metadata
 *   - isLoading    {boolean}      true while initial data fetch is in-flight
 *   - error        {string|null}  Error message if fetch failed
 *   - refetch      {function}     Manually re-trigger data fetch
 *
 * Usage:
 *   const { profile, status, isLoading, error } = useCustomerPortal();
 */
function useCustomerPortal() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both in parallel for efficiency
      const [profileRes, statusRes] = await Promise.all([
        portalApi.getMyProfile(),
        portalApi.getPortalStatus(),
      ]);

      setProfile(profileRes.data.data);
      setStatus(statusRes.data.data.status);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to load portal data. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  return { profile, status, isLoading, error, refetch: fetchPortalData };
}

export default useCustomerPortal;
