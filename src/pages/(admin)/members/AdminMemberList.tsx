import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   MdAdd,
   MdSearch,
   MdChevronLeft,
   MdChevronRight,
   MdEdit,
   MdDelete,
   MdCardGiftcard,
   MdClose,
} from "react-icons/md";
import { adminMemberApi } from "../../../api/admin.member.api.ts";
import { AnimatePresence, motion } from "framer-motion";

function AdminMemberList() {
   const [page, setPage] = useState(1);
   const limit = 10;
   const queryClient = useQueryClient();

   // 포인트 모달 상태
   const [isPointModalOpen, setIsPointModalOpen] = useState(false);
   const [targetMember, setTargetMember] = useState<{ id: number, name: string } | null>(null);
   const [pointForm, setPointForm] = useState({ amount: 1000, reason: "이벤트 적립" });

   // 1. 회원 목록 조회
   const { data, isLoading, isError } = useQuery({
      queryKey: ["admin", "members", page],
      queryFn: () => adminMemberApi.getMembers(page, limit),
   });

   // 2. 회원 삭제 Mutation
   const deleteMutation = useMutation({
      mutationFn: (id: number) => adminMemberApi.deleteMember(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
         alert("회원이 성공적으로 삭제되었습니다.");
      },
      onError: () => {
         alert("회원 삭제 중 오류가 발생했습니다.");
      }
   });

   // 3. 포인트 지급 Mutation
   const pointMutation = useMutation({
      mutationFn: async () => {
         if (targetMember) {
            return adminMemberApi.grantPoints({
               memberId: targetMember.id,
               amount: Number(pointForm.amount),
               reason: pointForm.reason
            });
         } else {
            return adminMemberApi.grantPointsToAll({
               amount: Number(pointForm.amount),
               reason: pointForm.reason
            });
         }
      },
      onSuccess: () => {
         alert("포인트가 지급되었습니다.");
         setIsPointModalOpen(false);
         queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      },
      onError: (err: any) => {
         alert(`지급 실패: ${err.response?.data?.message || err.message}`);
      }
   });

   const handleDelete = (id: number, name: string) => {
      if (window.confirm(`정말로 [${name}] 회원을 삭제하시겠습니까?`)) {
         deleteMutation.mutate(id);
      }
   };

   const openPointModal = (member: { id: number, name: string } | null) => {
      setTargetMember(member);
      setPointForm({
         amount: member ? 1000 : 5000,
         reason: member ? "관리자 수동 지급" : "전체 회원 이벤트 지급"
      });
      setIsPointModalOpen(true);
   };

   const members = data?.data || [];
   const pagination = data?.pagination || {
      totalMembers: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 10,
   };

   // 헬퍼 함수: 등급 뱃지 스타일
   const getGradeBadge = (grade: string) => {
      switch (grade) {
         case "VIP": return "bg-purple-100 text-purple-700 border-purple-200";
         case "GOLD": return "bg-yellow-100 text-yellow-800 border-yellow-200";
         case "SILVER": return "bg-blue-100 text-blue-700 border-blue-200";
         default: return "bg-gray-100 text-gray-600 border-gray-200";
      }
   };

   // 헬퍼 함수: 상태 뱃지 스타일
   const getStatusBadge = (status: string) => {
      switch (status) {
         case "ACTIVE": return "bg-green-100 text-green-700";
         case "DORMANT": return "bg-orange-100 text-orange-700";
         case "WITHDRAWN": return "bg-red-100 text-red-700";
         default: return "bg-gray-100 text-gray-600";
      }
   };

   return (
      <div className="space-y-6">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-bold text-[#222222]">회원 관리</h2>
               <p className="text-sm text-gray-500 mt-1">
                  총 {pagination.totalMembers}명의 회원이 등록되어 있습니다.
               </p>
            </div>

            <div className="flex gap-3">
               <div className="relative">
                  <input
                     type="text"
                     placeholder="이름, 이메일 검색"
                     className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FFD400] transition-all w-64"
                  />
                  <MdSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
               </div>

               <button
                  onClick={() => openPointModal(null)}
                  className="flex items-center gap-2 bg-[#FFD400] text-[#222222] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#FFC700] transition-colors shadow-sm">
                  <MdCardGiftcard className="w-5 h-5" />
                  전체 포인트 지급
               </button>

               <Link
                  to="/admin/members/new"
                  className="flex items-center gap-2 bg-[#222222] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors shadow-sm">
                  <MdAdd className="w-5 h-5" />
                  회원 등록
               </Link>
            </div>
         </div>

         {/* Table Section */}
         <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <th className="px-6 py-4 w-16 text-center">ID</th>
                        <th className="px-6 py-4">회원 정보</th>
                        <th className="px-6 py-4">연락처</th>
                        <th className="px-6 py-4">등급</th>
                        <th className="px-6 py-4">상태</th>
                        <th className="px-6 py-4">가입일</th>
                        <th className="px-6 py-4 text-center">관리</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                     {isLoading ? (
                        <tr>
                           <td colSpan={7} className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center gap-3">
                                 <div className="w-8 h-8 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin" />
                                 <span className="text-gray-400 font-medium">데이터를 불러오는 중...</span>
                              </div>
                           </td>
                        </tr>
                     ) : isError ? (
                        <tr>
                           <td colSpan={7} className="px-6 py-20 text-center text-red-500 font-medium">
                              데이터를 불러오는 데 실패했습니다.
                           </td>
                        </tr>
                     ) : members.length === 0 ? (
                        <tr>
                           <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                              등록된 회원이 없습니다.
                           </td>
                        </tr>
                     ) : (
                        members.map(member => (
                           <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4 text-gray-400 text-center font-mono">
                                 {member.id}
                              </td>
                              <td className="px-6 py-4">
                                 <Link to={`/admin/members/${member.id}`} className="flex flex-col hover:opacity-70 transition-opacity">
                                    <span className="font-bold text-[#222222]">
                                       {member.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                       {member.email}
                                    </span>
                                 </Link>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                 {member.phone}
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border ${getGradeBadge(member.grade)}`}>
                                    {member.grade}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${getStatusBadge(member.status)}`}>
                                    {member.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                 {new Date(member.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <div className="flex items-center justify-center gap-2">
                                    <button
                                       onClick={() => openPointModal({ id: member.id, name: member.name })}
                                       className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors"
                                       title="포인트 지급">
                                       <MdCardGiftcard className="w-4 h-4" />
                                    </button>
                                    <Link
                                       to={`/admin/members/${member.id}`}
                                       className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#222222] transition-colors"
                                       title="수정">
                                       <MdEdit className="w-4 h-4" />
                                    </Link>
                                    <button
                                       onClick={() => handleDelete(member.id, member.name)}
                                       disabled={deleteMutation.isPending}
                                       className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                                       title="삭제">
                                       <MdDelete className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination Section */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
               <span className="text-xs text-gray-400 font-medium">
                  Page <span className="text-[#222222]">{pagination.currentPage}</span> of {pagination.totalPages}
               </span>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                     disabled={page === 1 || isLoading}
                     className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                     <MdChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                     onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                     disabled={page === pagination.totalPages || isLoading}
                     className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                     <MdChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>

         {/* 포인트 지급 모달 */}
         <AnimatePresence>
            {isPointModalOpen && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                     <div className="bg-gradient-to-r from-[#FFD400] to-[#FFC700] p-6">
                        <div className="flex justify-between items-center">
                           <h3 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                              <MdCardGiftcard className="w-6 h-6" />
                              {targetMember ? `${targetMember.name}님에게 지급` : "전체 회원 지급"}
                           </h3>
                           <button
                              onClick={() => setIsPointModalOpen(false)}
                              className="p-2 hover:bg-white/20 rounded-full transition-colors">
                              <MdClose className="w-5 h-5 text-[#222222]" />
                           </button>
                        </div>
                     </div>
                     <div className="p-6 space-y-4">
                        <div>
                           <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">지급 금액 (P)</label>
                           <input
                              type="number"
                              value={pointForm.amount}
                              onChange={(e) => setPointForm({ ...pointForm, amount: Number(e.target.value) })}
                              className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-100 focus:border-[#FFD400] focus:outline-none font-bold transition-colors"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">지급 사유</label>
                           <input
                              type="text"
                              value={pointForm.reason}
                              onChange={(e) => setPointForm({ ...pointForm, reason: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-100 focus:border-[#FFD400] focus:outline-none font-bold transition-colors"
                           />
                        </div>
                        <button
                           onClick={() => pointMutation.mutate()}
                           disabled={pointMutation.isPending}
                           className="w-full py-3 bg-[#222222] text-white rounded-lg font-bold text-base hover:bg-black transition-all shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                           {pointMutation.isPending ? "처리 중..." : "지급하기"}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}

export default AdminMemberList;
