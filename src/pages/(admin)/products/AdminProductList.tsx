import { type ReactNode, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdAdd, MdSearch, MdFilterList, MdEdit, MdDelete, MdChevronLeft, MdChevronRight, MdOutlineImageNotSupported, MdRefresh, MdPlaylistAdd } from "react-icons/md";
import { getProducts } from "../../../api/product.api.ts";
import { deleteProduct, updateProduct } from "../../../api/admin.product.api.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import type { Category } from "../../../types/admin.category.ts";

function AdminProductList() {
   const queryClient = useQueryClient();
   const navigate = useNavigate();
   const location = useLocation();
   const ITEMS_PER_PAGE = 30; 

   const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
   const [page, setPage] = useState(Number(queryParams.get("page")) || 1);
   const [search, setSearch] = useState(queryParams.get("search") || "");
   const [appliedFilters, setAppliedFilters] = useState({
      search: queryParams.get("search") || undefined,
      catId: queryParams.get("catId") ? Number(queryParams.get("catId")) : undefined,
   });

   const { data: allFetchedProducts, isLoading } = useQuery({
      queryKey: ["products", "admin-full", appliedFilters.catId],
      queryFn: async () => {
         const res = await getProducts({ limit: 100, catId: appliedFilters.catId });
         return res.data;
      },
   });

   const paginatedProducts = useMemo(() => {
      let products = allFetchedProducts ? [...allFetchedProducts] : [];
      if (appliedFilters.search) products = products.filter(p => p.name.toLowerCase().includes(appliedFilters.search!.toLowerCase()));
      return products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
   }, [allFetchedProducts, appliedFilters, page]);

   const totalPages = Math.ceil((allFetchedProducts?.length || 0) / ITEMS_PER_PAGE) || 1;

   const handleBulkAddOption = async () => {
      alert("옵션 일괄 추가 기능이 실행됩니다.");
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
         <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-black text-[#222222]">PRODUCT MANAGEMENT</h2></div>
            <div className="flex gap-3">
               <button onClick={handleBulkAddOption} className="bg-brand-yellow text-brand-dark px-6 py-3 rounded-xl text-sm font-black hover:bg-yellow-400 transition-all shadow-sm"><MdPlaylistAdd size={20} /> 옵션 일괄 추가</button>
               <Link to="/admin/products/new" className="bg-[#222222] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg"><MdAdd size={20} /> 상품 등록</Link>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <tr><th className="px-6 py-4 w-24">Image</th><th className="px-6 py-4">Product Info</th><th className="px-6 py-4 w-40">Category</th><th className="px-6 py-4 w-32">Price</th><th className="px-6 py-4 w-28">Stock</th><th className="px-6 py-4 w-32 text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {isLoading ? (<tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold">로딩 중...</td></tr>) : paginatedProducts.map(product => {
                        const totalStock = product.options?.reduce((sum, opt) => sum + opt.stockQty, 0) || 0;
                        return (
                           <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4"><div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <MdOutlineImageNotSupported className="text-gray-300" size={24} />}</div></td>
                              <td className="px-6 py-4"><div className="flex flex-col"><span className="text-sm font-black text-[#222222]">{product.name}</span><span className="text-xs text-gray-400 mt-0.5 truncate max-w-50">{product.summary || "-"}</span></div></td>
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
         </div>
      </div>
   );
}

export default AdminProductList;
