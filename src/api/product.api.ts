import api from "./axios.ts";
import type {
   Product,
   ProductListParams,
   ProductListResponse,
} from "../types/product.ts";

export const getProduct = async (id: number) => {
   const response = await api.get<{ data: Product }>(
      `/products/${id}`,
   );
   return response.data;
};

export const getProducts = async (params: ProductListParams) => {
   const queryParams: Record<string, string | number | boolean> = {};

   if (params.page) queryParams.page = params.page;
   if (params.limit) queryParams.limit = params.limit;
   if (params.search) queryParams.search = params.search;
   if (params.isDisplay) queryParams.isDisplay = params.isDisplay;
   if (params.sort) queryParams.sort = params.sort; // [추가] 정렬 파라미터

   if (params.catId !== undefined && params.catId !== null) {
      queryParams.catId = Number(params.catId);
   }

   const response = await api.get<ProductListResponse>("/products", {
      params: queryParams,
   });
   return response.data;
};
