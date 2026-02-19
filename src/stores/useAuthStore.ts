import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserCreateRequest, UserProfile } from '../types/user';
import { signUp, login as loginApi } from '../api/auth.api';
import axios from 'axios';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  registerUser: (data: UserCreateRequest) => Promise<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  /** axios 인터셉터에서 토큰 갱신 후 호출 */
  setToken: (token: string, refreshToken?: string) => void;
}

// 사용자 인증 상태 관리 (Zustand + Persist)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,

      // 회원가입 액션
      registerUser: async (data) => {
        set({ isLoading: true });
        try {
          await signUp(data);
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Signup Error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      // 로그인 액션
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await loginApi(credentials);
          const { token, user } = response.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const refreshToken = (response.data as any).refreshToken ?? null;

          set({
            user: user,
            token: token,
            refreshToken: refreshToken,
            isLoading: false,
          });
          return true;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error('Login Error Detail:', error.response?.data);
          }
          set({ isLoading: false });
          return false;
        }
      },

      // 로그아웃 액션
      logout: () => {
        set({ user: null, token: null, refreshToken: null });
        localStorage.removeItem('auth-storage');
      },

      // 토큰만 업데이트 (액세스 토큰 갱신 시 사용)
      setToken: (token, refreshToken) => {
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
        }));
      },
    }),
    {
      name: 'auth-storage', // 로컬 스토리지 키 이름
    }
  )
);
