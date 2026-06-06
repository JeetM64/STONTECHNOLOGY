import axios from "axios";

// Dynamically check for environment API URL or default to local port
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
