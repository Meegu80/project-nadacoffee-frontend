import { type ChangeEvent, type ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
   MdArrowBack,
   MdSave,
   MdCloudUpload,
   MdAdd,
   MdDelete,
   MdInfoOutline,
   MdAttachMoney,
   MdInventory2
} from "react-icons/md";
import type { CreateProductInput } from "../../../types/admin.product.ts";
import type { Category } from "../../../types/admin.category.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import { createProduct } from "../../../api/admin.product.api.ts";
import { uploadImage } from "../../../api/upload.api.ts";
import { AxiosError } from "axios";

function AdminProductNew() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [uploading, setUploading] = useState(false);
   const [previewImage, setPreviewImage] = useState<string | null>(null);

   const {
      register,
      control,
      handleSubmit,
      setValue,
      formState: { errors }
   } = useForm<CreateProductInput>({
      defaultValues: {
         isDisplay: true,
         basePrice: 0,
         options: []
      }
   });

   const { fields, append, remove } = useFieldArray({
      control,
      name: "options"
   });

   // 카테고리 트리 조회
   const { data: categories } = useQuery({
      queryKey: ["admin", "categories", "tree"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   // 상품 생성 Mutation
   const mutation = useMutation({
      mutationFn: (data: CreateProductInput) => createProduct(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products"] });
         alert("상품이 성공적으로 등록되었습니다.");
         navigate("/admin/products");
      },
      onError: (err) => {
         let message = "상품 등록 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data.message;
         alert(message);
      }
   });

   // [수정] 이미지 업로드 핸들러 (API 함수 사용)
   const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
         const url = await uploadImage(file, "products");

         setValue("imageUrl", url);
         setPreviewImage(url);
      } catch (error) {
         console.error("Upload failed", error);
         alert("이미지 업로드에 실패했습니다.");
      } finally {
         setUploading(false);
      }
   };

   const onSubmit: SubmitHandler<CreateProductInput> = (data) => {
      const payload = {
         ...data,
         catId: Number(data.catId),
         basePrice: Number(data.basePrice),
         options: data.options?.map(opt => ({
            ...opt,
            addPrice: Number(opt.addPrice),
            stockQty: Number(opt.stockQty)
         }))
      };
      mutation.mutate(payload);
   };

   // Helper: Render Category Options
   const renderCategoryOptions = (cats: Category[], depth = 0): React.ReactNode[] => {
      const options: ReactNode[] = [];
      cats?.forEach(cat => {
         options.push(
            <option key={cat.id} value={cat.id}>
               {"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name}
            </option>
         );
         if (cat.categories) options.push(...renderCategoryOptions(cat.categories, depth + 1));
      });
      return options;
   };

   return (
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
         {/* Header */}
         <div className="flex items-center gap-4">
            <button
               onClick={() => navigate(-1)}
               className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
               <MdArrowBack className="w-6 h-6" />
            </button>
            <div>
               <h2 className="text-2xl font-black text-[#222222] tracking-tight">NEW PRODUCT</h2>
               <p className="text-sm text-gray-500 font-medium">새로운 상품 정보를 시스템에 등록합니다.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

               {/* Basic Info */}
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-1 h-6 bg-[#FFD400] rounded-full"></div>
                     <h3 className="text-lg font-black text-[#222222]">기본 정보</h3>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">카테고리 <span className="text-red-500">*</span></label>
                     <div className="relative">
                        <select
                           className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold bg-white appearance-none transition-all"
                           {...register("catId", { required: "카테고리를 선택해주세요." })}
                        >
                           <option value="">카테고리 선택</option>
                           {categories && renderCategoryOptions(categories)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                     </div>
                     {errors.catId && <p className="text-xs text-red-500 font-bold">{errors.catId.message}</p>}
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">상품명 <span className="text-red-500">*</span></label>
                     <input
                        type="text"
                        placeholder="예: 에티오피아 예가체프 G1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold transition-all"
                        {...register("name", { required: "상품명은 필수입니다." })}
                     />
                     {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">한줄 요약</label>
                     <input
                        type="text"
                        placeholder="예: 꽃향기가 가득한 산뜻한 산미"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold transition-all"
                        {...register("summary")}
                     />
                  </div>

                  {/* Price & Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">기본 가격 <span className="text-red-500">*</span></label>
                        <div className="relative">
                           <MdAttachMoney className="absolute left-3 top-3.5 text-gray-400" size={20} />
                           <input
                              type="number"
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold transition-all"
                              {...register("basePrice", { required: "가격은 필수입니다.", min: 0 })}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">진열 상태</label>
                        <div className="relative">
                           <select
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 font-bold bg-white appearance-none transition-all"
                              {...register("isDisplay")}
                           >
                              <option value="true">진열함 (판매가능)</option>
                              <option value="false">숨김 (판매중지)</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Options */}
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-[#FFD400] rounded-full"></div>
                        <h3 className="text-lg font-black text-[#222222]">상품 옵션</h3>
                     </div>
                     <button
                        type="button"
                        onClick={() => append({ name: "", value: "", addPrice: 0, stockQty: 0 })}
                        className="flex items-center gap-1 text-xs font-black text-[#222222] bg-[#FFD400] px-4 py-2 rounded-xl hover:bg-[#ffe14d] transition-all shadow-sm"
                     >
                        <MdAdd size={16} /> 옵션 추가
                     </button>
                  </div>

                  {fields.length === 0 ? (
                     <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 flex flex-col items-center gap-2">
                        <MdInventory2 size={32} className="opacity-20" />
                        <span className="text-xs font-bold">등록된 옵션이 없습니다.<br/>우측 상단 버튼을 눌러 추가하세요.</span>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {fields.map((field, index) => (
                           <div key={field.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group hover:border-gray-200 transition-colors">
                              <button
                                 type="button"
                                 onClick={() => remove(index)}
                                 className="absolute -right-2 -top-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                              >
                                 <MdDelete size={16} />
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">옵션명</label>
                                    <input
                                       placeholder="예: 용량, 분쇄도"
                                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none"
                                       {...register(`options.${index}.name` as const, { required: true })}
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">옵션값</label>
                                    <input
                                       placeholder="예: 200g, 핸드드립용"
                                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none"
                                       {...register(`options.${index}.value` as const, { required: true })}
                                    />
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">추가 금액</label>
                                    <input
                                       type="number"
                                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none text-right"
                                       {...register(`options.${index}.addPrice` as const)}
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">재고 수량</label>
                                    <input
                                       type="number"
                                       className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none text-right"
                                       {...register(`options.${index}.stockQty` as const)}
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            {/* Right Column: Image & Actions */}
            <div className="space-y-6">

               {/* Image Upload */}
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-6 bg-[#FFD400] rounded-full"></div>
                     <h3 className="text-lg font-black text-[#222222]">상품 이미지</h3>
                  </div>

                  <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FFD400] hover:bg-[#FFD400]/5 transition-all">
                     {previewImage ? (
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        <div className="text-center text-gray-400 group-hover:text-[#FFD400] transition-colors">
                           {uploading ? (
                              <div className="w-8 h-8 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                           ) : (
                              <MdCloudUpload size={48} className="mx-auto mb-2 opacity-30 group-hover:opacity-100 transition-opacity" />
                           )}
                           <p className="text-xs font-black">{uploading ? "업로드 중..." : "클릭하여 이미지 업로드"}</p>
                        </div>
                     )}
                     <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                     />
                  </div>
                  <input type="hidden" {...register("imageUrl")} />
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                     <p className="text-[10px] text-gray-400 font-medium">
                        권장: 1000x1000px (1:1)<br/>JPG, PNG / Max 10MB
                     </p>
                  </div>
               </div>

               {/* Actions */}
               <div className="bg-[#222222] text-white p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                     <MdInfoOutline className="text-[#FFD400]" size={20} />
                     <h3 className="text-sm font-black">최종 확인</h3>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                     입력된 정보가 쇼핑몰에 즉시 반영됩니다.<br/>
                     필수 항목을 모두 입력했는지 확인해주세요.
                  </p>
                  <div className="flex gap-2 pt-2">
                     <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 py-3 rounded-xl border border-white/20 text-gray-300 font-bold hover:bg-white/10 text-xs transition-all"
                     >
                        취소
                     </button>
                     <button
                        type="submit"
                        disabled={mutation.isPending || uploading}
                        className="flex-1 py-3 rounded-xl bg-[#FFD400] text-[#222222] font-black hover:bg-[#ffe14d] text-xs shadow-lg disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                     >
                        {mutation.isPending ? (
                           <div className="w-3 h-3 border-2 border-[#222222] border-t-transparent rounded-full animate-spin" />
                        ) : <MdSave size={16}/>}
                        {mutation.isPending ? "저장 중..." : "상품 등록"}
                     </button>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}

export default AdminProductNew;