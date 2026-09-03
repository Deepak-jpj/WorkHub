import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// REQUEST LOGGER
// ==========================================
API.interceptors.request.use(
  (config) => {
    console.log("====================================");
    console.log("🚀 API REQUEST");
    console.log("Method:", config.method?.toUpperCase());
    console.log("Base URL:", config.baseURL);
    console.log("URL:", config.url);
    console.log("Full URL:", `${config.baseURL}${config.url}`);
    console.log("Data:", config.data);
    console.log("====================================");

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ API REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE LOGGER
// ==========================================
API.interceptors.response.use(
  (response) => {
    console.log("====================================");
    console.log("✅ API RESPONSE");
    console.log("Status:", response.status);
    console.log("URL:", response.config.url);
    console.log("Data:", response.data);
    console.log("====================================");

    return response;
  },
  (error) => {
    console.error("====================================");
    console.error("❌ API RESPONSE ERROR");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("URL:", error.config?.url);
    } else if (error.request) {
      console.error("❌ Request was sent but no response received");
      console.error(error.request);
    } else {
      console.error("❌ Error:", error.message);
    }

    console.error("====================================");

    return Promise.reject(error);
  }
);

export default API;