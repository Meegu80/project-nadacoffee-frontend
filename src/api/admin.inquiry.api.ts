import api from "./axios.ts";
import type { InquiryItem, InquiryListResponse, InquiryType, InquiryStatus } from "./inquiry.api";

export interface AdminInquiryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: InquiryType;
  status?: InquiryStatus;
}

export const adminInquiryApi = {
  // 전체 문의 목록 조회 (관리자용)
  getInquiries: async (params: AdminInquiryParams = {}) => {
    const { data } = await api.get<InquiryListResponse>("/admin/inquiries", { params });
    return data;
  },
  // 문의 상세 조회
  getInquiry: async (id: number) => {
    const { data } = await api.get<{ data: InquiryItem }>(`/admin/inquiries/${id}`);
    return data.data;
  },
  // [수정] 답변 등록/수정 경로 변경 (/answer -> /reply)
  answerInquiry: async (id: number, answer: string) => {
    const { data } = await api.post<{ message: string }>(`/admin/inquiries/${id}/reply`, { answer });
    return data;
  },
  // 문의 삭제
  deleteInquiry: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/admin/inquiries/${id}`);
    return data;
  }
};
