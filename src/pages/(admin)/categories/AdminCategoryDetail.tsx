import { type ReactNode, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdArrowBack, MdSave, MdDelete, MdOutlineCategory } from "react-icons/md";
import type { Category, UpdateCategoryInput } from "../../../types/admin.category.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";

function AdminCategoryDetail() {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const categoryId = Number(id);
   const queryClient = useQueryClient();

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<UpdateCategoryInput>();

   // 1. 카테고리 상세 정보 조회
   const { data: category, isLoading: isDetailLoading } = useQuery({
      queryKey: ["admin", "categories", categoryId],
      queryFn: () => adminCategoryApi.getCategory(categoryId),
      enabled: !isNaN(categoryId),
   });

   // 2. 상위 카테고리 선택을 위한 목록 조회
   const { data: parents } = useQuery({
      queryKey: ["admin", "categories"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   // 데이터 로드 시 폼 초기화
   useEffect(() => {
      if (category) {
         reset({
            name: category.name,
            parentId: category.parentId,
            sortOrder: category.sortOrder,
         });
      }
   }, [category, reset]);

   // 3. 카테고리 수정 Mutation
   const updateMutation = useMutation({
      mutationFn: (data: UpdateCategoryInput) => adminCategoryApi.updateCategory(categoryId, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
         alert("카테고리 정보가 수정되었습니다.");
         navigate("/admin/categories");
      },
      onError: () => alert("수정 중 오류가 발생했습니다.")
   });

   // 4. 카테고리 삭제 Mutation
   const deleteMutation = useMutation({
      mutationFn: () => adminCategoryApi.deleteCategory(categoryId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
         alert("카테고리가 삭제되었습니다.");
         navigate("/admin/categories");
      },
      onError: () => alert("삭제 중 오류가 발생했습니다.")
   });

   const onSubmit: SubmitHandler<UpdateCategoryInput> = data => {
      const payload = {
         ...data,
         parentId: data.parentId ? Number(data.parentId) : null,
         sortOrder: Number(data.sortOrder),
      };
      
      if (payload.parentId === categoryId) {
         alert("자기 자신을 상위 카테고리로 설정할 수 없습니다.");
         return;
      }
      
      updateMutation.mutate(payload);
   };

   const handleDelete = () => {
      if (!window.confirm("정말로 이 카테고리를 삭제하시겠습니까? 하위 카테고리가 있는 경우 함께 삭제될 수 있습니다.")) return;
      deleteMutation.mutate();
   };

   // 계층형 옵션 렌더링 헬퍼
   const renderOptions = (categories: Category[], depth = 0): ReactNode[] => {
      const options: ReactNode[] = [];
      categories.forEach(cat => {
         if (!cat) return;
         options.push(
            <option key={cat.id} value={cat.id} disabled={cat.id === categoryId}>
               {"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name} {cat.id === categoryId ? "(현재)" : ""}
            </option>,
         );
         if (cat.categories && cat.categories.length > 0) {
            options.push(...renderOptions(cat.categories, depth + 1));
         }
      });
      return options;
   };

   if (isDetailLoading) return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
         <div className="w-10 h-10 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" />
         <p className="text-gray-400 font-bold">카테고리 정보를 불러오는 중...</p>
      </div>
   );

   return (
      <div className="space-y-8 max-w-3xl mx-auto pb-10">
         {/* Top Actions */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                  <MdArrowBack className="w-6 h-6" />
               </button>
               <div>
                  <h2 className="text-2xl font-black text-[#222222] tracking-tight">EDIT CATEGORY</h2>
                  <p className="text-sm text-gray-500 font-medium">카테고리 정보를 수정하거나 삭제합니다.</p>
               </div>
            </div>

            <button
               type="button"
               onClick={handleDelete}
               disabled={deleteMutation.isPending}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50">
               <MdDelete size={20} />
               {deleteMutation.isPending ? "삭제 중..." : "카테고리 삭제"}
            </button>
         </div>

         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)}>
               <div className="p-8 space-y-8">
                  {/* Parent Selection */}
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">상위 카테고리</label>
                     <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold bg-white"
                        {...register("parentId")}>
                        <option value="">(최상위 카테고리 설정)</option>
                        {parents && renderOptions(parents)}
                     </select>
                     <p className="text-[10px] text-gray-400 font-medium">부모 카테고리를 변경하여 위치를 이동할 수 있습니다.</p>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">카테고리명 <span className="text-red-500">*</span></label>
                     <input
                        type="text"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-bold ${
                           errors.name ? "border-red-200 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"
                        }`}
                        {...register("name", { required: "카테고리명은 필수입니다." })}
                     />
                     {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">정렬 순서</label>
                     <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold"
                        {...register("sortOrder")}
                     />
                     <p className="text-[10px] text-gray-400 font-medium">숫자가 낮을수록 메뉴 상단에 노출됩니다.</p>
                  </div>
               </div>

               {/* Form Actions */}
               <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                  <button
                     type="button"
                     onClick={() => navigate(-1)}
                     className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-white transition-all">
                     취소
                  </button>
                  <button
                     type="submit"
                     disabled={updateMutation.isPending}
                     className="flex items-center gap-2 px-10 py-3 rounded-xl bg-[#222222] text-white font-bold hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50">
                     {updateMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                        <MdSave size={20} />
                     )}
                     {updateMutation.isPending ? "저장 중..." : "수정 내용 저장"}
                  </button>
               </div>
            </form>
         </div>

         {/* Info Box */}
         <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl text-gray-400 shadow-sm">
               <MdOutlineCategory size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase">Category Info</p>
               <p className="text-sm font-bold text-[#222222]">
                  현재 카테고리 ID: <span className="text-[#FFD400]">{categoryId}</span> | 
                  하위 카테고리 수: <span className="text-[#FFD400]">{category?.categories?.length || 0}</span>개
               </p>
            </div>
         </div>
      </div>
   );
}

export default AdminCategoryDetail;
