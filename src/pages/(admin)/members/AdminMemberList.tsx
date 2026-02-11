import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdAdd, MdSearch, MdCardGiftcard, MdClose, MdChevronLeft, MdChevronRight, MdEdit, MdDelete, MdArrowUpward, MdArrowDownward, MdSync } from "react-icons/md";
import { adminMemberApi } from "../../../api/admin.member.api";
import { adminOrderApi } from "../../../api/admin.order.api";
import { AnimatePresence, motion } from "framer-motion";
import { useAlertStore } from "../../../stores/useAlertStore";

function AdminMemberList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  // [수정] 사용자의 실마리에 따라 limit을 100으로 고정하여 페칭
  const { data: ordersResponse, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["admin", "orders", "stats-safe-fetch"],
    queryFn: () => adminOrderApi.getOrders({ page: 1, limit: 100 }),
    staleTime: 1000 * 30,
  });

  const memberStats = useMemo(() => {
    // 1. 응답 구조 유연하게 처리 (data.data 또는 data 자체가 배열인 경우 등)
    const raw = ordersResponse as any;
    let orders: any[] = [];
    if (Array.isArray(raw)) orders = raw;
    else if (raw?.data && Array.isArray(raw.data)) orders = raw.data;
    else if (raw?.orders && Array.isArray(raw.orders)) orders = raw.orders;

    const stats: Record<string | number, number> = {};
    if (orders.length === 0) return stats;

    orders.forEach((order: any) => {
      // 2. 상태 필터링 (결제 완료 관련 모든 대소문자/한글 상태 포함)
      const st = String(order.status || '').toUpperCase().trim();
      const isPaid = (
        st.includes('COMPLETED') || st.includes('SUCCESS') || st.includes('PAID') ||
        st.includes('PREPARING') || st.includes('SHIPPING') || st.includes('DELIVERED') ||
        st.includes('완료') || st.includes('확정') || st.includes('준비') || st.includes('중')
      );

      if (isPaid) {
        // 3. 금액 추출 (totalPrice, totalAmount, amount 중 존재하는 필드 사용)
        const price = Number(order.totalPrice || order.totalAmount || order.amount || 0);

        // 4. 식별자 매핑 (memberId, userId, userEmail 등 가능한 모든 키 수집)
        const keys = new Set([
          order.memberId, order.userId, order.user_id, order.member_id,
          order.userEmail, order.email, order.user_email
        ].filter(v => v !== undefined && v !== null && v !== ''));

        keys.forEach(key => {
          stats[key] = (stats[key] || 0) + price;
        });
      }
    });
    return stats;
  }, [ordersResponse]);

  const getMemberTotal = (member: any) => {
    if (!member) return 0;
    // ID(숫자/문자) 및 이메일로 합산 금액 조회
    const total = memberStats[member.id] || memberStats[String(member.id)] || memberStats[member.email] || 0;
    return total;
  };

  const getDynamicGrade = (total: number) => {
    if (total >= 300000) return 'VIP';
    if (total >= 100000) return 'GOLD';
    return 'SILVER';
  };

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, grade }: { id: number; grade: string }) => adminMemberApi.updateMember(id, { grade }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (member: any) => adminMemberApi.updateMember(member.id, {
      status: member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      useAlertStore.getState().showAlert("상태가 변경되었습니다.", "성공", "success");
    }
  });

  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<{ id: number, name: string } | null>(null);
  const [pointForm, setPointForm] = useState({ amount: 1000, reason: "이벤트 적립" });

  const { data: membersResponse, isLoading: isMembersLoading } = useQuery({
    queryKey: ["admin", "members", page],
    queryFn: () => adminMemberApi.getMembers(page, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminMemberApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      useAlertStore.getState().showAlert("회원이 삭제되었습니다.", "성공", "success");
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
      useAlertStore.getState().showAlert("포인트가 지급되었습니다.", "성공", "success");
      setIsPointModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    },
    onError: (err: any) => useAlertStore.getState().showAlert(`지급 실패: ${err.response?.data?.message || err.message}`, "실패", "error")
  });

  const sortedMembers = useMemo(() => {
    const list = membersResponse?.data?.filter((m: any) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return [...list].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case "id":
          valA = a.id;
          valB = b.id;
          break;
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case "email":
          valA = (a.email || "").toLowerCase();
          valB = (b.email || "").toLowerCase();
          break;
        case "phone":
          valA = (a.phone || "").toLowerCase();
          valB = (b.phone || "").toLowerCase();
          break;
        case "amount":
          valA = getMemberTotal(a);
          valB = getMemberTotal(b);
          break;
        case "grade":
          valA = (a.grade || "").toLowerCase();
          valB = (b.grade || "").toLowerCase();
          break;
        case "status":
          valA = (a.status || "").toLowerCase();
          valB = (b.status || "").toLowerCase();
          break;
        case "joined":
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        default:
          valA = a.id;
          valB = b.id;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        const cmp = valA.localeCompare(valB);
        return sortOrder === "asc" ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [membersResponse, search, sortField, sortOrder, memberStats]);

  useEffect(() => {
    if (isOrdersLoading || isMembersLoading || sortedMembers.length === 0) return;

    const membersToSync = sortedMembers.filter(m => {
      const dynamic = getDynamicGrade(getMemberTotal(m));
      return m.grade !== dynamic;
    });

    if (membersToSync.length > 0) {
      if (!isAutoSyncing) setIsAutoSyncing(true);
      const target = membersToSync[0];
      updateGradeMutation.mutate({ id: target.id, grade: getDynamicGrade(getMemberTotal(target)) });
    } else {
      if (isAutoSyncing) setIsAutoSyncing(false);
    }
  }, [sortedMembers, memberStats, isOrdersLoading, isMembersLoading, isAutoSyncing]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <div className="w-4" />;
    return sortOrder === "asc" ? <MdArrowUpward size={14} className="ml-1" /> : <MdArrowDownward size={14} className="ml-1" />;
  };

  const openPointModal = (member: { id: number, name: string } | null) => {
    setTargetMember(member);
    setPointForm({ amount: member ? 1000 : 5000, reason: member ? "관리자 수동 지급" : "전체 회원 이벤트 지급" });
    setIsPointModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#222222]">MEMBER MANAGEMENT</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500 font-medium">회원 정보를 조회하고 관리합니다.</p>
            {isAutoSyncing && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black animate-pulse">
                <MdSync className="animate-spin" size={12} /> 등급 자동 동기화 중...
              </div>
            )}
          </div>
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
          <table className="w-full text-center">
            <thead className="bg-gray-50 text-sm font-black text-gray-600 uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('id')}>
                  <div className="flex items-center justify-center">ID <SortIcon field="id" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center justify-center">이름 <SortIcon field="name" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('email')}>
                  <div className="flex items-center justify-center">이메일 <SortIcon field="email" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('phone')}>
                  <div className="flex items-center justify-center">Phone <SortIcon field="phone" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-center">Cumulative Amount <SortIcon field="amount" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('grade')}>
                  <div className="flex items-center justify-center">Grade <SortIcon field="grade" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center justify-center">Status <SortIcon field="status" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-[#222222] transition-colors" onClick={() => handleSort('joined')}>
                  <div className="flex items-center justify-center">Joined <SortIcon field="joined" /></div>
                </th>
                <th className="px-6 py-4 text-center w-48">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isMembersLoading ? (
                <tr><td colSpan={9} className="py-20 text-center text-gray-400 font-bold italic">Loading members...</td></tr>
              ) : sortedMembers.length === 0 ? (
                <tr><td colSpan={9} className="py-20 text-center text-gray-400 font-bold">회원이 없습니다.</td></tr>
              ) : (
                sortedMembers.map((member: any) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold font-mono text-[#222222]">#{member.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#222222]">{member.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#222222]">{member.email}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#222222]">{member.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-bold text-[#222222]">
                          ₩ {getMemberTotal(member).toLocaleString()}
                        </span>
                        {isOrdersLoading && (
                          <div className="w-3 h-3 border-2 border-[#FFD400] border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded text-sm font-bold w-fit transition-colors bg-gray-100 text-[#222222]`}>
                          {member.grade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleStatusMutation.mutate(member)}
                          className={`px-2 py-1 rounded text-[10px] font-black hover:opacity-80 transition-all ${member.status === 'ACTIVE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                          title="상태 전환"
                        >
                          {member.status}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#222222]">{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openPointModal({ id: member.id, name: member.name })} className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all border border-yellow-200 shadow-sm" title="포인트 지급"><MdCardGiftcard size={18} /></button>
                        <Link to={`/admin/members/${member.id}`} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#222222] transition-all border border-gray-200 shadow-sm" title="수정"><MdEdit size={18} /></Link>
                        <button
                          onClick={() => {
                            useAlertStore.getState().showAlert(
                              '정말로 이 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
                              '회원 삭제 확인',
                              'warning',
                              [
                                { label: '삭제하기', onClick: () => deleteMutation.mutate(member.id) },
                                { label: '취소', onClick: () => { }, variant: 'secondary' }
                              ]
                            );
                          }}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all border border-red-200 shadow-sm"
                          title="삭제"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {membersResponse && membersResponse.pagination && membersResponse.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <MdChevronLeft size={24} />
            </button>
            {Array.from({ length: membersResponse.pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${p === page ? "bg-brand-yellow text-brand-dark shadow-sm" : "hover:bg-gray-100 text-gray-400"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(membersResponse.pagination.totalPages, p + 1))}
              disabled={page === membersResponse.pagination.totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <MdChevronRight size={24} />
            </button>
          </div>
        )}
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
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">지급 금액 (P)</label><input type="number" value={pointForm.amount} onChange={(e) => setPointForm({ ...pointForm, amount: Number(e.target.value) })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">지급 사유</label><input type="text" value={pointForm.reason} onChange={(e) => setPointForm({ ...pointForm, reason: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
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
