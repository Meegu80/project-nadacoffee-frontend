import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderApi } from '../../../api/admin.order.api';
import { 
  MdArrowBack, MdLocalShipping, MdPayment, MdReceipt, 
  MdPerson, MdPhone, MdLocationOn, MdMessage, MdEdit, 
  MdSave, MdClose, MdVpnKey, MdContentCopy, MdOpenInNew, MdCheckCircle 
} from 'react-icons/md';
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
      showAlert("주문 정보가 업데이트되었습니다.", "성공", "success");
      setIsEditing(false);
    },
    onError: (err: any) => {
      showAlert(`업데이트 실패: ${err.message}`, "오류", "error");
    }
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} 복사 완료`);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-brand-yellow" size={48} /></div>;
  if (error || !order) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4"><p className="text-xl font-bold text-gray-400">주문 정보를 찾을 수 없습니다.</p><button onClick={() => navigate(-1)} className="px-8 py-3 bg-brand-dark text-white rounded-xl font-bold">목록으로 돌아가기</button></div>;

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

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING') return 'bg-gray-100 text-gray-500 border-gray-200';
    if (s === 'PAYMENT_COMPLETED') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (s === 'PREPARING') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    if (s === 'SHIPPING') return 'bg-purple-50 text-purple-600 border-purple-100';
    if (s === 'DELIVERED') return 'bg-green-50 text-green-600 border-green-100';
    if (s === 'PURCHASE_COMPLETED') return 'bg-brand-dark text-brand-yellow border-brand-dark';
    return 'bg-red-50 text-red-600 border-red-100';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-3 rounded-2xl hover:bg-gray-50 transition-colors text-gray-400 border border-gray-100"><MdArrowBack size={24} /></button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-brand-dark tracking-tight">주문 상세 관리</h2>
              <span className={twMerge(["px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest", getStatusColor(order.status)])}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-bold flex items-center gap-2">
              주문번호: <span className="text-brand-dark">#{order.id}</span>
              <button onClick={() => copyToClipboard(String(order.id), '주문번호')} className="hover:text-brand-yellow"><MdContentCopy size={14} /></button>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-2xl bg-gray-50 text-gray-500 font-black hover:bg-gray-100 transition-all">취소</button>
              <button onClick={() => updateMutation.mutate(editForm)} disabled={updateMutation.isPending} className="px-8 py-3 rounded-2xl bg-brand-dark text-brand-yellow font-black hover:bg-black transition-all shadow-lg flex items-center gap-2">
                {updateMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <MdSave size={20} />} 변경사항 저장
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-8 py-3 rounded-2xl bg-brand-yellow text-brand-dark font-black hover:bg-yellow-400 transition-all shadow-md flex items-center gap-2">
              <MdEdit size={20} /> 주문 정보 수정
            </button>
          )}
        </div>
      </div>

      {/* 1. 주문 상품 목록 */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm flex items-center gap-2"><MdReceipt size={20} /> 주문 상품 목록</h3>
          <span className="text-xs font-bold text-gray-400">총 {order.orderItems?.length || 0}개의 품목</span>
        </div>
        <div className="divide-y divide-gray-50">
          {order.orderItems?.map((item: any) => (
            <div key={item.id} className="p-10 flex items-center gap-8 group hover:bg-gray-50/50 transition-colors">
              {/* [수정] 이미지 클릭 시 상품 상세 이동 */}
              <Link 
                to={`/products/${item.product?.id || item.prodId}`} 
                target="_blank"
                className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm shrink-0 relative cursor-pointer hover:ring-4 hover:ring-brand-yellow/30 transition-all"
              >
                {item.product?.imageUrl ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Coffee size={32} /></div>}
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* [수정] 제품명 클릭 시 상품 상세 이동 */}
                  <Link 
                    to={`/products/${item.product?.id || item.prodId}`} 
                    target="_blank"
                    className="text-xl font-black text-brand-dark truncate hover:text-brand-yellow transition-colors"
                  >
                    {item.product?.name || '알 수 없는 상품'}
                  </Link>
                  <MdOpenInNew size={16} className="text-gray-300" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.option && <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-500 shadow-sm">{item.option.name}: {item.option.value}</span>}
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400">수량 {item.quantity || 0}개</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-brand-dark italic tracking-tighter">₩ {((item.salePrice || 0) * (item.quantity || 0)).toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">단가 ₩ {(item.salePrice || 0).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 배송지 정보 */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
          <MdLocalShipping className="text-brand-dark" size={20} />
          <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">배송지 정보</h3>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><MdPerson size={24} /></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">수령인</p><p className="text-lg font-black text-brand-dark">{order.recipientName || '-'}</p></div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shrink-0"><MdPhone size={24} /></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">연락처</p><p className="text-lg font-black text-brand-dark">{order.recipientPhone || '-'}</p></div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><MdVpnKey size={24} /></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">공동현관 비밀번호</p><p className="text-lg font-black text-brand-dark">{order.entrancePassword || '없음'}</p></div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0"><MdLocationOn size={24} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">배송 주소</p>
                <p className="text-base font-bold text-brand-dark leading-relaxed">({order.zipCode || ''})<br />{order.address1 || ''} {order.address2 || ''}</p>
                <button onClick={() => copyToClipboard(`${order.address1} ${order.address2}`, '주소')} className="mt-2 text-[10px] font-black text-blue-500 hover:underline flex items-center gap-1"><MdContentCopy size={12} /> 주소 복사하기</button>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center shrink-0"><MdMessage size={24} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">배송 메시지</p>
                {isEditing ? (
                  <textarea value={editForm.deliveryMessage} onChange={(e) => setEditForm({...editForm, deliveryMessage: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow outline-none resize-none" rows={2} />
                ) : (
                  <p className="text-sm font-bold text-gray-500 italic">"{order.deliveryMessage || '메시지가 없습니다.'}"</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 주문자 정보 */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
          <MdPerson className="text-brand-dark" size={20} />
          <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">주문자 정보</h3>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">이름</span><p className="text-lg font-black text-brand-dark">{order.member?.name || '-'}</p></div>
          <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">이메일</span><p className="text-lg font-black text-brand-dark">{order.member?.email || '-'}</p></div>
          <div className="flex flex-col gap-1"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">주문일시</span><p className="text-lg font-black text-brand-dark">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</p></div>
        </div>
      </div>

      {/* 4. 주문 상태 및 배송 관리 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
            <MdCheckCircle className="text-brand-dark" size={20} />
            <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">주문 상태 관리</h3>
          </div>
          <div className="p-10">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusLabels).map(([value, label]: any) => (
                  <button key={value} onClick={() => setEditForm({...editForm, status: value})} className={twMerge(["py-3 rounded-xl text-[10px] font-black transition-all border", editForm.status === value ? "bg-brand-dark text-brand-yellow border-brand-dark shadow-md" : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"])}>{label}</button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className={twMerge(["px-10 py-4 rounded-2xl text-lg font-black border uppercase tracking-[0.2em] shadow-sm", getStatusColor(order.status)])}>{statusLabels[order.status] || order.status}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
            <MdLocalShipping className="text-brand-dark" size={20} />
            <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">배송 관리</h3>
          </div>
          <div className="p-10 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">택배사</label>
                {isEditing ? (
                  <select value={editForm.deliveryCompany} onChange={(e) => setEditForm({...editForm, deliveryCompany: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow outline-none"><option value="">택배사 선택</option><option value="CJ대한통운">CJ대한통운</option><option value="한진택배">한진택배</option><option value="롯데택배">롯데택배</option><option value="우체국택배">우체국택배</option></select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-xl font-black text-brand-dark">{order.deliveryCompany || '미지정'}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">송장번호</label>
                {isEditing ? (
                  <input type="text" value={editForm.trackingNumber} onChange={(e) => setEditForm({...editForm, trackingNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-yellow outline-none" placeholder="숫자만 입력" />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="flex-1 px-4 py-3 bg-gray-50 rounded-xl font-black text-brand-dark">{order.trackingNumber || '미발급'}</p>
                    {order.trackingNumber && <button onClick={() => copyToClipboard(order.trackingNumber, '송장번호')} className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:text-brand-dark transition-colors"><MdContentCopy size={18} /></button>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 최종 결제 요약 */}
      <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-12 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-8 opacity-20">
            <MdPayment size={24} className="text-brand-dark" />
            <h3 className="font-black uppercase tracking-widest text-sm text-brand-dark">최종 결제 요약</h3>
          </div>
          
          <div className="w-full max-w-md bg-gray-50/50 rounded-[30px] p-10 border border-gray-100 shadow-inner">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-gray-400 font-bold text-sm">
                <span>총 상품 금액</span>
                <span className="text-brand-dark font-black">₩ {((order.totalPrice || 0) + (order.usedPoint || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 font-bold text-sm">
                <span>포인트 사용</span>
                <span className="text-red-500 font-black">- ₩ {(order.usedPoint || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 font-bold text-sm">
                <span>배송비</span>
                <span className="text-green-500 font-black">무료배송</span>
              </div>
            </div>
            
            <div className="pt-8 border-t-2 border-dashed border-gray-200 flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Total Settlement Amount</span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-brand-dark text-3xl font-light italic">₩</span>
                <span className="text-6xl font-black text-brand-dark tracking-tighter leading-none drop-shadow-sm">
                  {(order.totalPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-yellow/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-50/30 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AdminOrderDetail;
