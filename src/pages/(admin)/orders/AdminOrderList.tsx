import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdSearch, MdFilterList, MdChevronLeft, MdChevronRight,
  MdArrowUpward, MdArrowDownward, MdOutlineImageNotSupported,
  MdDelete, MdEdit
} from "react-icons/md";
import { adminOrderApi } from "../../../api/admin.order.api";
import { adminMemberApi } from "../../../api/admin.member.api";
import { useAlertStore } from "../../../stores/useAlertStore";
import type { OrderStatus } from "../../../types/admin.order";
import { twMerge } from "tailwind-merge";

function AdminOrderList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sortField, setSortField] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<number, { salePrice: number; quantity: number }>>({});

  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'delete' | 'error';
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: 'success'
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", { page, statusFilter, search, startDate, endDate }],
    queryFn: () => adminOrderApi.getOrders({
      page,
      limit: 30,
      status: statusFilter || undefined,
      search,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelectAll = () => {
    if (data?.data) {
      if (selectedIds.length === data.data.length) setSelectedIds([]);
      else setSelectedIds(data.data.map(o => o.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("PAYMENT_COMPLETED");

  const handleBulkStatusChange = async () => {
    if (selectedIds.length === 0) return;
    const targetLabel = statusOptions.find(o => o.value === bulkStatus)?.label;
    useAlertStore.getState().showAlert(
      `${selectedIds.length}건의 주문 상태를 [${targetLabel}]로 변경하시겠습니까?`,
      "상태 일괄 변경 확인",
      "info",
      [
        {
          label: "변경하기", onClick: async () => {
            try {
              for (const id of selectedIds) {
                const order = data?.data.find(o => o.id === id);
                await statusMutation.mutateAsync({ id, status: bulkStatus, order });
              }
              setResultModal({ isOpen: true, title: "일괄 변경 성공", message: `${selectedIds.length}건의 주문 상태가 정상적으로 변경되었습니다.`, type: 'success' });
              setSelectedIds([]);
            } catch (err) { }
          }
        },
        { label: "취소", onClick: () => { }, variant: "secondary" }
      ]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    useAlertStore.getState().showAlert(
      `선택한 ${selectedIds.length}건의 주문을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      "주문 일괄 삭제 확인",
      "warning",
      [
        {
          label: "삭제하기", onClick: async () => {
            try {
              for (const id of selectedIds) { await adminOrderApi.deleteOrder(String(id)); }
              setResultModal({ isOpen: true, title: "일괄 삭제 완료", message: `${selectedIds.length}건의 주문이 성공적으로 삭제되었습니다.`, type: 'delete' });
              setSelectedIds([]);
              queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
            } catch (err: any) {
              setResultModal({ isOpen: true, title: "삭제 실패", message: `일부 주문 삭제 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`, type: 'error' });
            }
          }
        },
        { label: "취소", onClick: () => { }, variant: "secondary" }
      ]
    );
  };

  const handleStartEdit = () => {
    if (selectedIds.length === 0) return;
    const initialValues: Record<number, { salePrice: number; quantity: number }> = {};
    selectedIds.forEach(id => {
      const order = data?.data.find(o => o.id === id);
      if (order && order.orderItems?.[0]) {
        initialValues[id] = { salePrice: order.orderItems[0].salePrice, quantity: order.orderItems.reduce((sum, item) => sum + item.quantity, 0) };
      }
    });
    setEditValues(initialValues);
    setIsEditing(true);
  };

  const handleBulkSave = async () => {
    if (Object.keys(editValues).length === 0) return;
    try {
      for (const id of selectedIds) {
        const edits = editValues[id];
        if (!edits) continue;
        const order = data?.data.find(o => o.id === id);
        if (!order) continue;
        const updatedItems = [...order.orderItems];
        if (updatedItems[0]) { updatedItems[0] = { ...updatedItems[0], salePrice: edits.salePrice, quantity: edits.quantity }; }
        await adminOrderApi.updateOrderDetails(String(id), { orderItems: updatedItems });
      }
      setResultModal({ isOpen: true, title: "수정 완료", message: `${selectedIds.length}건의 주문 정보가 성공적으로 수정되었습니다.`, type: 'success' });
      setIsEditing(false);
      setEditValues({});
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    } catch (err: any) {
      setResultModal({ isOpen: true, title: "수정 실패", message: `정보 수정 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`, type: 'error' });
    }
  };

  const handleCancelEdit = () => { setIsEditing(false); setEditValues({}); };

  // [수정] 모든 필드에 대한 정렬 로직 강화
  const sortedOrders = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      let valA: any; let valB: any;
      switch (sortField) {
        case "id": valA = a.id; valB = b.id; break;
        case "date": valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); break;
        case "product": valA = (a.orderItems?.[0]?.product?.name || "").toLowerCase(); valB = (b.orderItems?.[0]?.product?.name || "").toLowerCase(); break;
        case "unitPrice": valA = a.orderItems?.[0]?.salePrice || 0; valB = b.orderItems?.[0]?.salePrice || 0; break;
        case "quantity": valA = a.orderItems?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0; valB = b.orderItems?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0; break;
        case "amount": valA = a.totalPrice || 0; valB = b.totalPrice || 0; break;
        case "customer": valA = (a.recipientName || "").toLowerCase(); valB = (b.recipientName || "").toLowerCase(); break;
        case "status": valA = (a.status || "").toLowerCase(); valB = (b.status || "").toLowerCase(); break;
        default: valA = a.id; valB = b.id;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data?.data, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <MdArrowUpward size={14} className="ml-1 opacity-20" />;
    return sortOrder === "asc" ? <MdArrowUpward size={14} className="ml-1 text-brand-dark" /> : <MdArrowDownward size={14} className="ml-1 text-brand-dark" />;
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, order }: { id: number, status: OrderStatus, order?: any }) => {
      await adminOrderApi.updateOrderDetails(String(id), { status });
      if (status === 'PURCHASE_COMPLETED' && order) {
        const rewardAmount = Math.ceil(order.totalPrice * 0.01);
        if (order.memberId) { try { await adminMemberApi.grantPoints({ memberId: order.memberId, amount: rewardAmount, reason: `주문 #${order.id} 구매확정 적립` }); } catch (err) { console.error('포인트 지급 실패:', err); } }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
    onError: (err: any) => setResultModal({ isOpen: true, title: "오류 발생", message: `요청을 처리하는 중 문제가 발생했습니다: ${err.response?.data?.message || err.message}`, type: 'error' })
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
    { value: 'PENDING', label: '결제대기' }, { value: 'PAYMENT_COMPLETED', label: '결제완료' }, { value: 'PREPARING', label: '배송준비' }, { value: 'SHIPPING', label: '배송중' }, { value: 'DELIVERED', label: '배송완료' }, { value: 'PURCHASE_COMPLETED', label: '구매확정' }, { value: 'CANCELLED', label: '취소됨' }, { value: 'RETURNED', label: '반품됨' },
  ];

  const formatOrderDate = (dateInput: string) => {
    const date = new Date(dateInput);
    const month = date.getMonth() + 1; const day = date.getDate(); const hours = date.getHours(); const minutes = date.getMinutes().toString().padStart(2, '0'); const ampm = hours >= 12 ? '오후' : '오전'; const displayHours = hours % 12 || 12;
    return `${month}.${day}. ${ampm} ${displayHours}:${minutes}`;
  };

  return (
    <div className="space-y-6 pb-20">
      <div><h2 className="text-2xl font-black text-[#222222] tracking-tight uppercase italic">Order Management</h2><p className="text-sm text-gray-500 mt-1 font-medium">주문 상태를 변경하여 프로세스를 관리하세요.</p></div>

      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative"><MdSearch className="absolute left-4 top-3.5 text-gray-400" size={20} /><input type="text" placeholder="주문번호 또는 주문자명 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm" /></div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-xs bg-white" /><span className="text-gray-400 font-bold">~</span><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-xs bg-white" /></div>
          <div className="relative min-w-44"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FFD400] font-bold text-sm appearance-none bg-white cursor-pointer"><option value="">모든 주문 상태</option>{statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><MdFilterList className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" /></div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2"><span className="text-xs font-black text-gray-400 uppercase tracking-widest italic">{selectedIds.length > 0 ? `${selectedIds.length} orders selected` : 'No orders selected'}</span></div>
        <div className="flex items-center gap-3">
          <button onClick={toggleSelectAll} className="px-4 py-2.5 rounded-xl text-xs font-black border border-gray-200 hover:bg-gray-50 transition-all text-[#222222] bg-white">{data?.data && selectedIds.length === data.data.length && data.data.length > 0 ? '선택 해제' : '전체 선택'}</button>
          <div className="h-4 w-[1px] bg-gray-200 mx-1" />
          {isEditing ? (
            <div className="flex items-center gap-2"><button onClick={handleBulkSave} className="px-4 py-2.5 rounded-xl text-xs font-black bg-brand-dark text-brand-yellow hover:bg-black transition-all border border-transparent shadow-sm">저장하기</button><button onClick={handleCancelEdit} className="px-4 py-2.5 rounded-xl text-xs font-black bg-white text-gray-500 hover:bg-gray-50 transition-all border border-gray-200 shadow-sm">취소</button></div>
          ) : (
            <div className="flex items-center gap-2"><button onClick={handleStartEdit} disabled={selectedIds.length === 0} className={twMerge(["flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all", selectedIds.length > 0 ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100" : "bg-gray-50 text-gray-300 border border-transparent cursor-not-allowed"])}><MdEdit size={16} />수정하기</button><button onClick={handleBulkDelete} disabled={selectedIds.length === 0} className={twMerge(["flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all", selectedIds.length > 0 ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" : "bg-gray-50 text-gray-300 border border-transparent cursor-not-allowed"])}><MdDelete size={16} />삭제하기</button></div>
          )}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-100"><select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as OrderStatus)} disabled={selectedIds.length === 0} className={twMerge(["pl-4 pr-10 py-2.5 border rounded-xl font-bold text-xs appearance-none cursor-pointer focus:outline-none focus:border-[#FFD400] transition-all", selectedIds.length > 0 ? "border-gray-200 bg-white text-[#222222]" : "border-transparent bg-gray-50 text-gray-300 cursor-not-allowed"])}>{statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><button onClick={handleBulkStatusChange} disabled={selectedIds.length === 0} className={twMerge(["px-6 py-2.5 rounded-xl text-xs font-black transition-all", selectedIds.length > 0 ? "bg-[#222222] text-white hover:bg-black" : "bg-gray-100 text-gray-400 cursor-not-allowed"])}>상태변경 ({selectedIds.length})</button></div>
        </div>
      </div>

      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50/50 text-sm font-black text-gray-700 uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="pl-[20px] pr-[40px] py-4 w-12 text-center"><input type="checkbox" checked={data?.data && selectedIds.length === data.data.length && data.data.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-yellow" /></th>
                <th className="px-1 py-4 w-32 text-center">이미지</th>
                <th className="px-1 py-4 w-24 text-center cursor-pointer hover:text-brand-dark transition-colors" onClick={() => handleSort("id")}><div className="flex items-center justify-center">주문번호 <SortIcon field="id" /></div></th>
                <th className="pl-[65px] px-1 py-4 w-64 cursor-pointer hover:text-brand-dark transition-colors" onClick={() => handleSort("product")}><div className="flex items-center justify-center">주문정보 <SortIcon field="product" /></div></th>
                <th className="px-1 py-4 w-28 text-center cursor-pointer hover:text-brand-dark transition-colors" onClick={() => handleSort("unitPrice")}><div className="flex items-center justify-center">단가 <SortIcon field="unitPrice" /></div></th>
                <th className="px-1 py-4 w-20 text-center cursor-pointer hover:text-brand-dark transition-colors" onClick={() => handleSort("quantity")}><div className="flex items-center justify-center">수량 <SortIcon field="quantity" /></div></th>
                <th className="px-1 py-4 cursor-pointer hover:text-brand-dark transition-colors" onClick={() => handleSort("amount")}><div className="flex items-center justify-center">결제금액 <SortIcon field="amount" /></div></th>
                <th className="px-1 py-4 cursor-pointer hover:text-brand-dark transition-colors" onClick={() => handleSort("customer")}><div className="flex items-center justify-center">주문자 <SortIcon field="customer" /></div></th>
                <th className="px-1 py-4 cursor-pointer hover:text-brand-dark transition-colors" onClick={() => handleSort("status")}><div className="flex items-center justify-center">상태 <SortIcon field="status" /></div></th>
                <th className="px-4 py-4 w-40 text-center">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (<tr><td colSpan={10} className="py-20 text-center text-gray-400 font-bold italic">Loading orders...</td></tr>) : !sortedOrders || sortedOrders.length === 0 ? (<tr><td colSpan={10} className="py-20 text-center text-gray-400 font-bold">주문 내역이 없습니다.</td></tr>) : (
                sortedOrders.map(order => (
                  <tr key={order.id} className={twMerge(["hover:bg-gray-50/50 transition-colors", selectedIds.includes(order.id) ? "bg-brand-yellow/5" : ""])}>
                    <td className="pl-[20px] pr-[40px] py-4 text-center"><input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelect(order.id)} className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-yellow" /></td>
                    <td className="px-1 py-4"><div className="flex justify-center"><div className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/products/${order.orderItems?.[0]?.prodId}`)}>{order.orderItems?.[0]?.product.imageUrl ? <img src={order.orderItems[0].product.imageUrl} alt="product" className="w-full h-full object-cover" /> : <MdOutlineImageNotSupported className="text-gray-200" size={32} />}</div></div></td>
                    <td className="px-1 py-4 text-center font-black text-[#222222]"><Link to={`/admin/orders/${order.id}`} className="hover:text-brand-yellow hover:underline transition-colors">#{order.id}</Link></td>
                    <td className="pl-[65px] px-1 py-4 text-left"><div className="flex flex-col"><span className="text-xs text-gray-400 font-bold">{formatOrderDate(String(order.createdAt))}</span><span className="text-sm text-gray-500 mt-1 font-bold truncate max-w-[180px]">{order.orderItems?.[0]?.product.name} {order.orderItems?.length > 1 ? `외 ${order.orderItems.length - 1}건` : ''}</span></div></td>
                    <td className="px-1 py-4 text-center">{isEditing && selectedIds.includes(order.id) ? (<div className="flex items-center justify-center gap-1"><span className="text-xs font-bold text-gray-400">₩</span><input type="number" value={editValues[order.id]?.salePrice || 0} onChange={(e) => setEditValues(prev => ({ ...prev, [order.id]: { ...prev[order.id], salePrice: parseInt(e.target.value) || 0 } }))} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-yellow text-center" /></div>) : (<span className="text-sm font-bold text-gray-600">₩ {(order.orderItems?.[0]?.salePrice || 0).toLocaleString()}</span>)}</td>
                    <td className="px-1 py-4 text-center">{isEditing && selectedIds.includes(order.id) ? (<input type="number" value={editValues[order.id]?.quantity || 0} onChange={(e) => setEditValues(prev => ({ ...prev, [order.id]: { ...prev[order.id], quantity: parseInt(e.target.value) || 0 } }))} className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-yellow text-center" />) : (<span className="text-sm font-black text-[#222222]">{order.orderItems?.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</span>)}</td>
                    <td className="px-1 py-4 text-center"><span className={twMerge(["text-base font-black", isEditing && selectedIds.includes(order.id) ? "text-brand-dark" : "text-[#222222]"])}>₩ {(isEditing && selectedIds.includes(order.id) && editValues[order.id]) ? ((editValues[order.id].salePrice || 0) * (editValues[order.id].quantity || 0)).toLocaleString() : (order.totalPrice || 0).toLocaleString()}</span></td>
                    <td className="px-1 py-4 text-center"><div className="flex flex-col items-center"><span className="text-base font-bold text-gray-700">{order.recipientName}</span><span className="text-sm text-gray-400 font-medium">{order.recipientPhone}</span></div></td>
                    <td className="px-1 py-4 text-center"><div className="relative group/status flex justify-center"><select value={order.status} onChange={(e) => { const nextStatus = e.target.value as OrderStatus; const targetLabel = statusOptions.find(o => o.value === nextStatus)?.label; useAlertStore.getState().showAlert(`주문 상태를 [${targetLabel}]로 변경하시겠습니까?`, "상태 변경 확인", "info", [{ label: "변경하기", onClick: () => statusMutation.mutate({ id: order.id, status: nextStatus, order }) }, { label: "취소", onClick: () => { }, variant: "secondary" }]); }} className={twMerge(["px-3 py-1.5 rounded-full text-xs font-black appearance-none cursor-pointer border-none focus:ring-2 focus:ring-brand-yellow/30 transition-all", getStatusColor(order.status)])}>{statusOptions.map(opt => (<option key={opt.value} value={opt.value} className="bg-white text-[#222222] font-bold">{opt.label}</option>))}</select></div></td>
                    <td className="px-4 py-4 text-center"><div className="flex flex-col gap-1 items-center">{order.orderItems?.[0]?.option && (<span className="text-[10px] bg-brand-yellow/10 text-brand-dark px-2 py-0.5 rounded-md font-bold">{order.orderItems[0].option.name}: {order.orderItems[0].option.value}</span>)}{order.deliveryMessage && (<span className="text-[11px] text-gray-400 font-medium italic line-clamp-2 max-w-[140px]">{order.deliveryMessage}</span>)}{!order.orderItems?.[0]?.option && !order.deliveryMessage && (<span className="text-gray-300">-</span>)}</div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-gray-50"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"><MdChevronLeft size={24} /></button>{Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (<button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${p === page ? "bg-brand-yellow text-brand-dark shadow-sm" : "hover:bg-gray-100 text-gray-400"}`}>{p}</button>))}<button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"><MdChevronRight size={24} /></button></div>
        )}
      </div>
      <AnimatePresence>{resultModal.isOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResultModal(prev => ({ ...prev, isOpen: false }))} className="absolute inset-0 bg-black/40 backdrop-blur-sm" /><motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"><div className={twMerge(["w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6", resultModal.type === 'success' ? "bg-green-50 text-green-500" : resultModal.type === 'delete' ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"])}>{resultModal.type === 'success' && <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}{resultModal.type === 'delete' && <MdDelete size={40} />}{resultModal.type === 'error' && <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}</div><h3 className="text-xl font-black text-[#222222] mb-2">{resultModal.title}</h3><p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">{resultModal.message}</p><button onClick={() => setResultModal(prev => ({ ...prev, isOpen: false }))} className="w-full py-4 bg-[#222222] text-white rounded-2xl text-sm font-black hover:bg-black transition-all shadow-lg active:scale-[0.98]">닫기</button></motion.div></div>)}</AnimatePresence>
    </div>
  );
}

export default AdminOrderList;
