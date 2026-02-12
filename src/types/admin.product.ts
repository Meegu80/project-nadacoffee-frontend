import type { ProductOption } from "./product.ts";

export interface CreateProductInput {
   catId: number;
   name: string;
   summary?: string;
   basePrice: number;
   imageUrl?: string | null; // 대표 이미지 (하위 호환 유지)
   imageUrls?: string[];     // [추가] 다중 이미지 배열
   isDisplay?: boolean;
   options?: Omit<ProductOption, "id">[];
}

export interface UpdateProductInput {
   catId?: number;
   name?: string;
   summary?: string;
   basePrice?: number;
   imageUrl?: string | null;
   imageUrls?: string[];     // [추가] 다중 이미지 배열
   isDisplay?: boolean;
   options?: Omit<ProductOption, "id">[];
}
