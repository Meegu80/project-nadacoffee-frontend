export interface Member {
   id: number;
   email: string;
   name: string;
   phone: string;
   grade: "BRONZE" | "SILVER" | "GOLD" | "VIP";
   status: "ACTIVE" | "INACTIVE" | "BANNED";
   role: "USER" | "ADMIN";
   createdAt: string;
   updatedAt: string;
}

export interface GetMembersResponse {
   data: Member[];
   pagination: {
      totalMembers: number; // total -> totalMembers로 변경
      totalPages: number;
      currentPage: number;
      limit: number;
   };
}

export interface GetMemberResponse {
   data: Member;
}

export interface CreateMemberInput {
   email: string;
   password?: string;
   name: string;
   phone: string;
   grade: string;
   status: string;
   role: string;
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {}
