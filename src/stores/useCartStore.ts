import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  prodId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  optionId?: number | null;
  optionName?: string | null; // 옵션 이름 추가 (HOT/ICE 등)
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (product: { id: number; name: string; basePrice: number; imageUrl: string; optionId?: number | null; optionName?: string | null; quantity?: number }) => void;
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

      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.prodId === product.id && item.optionId === product.optionId
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.prodId === product.id && item.optionId === product.optionId
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: Date.now(),
                prodId: product.id,
                name: product.name,
                price: product.basePrice,
                imageUrl: product.imageUrl,
                quantity: product.quantity || 1,
                optionId: product.optionId || null,
                optionName: product.optionName || null,
              },
            ],
          });
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
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
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
