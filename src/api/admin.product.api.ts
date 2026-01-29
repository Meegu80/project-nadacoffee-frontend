import type {
   CreateProductInput,
   UpdateProductInput,
} from "../types/admin.product.ts";
import api from "./axios.ts";
import type { Product } from "../types/product.ts";

export const createProduct = async (body: CreateProductInput) => {
   const response = await api.post<{ message: string; data: Product }>(
      "/admin/products",
      body,
   );
   return response.data;
};

export const updateProduct = async (id: number, body: UpdateProductInput) => {
   const response = await api.put<{ message: string }>(
      `/admin/products/${id}`,
      body,
   );
   return response.data;
};

export const deleteProduct = async (id: number) => {
   const response = await api.delete<{ message: string }>(
      `/admin/products/${id}`,
   );
   return response.data;
};
