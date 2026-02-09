import type {
   CreateMemberInput,
   GetMemberResponse,
   GetMembersResponse,
   Member,
   UpdateMemberInput,
} from "../types/admin.member.ts";
import api from "./axios.ts";

export const adminMemberApi = {
   getMembers: async (page: number = 1, limit: number = 10) => {
      const { data } = await api.get<GetMembersResponse>("/admin/members", {
         params: { page, limit },
      });
      return data;
   },

   getMember: async (id: number) => {
      const { data } = await api.get<GetMemberResponse>(`/admin/members/${id}`);
      return data.data;
   },

   createMember: async (body: CreateMemberInput) => {
      const { data } = await api.post<{ message: string; data: Member }>(
         "/admin/members",
         body,
      );
      return data;
   },

   updateMember: async (id: number, body: UpdateMemberInput) => {
      const { data } = await api.put<{ message: string; data: Member }>(
         `/admin/members/${id}`,
         body,
      );
      return data;
   },

   deleteMember: async (id: number) => {
      const { data } = await api.delete<{ message: string; deletedId: number }>(
         `/admin/members/${id}`,
      );
      return data;
   },

   // 포인트 개별 지급
   grantPoints: async (body: { memberId: number; amount: number; reason: string }) => {
      const { data } = await api.post<{ message: string }>("/admin/points", body);
      return data;
   },

   // [신규] 전체 회원 포인트 일괄 지급
   grantPointsToAll: async (body: { amount: number; reason: string }) => {
      const { data } = await api.post<{ message: string }>("/admin/points/bulk-all", body);
      return data;
   }
};
