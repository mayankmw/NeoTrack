import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: apiUrl,
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
