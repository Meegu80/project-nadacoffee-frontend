import api from "./axios.ts";

export interface AddToCartInput {
  prodId: number;
  optionId: number | string | null;
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  memberId: number;
  prodId: number;
  optionId: number | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    basePrice: number;
    imageUrl: string | null;
    images: { id: number; url: string }[];
  };
  option: {
    id: number;
    name: string;
    value: string;
    addPrice: number;
  } | null;
}

export const cartApi = {
  // [수정] 서버 응답 { message, data } 구조에서 data 배열만 추출
  getCart: async () => {
    const { data } = await api.get<{ message: string; data: CartItemResponse[] }>("/cart");
    return data.data;
  },
  addToCart: async (body: AddToCartInput) => {
    const { data } = await api.post<{ message: string; data?: CartItemResponse }>("/cart", body);
    return data;
  },
  updateCart: async (id: number, quantity: number) => {
    const { data } = await api.patch<{ message: string }>(`/cart/${id}`, { quantity });
    return data;
  },
  removeFromCart: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/cart/${id}`);
    return data;
  },
  clearCart: async () => {
    const { data } = await api.delete<{ message: string }>("/cart");
    return data;
  }
};
