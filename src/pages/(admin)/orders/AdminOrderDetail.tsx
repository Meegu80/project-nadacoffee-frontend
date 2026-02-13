import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderApi } from '../../../api/admin.order.api';
import { MdArrowBack, MdLocalShipping, MdPayment, MdReceipt, MdPerson, MdPhone, MdLocationOn, MdMessage, MdEdit, MdSave, MdClose } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
import { Loader2, Coffee } from 'lucide-react';
import { useAlertStore } from '../../../stores/useAlertStore';
import type { OrderStatus } from '../../../types/admin.order';

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '' as OrderStatus,
    deliveryMessage: '',
    deliveryCompany: '',
    trackingNumber: ''
  });

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminOrderApi.getOrder(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (order) {
      setEditForm({
        status: order.status,
        deliveryMessage: order.deliveryMessage || '',
        deliveryCompany: order.deliveryCompany || '',
        trackingNumber: order.trackingNumber || ''
      });
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminOrderApi.updateOrderDetails(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      showAlert("주문 정보가 수정되었습니다.", "성공", "success");
      setIsEditing(false);
    },
    onError: (err: any) => {
      showAlert(`수정 실패: ${err.response?.data?.message || err.message}`, "오류", "error");
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]"><Loader2 className="animate-spin text-brand-yellow" size={48} /></div>;
  if (error || !order) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] gap-4"><p className="text-xl font-bold text-gray-400">주문 정보를 찾을 수 없습니다.</p><button onClick={() => navigate(-1)} className="px-6 py-2 bg-brand-dark text-white rounded-full">뒤로가기</button></div>;

  const statusLabels: any = {
    PENDING: '결제대기',
    PAYMENT_COMPLETED: '결제완료',
    PREPARING: '배송준비',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    CANCELLED: '취소됨',
    PURCHASE_COMPLETED: '구매확정',
    RETURNED: '반품됨'
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

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING') return 'bg-gray-100 text-gray-500';
    if (s === 'PAYMENT_COMPLETED') return 'bg-blue-50 text-blue-600';
    if (s === 'PREPARING') return 'bg-yellow-50 text-yellow-600';
    if (s === 'SHIPPING') return 'bg-purple-50 text-purple-600';
    if (s === 'DELIVERED') return 'bg-green-50 text-green-600';
    if (s === 'PURCHASE_COMPLETED') return 'bg-brand-dark text-brand-yellow';
    return 'bg-red-50 text-red-600';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white transition-colors text-gray-500 shadow-sm border border-gray-100 bg-white"><MdArrowBack size={24} /></button>
          <div>
            <h2 className="text-2xl font-black text-[#222222] tracking-tight uppercase italic">Order Details</h2>
            <p className="text-sm text-gray-500 font-medium">주문번호: #{order.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-gray-500 font-bold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"><MdClose size={20} /> 취소</button>
              <button onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-dark text-brand-yellow font-black hover:bg-black transition-all shadow-lg disabled:opacity-50">{updateMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <MdSave size={20} />} 수정 저장</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-brand-dark font-black hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"><MdEdit size={20} /> 정보 수정하기</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 1. 주문 상품 리스트 */}
          <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdReceipt className="text-brand-dark" size={20} />
                <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">Ordered Items</h3>
              </div>
              {isEditing ? (
                <select 
                  value={editForm.status} 
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as OrderStatus})}
                  className={twMerge(["px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 border-brand-yellow focus:outline-none", getStatusColor(editForm.status)])}
                >
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <span className={twMerge(["px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", getStatusColor(order.status)])}>
                  {statusLabels[order.status] || order.status}
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {order.orderItems?.map((item: any) => (
                <div key={item.id} className="p-8 flex items-center gap-6 group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm shrink-0">
                    {item.product?.imageUrl ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Coffee size={28} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-brand-dark truncate mb-1">{item.product?.name || '알 수 없는 상품'}</h4>
                    <div className="flex items-center gap-2">
                      {item.option && <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500">{item.option.name}: {item.option.value}</span>}
                      <span className="text-xs text-gray-400 font-bold">수량: {item.quantity || 0}개</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-brand-dark italic">₩ {((item.salePrice || 0) * (item.quantity || 0)).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unit: ₩ {(item.salePrice || 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 배송지 정보 */}
          <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <MdLocalShipping className="text-brand-dark" size={20} />
              <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">Shipping Information</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><MdPerson size={20} /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recipient</p><p className="font-bold text-brand-dark">{order.recipientName || '-'}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><MdPhone size={20} /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p><p className="font-bold text-brand-dark">{order.recipientPhone || '-'}</p></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><MdLocationOn size={20} /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</p><p className="font-bold text-brand-dark text-sm leading-relaxed">({order.zipCode || ''}) {order.address1 || ''} {order.address2 || ''}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><MdMessage size={20} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Message</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.deliveryMessage} 
                        onChange={(e) => setEditForm({...editForm, deliveryMessage: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-yellow"
                        placeholder="배송 메시지 입력"
                      />
                    ) : (
                      <p className="font-bold text-brand-dark text-sm">{order.deliveryMessage || '메시지 없음'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* 3. 주문자 정보 */}
          <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <MdPerson className="text-brand-dark" size={20} />
              <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">Customer Info</h3>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">이름</span><span className="font-black text-brand-dark">{order.member?.name || '-'}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">이메일</span><span className="font-bold text-brand-dark text-sm">{order.member?.email || '-'}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">주문일시</span><span className="font-bold text-gray-400 text-xs">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</span></div>
            </div>
          </div>

          {/* 4. 배송 관리 (수정 가능) */}
          <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <MdLocalShipping className="text-brand-dark" size={20} />
              <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">Shipping Management</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Company</label>
                {isEditing ? (
                  <select 
                    value={editForm.deliveryCompany} 
                    onChange={(e) => setEditForm({...editForm, deliveryCompany: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-brand-yellow"
                  >
                    <option value="">택배사 선택</option>
                    <option value="CJ대한통운">CJ대한통운</option>
                    <option value="한진택배">한진택배</option>
                    <option value="롯데택배">롯데택배</option>
                    <option value="우체국택배">우체국택배</option>
                    <option value="로젠택배">로젠택배</option>
                  </select>
                ) : (
                  <p className="font-black text-brand-dark">{order.deliveryCompany || '미지정'}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editForm.trackingNumber} 
                    onChange={(e) => setEditForm({...editForm, trackingNumber: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-brand-yellow"
                    placeholder="송장 번호 입력"
                  />
                ) : (
                  <p className="font-black text-brand-dark">{order.trackingNumber || '미발급'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 5. 결제 요약 */}
          <div className="bg-[#222222] rounded-[30px] shadow-xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 opacity-50"><MdPayment size={20} /><h3 className="font-black uppercase tracking-widest text-sm">Payment Summary</h3></div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white/60 font-bold text-sm"><span>총 상품 금액</span><span>₩ {((order.totalPrice || 0) + (order.usedPoint || 0)).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-white/60 font-bold text-sm"><span>포인트 사용</span><span className="text-brand-yellow">- ₩ {(order.usedPoint || 0).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-white/60 font-bold text-sm"><span>배송비</span><span className="text-green-400">무료배송</span></div>
                <div className="pt-6 border-t border-white/10 mt-6"><div className="flex justify-between items-end"><span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Revenue</span><div className="text-right"><span className="text-brand-yellow text-4xl font-black italic tracking-tighter">₩ {(order.totalPrice || 0).toLocaleString()}</span></div></div></div>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" /><div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-yellow/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
