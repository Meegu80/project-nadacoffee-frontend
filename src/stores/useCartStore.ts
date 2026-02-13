import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number; // 서버 DB의 고유 ID
  prodId: number;
  name: string;
  price: number; // 옵션가가 포함된 최종 단가
  imageUrl: string;
  quantity: number;
  stockQty: number;
  optionId?: number | null;
  optionName?: string | null;
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (newItem: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (newItem) => {
        const currentItems = [...get().items];

        // 동일 상품 & 동일 옵션 체크
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            Number(item.prodId) === Number(newItem.prodId) &&
            String(item.optionId || '') === String(newItem.optionId || '')
        );

        if (existingItemIndex !== -1) {
          // 기존 항목 제거 후 새 데이터(합쳐진 수량 등)를 맨 앞에 추가
          const filtered = currentItems.filter((_, idx) => idx !== existingItemIndex);
          set({ items: [newItem, ...filtered] });
        } else {
          // 새 항목을 맨 앞에 추가
          set({ items: [newItem, ...currentItems] });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalAmount: () => {
        return get().items.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
      },

      totalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
