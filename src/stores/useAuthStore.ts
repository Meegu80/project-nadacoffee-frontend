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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

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

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await loginApi(credentials);
          // response는 이미 response.data이므로, response.data에서 token과 user를 추출합니다.
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

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
