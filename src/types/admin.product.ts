import type { ProductOption } from "./product.ts";

export interface CreateProductInput {
   catId: number;
   name: string;
   summary?: string;
   basePrice: number;
   imageUrl?: string | null;
   isDisplay?: boolean;
   options?: Omit<ProductOption, "id">[];
}

export interface UpdateProductInput {
   catId?: number;
   name?: string;
   summary?: string;
   basePrice?: number;
   imageUrl?: string | null;
   isDisplay?: boolean;
   options?: Omit<ProductOption, "id">[];
}
