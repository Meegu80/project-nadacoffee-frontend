import api from "./axios.ts";

export type OrderStatus =
  | 'PENDING'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_COMPLETED'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'PURCHASE_COMPLETED'
  | 'CANCELLED'
  | 'RETURNED';

export interface CreateOrderInput {
  items: {
    prodId: number;
    optionId: number | null;
    quantity: number;
  }[];
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  address1: string;
  address2: string;
  deliveryMessage?: string;
  entrancePassword?: string;
  usePoint?: number;
}

export interface ConfirmOrderInput {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface OrderItem {
  id: number;
  prodId: number;
  quantity: number;
  salePrice: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
  option: {
    name: string;
    value: string;
  } | null;
}

export interface Order {
  id: number;
  totalPrice: number;
  status: OrderStatus | string;
  createdAt: string;
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  address1: string;
  address2: string;
  deliveryMessage: string | null;
  usedPoint: number;
  orderItems: OrderItem[];
}

export interface OrderListResponse {
  data: Order[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const orderApi = {
  getMyOrders: async (page: number = 1, limit: number = 10) => {
    // baseURL이 /api 이므로 경로는 /orders 만 사용
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
  // [최종 수정] 중복된 /api 절대 금지
  getOrderDetail: async (id: number) => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  }
};
