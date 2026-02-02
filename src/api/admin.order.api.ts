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

  // 주문 상태 변경
  updateOrderStatus: async (id: string, status: OrderStatus) => {
    const { data } = await api.put<{ message: string }>(`/admin/orders/${id}/status`, { status });
    return data;
  },

  // 주문 삭제 (필요시)
  deleteOrder: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/admin/orders/${id}`);
    return data;
  }
};
