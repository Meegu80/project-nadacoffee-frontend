import api from "./axios";
import type { Order, OrderListParams, OrderListResponse, OrderStatus } from "../types/admin.order";

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

  // [수정] PATCH 메서드를 사용하여 주문 정보(상태 포함) 업데이트 시도
  updateOrderStatus: async (id: string, status: OrderStatus) => {
    // 보통 상태 변경은 PATCH /admin/orders/{id} 를 사용합니다.
    const { data } = await api.patch<{ message: string }>(`/admin/orders/${id}`, { status });
    return data;
  },

  // 주문 삭제
  deleteOrder: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/admin/orders/${id}`);
    return data;
  }
};
