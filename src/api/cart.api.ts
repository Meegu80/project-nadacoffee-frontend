import api from "./axios.ts";

export interface CartServerItem {
  id: number;
  memberId: number;
  prodId: number;
  optionId: number | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export const cartApi = {
  // 장바구니 목록 조회
  getCart: async () => {
    const { data } = await api.get<{ message: string; data: CartServerItem[] }>("/cart");
    return data.data;
  },

  // 장바구니 아이템 추가
  addToCart: async (body: { prodId: number; optionId?: number; quantity: number }) => {
    const { data } = await api.post<{ message: string }>("/cart", body);
    return data;
  },

  // 장바구니 수량 수정 (PATCH /api/cart/{id})
  updateCart: async (id: number, quantity: number) => {
    const { data } = await api.patch<{ message: string }>(`/cart/${id}`, { quantity });
    return data;
  },

  // 장바구니 아이템 삭제
  removeFromCart: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/cart/${id}`);
    return data;
  },

  // 장바구니 비우기
  clearCart: async () => {
    const { data } = await api.delete<{ message: string }>("/cart");
    return data;
  }
};
