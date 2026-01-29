import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   MdAdd,
   MdSearch,
   MdFilterList,
   MdEdit,
   MdDelete,
   MdChevronLeft,
   MdChevronRight,
   MdOutlineImageNotSupported,
} from "react-icons/md";
import { getProducts } from "../../../api/product.api.ts"; // 공용 API (조회)
import { deleteProduct } from "../../../api/admin.product.api.ts"; // 관리자 API (삭제)
import { adminCategoryApi } from "../../../api/admin.category.api.ts"; // 카테고리 트리용
import type { Category } from "../../../types/admin.category.ts";
import { AxiosError } from "axios";

function AdminProductList() {
   const queryClient = useQueryClient();

   // Filter States (undefined로 초기화하여 API 요청 시 키가 제외되도록 함)
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState<string>(""); // 입력 필드용
   const [appliedSearch, setAppliedSearch] = useState<string | undefined>(
      undefined,
   ); // 실제 검색용
   const [catId, setCatId] = useState<number | undefined>(undefined);
   const [isDisplay, setIsDisplay] = useState<"true" | "false" | undefined>(
      undefined,
   );

   // 1. 상품 목록 조회 (React Query)
   const { data, isLoading } = useQuery({
      queryKey: ["products", { page, search: appliedSearch, catId, isDisplay }],
      queryFn: () =>
         getProducts({
            page,
            limit: 10,
            search: appliedSearch,
            catId,
            isDisplay,
         }),
      placeholderData: previousData => previousData, // 페이지 전환 시 깜빡임 방지
   });

   // 2. 카테고리 목록 조회 (필터용)
   const { data: categories } = useQuery({
      queryKey: ["admin", "categories", "tree"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   // 3. 상품 삭제 Mutation
   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteProduct(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products"] });
         alert("상품이 삭제되었습니다.");
      },
      onError: (err) => {
         let message = "삭제 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data.message;
         alert(message);
      },
   });

   // 핸들러
   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setAppliedSearch(search || undefined);
      setPage(1);
   };

   const handleDelete = (id: number, name: string) => {
      if (window.confirm(`[${name}] 상품을 정말 삭제하시겠습니까?`)) {
         deleteMutation.mutate(id);
      }
   };

   // 카테고리 옵션 렌더링 (Flatten)
   const renderCategoryOptions = (
      cats: Category[],
      depth = 0,
   ): ReactNode[] => {
      const options: ReactNode[] = [];
      cats?.forEach(cat => {
         options.push(
            <option key={cat.id} value={cat.id}>
               {"\u00A0".repeat(depth * 4)}
               {depth > 0 ? "└ " : ""}
               {cat.name}
            </option>,
         );
         if (cat.categories)
            options.push(...renderCategoryOptions(cat.categories, depth + 1));
      });
      return options;
   };

   return (
      <div className="space-y-6 pb-20">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-black text-[#222222] tracking-tight">
                  PRODUCT MANAGEMENT
               </h2>
               <p className="text-sm text-gray-500 mt-1 font-medium">
                  등록된 상품을 조회하고 관리합니다.
               </p>
            </div>
            <Link
               to="/admin/products/new"
               className="flex items-center gap-2 bg-[#222222] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg shadow-black/10">
               <MdAdd size={20} />
               상품 등록
            </Link>
         </div>

         {/* Filter Bar */}
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <form
               onSubmit={handleSearch}
               className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <MdSearch
                     className="absolute left-4 top-3.5 text-gray-400"
                     size={20}
                  />
                  <input
                     type="text"
                     placeholder="상품명 검색..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold text-sm"
                  />
               </div>
               <div className="flex gap-4">
                  {/* Category Filter */}
                  <div className="relative min-w-40">
                     <select
                        value={catId ?? ""}
                        onChange={e => {
                           setCatId(
                              e.target.value
                                 ? Number(e.target.value)
                                 : undefined,
                           );
                           setPage(1);
                        }}
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold text-sm appearance-none bg-white cursor-pointer">
                        <option value="">전체 카테고리</option>
                        {categories && renderCategoryOptions(categories)}
                     </select>
                     <MdFilterList className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Display Status Filter */}
                  <div className="relative min-w-35">
                     <select
                        value={isDisplay ?? ""}
                        onChange={e => {
                           // 값이 있으면 "true"|"false", 없으면 undefined
                           setIsDisplay(
                              e.target.value
                                 ? (e.target.value as "true" | "false")
                                 : undefined,
                           );
                           setPage(1);
                        }}
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold text-sm appearance-none bg-white cursor-pointer">
                        <option value="">전체 상태</option>
                        <option value="true">진열중</option>
                        <option value="false">숨김</option>
                     </select>
                     <MdFilterList className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                  </div>

                  <button
                     type="submit"
                     className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#222222] rounded-xl font-bold text-sm transition-colors">
                     검색
                  </button>
               </div>
            </form>
         </div>

         {/* Product Table */}
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <tr>
                        <th className="px-6 py-4 w-24">Image</th>
                        <th className="px-6 py-4">Product Info</th>
                        <th className="px-6 py-4 w-40">Category</th>
                        <th className="px-6 py-4 w-32">Price</th>
                        <th className="px-6 py-4 w-28">Status</th>
                        <th className="px-6 py-4 w-32 text-center">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {isLoading ? (
                        <tr>
                           <td colSpan={6} className="py-20 text-center">
                              <div className="flex justify-center items-center gap-3">
                                 <div className="w-6 h-6 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" />
                                 <span className="text-gray-400 font-bold">
                                    상품 정보를 불러오는 중...
                                 </span>
                              </div>
                           </td>
                        </tr>
                     ) : !data?.data || data.data.length === 0 ? (
                        <tr>
                           <td
                              colSpan={6}
                              className="py-20 text-center text-gray-400 font-bold">
                              조건에 맞는 상품이 없습니다.
                           </td>
                        </tr>
                     ) : (
                        data.data.map(product => (
                           <tr
                              key={product.id}
                              className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                 <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                                    {product.imageUrl ? (
                                       <img
                                          src={product.imageUrl}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                       />
                                    ) : (
                                       <MdOutlineImageNotSupported
                                          className="text-gray-300"
                                          size={24}
                                       />
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-[#222222]">
                                       {product.name}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-0.5 truncate max-w-50">
                                       {product.summary || "-"}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                                    {product.category?.name || "미지정"}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="text-sm font-black text-[#222222]">
                                    {product.basePrice.toLocaleString()}원
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <span
                                    className={`px-2 py-1 rounded-md text-[10px] font-black ${
                                       product.isDisplay
                                          ? "bg-green-50 text-green-600"
                                          : "bg-red-50 text-red-600"
                                    }`}>
                                    {product.isDisplay ? "진열중" : "숨김"}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                       to={`/admin/products/${product.id}`}
                                       className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-[#222222] transition-all"
                                       title="수정">
                                       <MdEdit size={18} />
                                    </Link>
                                    <button
                                       onClick={() =>
                                          handleDelete(product.id, product.name)
                                       }
                                       className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                       title="삭제">
                                       <MdDelete size={18} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 0 && (
               <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">
                     Total {data.pagination.total} Items
                  </span>
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 disabled:opacity-30 transition-all">
                        <MdChevronLeft size={20} />
                     </button>
                     <span className="text-xs font-black text-[#222222] bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                        Page {page} / {data.pagination.totalPages}
                     </span>
                     <button
                        onClick={() =>
                           setPage(p =>
                              Math.min(data.pagination.totalPages, p + 1),
                           )
                        }
                        disabled={page === data.pagination.totalPages}
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 disabled:opacity-30 transition-all">
                        <MdChevronRight size={20} />
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

export default AdminProductList;
