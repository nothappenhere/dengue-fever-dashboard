import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jangan redirect otomatis, biarkan component handle error
    if (error.response?.status === 401) {
      // Hanya log, tidak redirect
      console.log("Unauthorized access");
    }
    return Promise.reject(error);
  }
);
