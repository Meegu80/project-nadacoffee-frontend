import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MdSearch, MdFilterList, MdChevronLeft, MdChevronRight, 
  MdVisibility, MdLocalShipping, MdCheckCircle, MdCancel 
} from "react-icons/md";
import { adminOrderApi } from "../../../api/admin.order.api";
import type { OrderStatus } from "../../../types/admin.order";

function AdminOrderList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");

  // 1. 주문 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", { page, status, search }],
    queryFn: () => adminOrderApi.getOrders({ page, limit: 10, status: status || undefined, search }),
  });

  // 2. 상태 변경 Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: OrderStatus }) => 
      adminOrderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      alert("주문 상태가 변경되었습니다.");
    }
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PAYMENT_COMPLETED': return 'bg-blue-50 text-blue-600';
      case 'PREPARING': return 'bg-yellow-50 text-yellow-600';
      case 'SHIPPING': return 'bg-purple-50 text-purple-600';
      case 'DELIVERED': return 'bg-green-50 text-green-600';
      case 'CANCELLED': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-black text-[#222222] tracking-tight">ORDER MANAGEMENT</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">고객의 주문 내역을 확인하고 배송 상태를 관리합니다.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="주문번호 또는 주문자명 검색..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm" 
          />
        </div>
        <div className="relative min-w-48">
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm appearance-none bg-white"
          >
            <option value="">모든 주문 상태</option>
            <option value="PAYMENT_COMPLETED">결제완료</option>
            <option value="PREPARING">배송준비중</option>
            <option value="SHIPPING">배송중</option>
            <option value="DELIVERED">배송완료</option>
            <option value="CANCELLED">주문취소</option>
          </select>
          <MdFilterList className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-6 py-4">Order Info</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">주문 내역을 불러오는 중...</td></tr>
              ) : data?.data.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#222222]">{order.orderNumber}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{order.createdAt}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">{order.userName}</span>
                      <span className="text-xs text-gray-400">{order.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[#222222]">₩ {order.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'SHIPPING' })}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="배송 시작"
                      >
                        <MdLocalShipping size={18} />
                      </button>
                      <button 
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'DELIVERED' })}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="배송 완료"
                      >
                        <MdCheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => statusMutation.mutate({ id: order.id, status: 'CANCELLED' })}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="주문 취소"
                      >
                        <MdCancel size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Total {data.pagination.total} Orders</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-white text-gray-400 disabled:opacity-30"><MdChevronLeft size={20} /></button>
              <span className="text-xs font-black text-[#222222] bg-white px-3 py-1.5 rounded-lg border border-gray-100">Page {page} / {data.pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages} className="p-2 rounded-lg hover:bg-white text-gray-400 disabled:opacity-30"><MdChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrderList;
