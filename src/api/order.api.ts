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
  totalPrice: number; // [확인] 서버 응답이 totalPrice인지 totalAmount인지 확인 필요 (아까 관리자는 totalPrice였음)
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

  getOrderDetail: async (id: number) => {
    // [수정] 서버 응답이 { data: Order } 형태일 수도 있고 Order 객체 자체일 수도 있음.
    // 아까 GET /api/orders/{id} 명세는 객체 자체였음.
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  }
};
