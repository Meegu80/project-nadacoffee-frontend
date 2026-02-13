import axios from 'axios';

// Axios 인스턴스 생성 및 기본 설정
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'x-client-key': import.meta.env.VITE_API_CLIENT_KEY,
    },
});

// 요청 인터셉터: 토큰 자동 주입
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

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        // 401 에러 시 로그 출력 (강제 리다이렉트는 제거됨)
        if (status === 401) {
            console.warn('Unauthorized request - User might not be logged in');
        }
        return Promise.reject(error);
    }
);

export default api;
