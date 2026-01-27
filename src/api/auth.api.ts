import api from './axios';
import type { UserCreateRequest, SignUpResponse, LoginResponse } from '../types/user';

// 회원가입: 경로를 /auth/register로 수정합니다. (baseURL /api와 합쳐져서 .../api/auth/register가 됨)
export const signUp = async (userData: UserCreateRequest): Promise<SignUpResponse> => {
    const response = await api.post<SignUpResponse>('/auth/register', userData);
    return response.data;
};

// 로그인: /auth/login (이미 잘 작동함)
export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
};
