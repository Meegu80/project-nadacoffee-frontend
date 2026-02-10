import api from "./axios";
import type { Order, OrderListParams, OrderListResponse } from "../types/admin.order";

export const adminOrderApi = {
  // 주문 목록 조회
  getOrders: async (params: OrderListParams) => {
    const { data } = await api.get<OrderListResponse>("/admin/orders", { params });
    return data;
  },

  // 주문 상세 조회
  getOrder: async (id: string) => {
    const { data } = await api.get<{ data: Order }>(`/admin/orders/${id}`);
    return data.data;
  },

  // 주문 정보(아이템 정보 포함) 업데이트
  updateOrderDetails: async (id: string, updateData: any) => {
    const { data } = await api.patch<{ message: string }>(`/admin/orders/${id}`, updateData);
    return data;
  },

  // 주문 삭제 (실제로는 주문 취소 API 사용)
  deleteOrder: async (id: string) => {
    // Client -> Proxy (/api) -> Target (/api) -> App (/api/orders) ? No, user says curl has /api/api
    // We need the browser to send /api/api/orders...
    // Since axios might be de-duping /api + /api, we force another one.
    const { data } = await api.post<{ message: string }>(`/api/api/orders/${id}/cancel`, {
      reason: "관리자 삭제(Delete Action)"
    });
    return data;
  }
};
