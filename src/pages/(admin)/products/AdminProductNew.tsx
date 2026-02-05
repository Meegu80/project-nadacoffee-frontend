import { type ChangeEvent, type ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm, useFieldArray, type SubmitHandler, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
   MdArrowBack,
   MdSave,
   MdCloudUpload,
   MdAdd,
   MdDelete,
   MdInfoOutline,
   MdAttachMoney,
   MdInventory2,
   MdLayers
} from "react-icons/md";
import type { CreateProductInput } from "../../../types/admin.product.ts";
import type { Category } from "../../../types/admin.category.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import { createProduct } from "../../../api/admin.product.api.ts";
import { uploadImage } from "../../../api/upload.api.ts";
import { AxiosError } from "axios";
import WebEditor from "../../../components/common/WebEditor.tsx";

function AdminProductNew() {
   const navigate = useNavigate();
   const location = useLocation();
   const queryClient = useQueryClient();
   const [mode, setMode] = useState<"single" | "bulk">("single");
   const [uploading, setUploading] = useState(false);
   const [previewImage, setPreviewImage] = useState<string | null>(null);
   const [bulkLogs, setBulkLogs] = useState<{name: string, status: 'pending' | 'success' | 'error', message?: string}[]>([]);

   useEffect(() => {
      const params = new URLSearchParams(location.search);
      if (params.get("mode") === "bulk") {
         setMode("bulk");
      }
   }, [location]);

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
         options: [],
         summary: ""
      }
   });

   const { fields, append, remove } = useFieldArray({
      control,
      name: "options"
   });

   const { data: categories } = useQuery({
      queryKey: ["admin", "categories", "tree"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   const mutation = useMutation({
      mutationFn: (data: CreateProductInput) => createProduct(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["products"] });
         if (mode === "single") {
            alert("상품이 성공적으로 등록되었습니다.");
            navigate("/admin/products");
         }
      },
      onError: (err) => {
         let message = "상품 등록 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data.message;
         alert(message);
      }
   });

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

   // 일괄 등록 핸들러 수정
   const handleBulkUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !categories) return;

      const fileList = Array.from(files);
      setUploading(true);
      setBulkLogs(fileList.map(f => ({ name: f.name, status: 'pending' })));

      const normalize = (str: string) => str.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();

      const flatCategories: {id: number, name: string, normalized: string}[] = [];
      const flatten = (cats: Category[]) => {
         cats.forEach(c => {
            flatCategories.push({ id: c.id, name: c.name, normalized: normalize(c.name) });
            if (c.categories) flatten(c.categories);
         });
      };
      flatten(categories);

      for (let i = 0; i < fileList.length; i++) {
         const file = fileList[i];
         const fileName = file.name.split('.')[0]; 
         const parts = fileName.split('_'); 

         if (parts.length < 3) {
            setBulkLogs(prev => prev.map((log, idx) => i === idx ? { ...log, status: 'error', message: '파일명 형식 오류 (카테고리_상품명_가격)' } : log));
            continue;
         }

         // 개선된 파싱 로직: 마지막은 가격, 첫번째는 카테고리, 중간은 상품명
         const priceStr = parts.pop() || "0";
         const catNameRaw = parts.shift() || "";
         const prodName = parts.join('_'); // 중간에 언더바가 있어도 상품명으로 합침

         const category = flatCategories.find(c => c.normalized === normalize(catNameRaw));

         if (!category) {
            setBulkLogs(prev => prev.map((log, idx) => i === idx ? { ...log, status: 'error', message: `카테고리 '${catNameRaw}'를 찾을 수 없음` } : log));
            continue;
         }

         try {
            const imageUrl = await uploadImage(file, "products");
            
            await createProduct({
               catId: category.id,
               name: prodName,
               basePrice: Number(priceStr),
               imageUrl,
               isDisplay: true,
               summary: `${category.name} 신규 상품`,
               options: []
            });

            setBulkLogs(prev => prev.map((log, idx) => i === idx ? { ...log, status: 'success' } : log));
         } catch (error) {
            setBulkLogs(prev => prev.map((log, idx) => i === idx ? { ...log, status: 'error', message: '등록 중 서버 오류' } : log));
         }
      }

      setUploading(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                  <MdArrowBack className="w-6 h-6" />
               </button>
               <div>
                  <h2 className="text-2xl font-black text-[#222222] tracking-tight">NEW PRODUCT</h2>
                  <p className="text-sm text-gray-500 font-medium">새로운 상품 정보를 시스템에 등록합니다.</p>
               </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl">
               <button 
                  onClick={() => setMode("single")}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${mode === 'single' ? 'bg-white text-[#222222] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  단일 등록
               </button>
               <button 
                  onClick={() => setMode("bulk")}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${mode === 'bulk' ? 'bg-white text-[#222222] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <MdLayers size={16} /> 일괄 등록
               </button>
            </div>
         </div>

         {mode === "single" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-[#FFD400] rounded-full"></div>
                        <h3 className="text-lg font-black text-[#222222]">기본 정보</h3>
                     </div>

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

                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">상품 설명 (Summary)</label>
                        <Controller
                           name="summary"
                           control={control}
                           render={({ field }) => (
                              <WebEditor 
                                 value={field.value || ""} 
                                 onChange={field.onChange} 
                                 placeholder="상품에 대한 상세 설명을 입력하세요."
                              />
                           )}
                        />
                     </div>

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
                                 <button type="button" onClick={() => remove(index)} className="absolute -right-2 -top-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50">
                                    <MdDelete size={16} />
                                 </button>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-gray-400 uppercase">옵션명</label>
                                       <input placeholder="예: 용량, 분쇄도" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none" {...register(`options.${index}.name` as const, { required: true })} />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-gray-400 uppercase">옵션값</label>
                                       <input placeholder="예: 200g, 핸드드립용" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none" {...register(`options.${index}.value` as const, { required: true })} />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-gray-400 uppercase">추가 금액</label>
                                       <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none text-right" {...register(`options.${index}.addPrice` as const)} />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-black text-gray-400 uppercase">재고 수량</label>
                                       <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-[#FFD400] outline-none text-right" {...register(`options.${index}.stockQty` as const)} />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-4">
                     <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-[#FFD400] rounded-full"></div>
                        <h3 className="text-lg font-black text-[#222222]">상품 이미지</h3>
                     </div>
                     <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FFD400] hover:bg-[#FFD400]/5 transition-all">
                        {previewImage ? <img src={previewImage} alt="Preview" className="w-full h-full object-cover" /> : (
                           <div className="text-center text-gray-400 group-hover:text-[#FFD400] transition-colors">
                              {uploading ? <div className="w-8 h-8 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin mx-auto mb-2" /> : <MdCloudUpload size={48} className="mx-auto mb-2 opacity-30 group-hover:opacity-100 transition-opacity" />}
                              <p className="text-xs font-black">{uploading ? "업로드 중..." : "클릭하여 이미지 업로드"}</p>
                           </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>
                     <input type="hidden" {...register("imageUrl")} />
                  </div>

                  <div className="bg-[#222222] text-white p-6 rounded-3xl shadow-xl space-y-4">
                     <div className="flex items-center gap-2">
                        <MdInfoOutline className="text-[#FFD400]" size={20} />
                        <h3 className="text-sm font-black">최종 확인</h3>
                     </div>
                     <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl border border-white/20 text-gray-300 font-bold hover:bg-white/10 text-xs transition-all">취소</button>
                        <button type="submit" disabled={mutation.isPending || uploading} className="flex-1 py-3 rounded-xl bg-[#FFD400] text-[#222222] font-black hover:bg-[#ffe14d] text-xs shadow-lg disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                           {mutation.isPending ? <div className="w-3 h-3 border-2 border-[#222222] border-t-transparent rounded-full animate-spin" /> : <MdSave size={16}/>}
                           {mutation.isPending ? "저장 중..." : "상품 등록"}
                        </button>
                     </div>
                  </div>
               </div>
            </form>
         ) : (
            <div className="space-y-6">
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center space-y-6">
                  <div className="max-w-md mx-auto space-y-4">
                     <div className="w-20 h-20 bg-[#FFD400]/10 text-[#FFD400] rounded-full flex items-center justify-center mx-auto">
                        <MdLayers size={40} />
                     </div>
                     <h3 className="text-xl font-black text-[#222222]">이미지 일괄 등록</h3>
                     <p className="text-sm text-gray-500 leading-relaxed">
                        파일명 형식: <span className="font-black text-brand-dark bg-gray-100 px-2 py-1 rounded">카테고리_상품명_가격.jpg</span><br/>
                        예: <span className="italic">커피_아메리카노_1500.jpg</span>
                     </p>
                  </div>

                  <div className="relative group max-w-2xl mx-auto">
                     <div className="w-full py-20 border-4 border-dashed border-gray-100 rounded-[40px] group-hover:border-[#FFD400] group-hover:bg-[#FFD400]/5 transition-all flex flex-col items-center justify-center gap-4">
                        <MdCloudUpload size={64} className="text-gray-200 group-hover:text-[#FFD400] transition-colors" />
                        <p className="text-gray-400 font-bold">여러 개의 이미지를 드래그하거나 클릭하여 선택하세요.</p>
                        <input 
                           type="file" 
                           multiple 
                           accept="image/*" 
                           onChange={handleBulkUpload}
                           disabled={uploading}
                           className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                        />
                     </div>
                  </div>

                  {uploading && (
                     <div className="flex items-center justify-center gap-3 text-[#FFD400] font-black">
                        <div className="w-5 h-5 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" />
                        일괄 등록 처리 중...
                     </div>
                  )}
               </div>

               {bulkLogs.length > 0 && (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                     <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h4 className="text-sm font-black text-[#222222]">처리 결과 ({bulkLogs.filter(l => l.status === 'success').length}/{bulkLogs.length})</h4>
                        <button onClick={() => setBulkLogs([])} className="text-xs text-gray-400 hover:text-gray-600 font-bold">로그 지우기</button>
                     </div>
                     <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                        {bulkLogs.map((log, idx) => (
                           <div key={idx} className="px-8 py-4 flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-600">{log.name}</span>
                              <div className="flex items-center gap-3">
                                 {log.message && <span className="text-xs text-red-400 font-bold">{log.message}</span>}
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                    log.status === 'success' ? 'bg-green-50 text-green-600' :
                                    log.status === 'error' ? 'bg-red-50 text-red-600' :
                                    'bg-gray-100 text-gray-400'
                                 }`}>
                                    {log.status.toUpperCase()}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}

export default AdminProductNew;
