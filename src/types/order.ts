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
    usePoint?: number; // [복구] usedPoint -> usePoint
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
        id: number;
        name: string;
        imageUrl: string | null;
    };
    option: {
        name: string;
        value: string;
    } | null;
    review?: {
        id: number;
        rating: number;
        content: string;
        createdAt: string;
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
