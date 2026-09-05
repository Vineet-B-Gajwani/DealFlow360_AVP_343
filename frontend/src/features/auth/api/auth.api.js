import axios from 'axios';

/**
 * Axios instance pre-configured for the DealFlow360 API.
 *
 * Base URL: Vite proxies /api → http://localhost:5000 in development.
 * Credentials are included so httpOnly refresh token cookies are sent.
 */
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach access token ─────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — silent token refresh on 401 ───────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh on auth endpoints to avoid infinite loops
    const isAuthEndpoint =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue request while refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear local state; AuthContext listener will redirect
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Auth API functions
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Register a new internal user.
   * @param {{ name: string, email: string, password: string, role: string }} data
   */
  register: (data) => apiClient.post('/auth/register', data),

  /**
   * Login with email and password.
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /**
   * Refresh the access token using the httpOnly refresh token cookie.
   */
  refresh: () => apiClient.post('/auth/refresh'),

  /**
   * Logout — invalidates server-side refresh token and clears cookie.
   */
  logout: () => apiClient.post('/auth/logout'),

  /**
   * Get the current authenticated user's profile.
   */
  getMe: () => apiClient.get('/auth/me'),
};

export default apiClient;
