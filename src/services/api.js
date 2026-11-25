import axios from "axios";

const API = axios.create({
  baseURL: "https://workhub-backend-2.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach authentication token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;