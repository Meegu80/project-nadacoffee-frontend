import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Axios 인스턴스 생성 및 기본 설정
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'x-client-key': import.meta.env.VITE_API_CLIENT_KEY,
    },
});

// 요청 인터셉터: 토큰 자동 주입 및 만료 체크
api.interceptors.request.use(
    (config) => {
        const storage = localStorage.getItem('auth-storage');
        if (storage) {
            try {
                const parsed = JSON.parse(storage);
                const token = parsed.state?.token;

                if (token) {
                    // JWT 토큰 만료 체크
                    const decoded: any = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        console.warn('Token expired');
                        return Promise.reject(new Error('Token expired'));
                    }

                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error('Auth token processing failed', e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            console.warn('Unauthorized request');
        }
        return Promise.reject(error);
    }
);

export default api;
