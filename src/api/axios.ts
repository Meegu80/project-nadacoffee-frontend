import axios from 'axios';

// 프록시를 사용하므로 baseURL은 상대 경로로 설정합니다.
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        // 서버가 요구하는 정확한 헤더 이름 'x-client-key'로 수정합니다.
        'x-client-key': import.meta.env.VITE_API_KEY,
    },
});

// 요청 인터셉터: 토큰 자동 주입 (기존 로직 유지)
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
                console.error('Token parsing error:', e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
