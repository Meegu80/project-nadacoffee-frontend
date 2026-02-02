import type {
   CreateMemberInput,
   GetMemberResponse,
   GetMembersResponse,
   Member,
   UpdateMemberInput,
} from "../types/admin.member.ts";
import api from "./axios.ts";

export const adminMemberApi = {
   // 404 에러 대응: /api 접두어 제거하여 /admin/members로 원복
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
};
