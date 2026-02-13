import api from "./axios";
import type {
   UserCreateRequest,
   SignUpResponse,
   LoginResponse,
} from "../types/user";

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
