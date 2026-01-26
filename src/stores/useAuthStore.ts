import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserCreateRequest, UserProfile } from '../types/user';
import { signUp, login as loginApi } from '../api/auth.api';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  registerUser: (data: UserCreateRequest) => Promise<boolean>;
  signup: (data: UserCreateRequest) => Promise<boolean>;
  login: (credentials: { email: string; pass: string }) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      registerUser: async (data) => {
        set({ isLoading: true });
        try {
          await signUp(data);
          // 회원가입 성공 시 자동 로그인 하지 않음 (토큰이 없으므로)
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Signup Error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signup: async (data) => {
        return get().registerUser(data);
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const result = await loginApi(credentials);
          // API 응답 구조: { message, data: { token, user } }
          // AuthData 인터페이스: { token: string, user: UserProfile }
          const { token, user } = result.data;

          set({ user, token, isLoading: false });
          return true;
        } catch (error) {
          console.error('Login Error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }), // Persist only user and token
    }
  )
);
