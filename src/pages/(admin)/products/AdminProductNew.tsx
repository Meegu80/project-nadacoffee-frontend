import { type ChangeEvent, type ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useFieldArray, type SubmitHandler, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
   MdArrowBack, MdSave, MdCloudUpload, MdAdd, MdDelete, MdAttachMoney, MdInventory2, MdClose
} from "react-icons/md";
import { Loader2 } from "lucide-react";
import type { CreateProductInput } from "../../../types/admin.product.ts";
import type { Category } from "../../../types/admin.category.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import { createProduct } from "../../../api/admin.product.api.ts";
import { uploadImage } from "../../../api/upload.api.ts";
import { AxiosError } from "axios";
import WebEditor from "../../../components/common/WebEditor.tsx";
import { useAlertStore } from "../../../stores/useAlertStore";
import { twMerge } from "tailwind-merge";

function AdminProductNew() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { showAlert } = useAlertStore();
   const [uploading, setUploading] = useState(false);
   const [imageUrls, setImageUrls] = useState<string[]>([]);

   const { register, control, handleSubmit, formState: { errors } } = useForm<CreateProductInput>({
      defaultValues: { isDisplay: true, basePrice: 0, options: [], summary: "" }
   });

   const { fields, append, remove } = useFieldArray({ control, name: "options" });

   const { data: categories } = useQuery({
      queryKey: ["admin", "categories", "tree"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   const mutation = useMutation({
      mutationFn: (data: any) => createProduct(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products"] });
         showAlert("상품이 성공적으로 등록되었습니다.", "성공", "success");
         navigate("/admin/products");
      },
      onError: (err) => {
         let message = "상품 등록 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data.message || err.message;
         showAlert(message, "실패", "error");
      }
   });

   const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      if (imageUrls.length + files.length > 5) {
         showAlert("이미지는 최대 5장까지 업로드 가능합니다.", "알림", "warning");
         return;
      }

      setUploading(true);
      try {
         const newUrls = await Promise.all(
            Array.from(files).map(file => uploadImage(file, "products"))
         );
         setImageUrls(prev => [...prev, ...newUrls]);
      } catch (error) {
         showAlert("이미지 업로드에 실패했습니다.", "실패", "error");
      } finally {
         setUploading(false);
      }
   };

   const removeImage = (index: number) => {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
   };

   const onSubmit: SubmitHandler<CreateProductInput> = (data) => {
      const payload = {
         catId: Number(data.catId),
         name: data.name.trim(),
         summary: data.summary || "",
         basePrice: Number(data.basePrice),
         imageUrl: imageUrls[0] || "", // 대표 이미지
         isDisplay: String(data.isDisplay) === "true",
         options: data.options?.map(opt => ({
            name: opt.name.trim(),
            value: opt.value.trim(),
            addPrice: Number(opt.addPrice || 0),
            stockQty: Number(opt.stockQty || 0)
         })) || []
      };

      // 다중 이미지 꼼수 저장 (summary 하단에 숨김 처리)
      if (imageUrls.length > 1) {
         const extraImagesHtml = imageUrls.slice(1).map(url => `<img src="${url}" style="width:100%; margin-top:10px;" />`).join('');
         payload.summary = (payload.summary || "") + `<div class="extra-images" style="display:none;">${extraImagesHtml}</div>`;
      }

      mutation.mutate(payload);
   };

   const renderCategoryOptions = (cats: Category[], depth = 0): React.ReactNode[] => {
      const options: ReactNode[] = [];
      cats?.forEach(cat => {
         options.push(
            <option key={cat.id} value={cat.id}>
               {"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name}
            </option>
         );
         if (cat.categories && cat.categories.length > 0) {
            options.push(...renderCategoryOptions(cat.categories, depth + 1));
         }
      });
      return options;
   };

   return (
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"><MdArrowBack size={24} /></button>
            <h2 className="text-2xl font-black text-[#222222] tracking-tight uppercase italic">New Product</h2>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 기본 정보 */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-8">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-8 bg-brand-yellow rounded-full"></div>
                  <h3 className="text-xl font-black text-brand-dark">기본 정보</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">카테고리 <span className="text-red-500">*</span></label>
                     <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("catId", { required: true })}>
                        <option value="">카테고리 선택</option>
                        {categories && renderCategoryOptions(categories)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">상품명 <span className="text-red-500">*</span></label>
                     <input type="text" placeholder="상품명을 입력하세요" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("name", { required: true })} />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">상품 설명</label>
                  <Controller name="summary" control={control} render={({ field }) => <WebEditor value={field.value || ""} onChange={field.onChange} placeholder="상품에 대한 상세 설명을 입력하세요." />} />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">기본 가격 <span className="text-red-500">*</span></label>
                     <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("basePrice", { required: true })} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">진열 상태</label>
                     <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("isDisplay")}>
                        <option value="true">진열함</option>
                        <option value="false">숨김</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-6">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-8 bg-brand-yellow rounded-full"></div>
                     <h3 className="text-xl font-black text-brand-dark">상품 이미지 (최대 5장)</h3>
                  </div>
                  <span className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-1 rounded-full">{imageUrls.length} / 5</span>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {imageUrls.map((url, idx) => (
                     <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 group shadow-sm">
                        <img src={url} className="w-full h-full object-cover" alt="product" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><MdClose size={32} /></button>
                        {idx === 0 && <span className="absolute top-3 left-3 bg-brand-yellow text-brand-dark text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">대표</span>}
                     </div>
                  ))}
                  {imageUrls.length < 5 && (
                     <label className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-gray-400 group">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        {uploading ? <Loader2 size={32} className="animate-spin text-brand-yellow" /> : <MdCloudUpload size={40} className="group-hover:text-brand-yellow transition-colors" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">이미지 추가</span>
                     </label>
                  )}
               </div>
            </div>

            {/* 옵션 관리 */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-6">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-1.5 h-8 bg-brand-yellow rounded-full"></div>
                     <h3 className="text-xl font-black text-brand-dark">상품 옵션</h3>
                  </div>
                  <button type="button" onClick={() => append({ name: "온도", value: "HOT", addPrice: 0, stockQty: 100 })} className="bg-brand-dark text-brand-yellow px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg hover:bg-black transition-all flex items-center gap-2"><MdAdd size={18} /> 옵션 추가하기</button>
               </div>
               {fields.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-[30px] border border-dashed border-gray-200 text-gray-400"><MdInventory2 size={48} className="mx-auto mb-4 opacity-20" /><p className="font-bold">등록된 옵션이 없습니다.</p></div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {fields.map((field, index) => (
                        <div key={field.id} className="p-6 bg-gray-50 rounded-[30px] border border-gray-100 relative group hover:border-brand-yellow/30 transition-all">
                           <button type="button" onClick={() => remove(index)} className="absolute -right-2 -top-2 bg-white text-red-500 p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 border border-gray-100"><MdDelete size={18} /></button>
                           <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <input placeholder="옵션명 (예: 온도)" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.name` as const, { required: true })} />
                                 <input placeholder="옵션값 (예: ICE)" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.value` as const, { required: true })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <input type="number" placeholder="추가금액" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.addPrice` as const)} />
                                 <input type="number" placeholder="재고" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.stockQty` as const)} />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="pt-4">
               <button type="submit" disabled={mutation.isPending || uploading} className="w-full py-6 bg-brand-dark text-brand-yellow rounded-[30px] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50">
                  {mutation.isPending ? <Loader2 className="animate-spin" size={28} /> : <MdSave size={28} />}
                  {mutation.isPending ? "상품 정보를 저장하는 중..." : "새 상품 등록 완료"}
               </button>
            </div>
         </form>
      </div>
   );
}

export default AdminProductNew;
