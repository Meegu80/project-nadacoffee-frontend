import axios from "axios";
import useAuthStore from "../stores/useAuthStore.ts";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_API_CLIENT_KEY; // [수정] VITE_API_KEY -> VITE_API_CLIENT_KEY

export const httpClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "x-client-key": API_KEY,
    }
});

httpClient.interceptors.request.use(
    config => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    }
);