import axios from "axios";

// Resolve the API URL dynamically at runtime
const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && 
   (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "::1")
     ? "http://localhost:5000/api"
     : "/api");

// Create Axios instance pointing to the backend API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
