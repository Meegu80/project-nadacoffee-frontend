import { type ReactNode, useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
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
   MdLayers,
   MdSwapVert,
   MdArrowUpward,
   MdArrowDownward,
   MdRefresh
} from "react-icons/md";
import { getProducts } from "../../../api/product.api.ts";
import { deleteProduct } from "../../../api/admin.product.api.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import type { Category } from "../../../types/admin.category.ts";
import { AxiosError } from "axios";

function AdminProductList() {
   const queryClient = useQueryClient();
   const navigate = useNavigate();
   const location = useLocation();
   const ITEMS_PER_PAGE = 30; 

   // URL 쿼리 파라미터에서 모든 상태 복원
   const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
   
   const [page, setPage] = useState(Number(queryParams.get("page")) || 1);
   const [search, setSearch] = useState(queryParams.get("search") || "");
   const [minPrice, setMinPrice] = useState(queryParams.get("minPrice") || "");
   const [maxPrice, setMaxPrice] = useState(queryParams.get("maxPrice") || "");
   
   const [appliedFilters, setAppliedFilters] = useState({
      search: queryParams.get("search") || undefined,
      minPrice: queryParams.get("minPrice") ? Number(queryParams.get("minPrice")) : undefined,
      maxPrice: queryParams.get("maxPrice") ? Number(queryParams.get("maxPrice")) : undefined,
      catId: queryParams.get("catId") ? Number(queryParams.get("catId")) : undefined,
      isDisplay: (queryParams.get("isDisplay") as "true" | "false") || undefined
   });

   const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
      key: queryParams.get("sortKey") || 'basePrice',
      direction: (queryParams.get("sortDir") as 'asc' | 'desc') || null
   });

   // 상태가 변경될 때마다 URL 업데이트
   const updateURL = (newParams: Record<string, any>) => {
      const params = new URLSearchParams(location.search);
      Object.entries(newParams).forEach(([key, value]) => {
         if (value === undefined || value === "") params.delete(key);
         else params.set(key, value.toString());
      });
      navigate({ search: params.toString() }, { replace: true });
   };

   const handlePageChange = (newPage: number) => {
      setPage(newPage);
      updateURL({ page: newPage });
      setSelectedIds([]);
   };

   const [selectedIds, setSelectedIds] = useState<number[]>([]);

   // 1. 상품 목록 조회 (다중 호출 로직 유지)
   const { data: allFetchedProducts, isLoading, isError } = useQuery({
      queryKey: ["products", "admin-full-fetch", appliedFilters.catId, appliedFilters.isDisplay],
      queryFn: async () => {
         const res1 = await getProducts({ limit: 100, catId: appliedFilters.catId, isDisplay: appliedFilters.isDisplay });
         let allData = [...res1.data];
         if (res1.pagination.total > 100) {
            const res2 = await getProducts({ page: 2, limit: 100, catId: appliedFilters.catId, isDisplay: appliedFilters.isDisplay });
            allData = [...allData, ...res2.data];
         }
         if (res1.pagination.total > 200) {
            const res3 = await getProducts({ page: 3, limit: 100, catId: appliedFilters.catId, isDisplay: appliedFilters.isDisplay });
            allData = [...allData, ...res3.data];
         }
         return allData;
      },
   });

   // 2. 필터링 및 정렬
   const processedProducts = useMemo(() => {
      let products = allFetchedProducts ? [...allFetchedProducts] : [];
      if (appliedFilters.search) {
         const term = appliedFilters.search.toLowerCase();
         products = products.filter(p => p.name.toLowerCase().includes(term));
      }
      if (appliedFilters.minPrice !== undefined) products = products.filter(p => p.basePrice >= (appliedFilters.minPrice || 0));
      if (appliedFilters.maxPrice !== undefined) products = products.filter(p => p.basePrice <= (appliedFilters.maxPrice || Infinity));

      if (sortConfig.direction !== null) {
         products.sort((a: any, b: any) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
         });
      }
      return products;
   }, [allFetchedProducts, appliedFilters, sortConfig]);

   const paginatedProducts = useMemo(() => {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      return processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
   }, [processedProducts, page]);

   const totalItems = processedProducts.length;
   const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

   const handleSort = (key: string) => {
      let direction: 'asc' | 'desc' | null = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
      
      setSortConfig({ key, direction });
      updateURL({ sortKey: key, sortDir: direction || "", page: 1 });
      setPage(1);
   };

   const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newFilters = {
         search: search || undefined,
         minPrice: minPrice ? Number(minPrice) : undefined,
         maxPrice: maxPrice ? Number(maxPrice) : undefined
      };
      setAppliedFilters(prev => ({ ...prev, ...newFilters }));
      updateURL({ ...newFilters, page: 1 });
      setPage(1);
   };

   const resetFilters = () => {
      setSearch(""); setMinPrice(""); setMaxPrice("");
      setAppliedFilters({ search: undefined, minPrice: undefined, maxPrice: undefined, catId: undefined, isDisplay: undefined });
      navigate({ search: "" }, { replace: true });
      setPage(1);
   };

   const { data: categories } = useQuery({
      queryKey: ["admin", "categories", "tree"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteProduct(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products"] });
         alert("상품이 삭제되었습니다.");
      },
   });

   const handleBulkDelete = async () => {
      if (!window.confirm(`선택한 ${selectedIds.length}개의 상품을 정말 삭제하시겠습니까?`)) return;
      try {
         for (const id of selectedIds) await deleteProduct(id);
         alert("선택한 상품이 모두 삭제되었습니다.");
         setSelectedIds([]);
         queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (err) {
         alert("일부 상품 삭제 중 오류가 발생했습니다.");
      }
   };

   const toggleSelectAll = () => {
      if (selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0) setSelectedIds([]);
      else setSelectedIds(paginatedProducts.map(p => p.id));
   };

   const toggleSelect = (id: number) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
   };

   const renderCategoryOptions = (cats: Category[], depth = 0): ReactNode[] => {
      const options: ReactNode[] = [];
      cats?.forEach(cat => {
         options.push(<option key={cat.id} value={cat.id}>{"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name}</option>);
         if (cat.categories) options.push(...renderCategoryOptions(cat.categories, depth + 1));
      });
      return options;
   };

   return (
      <div className="space-y-6 pb-20">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-black text-[#222222] tracking-tight">PRODUCT MANAGEMENT</h2>
               <p className="text-sm text-gray-500 mt-1 font-medium">모든 검색 및 정렬 조건이 유지됩니다. (총 {totalItems}개)</p>
            </div>
            <div className="flex gap-3">
               {selectedIds.length > 0 && (
                  <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-xl text-sm font-black hover:bg-red-100 transition-all shadow-sm">
                     <MdDelete size={20} /> {selectedIds.length}개 삭제
                  </button>
               )}
               <Link to="/admin/products/new" className="flex items-center gap-2 bg-[#222222] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg shadow-black/10">
                  <MdAdd size={20} /> 상품 등록
               </Link>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-6">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
               <div className="md:col-span-2 relative">
                  <MdSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input type="text" placeholder="상품명 검색..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold text-sm" />
               </div>
               <div className="flex items-center gap-2 md:col-span-2">
                  <input type="number" placeholder="최소 가격" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm" />
                  <span className="text-gray-300">~</span>
                  <input type="number" placeholder="최대 가격" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm" />
               </div>
               <div className="relative">
                  <select value={appliedFilters.catId ?? ""} onChange={e => { 
                     const val = e.target.value ? Number(e.target.value) : undefined;
                     setAppliedFilters(prev => ({...prev, catId: val})); 
                     updateURL({ catId: val || "", page: 1 });
                     setPage(1);
                  }} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm appearance-none bg-white cursor-pointer">
                     <option value="">전체 카테고리</option>
                     {categories && renderCategoryOptions(categories)}
                  </select>
                  <MdFilterList className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
               </div>
               <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-[#222222] text-white rounded-xl font-black text-sm hover:bg-black transition-colors">검색</button>
                  <button type="button" onClick={resetFilters} className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors" title="초기화"><MdRefresh size={20} /></button>
               </div>
            </form>
         </div>

         <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <tr>
                        <th className="px-6 py-4 w-12">
                           <input type="checkbox" checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length} onChange={toggleSelectAll} className="w-4 h-4 accent-brand-dark cursor-pointer" />
                        </th>
                        <th className="px-6 py-4 w-24">Image</th>
                        <th className="px-6 py-4">Product Info</th>
                        <th className="px-6 py-4 w-40">Category</th>
                        <th className="px-6 py-4 w-32 cursor-pointer hover:text-[#222222] transition-colors group" onClick={() => handleSort('basePrice')}>
                           <div className="flex items-center gap-1">
                              Price
                              {sortConfig.key === 'basePrice' && (
                                 sortConfig.direction === 'asc' ? <MdArrowUpward className="text-[#FFD400]" /> : 
                                 sortConfig.direction === 'desc' ? <MdArrowDownward className="text-[#FFD400]" /> : null
                              )}
                              {sortConfig.direction === null && <MdSwapVert className="opacity-0 group-hover:opacity-100" />}
                           </div>
                        </th>
                        <th className="px-6 py-4 w-28">Status</th>
                        <th className="px-6 py-4 w-32 text-center">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {isLoading ? (
                        <tr><td colSpan={7} className="py-20 text-center"><div className="flex justify-center items-center gap-3"><div className="w-6 h-6 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" /><span className="text-gray-400 font-bold">데이터를 불러오는 중...</span></div></td></tr>
                     ) : paginatedProducts.length === 0 ? (
                        <tr><td colSpan={7} className="py-20 text-center text-gray-400 font-bold">조건에 맞는 상품이 없습니다.</td></tr>
                     ) : (
                        paginatedProducts.map(product => (
                           <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(product.id) ? 'bg-yellow-50/30' : ''}`}>
                              <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 accent-brand-dark cursor-pointer" /></td>
                              <td className="px-6 py-4"><div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <MdOutlineImageNotSupported className="text-gray-300" size={24} />}</div></td>
                              <td className="px-6 py-4"><div className="flex flex-col"><span className="text-sm font-black text-[#222222]">{product.name}</span><span className="text-xs text-gray-400 mt-0.5 truncate max-w-50">{product.summary || "-"}</span></div></td>
                              <td className="px-6 py-4"><span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">{product.category?.name || "미지정"}</span></td>
                              <td className="px-6 py-4"><span className="text-sm font-black text-[#222222]">{product.basePrice.toLocaleString()}원</span></td>
                              <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-black ${product.isDisplay ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{product.isDisplay ? "진열중" : "숨김"}</span></td>
                              <td className="px-6 py-4 text-center">
                                 <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* 현재 URL의 모든 쿼리 스트링을 그대로 전달 */}
                                    <Link to={`/admin/products/${product.id}${location.search}`} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-[#222222] transition-all" title="수정"><MdEdit size={18} /></Link>
                                    <button onClick={() => deleteMutation.mutate(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all" title="삭제"><MdDelete size={18} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {totalPages > 0 && (
               <div className="px-6 py-8 border-t border-gray-50 bg-gray-50/30 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-1">
                     <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 disabled:opacity-30 transition-all mr-2"><MdChevronLeft size={24} /></button>
                     <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                           <button key={num} onClick={() => handlePageChange(num)} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === num ? "bg-[#222222] text-white shadow-lg shadow-black/20" : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"}`}>{num}</button>
                        ))}
                     </div>
                     <button onClick={() => handlePageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 disabled:opacity-30 transition-all ml-2"><MdChevronRight size={24} /></button>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total {totalItems} Items | Page {page} of {totalPages}</span>
               </div>
            )}
         </div>
      </div>
   );
}

export default AdminProductList;
