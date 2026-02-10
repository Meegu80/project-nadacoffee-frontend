import api from "./axios.ts";

export interface ReviewInput {
    orderId: number;
    prodId: number;
    rating: number;
    content: string;
    imageUrls?: string[];
}

export interface UpdateReviewInput {
    rating: number;
    content: string;
    imageUrls: string[];
}

export interface MyReview {
    id: number;
    rating: number;
    content: string;
    reviewImages: {
        id: number;
        url: string;
    }[];
    createdAt: string;
    updatedAt: string;
    member: {
        id: number;
        name: string;
    };
    product: {
        id: number;
        name: string;
        imageUrl: string | null;
    };
}

export interface MyReviewListResponse {
    data: MyReview[];
    pagination: {
        total: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

export const reviewApi = {
    // [수정] Vite 프록시가 /api를 유지하므로 /reviews만 사용
    createReview: async (body: ReviewInput) => {
        const { data } = await api.post<{ message: string }>("/reviews", body);
        return data;
    },
    updateReview: async (id: number, body: UpdateReviewInput) => {
        const { data } = await api.patch<{ message: string }>(`/reviews/${id}`, body);
        return data;
    },
    deleteReview: async (id: number) => {
        const { data } = await api.delete<{ message: string }>(`/reviews/${id}`);
        return data;
    },
    getMyReviews: async (page: number = 1, limit: number = 10) => {
        const { data } = await api.get<MyReviewListResponse>("/reviews/me", {
            params: { page, limit }
        });
        return data;
    },
    getProductReviews: async (prodId: number, page: number = 1, limit: number = 10) => {
        const { data } = await api.get<MyReviewListResponse>(`/reviews/product/${prodId}`, {
            params: { page, limit }
        });
        return data;
    }
};
