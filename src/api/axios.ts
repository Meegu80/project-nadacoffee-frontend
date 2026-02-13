import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'x-client-key': import.meta.env.VITE_API_CLIENT_KEY,
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
        // [수정] 401 에러 시 강제 리다이렉트 제거
        // 비로그인 상태에서 메인 페이지 API 호출 시 튕기는 현상 방지
        if (status === 401) {
            console.warn('Unauthorized request - User might not be logged in');
            // 토큰이 만료된 경우에만 스토리지를 비우고 싶다면 아래 로직 유지
            // localStorage.removeItem('auth-storage');
        }
        return Promise.reject(error);
    }
);

export default api;
