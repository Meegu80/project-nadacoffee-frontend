import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdArrowBack, MdSave, MdDelete } from "react-icons/md";
import type { UpdateMemberInput } from "../../../types/admin.member.ts";
import { adminMemberApi } from "../../../api/admin.member.api.ts";
import { AxiosError } from "axios";
import { useAlertStore } from "../../../stores/useAlertStore";

function AdminMemberEdit() {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const memberId = Number(id);
   const queryClient = useQueryClient();
   const [apiError, setApiError] = useState<string | null>(null);
   const { showAlert } = useAlertStore();

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<UpdateMemberInput>();

   // 1. 회원 상세 정보 조회 (TanStack Query)
   const { data: member, isLoading, isError } = useQuery({
      queryKey: ["admin", "members", memberId],
      queryFn: () => adminMemberApi.getMember(memberId),
      enabled: !isNaN(memberId),
   });

   // 데이터 로드 시 폼 초기화
   useEffect(() => {
      if (member) {
         reset({
            email: member.email,
            name: member.name,
            phone: member.phone,
            grade: member.grade,
            status: member.status,
            role: member.role,
            password: "",
         });
      }
   }, [member, reset]);

   // 2. 회원 정보 수정 (Mutation)
   const updateMutation = useMutation({
      mutationFn: (data: UpdateMemberInput) => adminMemberApi.updateMember(memberId, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
         showAlert("회원 정보가 성공적으로 수정되었습니다.", "성공", "success");
         navigate("/admin/members");
      },
      onError: (err) => {
         let message = "수정 중 오류가 발생했습니다.";
         if (err instanceof AxiosError) message = err.response?.data?.message || message;
         setApiError(message);
      }
   });

   // 3. 회원 삭제 (Mutation)
   const deleteMutation = useMutation({
      mutationFn: () => adminMemberApi.deleteMember(memberId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
         showAlert("회원이 삭제되었습니다.", "성공", "success");
         navigate("/admin/members");
      },
      onError: () => showAlert("삭제 중 오류가 발생했습니다.", "실패", "error")
   });

   const onSubmit: SubmitHandler<UpdateMemberInput> = data => {
      showAlert(
         "회원 정보를 수정하시겠습니까?",
         "수정 확인",
         "info",
         [
            {
               label: "수정하기", onClick: () => {
                  setApiError(null);
                  const payload = { ...data };
                  if (!payload.password) delete payload.password;
                  updateMutation.mutate(payload);
               }
            },
            { label: "취소", onClick: () => { }, variant: "secondary" }
         ]
      );
   };

   const handleDelete = () => {
      useAlertStore.getState().showAlert(
         "정말로 이 회원을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.",
         "회원 삭제 확인",
         "warning",
         [
            { label: "삭제하기", onClick: () => deleteMutation.mutate() },
            { label: "취소", onClick: () => { }, variant: "secondary" }
         ]
      );
   };

   if (isLoading) return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
         <div className="w-10 h-10 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" />
         <p className="text-gray-400 font-bold">회원 정보를 불러오는 중...</p>
      </div>
   );

   if (isError || isNaN(memberId)) return (
      <div className="text-center py-20">
         <p className="text-red-500 font-bold mb-4">회원 정보를 불러오는데 실패했습니다.</p>
         <button onClick={() => navigate("/admin/members")} className="text-gray-500 underline">목록으로 돌아가기</button>
      </div>
   );

   return (
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
         {/* Top Actions */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                  <MdArrowBack className="w-6 h-6" />
               </button>
               <div>
                  <h2 className="text-2xl font-bold text-[#222222]">회원 상세 및 수정</h2>
                  <p className="text-sm text-gray-500">회원의 상세 정보를 확인하고 수정하거나 삭제할 수 있습니다.</p>
               </div>
            </div>

            <button
               type="button"
               onClick={handleDelete}
               disabled={deleteMutation.isPending}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50">
               <MdDelete className="w-5 h-5" />
               {deleteMutation.isPending ? "삭제 중..." : "회원 삭제"}
            </button>
         </div>

         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)}>
               {apiError && (
                  <div className="m-6 mb-0 bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm font-bold">
                     ⚠️ {apiError}
                  </div>
               )}

               <div className="p-8 space-y-10">
                  {/* Section 1: Account Info */}
                  <section>
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-5 bg-[#FFD400] rounded-full" />
                        <h3 className="text-lg font-bold text-[#222222]">계정 정보</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">이메일 (수정 불가)</label>
                           <input
                              type="email"
                              className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 font-medium cursor-not-allowed outline-none"
                              {...register("email")}
                              readOnly
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                              비밀번호 변경 <span className="text-[10px] text-gray-300 font-normal">(변경 시에만 입력)</span>
                           </label>
                           <input
                              type="password"
                              placeholder="새 비밀번호 입력"
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${errors.password ? "border-red-200 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"
                                 }`}
                              {...register("password", { minLength: { value: 6, message: "비밀번호는 최소 6자 이상이어야 합니다." } })}
                           />
                           {errors.password && <p className="text-xs text-red-500 font-bold">{errors.password.message}</p>}
                        </div>
                     </div>
                  </section>

                  {/* Section 2: Personal Info */}
                  <section>
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-5 bg-[#FFD400] rounded-full" />
                        <h3 className="text-lg font-bold text-[#222222]">개인 정보</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">이름</label>
                           <input
                              type="text"
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${errors.name ? "border-red-200 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"
                                 }`}
                              {...register("name", { required: "이름은 필수입니다." })}
                           />
                           {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">연락처</label>
                           <input
                              type="text"
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium ${errors.phone ? "border-red-200 focus:ring-red-100" : "border-gray-200 focus:border-[#FFD400] focus:ring-[#FFD400]/10"
                                 }`}
                              {...register("phone", { required: "연락처는 필수입니다." })}
                           />
                           {errors.phone && <p className="text-xs text-red-500 font-bold">{errors.phone.message}</p>}
                        </div>
                     </div>
                  </section>

                  {/* Section 3: Member Settings */}
                  <section>
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-5 bg-[#FFD400] rounded-full" />
                        <h3 className="text-lg font-bold text-[#222222]">회원 설정</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">회원 등급</label>
                           <select
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold bg-white"
                              {...register("grade")}>
                              <option value="SILVER">SILVER</option>
                              <option value="GOLD">GOLD</option>
                              <option value="VIP">VIP</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">계정 상태</label>
                           <select
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold bg-white"
                              {...register("status")}>
                              <option value="ACTIVE">활동 (ACTIVE)</option>
                              <option value="DORMANT">휴면 (DORMANT)</option>
                              <option value="WITHDRAWN">탈퇴 (WITHDRAWN)</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black text-gray-400 uppercase tracking-wider">권한</label>
                           <select
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/10 transition-all font-bold bg-white"
                              {...register("role")}>
                              <option value="USER">일반 사용자</option>
                              <option value="ADMIN">관리자</option>
                           </select>
                        </div>
                     </div>
                  </section>
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
                     className="flex items-center gap-2 px-10 py-3 rounded-xl bg-[#222222] text-white font-bold hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed">
                     {updateMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                        <MdSave className="w-5 h-5" />
                     )}
                     {updateMutation.isPending ? "저장 중..." : "수정 저장"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default AdminMemberEdit;
