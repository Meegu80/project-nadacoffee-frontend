import { type ChangeEvent, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useForm, useFieldArray, type SubmitHandler, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
   MdArrowBack, MdSave, MdCloudUpload, MdAdd, MdDelete, MdAttachMoney, MdInventory2, MdClose
} from "react-icons/md";
import { Loader2 } from "lucide-react";
import { getProduct } from "../../../api/product.api.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";
import type { UpdateProductInput } from "../../../types/admin.product.ts";
import type { Category } from "../../../types/admin.category.ts";
import { deleteProduct, updateProduct } from "../../../api/admin.product.api.ts";
import { uploadImage } from "../../../api/upload.api.ts";
import { AxiosError } from "axios";
import WebEditor from "../../../components/common/WebEditor.tsx";
import { useAlertStore } from "../../../stores/useAlertStore";
import { twMerge } from "tailwind-merge";

function AdminProductDetail() {
   const navigate = useNavigate();
   const location = useLocation();
   const { id } = useParams<{ id: string }>();
   const productId = Number(id);
   const queryClient = useQueryClient();
   const { showAlert } = useAlertStore();

   const filterParams = location.search;

   const [uploading, setUploading] = useState(false);
   const [imageUrls, setImageUrls] = useState<string[]>([]);

   const { register, control, handleSubmit, reset, formState: { errors } } = useForm<any>({
      defaultValues: { isDisplay: true, basePrice: 0, options: [], summary: "" }
   });

   const { fields, append, remove } = useFieldArray({ control, name: "options" });

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
      if (product?.data) {
         const item = product.data;
         const initialImages = item.imageUrl ? item.imageUrl.split(',') : [];
         setImageUrls(initialImages);

         reset({
            catId: item.catId,
            name: item.name,
            summary: item.summary || "",
            basePrice: item.basePrice,
            isDisplay: item.isDisplay,
            options: item.options?.map(opt => ({
               id: opt.id,
               name: opt.name,
               value: opt.value,
               addPrice: opt.addPrice,
               stockQty: opt.stockQty,
            })) || [],
         });
      }
   }, [product, reset]);

   const updateMutation = useMutation({
      mutationFn: (data: any) => updateProduct(productId, data),
      onSuccess: () => {
         // [수정] 캐시를 더 확실하게 무효화
         queryClient.invalidateQueries({ queryKey: ["products"] });
         queryClient.invalidateQueries({ queryKey: ["products", productId] });
         
         showAlert("상품 정보가 수정되었습니다.", "성공", "success");
         // 약간의 지연 후 이동하여 서버 반영 시간 확보
         setTimeout(() => {
            navigate(`/admin/products${filterParams}`);
         }, 500);
      },
      onError: (err) => {
         let message = "수정 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data.message || err.message;
         showAlert(message, "실패", "error");
      }
   });

   const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
         const newUrls = await Promise.all(Array.from(files).map(file => uploadImage(file, "products")));
         setImageUrls(prev => [...prev, ...newUrls]);
      } catch (error) {
         showAlert("이미지 업로드 실패", "실패", "error");
      } finally {
         setUploading(false);
      }
   };

   const removeImage = (index: number) => setImageUrls(prev => prev.filter((_, i) => i !== index));

   const onSubmit: SubmitHandler<any> = data => {
      const stripHtml = (html: string) => {
         const doc = new DOMParser().parseFromString(html, 'text/html');
         return doc.body.textContent || "";
      };

      const payload: any = {
         catId: Number(data.catId),
         name: data.name?.trim(),
         summary: stripHtml(data.summary || "").trim(),
         basePrice: Number(data.basePrice),
         // [테스트] 쉼표 없이 1장만 보내서 서버가 저장하는지 최종 확인
         imageUrl: imageUrls[0] || "", 
         isDisplay: String(data.isDisplay) === "true",
         options: data.options?.map((opt: any) => ({
            id: opt.id ? Number(opt.id) : undefined,
            name: opt.name.trim(),
            value: opt.value.trim(),
            addPrice: Number(opt.addPrice || 0),
            stockQty: Number(opt.stockQty || 0)
         }))
      };

      console.log("🚀 Final Test Payload:", payload);
      updateMutation.mutate(payload);
   };

   const renderCategoryOptions = (cats: Category[], depth = 0): React.ReactNode[] => {
      const options: any[] = [];
      cats?.forEach(cat => {
         options.push(<option key={cat.id} value={cat.id}>{"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name}</option>);
         if (cat.categories) options.push(...renderCategoryOptions(cat.categories, depth + 1));
      });
      return options;
   };

   if (isProductLoading) return <div className="py-40 text-center italic text-gray-400">Loading product info...</div>;

   return (
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"><MdArrowBack size={24} /></button>
            <h2 className="text-2xl font-black text-[#222222] tracking-tight uppercase italic">Edit Product</h2>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">카테고리</label>
                     <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("catId", { required: true })}>
                        <option value="">카테고리 선택</option>
                        {categories && renderCategoryOptions(categories)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">상품명</label>
                     <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("name", { required: true })} />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">상품 설명</label>
                  <Controller name="summary" control={control} render={({ field }) => <WebEditor value={field.value || ""} onChange={field.onChange} />} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">기본 가격</label><input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("basePrice", { required: true })} /></div>
                  <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">진열 상태</label><select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register("isDisplay")}><option value="true">진열함</option><option value="false">숨김</option></select></div>
               </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-brand-dark">상품 이미지 (최대 5장)</h3>
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

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-6">
               <div className="flex justify-between items-center"><h3 className="text-xl font-black text-brand-dark">상품 옵션</h3><button type="button" onClick={() => append({ name: "온도", value: "HOT", addPrice: 0, stockQty: 100 })} className="bg-brand-dark text-brand-yellow px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg hover:bg-black transition-all flex items-center gap-2"><MdAdd size={18} /> 옵션 추가하기</button></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((field, index) => (
                     <div key={field.id} className="p-6 bg-gray-50 rounded-[30px] border border-gray-100 relative group hover:border-brand-yellow/30 transition-all">
                        <button type="button" onClick={() => remove(index)} className="absolute -right-2 -top-2 bg-white text-red-500 p-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 border border-gray-100"><MdDelete size={18} /></button>
                        <div className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <input placeholder="옵션명" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.name` as const, { required: true })} />
                              <input placeholder="옵션값" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.value` as const, { required: true })} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <input type="number" placeholder="추가금액" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.addPrice` as const)} />
                              <input type="number" placeholder="재고" className="w-full p-3 bg-white border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow/20" {...register(`options.${index}.stockQty` as const)} />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="pt-4">
               <button type="submit" disabled={updateMutation.isPending || uploading} className="w-full py-6 bg-brand-dark text-brand-yellow rounded-[30px] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50">
                  {updateMutation.isPending ? <Loader2 className="animate-spin" size={28} /> : <MdSave size={28} />}
                  {updateMutation.isPending ? "수정 내용을 저장하는 중..." : "상품 정보 수정 완료"}
               </button>
            </div>
         </form>
      </div>
   );
}

export default AdminProductDetail;
