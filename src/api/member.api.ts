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

export interface PointHistoryItem {
  id: number;
  amount: number;
  reason: string;
  createdAt: string;
  orderId: number | null;
}

export interface PointHistoryResponse {
  data: PointHistoryItem[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
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
   // 포인트 잔액 조회
   getPointBalance: async () => {
      const { data } = await api.get<{ balance: number }>("/points/balance");
      return data;
   },
   // 포인트 내역 조회 (GET /api/points)
   getPointHistory: async (page: number = 1, limit: number = 10) => {
      const { data } = await api.get<PointHistoryResponse>("/points", {
         params: { page, limit }
      });
      return data;
   }
};
