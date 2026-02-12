export interface ProductOption {
   id?: number;
   name: string;
   value: string;
   addPrice: number;
   stockQty: number;
}

export interface CategorySimple {
   id: number;
   name: string;
}

export interface Product {
   id: number;
   name: string;
   summary: string | null;
   basePrice: number;
   imageUrl: string | null;
   imageUrls?: string[]; // [추가] 정식 다중 이미지 필드
   isDisplay: boolean;
   catId: number;

   category?: CategorySimple;
   options?: ProductOption[];

   createdAt: string;
   updatedAt: string;
}

export interface PaginationMeta {
   total: number;
   totalPages: number;
   currentPage: number;
   limit: number;
}

export interface ProductListResponse {
   data: Product[];
   pagination: PaginationMeta;
}

export interface ProductListParams {
   page?: number;
   limit?: number;
   search?: string;
   catId?: number;
   isDisplay?: "true" | "false";
}
