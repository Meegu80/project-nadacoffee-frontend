import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdAdd, MdSearch, MdCardGiftcard, MdClose, MdChevronLeft, MdChevronRight, MdEdit, MdDelete } from "react-icons/md";
import { adminMemberApi } from "../../../api/admin.member.api";
import { AnimatePresence, motion } from "framer-motion";

function AdminMemberList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<{ id: number, name: string } | null>(null);
  const [pointForm, setPointForm] = useState({ amount: 1000, reason: "이벤트 적립" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "members", page],
    queryFn: () => adminMemberApi.getMembers(page, 10),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminMemberApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      alert("회원이 삭제되었습니다.");
    },
  });

  const pointMutation = useMutation({
    mutationFn: async () => {
      if (targetMember) {
        return adminMemberApi.grantPoints({ memberId: targetMember.id, amount: Number(pointForm.amount), reason: pointForm.reason });
      } else {
        return adminMemberApi.grantPointsToAll({ amount: Number(pointForm.amount), reason: pointForm.reason });
      }
    },
    onSuccess: () => {
      alert("포인트가 지급되었습니다.");
      setIsPointModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    },
    onError: (err: any) => alert(`지급 실패: ${err.response?.data?.message || err.message}`)
  });

  const openPointModal = (member: { id: number, name: string } | null) => {
    setTargetMember(member);
    setPointForm({ amount: member ? 1000 : 5000, reason: member ? "관리자 수동 지급" : "전체 회원 이벤트 지급" });
    setIsPointModalOpen(true);
  };

  const filteredMembers = data?.data?.filter((m: any) => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#222222]">MEMBER MANAGEMENT</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">회원 정보를 조회하고 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openPointModal(null)} className="flex items-center gap-2 bg-brand-yellow text-brand-dark px-6 py-3 rounded-xl text-sm font-black hover:bg-yellow-400 transition-all shadow-sm">
            <MdCardGiftcard size={20} /> 전체 포인트 지급
          </button>
          <Link to="/admin/members/new" className="flex items-center gap-2 bg-[#222222] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg">
            <MdAdd size={20} /> 회원 등록
          </Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
        <div className="relative">
          <MdSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input type="text" placeholder="이름 또는 이메일 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-center w-48">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={7} className="py-20 text-center text-gray-400 font-bold italic">Loading members...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-gray-400 font-bold">회원이 없습니다.</td></tr>
              ) : (
                filteredMembers.map((member: any) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">#{member.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#222222]">{member.name}</span>
                        <span className="text-xs text-gray-400">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.phone}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-500">{member.grade}</span></td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-black ${member.status === 'ACTIVE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{member.status}</span></td>
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openPointModal({ id: member.id, name: member.name })} className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all border border-yellow-200 shadow-sm" title="포인트 지급"><MdCardGiftcard size={18} /></button>
                        <Link to={`/admin/members/${member.id}`} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#222222] transition-all border border-gray-200 shadow-sm" title="수정"><MdEdit size={18} /></Link>
                        <button onClick={() => { if(window.confirm('정말 삭제하시겠습니까?')) deleteMutation.mutate(member.id) }} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all border border-red-200 shadow-sm" title="삭제"><MdDelete size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isPointModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-md rounded-[30px] overflow-hidden shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-brand-dark flex items-center gap-2"><MdCardGiftcard className="text-brand-yellow" /> {targetMember ? `${targetMember.name}님에게 지급` : "전체 회원 지급"}</h3>
                <button onClick={() => setIsPointModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdClose size={20} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">지급 금액 (P)</label><input type="number" value={pointForm.amount} onChange={(e) => setPointForm({...pointForm, amount: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">지급 사유</label><input type="text" value={pointForm.reason} onChange={(e) => setPointForm({...pointForm, reason: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
                <button onClick={() => pointMutation.mutate()} disabled={pointMutation.isPending} className="w-full py-4 bg-brand-dark text-white rounded-xl font-black text-lg hover:bg-black transition-all shadow-lg mt-4 disabled:opacity-50">{pointMutation.isPending ? "처리 중..." : "지급하기"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminMemberList;
