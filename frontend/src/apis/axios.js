import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Fallback handlers just in case the interceptor triggers before React is mounted
let authLogout = () => localStorage.clear();
let routerNavigate = (path) => { window.location.href = path; };

/**
 * Inject React context hooks into the axios instance.
 * Call this from inside your AuthProvider.
 */
export const injectAxiosInterceptors = (logout, navigate) => {
  authLogout = logout;
  routerNavigate = navigate;
};

// ── Request Interceptor ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized or 403 Forbidden -> session is invalid
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      authLogout(); // Safely clears React state + localStorage
      routerNavigate("/login?reason=session_expired"); // Client-side route without reload
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
