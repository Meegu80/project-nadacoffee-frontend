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

// [추가] 상세 이미지 객체 타입
export interface ProductImage {
   id: number;
   url: string;
}

export interface Product {
   id: number;
   name: string;
   summary: string | null;
   basePrice: number;
   imageUrl: string | null; // 대표 이미지
   images: ProductImage[];  // [수정] 상세 이미지 객체 배열
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
   catId?: number | null;
   isDisplay?: "true" | "false";
   sort?: "latest" | "price_asc" | "price_desc"; // [추가] 정렬 파라미터
}
