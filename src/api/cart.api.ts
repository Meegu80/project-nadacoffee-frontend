import api from "./axios";

export interface CartItem {
  id: number;
  prodId: number;
  optionId: number | null;
  quantity: number;
}

export const cartApi = {
  // 장바구니 목록 조회
  getCart: async () => {
    const { data } = await api.get<CartItem[]>("/cart");
    return data;
  },

  // 장바구니에 상품 추가
  addToCart: async (body: { prodId: number; optionId: number | null; quantity: number }) => {
    const { data } = await api.post("/cart", body);
    return data;
  },

  // 장바구니 상품 수량 수정
  updateCart: async (id: number, quantity: number) => {
    const { data } = await api.put(`/cart/${id}`, { quantity });
    return data;
  },

  // 장바구니 상품 삭제
  removeFromCart: async (id: number) => {
    const { data } = await api.delete(`/cart/${id}`);
    return data;
  },

  // [신규] 장바구니 비우기
  clearCart: async () => {
    const { data } = await api.delete("/cart");
    return data;
  },
};
