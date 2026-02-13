import api from "./axios.ts";
import type {
  OrderStatus,
  CreateOrderInput,
  ConfirmOrderInput,
  OrderItem,
  Order,
  OrderListResponse,
} from "../types/order.ts";

export type {
  OrderStatus,
  CreateOrderInput,
  ConfirmOrderInput,
  OrderItem,
  Order,
  OrderListResponse,
};

export const orderApi = {
  getMyOrders: async (page: number = 1, limit: number = 10) => {
    const { data } = await api.get<OrderListResponse>("/orders", {
      params: { page, limit }
    });
    return data;
  },
  createOrder: async (body: CreateOrderInput) => {
    const { data } = await api.post<{ orderId: number; amount: number }>("/orders", body);
    return data;
  },
  confirmOrder: async (body: ConfirmOrderInput) => {
    const { data } = await api.post<{ message: string }>("/orders/confirm", body);
    return data;
  },
  cancelOrder: async (id: number, reason: string = "단순 변심") => {
    const { data } = await api.post<{ message: string }>(`/orders/${id}/cancel`, { reason });
    return data;
  },
  // [최종 수정] 콘솔 로그 확인 결과: { data: Order } 구조임
  getOrderDetail: async (id: number) => {
    const { data } = await api.get<{ data: Order }>(`/orders/${id}`);
    return data.data; // 알맹이(data)만 쏙 빼서 반환
  }
};
