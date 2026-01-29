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
} from "react-icons/md";
import { adminMemberApi } from "../../../api/admin.member.api.ts";

function AdminMemberList() {
   const [page, setPage] = useState(1);
   const limit = 10;
   const queryClient = useQueryClient();

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

   const handleDelete = (id: number, name: string) => {
      if (window.confirm(`정말로 [${name}] 회원을 삭제하시겠습니까?`)) {
         deleteMutation.mutate(id);
      }
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
      </div>
   );
}

export default AdminMemberList;
