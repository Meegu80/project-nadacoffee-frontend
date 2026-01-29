import api from "./axios.ts";

export interface MemberInfo {
   id: number;
   email: string;
   name: string;
   phone: string;
   grade: string;
   status: string;
   role: string;
   createdAt: string;
   updatedAt: string;
}

export interface UpdateMemberInput {
   name?: string;
   phone?: string;
}

export interface ChangePasswordInput {
   currentPassword: string;
   newPassword: string;
   confirmPassword: string;
}

export const memberApi = {
   getMe: async () => {
      const { data } = await api.get<{ message: string; data: MemberInfo }>("/members/me");
      return data.data;
   },
   updateMe: async (body: UpdateMemberInput) => {
      const { data } = await api.put<{ message: string; data: MemberInfo }>("/members/me", body);
      return data;
   },
   changePassword: async (body: ChangePasswordInput) => {
      const { data } = await api.patch<{ message: string }>("/members/me/password", body);
      return data;
   },
};
