export type OrderStatus = 'PENDING_PAYMENT' | 'PAYMENT_COMPLETED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

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
  id: number; // string -> number
  totalPrice: number; // totalAmount -> totalPrice
  status: OrderStatus;
  createdAt: string;
  recipientName: string; // userName -> recipientName
  recipientPhone: string;
  zipCode: string;
  address1: string;
  address2: string;
  deliveryMessage: string | null;
  usedPoint: number;
  orderItems: OrderItem[]; // items -> orderItems
  
  // 추가 정보가 있을 수 있으므로 optional로 유지
  userEmail?: string; 
  userName?: string;
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
