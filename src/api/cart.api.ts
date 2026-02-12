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
   optionId: number;
   quantity: number;
   createdAt: string;
   updatedAt: string;

   product: {
      id: number;
      name: string;
      basePrice: number;
      imageUrl: string | null;
      summary: string | null;
      isDisplay: boolean;
      catId: number;
      images: any[];
   };
   option: {
      id: number;
      prodId: number;
      name: string;
      value: string;
      addPrice: number;
      stockQty: number;
      createdAt: string;
      updatedAt: string;
   } | null;
}

export const cartApi = {
   getCart: async () => {
      const { data } = await api.get<CartItemResponse[]>("/cart");
      return data;
   },
   addToCart: async (body: AddToCartInput) => {
      const { data } = await api.post<{
         message: string;
         data?: CartItemResponse;
      }>("/cart", body);
      return data;
   },
   updateCart: async (id: number, quantity: number) => {
      const { data } = await api.patch<{ message: string }>(`/cart/${id}`, {
         quantity,
      });
      return data;
   },
   removeFromCart: async (id: number) => {
      const { data } = await api.delete<{ message: string }>(`/cart/${id}`);
      return data;
   },
};
