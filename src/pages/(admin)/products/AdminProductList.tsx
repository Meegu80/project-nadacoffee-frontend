import { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../../api/product.api.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import { deleteProduct } from "../../../api/admin.product.api.ts";
import type { Category } from "../../../types/admin.category.ts";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { MdAdd, MdSearch, MdFilterList, MdEdit, MdChevronLeft, MdChevronRight, MdOutlineImageNotSupported, MdRefresh, MdPlaylistAdd, MdArrowUpward, MdArrowDownward, MdDeleteOutline } from "react-icons/md";

function AdminProductList() {
   const navigate = useNavigate();
   const location = useLocation();
   const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

   const ITEMS_PER_PAGE = 25;
   const [page, setPage] = useState(Number(queryParams.get("page")) || 1);
   const [searchKeyword, setSearchKeyword] = useState(queryParams.get("search") || "");
   const [appliedSearch, setAppliedSearch] = useState(queryParams.get("search") || "");
   const [catId, setCatId] = useState(queryParams.get("catId") ? Number(queryParams.get("catId")) : undefined);

   const queryClient = useQueryClient();
   const [selectedIds, setSelectedIds] = useState<number[]>([]);

   // [추가] 정렬 상태 관리
   const [sortField, setSortField] = useState<string>("stock"); // 기본값: 재고순
   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   const pagination = response?.pagination;
   const totalPages = pagination?.totalPages || 1;

   // [수정] 정렬 로직 고도화 (인터랙티브 정렬 지원)
   const products = useMemo(() => {
      const data = response?.data || [];
      return [...data].sort((a, b) => {
         let valueA: any;
         let valueB: any;

         switch (sortField) {
            case "name":
               valueA = a.name.toLowerCase();
               valueB = b.name.toLowerCase();
               break;
            case "category":
               valueA = (a.category?.name || "").toLowerCase();
               valueB = (b.category?.name || "").toLowerCase();
               break;
            case "price":
               valueA = a.basePrice;
               valueB = b.basePrice;
               break;
            case "stock":
            default:
               valueA = a.options?.reduce((sum, opt) => sum + opt.stockQty, 0) || 0;
               valueB = b.options?.reduce((sum, opt) => sum + opt.stockQty, 0) || 0;
               break;
         }

         if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
         if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
         return 0;
      });
   }, [response?.data, sortField, sortOrder]);

   const handleSort = (field: string) => {
      if (sortField === field) {
         setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
         setSortField(field);
         setSortOrder("asc");
      }
   };

   const SortIcon = ({ field }: { field: string }) => {
      if (sortField !== field) return <div className="w-4" />;
      return sortOrder === "asc" ? <MdArrowUpward size={14} className="ml-1" /> : <MdArrowDownward size={14} className="ml-1" />;
   };

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

   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteProduct(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
      },
      onError: (err: any) => {
         alert(`삭제 실패: ${err.message}`);
      }
   });

   const handleDeleteIndividual = (id: number) => {
      if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
         deleteMutation.mutate(id);
      }
   };

   const handleDeleteSelected = async () => {
      if (selectedIds.length === 0) return;
      if (window.confirm(`선택한 ${selectedIds.length}개의 상품을 정말로 삭제하시겠습니까?`)) {
         try {
            for (const id of selectedIds) {
               await deleteProduct(id);
            }
            alert("선택한 상품이 삭제되었습니다.");
            setSelectedIds([]);
            queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
         } catch (err: any) {
            alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
         }
      }
   };

   const toggleSelectAll = () => {
      if (selectedIds.length === products.length) {
         setSelectedIds([]);
      } else {
         setSelectedIds(products.map(p => p.id));
      }
   };

   const toggleSelect = (id: number) => {
      if (selectedIds.includes(id)) {
         setSelectedIds(selectedIds.filter(idx => idx !== id));
      } else {
         setSelectedIds([...selectedIds, id]);
      }
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
               {selectedIds.length > 0 && (
                  <button onClick={handleDeleteSelected} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-sm font-black hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm border border-red-100">
                     <MdDeleteOutline size={20} /> 선택 삭제 ({selectedIds.length})
                  </button>
               )}
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
               <table className="w-full text-center">
                  <thead className="bg-gray-50/50 text-sm font-black text-[#222222] uppercase tracking-widest border-b border-gray-50">
                     <tr>
                        <th className="px-6 py-4 w-12 text-center">
                           <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-yellow"
                              checked={products.length > 0 && selectedIds.length === products.length}
                              onChange={toggleSelectAll}
                           />
                        </th>
                        <th className="px-6 py-4 w-32 text-center text-[#222222]">Image</th>
                        <th
                           className="px-6 py-4 w-48 cursor-pointer hover:text-brand-dark transition-colors"
                           onClick={() => handleSort("name")}
                        >
                           <div className="flex items-center justify-center">Product Info <SortIcon field="name" /></div>
                        </th>
                        <th
                           className="px-6 py-4 w-32 cursor-pointer hover:text-brand-dark transition-colors"
                           onClick={() => handleSort("category")}
                        >
                           <div className="flex items-center justify-center">Category <SortIcon field="category" /></div>
                        </th>
                        <th
                           className="px-6 py-4 w-28 cursor-pointer hover:text-brand-dark transition-colors"
                           onClick={() => handleSort("price")}
                        >
                           <div className="flex items-center justify-center">Price <SortIcon field="price" /></div>
                        </th>
                        <th
                           className="px-6 py-4 w-24 cursor-pointer hover:text-brand-dark transition-colors"
                           onClick={() => handleSort("stock")}
                        >
                           <div className="flex items-center justify-center">Stock <SortIcon field="stock" /></div>
                        </th>
                        <th className="px-6 py-4 w-48 text-center text-[#222222]">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {isLoading ? (
                        <tr><td colSpan={7} className="py-20 text-center text-gray-400 font-bold">로딩 중...</td></tr>
                     ) : products.length === 0 ? (
                        <tr><td colSpan={7} className="py-20 text-center text-gray-400 font-bold">검색 결과가 없습니다.</td></tr>
                     ) : products.map(product => {
                        const totalStock = product.options?.reduce((sum, opt) => sum + opt.stockQty, 0) || 0;
                        const isSelected = selectedIds.includes(product.id);
                        return (
                           <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors group ${isSelected ? "bg-brand-yellow/5" : ""}`}>
                              <td className="px-6 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-yellow"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(product.id)}
                                 />
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <div className="flex justify-center">
                                    <div
                                       className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                       onClick={() => navigate(`/products/${product.id}`)}
                                    >
                                       {product.imageUrl ? (
                                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                       ) : (
                                          <MdOutlineImageNotSupported className="text-gray-300" size={28} />
                                       )}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-[#222222] truncate max-w-[200px]">{product.name}</span>
                                    <span className="text-sm text-gray-400 mt-1 truncate max-w-[200px]">{product.summary || "-"}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-center"><span className="text-base font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg inline-block">{product.category?.name || "미지정"}</span></td>
                              <td className="px-6 py-4 text-center"><span className="text-base font-black text-[#222222]">{product.basePrice.toLocaleString()}원</span></td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`px-2.5 py-1.5 rounded-md text-sm font-black flex flex-col items-center text-center ${totalStock === 0 ? "bg-red-50 text-red-600" : totalStock <= 5 ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                                    {totalStock === 0 ? "품절" : totalStock <= 5 ? (<><span>재고부족</span><span>{totalStock}개</span></>) : `${totalStock}개`}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <div className="flex items-center justify-center gap-2 transition-opacity">
                                    <Link
                                       to={`/admin/products/${product.id}`}
                                       className="p-2.5 rounded-lg bg-gray-50 hover:bg-white text-gray-400 hover:text-[#222222] transition-all flex items-center gap-1 border border-transparent hover:border-gray-100 shadow-sm"
                                       title="수정"
                                    >
                                       <MdEdit size={20} />
                                       <span className="text-sm font-bold">수정</span>
                                    </Link>
                                    <button
                                       onClick={() => handleDeleteIndividual(product.id)}
                                       className="p-2.5 rounded-lg bg-gray-50 hover:bg-white text-gray-400 hover:text-red-500 transition-all flex items-center gap-1 border border-transparent hover:border-gray-100 shadow-sm"
                                       title="삭제"
                                    >
                                       <MdDeleteOutline size={20} />
                                       <span className="text-sm font-bold">삭제</span>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>

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
