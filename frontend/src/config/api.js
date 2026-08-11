import axios from "axios";

/**
 * Centralised Axios instance.
 *
 * To change the backend URL, set VITE_API_URL in your .env file:
 *   VITE_API_URL=http://localhost:5000
 *
 * All components should import `api` from this file instead of
 * hardcoding axios.post("http://localhost:5000/...").
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor – attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timed out");
    }
    return Promise.reject(error);
  }
);

export default api;
