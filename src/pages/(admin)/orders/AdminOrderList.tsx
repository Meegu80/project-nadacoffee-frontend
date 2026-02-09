import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdSearch, MdFilterList, MdChevronLeft, MdChevronRight
} from "react-icons/md";
import { adminOrderApi } from "../../../api/admin.order.api";
import { adminMemberApi } from "../../../api/admin.member.api";
import type { OrderStatus } from "../../../types/admin.order";
import { twMerge } from "tailwind-merge";

function AdminOrderList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");

  // 1. 주문 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", { page, statusFilter, search }],
    queryFn: () => adminOrderApi.getOrders({ page, limit: 10, status: statusFilter || undefined, search }),
  });

  // 2. 상태 변경 Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, order }: { id: number, status: OrderStatus, order?: any }) => {
      // 주문 상태 변경
      await adminOrderApi.updateOrderStatus(String(id), status);

      // 구매확정으로 변경하는 경우 포인트 자동 지급
      if (status === 'PURCHASE_COMPLETED' && order) {
        // 포인트 계산 (1%, 소수점 올림)
        const rewardAmount = Math.ceil(order.totalPrice * 0.01);

        // 주문자의 memberId를 가져와야 함
        if (order.memberId) {
          try {
            await adminMemberApi.grantPoints({
              memberId: order.memberId,
              amount: rewardAmount,
              reason: `주문 #${order.id} 구매확정 적립`
            });
          } catch (err) {
            console.error('포인트 지급 실패:', err);
            // 포인트 지급 실패해도 주문 상태 변경은 성공으로 처리
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      alert("주문 상태가 성공적으로 변경되었습니다.");
    },
    onError: (err: any) => {
      alert(`상태 변경 실패: ${err.response?.data?.message || err.message}`);
    }
  });

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase().replace(/\s/g, '');
    if (s === 'PENDING' || s === '결제대기') return 'bg-gray-100 text-gray-500';
    if (s === 'PAYMENT_COMPLETED' || s === '결제완료') return 'bg-blue-50 text-blue-600';
    if (s === 'PREPARING' || s === '배송준비') return 'bg-yellow-50 text-yellow-600';
    if (s === 'SHIPPING' || s === '배송중') return 'bg-purple-50 text-purple-600';
    if (s === 'DELIVERED' || s === '배송완료') return 'bg-green-50 text-green-600';
    if (s === 'PURCHASE_COMPLETED' || s === '구매확정') return 'bg-brand-dark text-brand-yellow';
    if (s === 'CANCELLED' || s === '취소됨') return 'bg-red-50 text-red-600';
    if (s === 'RETURNED' || s === '반품됨') return 'bg-orange-50 text-orange-600';
    return 'bg-gray-50 text-gray-600';
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'PENDING', label: '결제대기' },
    { value: 'PAYMENT_COMPLETED', label: '결제완료' },
    { value: 'PREPARING', label: '배송준비' },
    { value: 'SHIPPING', label: '배송중' },
    { value: 'DELIVERED', label: '배송완료' },
    { value: 'PURCHASE_COMPLETED', label: '구매확정' },
    { value: 'CANCELLED', label: '취소됨' },
    { value: 'RETURNED', label: '반품됨' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-black text-[#222222] tracking-tight uppercase italic">Order Management</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">주문 상태를 변경하여 프로세스를 관리하세요.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input type="text" placeholder="주문번호 또는 주문자명 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm" />
        </div>
        <div className="relative min-w-48">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm appearance-none bg-white cursor-pointer">
            <option value="">모든 주문 상태</option>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <MdFilterList className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-6 py-4">Order Info</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold italic">Loading orders...</td></tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">주문 내역이 없습니다.</td></tr>
              ) : (
                data.data.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#222222]">#{order.id}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 font-bold">{new Date(order.createdAt).toLocaleString()}</span>
                        <span className="text-xs text-gray-500 mt-1 font-bold truncate max-w-[200px]">
                          {order.orderItems?.[0]?.product.name} {order.orderItems?.length > 1 ? `외 ${order.orderItems.length - 1}건` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700">{order.recipientName}</span>
                        <span className="text-xs text-gray-400 font-medium">{order.recipientPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-[#222222]">₩ {(order.totalPrice || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={twMerge(["px-3 py-1 rounded-full text-[10px] font-black", getStatusColor(order.status)])}>
                        {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* [수정] ACTIONS를 Select 박스로 변경 */}
                      <select
                        value={order.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as OrderStatus;
                          if (window.confirm(`주문 상태를 [${statusOptions.find(o => o.value === nextStatus)?.label}]로 변경하시겠습니까?`)) {
                            statusMutation.mutate({ id: order.id, status: nextStatus, order });
                          }
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-yellow bg-gray-50 cursor-pointer hover:bg-white transition-all"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination && (
          <div className="px-6 py-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total {data.pagination.total} Orders</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl hover:bg-white text-gray-400 disabled:opacity-30 transition-all border border-transparent hover:border-gray-100"><MdChevronLeft size={20} /></button>
              <span className="text-xs font-black text-[#222222] bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm italic">Page {page} / {data.pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages} className="p-2 rounded-xl hover:bg-white text-gray-400 disabled:opacity-30 transition-all border border-transparent hover:border-gray-100"><MdChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderList;
