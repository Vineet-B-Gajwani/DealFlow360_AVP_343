import { useAuthContext } from '../../../context/AuthContext';

/**
 * useAuth
 *
 * Convenience hook for consuming auth state and actions.
 *
 * Returns:
 *   - user          {object|null}  The authenticated user object, or null
 *   - isAuthenticated {boolean}   true if the user is logged in
 *   - isLoading     {boolean}     true while the initial session check is in-flight
 *   - login         {function}    (credentials) => Promise<user>
 *   - register      {function}    (userData) => Promise<user>
 *   - logout        {function}    () => Promise<void>
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
function useAuth() {
  return useAuthContext();
}

export default useAuth;
