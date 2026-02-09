import { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { MdAdd, MdSearch, MdFilterList, MdEdit, MdChevronLeft, MdChevronRight, MdOutlineImageNotSupported, MdRefresh, MdPlaylistAdd } from "react-icons/md";
import { getProducts } from "../../../api/product.api.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import type { Category } from "../../../types/admin.category.ts";

function AdminProductList() {
   const navigate = useNavigate();
   const location = useLocation();
   const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

   const ITEMS_PER_PAGE = 25;
   const [page, setPage] = useState(Number(queryParams.get("page")) || 1);
   const [searchKeyword, setSearchKeyword] = useState(queryParams.get("search") || "");
   const [appliedSearch, setAppliedSearch] = useState(queryParams.get("search") || "");
   const [catId, setCatId] = useState(queryParams.get("catId") ? Number(queryParams.get("catId")) : undefined);

   // 서버 사이드 데이터 페칭
   const { data: response, isLoading } = useQuery({
      queryKey: ["products", "admin", page, appliedSearch, catId],
      queryFn: () => getProducts({
         page,
         limit: ITEMS_PER_PAGE,
         search: appliedSearch || undefined,
         catId: catId
      }),
   });

   // 카테고리 목록 페칭
   const { data: categories } = useQuery({
      queryKey: ["admin", "categories"],
      queryFn: () => adminCategoryApi.getCategories(),
   });

   const products = response?.data || [];
   const pagination = response?.pagination;
   const totalPages = pagination?.totalPages || 1;

   const handleSearch = (e?: React.FormEvent) => {
      e?.preventDefault();
      setAppliedSearch(searchKeyword);
      setPage(1);

      const params = new URLSearchParams();
      if (searchKeyword) params.set("search", searchKeyword);
      if (catId) params.set("catId", String(catId));
      params.set("page", "1");
      navigate({ search: params.toString() });
   };

   const handleCategoryChange = (newCatId: number | undefined) => {
      setCatId(newCatId);
      setPage(1);

      const params = new URLSearchParams();
      if (appliedSearch) params.set("search", appliedSearch);
      if (newCatId) params.set("catId", String(newCatId));
      params.set("page", "1");
      navigate({ search: params.toString() });
   };

   const handlePageChange = (newPage: number) => {
      setPage(newPage);
      const params = new URLSearchParams(location.search);
      params.set("page", String(newPage));
      navigate({ search: params.toString() });
      window.scrollTo(0, 0);
   };

   const handleBulkAddOption = async () => {
      alert("옵션 일괄 추가 기능이 실행됩니다.");
   };

   const renderCategoryOptions = (cats: Category[], depth = 0) => {
      const options: any[] = [];
      cats?.forEach(cat => {
         options.push(<option key={cat.id} value={cat.id}>{"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name}</option>);
         if (cat.categories) options.push(...renderCategoryOptions(cat.categories, depth + 1));
      });
      return options;
   };

   return (
      <div className="space-y-6 pb-20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><h2 className="text-2xl font-black text-[#222222]">PRODUCT MANAGEMENT</h2></div>
            <div className="flex flex-wrap gap-3">
               <button onClick={handleBulkAddOption} className="bg-brand-yellow text-brand-dark px-6 py-3 rounded-xl text-sm font-black hover:bg-yellow-400 transition-all shadow-sm flex items-center gap-2"><MdPlaylistAdd size={20} /> 옵션 일괄 추가</button>
               <Link to="/admin/products/new" className="bg-[#222222] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg flex items-center gap-2"><MdAdd size={20} /> 상품 등록</Link>
            </div>
         </div>

         {/* 검색 및 필터 바 */}
         <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
               <input
                  type="text"
                  placeholder="상품명을 입력하세요..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
               />
               <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#222222] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black">검색</button>
            </form>
            <div className="flex items-center gap-2">
               <MdFilterList className="text-gray-400" size={20} />
               <select
                  className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all min-w-[150px]"
                  value={catId || ""}
                  onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
               >
                  <option value="">전체 카테고리</option>
                  {categories && renderCategoryOptions(categories)}
               </select>
               <button
                  onClick={() => {
                     setSearchKeyword("");
                     setAppliedSearch("");
                     setCatId(undefined);
                     setPage(1);
                     navigate({ search: "" });
                  }}
                  className="p-3 text-gray-400 hover:text-[#222222] transition-colors"
                  title="필터 초기화"
               >
                  <MdRefresh size={20} />
               </button>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <tr><th className="px-6 py-4 w-24">Image</th><th className="px-6 py-4">Product Info</th><th className="px-6 py-4 w-40">Category</th><th className="px-6 py-4 w-32">Price</th><th className="px-6 py-4 w-28">Stock</th><th className="px-6 py-4 w-32 text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {isLoading ? (
                        <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold">로딩 중...</td></tr>
                     ) : products.length === 0 ? (
                        <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold">검색 결과가 없습니다.</td></tr>
                     ) : products.map(product => {
                        const totalStock = product.options?.reduce((sum, opt) => sum + opt.stockQty, 0) || 0;
                        return (
                           <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4"><div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <MdOutlineImageNotSupported className="text-gray-300" size={24} />}</div></td>
                              <td className="px-6 py-4"><div className="flex flex-col"><span className="text-sm font-black text-[#222222]">{product.name}</span><span className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{product.summary || "-"}</span></div></td>
                              <td className="px-6 py-4"><span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">{product.category?.name || "미지정"}</span></td>
                              <td className="px-6 py-4"><span className="text-sm font-black text-[#222222]">{product.basePrice.toLocaleString()}원</span></td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded-md text-[10px] font-black flex flex-col items-center text-center ${totalStock === 0 ? "bg-red-50 text-red-600" : totalStock <= 5 ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                                    {totalStock === 0 ? "품절" : totalStock <= 5 ? (<><span>재고부족</span><span>{totalStock}개</span></>) : `${totalStock}개`}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><Link to={`/admin/products/${product.id}`} className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-[#222222] transition-all"><MdEdit size={18} /></Link></div></td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>

            {/* 페이지네이션 UI */}
            {!isLoading && totalPages > 1 && (
               <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-gray-50">
                  <button
                     onClick={() => handlePageChange(page - 1)}
                     disabled={page === 1}
                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                     <MdChevronLeft size={24} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                     <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${p === page ? "bg-brand-yellow text-brand-dark shadow-sm" : "hover:bg-gray-100 text-gray-400"}`}
                     >
                        {p}
                     </button>
                  ))}
                  <button
                     onClick={() => handlePageChange(page + 1)}
                     disabled={page === totalPages}
                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                     <MdChevronRight size={24} />
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}

export default AdminProductList;
