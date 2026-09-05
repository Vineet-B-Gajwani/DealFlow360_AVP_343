import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../features/auth/api/auth.api';

// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Manages:
 *  - user: the authenticated user object (or null)
 *  - accessToken: stored in localStorage for persistence across page refreshes
 *  - isLoading: true while the initial session check is in-flight
 *  - isAuthenticated: derived boolean
 *
 * On mount, silently calls GET /api/auth/me to restore session from
 * the httpOnly refresh token cookie, issuing a new access token if needed.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── On app boot: attempt to restore the session ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        // If we have an access token in localStorage, try /me directly.
        // The Axios interceptor will silently refresh if the token is expired.
        const { data } = await authApi.getMe();
        if (!cancelled) {
          setUser(data.data.user);
        }
      } catch {
        // No valid session — clear any stale token
        localStorage.removeItem('accessToken');
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext — low-level hook for consuming AuthContext.
 * Use the convenience hook `useAuth` from features/auth/hooks/useAuth.js instead.
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
