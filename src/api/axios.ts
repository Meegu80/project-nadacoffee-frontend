import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'x-client-key': import.meta.env.VITE_API_KEY,
    },
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        // 결제 승인 로그 (개발 환경에서만 유용)
        if (import.meta.env.DEV && config.url?.includes('/orders/confirm')) {
            console.log("📡 [Payment Confirm] Payload:", config.data);
        }

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
            console.warn('Session expired. Redirecting to login...');
            // 전역 상태 초기화 및 이동 로직 (필요 시 추가)
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
