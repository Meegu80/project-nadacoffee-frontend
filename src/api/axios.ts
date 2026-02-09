import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'x-client-key': import.meta.env.VITE_API_CLIENT_KEY, // [수정] VITE_API_KEY -> VITE_API_CLIENT_KEY
    },
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        const storage = localStorage.getItem('auth-storage');
        if (storage) {
            try {
                const parsed = JSON.parse(storage);
                const token = parsed.state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error('Auth token injection failed', e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
