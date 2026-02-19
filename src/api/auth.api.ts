import api from "./axios";
import axios from "axios";
import type {
   UserCreateRequest,
   SignUpResponse,
   LoginResponse,
} from "../types/user";

/** 백엔드 baseURL (인터셉터 없는 순수 인스턴스 사용) */
const rawApi = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api" });

export const signUp = async (
   userData: UserCreateRequest,
): Promise<SignUpResponse> => {
   const response = await api.post<SignUpResponse>("/auth/register", userData);
   return response.data;
};

export const login = async (credentials: {
   email: string;
   password: string;
}): Promise<LoginResponse> => {
   const response = await api.post<LoginResponse>("/auth/login", credentials);
   return response.data;
};

/**
 * Refresh Token으로 새 Access Token 발급
 * 순환 인터셉터 방지를 위해 rawApi(인터셉터 없는 인스턴스) 사용
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{ token: string; refreshToken?: string }> => {
   const response = await rawApi.post("/auth/refresh", { refreshToken });
   return response.data;
};
