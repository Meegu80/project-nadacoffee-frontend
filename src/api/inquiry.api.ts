import api from "./axios.ts";

export type InquiryType = 'COMPLIMENT' | 'COMPLAINT' | 'SUGGESTION' | 'INQUIRY';
export type InquiryStatus = 'PENDING' | 'ANSWERED';

export interface CreateInquiryInput {
  type: InquiryType;
  title: string;
  content: string;
  images?: string[];
}

export interface InquiryImage {
  id: number;
  url: string;
}

export interface InquiryItem {
  id: number;
  type: InquiryType;
  title: string;
  content: string;
  status: InquiryStatus;
  answer?: string | null;
  answeredAt?: string | null;
  images: InquiryImage[];
  createdAt: string;
  updatedAt: string;
}

export interface InquiryListResponse {
  data: InquiryItem[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const inquiryApi = {
  // 문의 등록
  createInquiry: async (body: CreateInquiryInput) => {
    const { data } = await api.post<{ message: string; data: InquiryItem }>("/inquiries", body);
    return data;
  },
  // 내 문의 목록 조회
  getMyInquiries: async (params: { page?: number; limit?: number; type?: InquiryType; status?: InquiryStatus } = {}) => {
    const { data } = await api.get<InquiryListResponse>("/inquiries", { params });
    return data;
  },
  // 문의 상세 조회
  getInquiryDetail: async (id: number) => {
    const { data } = await api.get<{ data: InquiryItem }>(`/inquiries/${id}`);
    return data.data;
  },
  // [신규] 문의 수정
  updateInquiry: async (id: number, body: CreateInquiryInput) => {
    const { data } = await api.put<{ message: string; data: InquiryItem }>(`/inquiries/${id}`, body);
    return data;
  },
  // 문의 삭제
  deleteInquiry: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/inquiries/${id}`);
    return data;
  }
};
