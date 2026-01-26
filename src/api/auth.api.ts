import api from './axios';
import type { UserCreateRequest, SignUpResponse, LoginResponse } from '../types/user';

// 최종 요청 주소: /api (baseURL) + /auth/register = /api/auth/register
export const signUp = async (userData: UserCreateRequest): Promise<SignUpResponse> => {
    const response = await api.post<SignUpResponse>('/auth/register', userData);
    return response.data;
};

// 로그인
export const login = async (credentials: { email: string; pass: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
};
