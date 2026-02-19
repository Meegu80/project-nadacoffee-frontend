import axios from 'axios';
import { refreshAccessToken } from './auth.api';

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

// ─── Refresh Token 관련 상태 ────────────────────────────────────────────────
/** 현재 토큰 갱신 중인지 여부 (race condition 방지) */
let isRefreshing = false;
/** 갱신 중 대기 중인 요청들의 resolve/reject 콜백 큐 */
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

/** 큐에 쌓인 요청들을 새 토큰으로 처리 또는 거부 */
function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (token) {
            resolve(token);
        } else {
            reject(error);
        }
    });
    failedQueue = [];
}

/** localStorage에서 refreshToken 가져오기 */
function getRefreshToken(): string | null {
    try {
        const storage = localStorage.getItem('auth-storage');
        if (!storage) return null;
        return JSON.parse(storage)?.state?.refreshToken ?? null;
    } catch {
        return null;
    }
}

/** 로그아웃 처리 후 로그인 페이지로 이동 */
function forceLogout() {
    localStorage.removeItem('auth-storage');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}
// ─────────────────────────────────────────────────────────────────────────────

// 응답 인터셉터: 에러 처리 + Refresh Token 자동 갱신
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // 401 에러 처리
        if (status === 401 && !originalRequest._retry) {
            const currentPath = window.location.pathname;
            const refreshToken = getRefreshToken();

            // 비로그인 사용자(토큰 없음) 또는 이미 로그인 페이지인 경우 → 그냥 reject
            if (!refreshToken || currentPath === '/login') {
                return Promise.reject(error);
            }

            // 이미 갱신 중인 경우 → 큐에 대기
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }).catch((err) => Promise.reject(err));
            }

            // 토큰 갱신 시작
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('🔄 Access Token 만료. Refresh Token으로 재발급 중...');
                const result = await refreshAccessToken(refreshToken);
                const newToken = result.token;

                // useAuthStore.setToken 동적 import (순환 참조 방지)
                const { useAuthStore } = await import('../stores/useAuthStore');
                useAuthStore.getState().setToken(newToken, result.refreshToken);

                // 대기 중인 요청들 처리
                processQueue(null, newToken);

                // 원래 요청 재시도
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // 갱신 실패 → 강제 로그아웃
                processQueue(refreshError, null);
                console.warn('🔒 Refresh Token 만료. 로그아웃 처리합니다.');
                forceLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
