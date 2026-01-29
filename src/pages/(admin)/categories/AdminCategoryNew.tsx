import { type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdArrowBack, MdSave, MdOutlineCategory, MdInfoOutline } from "react-icons/md";
import type { Category, CreateCategoryInput } from "../../../types/admin.category.ts";
import { adminCategoryApi } from "../../../api/admin.category.api.ts";

function AdminCategoryNew() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<CreateCategoryInput>({
      defaultValues: { sortOrder: 1 },
   });

   // 1. 상위 카테고리 선택을 위한 목록 조회
   const { data: parents } = useQuery({
      queryKey: ["admin", "categories"],
      queryFn: () => adminCategoryApi.getCategoryTree(),
   });

   // 2. 카테고리 등록 Mutation
   const mutation = useMutation({
      mutationFn: (data: CreateCategoryInput) => adminCategoryApi.createCategory(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
         alert("새 카테고리가 성공적으로 등록되었습니다.");
         navigate("/admin/categories");
      },
      onError: () => alert("카테고리 등록 중 오류가 발생했습니다.")
   });

   const onSubmit: SubmitHandler<CreateCategoryInput> = data => {
      const payload = {
         ...data,
         parentId: data.parentId ? Number(data.parentId) : null,
         sortOrder: Number(data.sortOrder),
      };
      mutation.mutate(payload);
   };

   // 계층형 옵션 렌더링 헬퍼
   const renderOptions = (categories: Category[], depth = 0): ReactNode[] => {
      const options: ReactNode[] = [];
      categories.forEach(cat => {
         if (!cat) return;
         options.push(
            <option key={cat.id} value={cat.id}>
               {"\u00A0".repeat(depth * 4)}{depth > 0 ? "└ " : ""}{cat.name}
            </option>,
         );
         if (cat.categories && cat.categories.length > 0) {
            options.push(...renderOptions(cat.categories, depth + 1));
         }
      });
      return options;
   };

   return (
      <div className="space-y-8 max-w-3xl mx-auto pb-10">
         {/* Header */}
         <div className="flex items-center gap-4">
            <button
               onClick={() => navigate(-1)}
               className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
               <MdArrowBack className="w-6 h-6" />
            </button>
            <div>
               <h2 className="text-2xl font-black text-[#222222] tracking-tight">NEW CATEGORY</h2>
               <p className="text-sm text-gray-500 font-medium">새로운 메뉴 카테고리를 시스템에 등록합니다.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Area */}
            <div className="lg:col-span-2">
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
                           <p className="text-[10px] text-gray-400 font-medium">대분류로 등록하려면 선택하지 마세요.</p>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-widest">카테고리명 <span className="text-red-500">*</span></label>
                           <input
                              type="text"
                              placeholder="예: Coffee, Dessert, New Menu"
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

                     {/* Actions */}
                     <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                           type="button"
                           onClick={() => navigate(-1)}
                           className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-white transition-all">
                           취소
                        </button>
                        <button
                           type="submit"
                           disabled={mutation.isPending}
                           className="flex items-center gap-2 px-10 py-3 rounded-xl bg-[#222222] text-white font-bold hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50">
                           {mutation.isPending ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           ) : (
                              <MdSave size={20} />
                           )}
                           {mutation.isPending ? "저장 중..." : "카테고리 등록"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>

            {/* Guide Area */}
            <div className="space-y-6">
               <div className="bg-[#222222] text-white p-8 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-2 mb-6">
                     <MdInfoOutline className="text-[#FFD400]" size={24} />
                     <h3 className="text-lg font-black">등록 가이드</h3>
                  </div>
                  <div className="space-y-4 text-xs leading-relaxed text-white/70 font-medium">
                     <p>
                        <strong className="text-[#FFD400]">1. 핵심 카테고리:</strong><br/>
                        사용자 페이지 메뉴와 연동하려면 아래 이름을 정확히 입력하세요.<br/>
                        (coffee, beverage, dessert, choice)
                     </p>
                     <p>
                        <strong className="text-[#FFD400]">2. 계층 구조:</strong><br/>
                        상위 카테고리를 선택하면 해당 메뉴의 하위 카테고리로 등록됩니다.
                     </p>
                     <p>
                        <strong className="text-[#FFD400]">3. 정렬 순서:</strong><br/>
                        GNB 메뉴 바에서 왼쪽부터 노출되는 순서를 결정합니다.
                     </p>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                     <MdOutlineCategory size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase">Current Status</p>
                     <p className="text-sm font-bold text-[#222222]">총 {parents?.length || 0}개 대분류 운영 중</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default AdminCategoryNew;
