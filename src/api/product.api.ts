import api from "./axios.ts";
import type {
   Product,
   ProductListParams,
   ProductListResponse,
} from "../types/product.ts";

export const getProduct = async (id: number) => {
   const response = await api.get<{ message: string; data: Product }>(
      `/products/${id}`,
   );
   return response.data;
};

export const getProducts = async (params: ProductListParams) => {
   const response = await api.get<ProductListResponse>("/products", {
      params,
   });
   return response.data;
};
