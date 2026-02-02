import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'x-client-key': import.meta.env.VITE_API_KEY,
    },
});

// 요청 인터셉터: 토큰 주입 로직 강화
api.interceptors.request.use(
    (config) => {
        // 1. localStorage에서 auth-storage 가져오기
        const storage = localStorage.getItem('auth-storage');
        
        if (storage) {
            try {
                const parsed = JSON.parse(storage);
                // Zustand의 persist 구조에 맞춰 토큰 추출
                const token = parsed.state?.token;
                
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    console.warn('No token found in auth-storage');
                }
            } catch (e) {
                console.error('Auth storage parsing error:', e);
            }
        } else {
            console.warn('auth-storage not found in localStorage');
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 자동 로그아웃 처리 (선택 사항)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized! Redirecting to login...');
            // 필요 시 여기서 로그아웃 처리 및 페이지 이동 로직 추가 가능
        }
        return Promise.reject(error);
    }
);

export default api;
