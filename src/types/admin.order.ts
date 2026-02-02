export type OrderStatus = 'PAYMENT_COMPLETED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: OrderStatus;
  receiverName: string;
  receiverPhone: string;
  address: string;
  detailAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
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

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}
