import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
   MdArrowBack,
   MdSave,
   MdAdd,
   MdDelete,
   MdInfoOutline,
   MdAttachMoney,
   MdInventory2,
   MdOutlineImageNotSupported,
} from "react-icons/md";

import { getProduct } from "../../../api/product.api.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import type { UpdateProductInput } from "../../../types/admin.product.ts";
import type { Category } from "../../../types/admin.category.ts";
import {
   deleteProduct,
   updateProduct,
} from "../../../api/admin.product.api.ts";
import { uploadImage } from "../../../api/upload.api.ts";
import { AxiosError } from "axios";

function AdminProductDetail() {
   const navigate = useNavigate();
   const location = useLocation();
   const { id } = useParams<{ id: string }>();
   const productId = Number(id);
   const queryClient = useQueryClient();

   // 현재 URL의 쿼리 스트링(필터 및 정렬 정보)을 그대로 보관
   const filterParams = location.search;

   const [uploading, setUploading] = useState(false);
   const [previewImage, setPreviewImage] = useState<string | null>(null);

   const {
      register,
      control,
      handleSubmit,
      setValue,
      reset,
      formState: { errors },
   } = useForm<UpdateProductInput>({
      defaultValues: {
         isDisplay: true,
         basePrice: 0,
         options: [],
      },
   });

   const { fields, append, remove } = useFieldArray({
      control,
      name: "options",
   });

   const { data: product, isLoading: isProductLoading } = useQuery({
      queryKey: ["products", productId],
      queryFn: () => getProduct(productId),
      enabled: !isNaN(productId),
   });

   const { data: categories } = useQuery({
      queryKey: ["admin", "categories", "tree"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   useEffect(() => {
      if (product) {
         reset({
            catId: product.data.catId,
            name: product.data.name,
            summary: product.data.summary || "",
            basePrice: product.data.basePrice,
            imageUrl: product.data.imageUrl,
            isDisplay: product.data.isDisplay,
            options: product.data.options?.map(opt => ({
               name: opt.name,
               value: opt.value,
               addPrice: opt.addPrice,
               stockQty: opt.stockQty,
            })) || [],
         });
         setPreviewImage(product.data.imageUrl);
      }
   }, [product, reset]);

   const updateMutation = useMutation({
      mutationFn: (data: UpdateProductInput) => updateProduct(productId, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products"] });
         alert("상품 정보가 수정되었습니다.");
         // 보관해둔 필터 파라미터를 붙여서 원래 페이지 상태로 복구
         navigate(`/admin/products${filterParams}`);
      },
      onError: (err) => {
         let message = "수정 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data.message;
         alert(message);
      },
   });

   const deleteMutation = useMutation({
      mutationFn: () => deleteProduct(productId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products"] });
         alert("상품이 삭제되었습니다.");
         navigate(`/admin/products${filterParams}`);
      },
      onError: (err) => {
         let message = "삭제 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data.message;
         alert(message);
      },
   });

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
         const url = await uploadImage(file, "products");
         setValue("imageUrl", url);
         setPreviewImage(url);
      } catch (error) {
         alert("이미지 업로드 실패");
      } finally {
         setUploading(false);
      }
   };

   const onSubmit: SubmitHandler<UpdateProductInput> = data => {
      if (!window.confirm("상품 정보를 수정하시겠습니까?")) return;
      const payload = {
         ...data,
         catId: Number(data.catId),
         basePrice: Number(data.basePrice),
         options: data.options?.map(opt => ({
            ...opt,
            addPrice: Number(opt.addPrice),
            stockQty: Number(opt.stockQty),
         })),
      };
      updateMutation.mutate(payload);
   };

   const handleDelete = () => {
      if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
         deleteMutation.mutate();
      }
   };

   const renderCategoryOptions = (cats: Category[], depth = 0): React.ReactNode[] => {
      let options: React.ReactNode[] = [];
      cats?.forEach(cat => {
         options.push(<option key={cat.id} value={cat.id}>{"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name}</option>);
         if (cat.categories) options.push(...renderCategoryOptions(cat.categories, depth + 1));
      });
      return options;
   };

   if (isProductLoading) return <div className="flex flex-col items-center justify-center py-40 gap-4"><div className="w-10 h-10 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" /><p className="text-gray-400 font-bold">상품 정보를 불러오는 중...</p></div>;

   return (
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"><MdArrowBack className="w-6 h-6" /></button>
               <div>
                  <h2 className="text-2xl font-black text-[#222222] tracking-tight">EDIT PRODUCT</h2>
                  <p className="text-sm text-gray-500 font-medium">상품 정보를 수정하거나 삭제합니다.</p>
               </div>
            </div>
            <button type="button" onClick={handleDelete} disabled={deleteMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"><MdDelete size={20} />{deleteMutation.isPending ? "삭제 중..." : "상품 삭제"}</button>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
                  <div className="flex items-center gap-2 mb-2"><div className="w-1 h-6 bg-[#FFD400] rounded-full"></div><h3 className="text-lg font-black text-[#222222]">기본 정보</h3></div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">카테고리</label>
                     <div className="relative">
                        <select className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold bg-white appearance-none transition-all" {...register("catId", { required: "카테고리를 선택해주세요." })}>
                           <option value="">카테고리 선택</option>
                           {categories && renderCategoryOptions(categories)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">상품명</label>
                     <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold transition-all" {...register("name", { required: "상품명은 필수입니다." })} />
                     {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">한줄 요약</label>
                     <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold transition-all" {...register("summary")} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">기본 가격</label>
                        <div className="relative">
                           <MdAttachMoney className="absolute left-3 top-3.5 text-gray-400" size={20} />
                           <input type="number" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold transition-all" {...register("basePrice", { required: "가격은 필수입니다.", min: 0 })} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">진열 상태</label>
                        <div className="relative">
                           <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold bg-white appearance-none transition-all" {...register("isDisplay")}>
                              <option value="true">진열함 (판매가능)</option>
                              <option value="false">숨김 (판매중지)</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2"><div className="w-1 h-6 bg-[#FFD400] rounded-full"></div><h3 className="text-lg font-black text-[#222222]">상품 옵션</h3></div>
                     <button type="button" onClick={() => append({ name: "", value: "", addPrice: 0, stockQty: 0 })} className="flex items-center gap-1 text-xs font-black text-[#222222] bg-[#FFD400] px-4 py-2 rounded-xl hover:bg-[#ffe14d] transition-all shadow-sm"><MdAdd size={16} /> 옵션 추가</button>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-xs font-bold flex items-center gap-2"><MdInfoOutline size={16} /><span>옵션 수정 시 기존 옵션은 삭제되고 새로 생성됩니다.</span></div>
                  {fields.length === 0 ? (
                     <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 flex flex-col items-center gap-2"><MdInventory2 size={32} className="opacity-20" /><span className="text-xs font-bold">등록된 옵션이 없습니다.</span></div>
                  ) : (
                     <div className="space-y-4">
                        {fields.map((field, index) => (
                           <div key={field.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group hover:border-gray-200 transition-colors">
                              <button type="button" onClick={() => remove(index)} className="absolute -right-2 -top-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"><MdDelete size={16} /></button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                 <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">옵션명</label><input placeholder="예: 용량" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none" {...register(`options.${index}.name` as const, { required: true })} /></div>
                                 <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">옵션값</label><input placeholder="예: 200g" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none" {...register(`options.${index}.value` as const, { required: true })} /></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">추가 금액</label><input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none text-right" {...register(`options.${index}.addPrice` as const)} /></div>
                                 <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase">재고 수량</label><input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none text-right" {...register(`options.${index}.stockQty` as const)} /></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-4">
                  <div className="flex items-center gap-2"><div className="w-1 h-6 bg-[#FFD400] rounded-full"></div><h3 className="text-lg font-black text-[#222222]">상품 이미지</h3></div>
                  <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FFD400] hover:bg-[#FFD400]/5 transition-all">
                     {previewImage ? <img src={previewImage} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-gray-400 group-hover:text-[#FFD400] transition-colors"><MdOutlineImageNotSupported size={48} className="mx-auto mb-2 opacity-30 group-hover:opacity-100 transition-opacity" /><p className="text-xs font-black">{uploading ? "업로드 중..." : "이미지 변경 (클릭)"}</p></div>}
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <input type="hidden" {...register("imageUrl")} />
               </div>
               <div className="bg-[#222222] text-white p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center gap-2"><MdInfoOutline className="text-[#FFD400]" size={20} /><h3 className="text-sm font-black">수정 확인</h3></div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">변경된 내용은 즉시 반영됩니다.</p>
                  <div className="flex gap-2 pt-2">
                     <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl border border-white/20 text-gray-300 font-bold hover:bg-white/10 text-xs transition-all">취소</button>
                     <button type="submit" disabled={updateMutation.isPending || uploading} className="flex-1 py-3 rounded-xl bg-[#FFD400] text-[#222222] font-black hover:bg-[#ffe14d] text-xs shadow-lg disabled:opacity-50 transition-all flex justify-center items-center gap-2">{updateMutation.isPending ? <div className="w-3 h-3 border-2 border-[#222222] border-t-transparent rounded-full animate-spin" /> : <MdSave size={16} />}{updateMutation.isPending ? "저장 중..." : "수정 저장"}</button>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}

export default AdminProductDetail;
