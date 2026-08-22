/**
 * Axios base instance for Dayflow API.
 *
 * - Base URL uses Vite proxy (/api → http://localhost:5000/api)
 * - Automatically attaches Authorization header from localStorage token
 */
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor — attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("dayflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — standardize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // 401 — token expired or invalid — could trigger logout here
    // Member 1 can enhance this to redirect to login page
    if (error.response?.status === 401) {
      localStorage.removeItem("dayflow_token");
      // window.location.href = "/login"; // Uncomment when login page is ready
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
