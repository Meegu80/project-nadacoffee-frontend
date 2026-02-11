import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdArrowBack, MdSave } from "react-icons/md";
import type { CreateMemberInput } from "../../../types/admin.member.ts";
import { adminMemberApi } from "../../../api/admin.member.api.ts";
import { AxiosError } from "axios";
import { useAlertStore } from "../../../stores/useAlertStore";

function AdminMemberNew() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [apiError, setApiError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<CreateMemberInput>({
      defaultValues: {
         grade: "SILVER",
         status: "ACTIVE",
         role: "USER",
      },
   });

   const mutation = useMutation({
      mutationFn: (data: CreateMemberInput) => adminMemberApi.createMember(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
         useAlertStore.getState().showAlert("회원이 성공적으로 등록되었습니다.", "성공", "success");
         navigate("/admin/members");
      },
      onError: (err) => {
         console.error(err);
         let message = "회원 등록 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data?.message || message;
         setApiError(message);
      }
   });

   const onSubmit: SubmitHandler<CreateMemberInput> = data => {
      setApiError(null);
      mutation.mutate(data);
   };

   return (
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"><MdArrowBack className="w-6 h-6" /></button>
            <div>
               <h2 className="text-2xl font-bold text-[#222222]">신규 회원 등록</h2>
               <p className="text-sm text-gray-500">새로운 회원의 정보를 입력하여 계정을 생성합니다.</p>
            </div>
         </div>

         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)}>
               {apiError && (
                  <div className="m-6 mb-0 bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm font-bold flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                     {apiError}
                  </div>
               )}

               <div className="p-8 space-y-10">
                  <section>
                     <div className="flex items-center gap-2 mb-6"><div className="w-1 h-5 bg-[#FFD400] rounded-full" /><h3 className="text-lg font-bold text-[#222222]">계정 정보</h3></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">이메일 주소 <span className="text-red-500">*</span></label>
                           <input type="email" placeholder="example@nada.com" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${errors.email ? "border-red-200 bg-red-50/30 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"}`} {...register("email", { required: "이메일은 필수입니다.", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "유효한 이메일 주소를 입력해주세요." } })} />
                           {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">비밀번호 <span className="text-red-500">*</span></label>
                           <input type="password" placeholder="6자 이상 입력" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${errors.password ? "border-red-200 bg-red-50/30 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"}`} {...register("password", { required: "비밀번호는 필수입니다.", minLength: { value: 6, message: "비밀번호는 최소 6자 이상이어야 합니다." } })} />
                           {errors.password && <p className="text-xs text-red-500 font-bold">{errors.password.message}</p>}
                        </div>
                     </div>
                  </section>

                  <section>
                     <div className="flex items-center gap-2 mb-6"><div className="w-1 h-5 bg-[#FFD400] rounded-full" /><h3 className="text-lg font-bold text-[#222222]">개인 정보</h3></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">이름 <span className="text-red-500">*</span></label>
                           <input type="text" placeholder="성함을 입력하세요" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${errors.name ? "border-red-200 bg-red-50/30 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"}`} {...register("name", { required: "이름은 필수입니다." })} />
                           {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">연락처 <span className="text-red-500">*</span></label>
                           <input type="text" placeholder="010-0000-0000" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${errors.phone ? "border-red-200 bg-red-50/30 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"}`} {...register("phone", { required: "연락처는 필수입니다." })} />
                           {errors.phone && <p className="text-xs text-red-500 font-bold">{errors.phone.message}</p>}
                        </div>
                     </div>
                  </section>

                  <section>
                     <div className="flex items-center gap-2 mb-6"><div className="w-1 h-5 bg-[#FFD400] rounded-full" /><h3 className="text-lg font-bold text-[#222222]">회원 설정</h3></div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">회원 등급</label>
                           <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold bg-white" {...register("grade")}>
                              <option value="BRONZE">BRONZE</option>
                              <option value="SILVER">SILVER</option>
                              <option value="GOLD">GOLD</option>
                              <option value="VIP">VIP</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">계정 상태</label>
                           <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold bg-white" {...register("status")}>
                              <option value="ACTIVE">활동 (ACTIVE)</option>
                              <option value="INACTIVE">비활동 (INACTIVE)</option>
                              <option value="BANNED">정지 (BANNED)</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">권한</label>
                           <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold bg-white" {...register("role")}>
                              <option value="USER">일반 사용자</option>
                              <option value="ADMIN">관리자</option>
                           </select>
                        </div>
                     </div>
                  </section>
               </div>

               <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => navigate(-1)} className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-white transition-all">취소</button>
                  <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-10 py-3 rounded-xl bg-[#222222] text-white font-bold hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed">
                     {mutation.isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdSave className="w-5 h-5" />}
                     {mutation.isPending ? "저장 중..." : "회원 등록"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default AdminMemberNew;
