import type { ProductOption } from "./product.ts";

export interface CreateProductInput {
   catId: number;
   name: string;
   summary?: string;
   basePrice: number;
   imageUrl?: string | null; // 대표 이미지
   images?: string[];        // [수정] 상세 이미지 URL 리스트 (string[])
   isDisplay?: boolean;
   options?: Omit<ProductOption, "id">[];
}

export interface UpdateProductInput {
   catId?: number;
   name?: string;
   summary?: string;
   basePrice?: number;
   imageUrl?: string | null;
   images?: string[];        // [수정] 상세 이미지 URL 리스트 (string[])
   isDisplay?: boolean;
   options?: ProductOption[];
}
