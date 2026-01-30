import api from "./axios.ts";
import type {
   Product,
   ProductListParams,
   ProductListResponse,
} from "../types/product.ts";

export const getProduct = async (id: number) => {
   // 404 에러 대응: /api 접두어 제거
   const response = await api.get<{ data: Product }>(
      `/products/${id}`,
   );
   return response.data;
};

export const getProducts = async (params: ProductListParams) => {
   const queryParams: any = {};
   
   if (params.page) queryParams.page = params.page;
   if (params.limit) queryParams.limit = params.limit;
   if (params.search) queryParams.search = params.search;
   if (params.isDisplay) queryParams.isDisplay = params.isDisplay;
   
   if (params.catId !== undefined && params.catId !== null) {
      queryParams.catId = Number(params.catId);
   }

   // 404 에러 대응: /api 접두어 제거
   const response = await api.get<ProductListResponse>("/products", {
      params: queryParams,
   });
   return response.data;
};
