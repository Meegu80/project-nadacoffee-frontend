import api from "./axios";
import type { Order, OrderListParams, OrderListResponse } from "../types/admin.order";

export const adminOrderApi = {
  // 주문 목록 조회
  getOrders: async (params: OrderListParams) => {
    const { data } = await api.get<OrderListResponse>("/admin/orders", { params });
    return data;
  },

  // [수정] 주문 상세 조회: 서버 응답 구조 { data: Order } 에서 data만 추출
  getOrder: async (id: string) => {
    const { data } = await api.get<{ data: Order }>(`/admin/orders/${id}`);
    return data.data;
  },

  // 주문 정보 업데이트
  updateOrderDetails: async (id: string, updateData: any) => {
    const { data } = await api.patch<{ message: string }>(`/admin/orders/${id}`, updateData);
    return data;
  },

  // 주문 취소
  deleteOrder: async (id: string) => {
    const { data } = await api.post<{ message: string }>(`/orders/${id}/cancel`, {
      reason: "관리자 삭제(Delete Action)"
    });
    return data;
  }
};
