import api from "./axios.ts";

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
  status: string;
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
  // 내 주문 목록 조회
  getMyOrders: async (page: number = 1, limit: number = 10) => {
    const { data } = await api.get<OrderListResponse>("/orders", {
      params: { page, limit }
    });
    return data;
  },

  // 주문서 생성
  createOrder: async (body: CreateOrderInput) => {
    const { data } = await api.post<{ orderId: number; amount: number }>("/orders", body);
    return data;
  },

  // 결제 승인 확인
  confirmOrder: async (body: ConfirmOrderInput) => {
    const { data } = await api.post<{ message: string }>("/orders/confirm", body);
    return data;
  },

  // 주문 취소 요청 (POST /api/orders/{id}/cancel)
  cancelOrder: async (id: number, reason: string = "단순 변심") => {
    const { data } = await api.post<{ message: string }>(`/orders/${id}/cancel`, { reason });
    return data;
  },

  // 주문 상세 조회
  getOrderDetail: async (id: number) => {
    const { data } = await api.get<{ data: Order }>(`/orders/${id}`);
    return data.data;
  }
};
