import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserCreateRequest, UserProfile } from '../types/user';
import { signUp, login as loginApi } from '../api/auth.api';
import axios from 'axios';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  registerUser: (data: UserCreateRequest) => Promise<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

// 사용자 인증 상태 관리 (Zustand + Persist)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
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
          
          set({ 
            user: user, 
            token: token, 
            isLoading: false 
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
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage', // 로컬 스토리지 키 이름
    }
  )
);
