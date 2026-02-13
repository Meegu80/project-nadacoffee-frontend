import type { OrderStatus } from '../types/order';

export interface StatusInfo {
    label: string;
    color: string;
    isPending: boolean;
    canReview: boolean;
}

export const getStatusInfo = (status: OrderStatus | string): StatusInfo => {
    const statusMap: Record<string, StatusInfo> = {
        PENDING: { label: '주문 대기', color: 'gray', isPending: true, canReview: false },
        PENDING_PAYMENT: { label: '결제 대기', color: 'yellow', isPending: true, canReview: false },
        PAYMENT_COMPLETED: { label: '결제 완료', color: 'blue', isPending: true, canReview: false },
        PREPARING: { label: '상품 준비중', color: 'blue', isPending: false, canReview: false },
        SHIPPING: { label: '배송중', color: 'purple', isPending: false, canReview: false },
        DELIVERED: { label: '배송 완료', color: 'green', isPending: false, canReview: true },
        PURCHASE_COMPLETED: { label: '구매 확정', color: 'green', isPending: false, canReview: true },
        CANCELLED: { label: '주문 취소', color: 'red', isPending: false, canReview: false },
        RETURNED: { label: '반품', color: 'red', isPending: false, canReview: false },
    };

    return statusMap[status] || { label: status, color: 'gray', isPending: false, canReview: false };
};

export const getStatusBadgeColor = (status: OrderStatus | string): string => {
    const info = getStatusInfo(status);
    const colorMap: Record<string, string> = {
        gray: 'bg-gray-100 text-gray-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        green: 'bg-green-100 text-green-700',
        red: 'bg-red-100 text-red-700',
    };
    return colorMap[info.color] || colorMap.gray;
};

export const isOrderCancellable = (status: OrderStatus | string): boolean => {
    return getStatusInfo(status).isPending;
};

export const canWriteReview = (status: OrderStatus | string): boolean => {
    return getStatusInfo(status).canReview;
};
