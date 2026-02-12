import React, { useState } from 'react';
import {
  User, Mail, Phone, ShieldCheck, Calendar, Save, Lock,
  History, Coins, ArrowUpRight, ArrowDownLeft, Package,
  CheckSquare, Square, Trash2, CheckCircle, ChevronLeft, ChevronRight, MessageSquare, Star
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router';
import ReviewModal from './ReviewModal';
import ImageLightbox from '../../../components/ImageLightbox';
import { useAlertStore } from '../../../stores/useAlertStore';

interface MyPageContentProps {
  activeMenu: string;
  data: any;
  actions: any;
}

const MyPageContent: React.FC<MyPageContentProps> = ({ activeMenu, data, actions }) => {
  const navigate = useNavigate();
  const {
    user, orderData, pointBalance, pointHistory, isPointLoading, pointPage,
    myReviewsData, isReviewsLoading, reviewPage, orderPage
  } = data;
  const {
    setPointPage, setReviewPage, setOrderPage, selectedIds, setSelectedIds,
    updateProfileMutation, changePasswordMutation, deleteReviewMutation,
    confirmPurchaseMutation, handleCancelOrder,
    refetchBalance, refetchHistory
  } = actions;
  const { showAlert } = useAlertStore();

  const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleOpenReview = (order: any) => {
    setSelectedReview(null);
    setSelectedOrder(order);
    setIsReviewOpen(true);
  };

  const handleOpenEditReview = (review: any) => {
    setSelectedOrder(null);
    setSelectedReview(review);
    setIsReviewOpen(true);
  };

  const handleDeleteReview = (id: number) => {
    showAlert('정말로 이 리뷰를 삭제하시겠습니까?', '리뷰 삭제 확인', 'warning', [
      { label: '삭제하기', onClick: () => deleteReviewMutation.mutate(id) },
      { label: '취소', onClick: () => { }, variant: 'secondary' }
    ]);
  };

  const getStatusInfo = (status: string) => {
    const s = status?.toUpperCase().replace(/\s/g, '');
    if (s === 'PENDING' || s === 'PENDING_PAYMENT' || s === '결제대기') return { label: '결제대기', color: 'bg-gray-100 text-gray-500', isPending: true, canCancel: true };
    if (s === 'PAYMENT_COMPLETED' || s === '결제완료') return { label: '결제완료', color: 'bg-blue-50 text-blue-600', canCancel: true };
    if (s === 'PREPARING' || s === '배송준비') return { label: '배송준비', color: 'bg-yellow-50 text-yellow-600', canCancel: true };
    if (s === 'SHIPPING' || s === '배송중') return { label: '배송중', color: 'bg-purple-50 text-purple-600', canCancel: false };
    if (s === 'DELIVERED' || s === '배송완료') return { label: '배송완료', color: 'bg-green-50 text-green-600', canCancel: false, canConfirm: true };
    if (s === 'PURCHASE_COMPLETED' || s === '구매확정') return { label: '구매확정', color: 'bg-brand-dark text-brand-yellow', canCancel: false };
    if (s === 'CANCELLED' || s === '취소됨') return { label: '취소됨', color: 'bg-red-50 text-red-600', isCancelled: true, canCancel: false };
    if (s === 'RETURNED' || s === '반품됨') return { label: '반품됨', color: 'bg-orange-50 text-orange-600', isCancelled: true, canCancel: false };
    return { label: status, color: 'bg-gray-50 text-gray-400', canCancel: false };
  };

  // [수정] 결제하기 핸들러: 데이터 구조 정규화 및 이동
  const handlePayment = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    
    // Checkout.tsx에서 기대하는 구조로 데이터 정규화
    const normalizedOrder = {
      ...order,
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          id: item.product?.id || item.prodId // ID 필드 보장
        }
      }))
    };

    navigate('/payment', { state: { existingOrder: normalizedOrder } });
  };

  let content;
  switch (activeMenu) {
    case 'My 포인트':
      content = (
        <div className="space-y-10 animate-in fade-in duration-500">
          <h3 className="text-3xl font-black text-brand-dark italic mb-8">My Points</h3>
          <div className="bg-brand-dark rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm mb-4">Available Balance</p>
              <div className="flex items-baseline gap-2"><span className="text-6xl font-black text-brand-yellow tracking-tighter">{(pointBalance?.balance ?? 0).toLocaleString()}</span><span className="text-2xl font-bold text-white/60">P</span></div>
            </div>
            <Coins size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-black text-brand-dark flex items-center gap-2"><History size={20} /> 포인트 이용 내역</h4>
              <button onClick={() => { refetchBalance(); refetchHistory(); }} className="text-xs font-bold text-gray-400 hover:text-brand-dark transition-colors">새로고침</button>
            </div>
            {isPointLoading ? (<div className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-yellow mx-auto"></div></div>) : pointHistory?.data && pointHistory.data.length > 0 ? (
              <>
                <div className="bg-white rounded-[30px] border border-gray-100 overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    {pointHistory.data.map((item: any) => (
                      <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={twMerge(["w-10 h-10 rounded-full flex items-center justify-center", item.amount > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'])}>{item.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}</div>
                          <div><p className="font-black text-brand-dark">{item.reason}</p><p className="text-xs text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</p></div>
                        </div>
                        <span className={twMerge(["text-lg font-black", item.amount > 0 ? 'text-green-500' : 'text-red-500'])}>{item.amount > 0 ? '+' : ''}{(item.amount || 0).toLocaleString()} P</span>
                      </div>
                    ))}
                  </div>
                </div>
                {pointHistory.pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button onClick={() => setPointPage((p: number) => Math.max(1, p - 1))} disabled={pointPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={20} /></button>
                    {Array.from({ length: pointHistory.pagination.totalPages }, (_, i) => i + 1).map(num => (
                      <button key={num} onClick={() => setPointPage(num)} className={twMerge(["w-8 h-8 rounded-lg font-black text-xs transition-all", pointPage === num ? "bg-brand-dark text-white" : "text-gray-400 hover:bg-gray-50"])}>{num}</button>
                    ))}
                    <button onClick={() => setPointPage((num: number) => Math.min(pointHistory.pagination.totalPages, num + 1))} disabled={pointPage === pointHistory.pagination.totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={20} /></button>
                  </div>
                )}
              </>
            ) : <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">포인트 이용 내역이 없습니다.</p></div>}
          </div>
        </div>
      );
      break;

    case 'My 주문내역':
    case 'My 취소/반품내역':
      const isCancelTab = activeMenu === 'My 취소/반품내역';
      const filteredOrders = orderData?.data.filter((order: any) => {
        const info = getStatusInfo(order.status);
        return isCancelTab ? info.isCancelled : !info.isCancelled;
      }) || [];
      const cancellableOrders = filteredOrders.filter((order: any) => getStatusInfo(order.status).isPending);
      const toggleSelectAll = () => { if (selectedIds.length === cancellableOrders.length && cancellableOrders.length > 0) setSelectedIds([]); else setSelectedIds(cancellableOrders.map((o: any) => o.id)); };
      const toggleSelect = (id: number) => setSelectedIds((prev: number[]) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

      content = (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black text-brand-dark italic">{isCancelTab ? 'Cancellation History' : 'Order History'}</h3>
            {!isCancelTab && cancellableOrders.length > 0 && (
              <div className="flex items-center gap-3">
                <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-dark transition-colors">
                  {selectedIds.length === cancellableOrders.length ? <CheckSquare size={18} className="text-brand-dark" /> : <Square size={18} />}전체 선택
                </button>
                {selectedIds.length > 0 && (
                  <button onClick={() => actions.handleBulkCancel()} className="flex items-center gap-1 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-black hover:bg-red-100 transition-colors"><Trash2 size={14} /> 선택 삭제 ({selectedIds.length})</button>
                )}
              </div>
            )}
          </div>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order: any) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div key={order.id} className={twMerge(["bg-white rounded-3xl border p-8 flex items-center gap-6 hover:shadow-lg transition-all group", selectedIds.includes(order.id) ? 'border-brand-yellow bg-yellow-50/10' : 'border-gray-100'])}>
                  {!isCancelTab && (
                    <div className="shrink-0">
                      {statusInfo.isPending ? (
                        <button onClick={() => toggleSelect(order.id)} className="text-gray-300 hover:text-brand-dark transition-colors p-2">
                          {selectedIds.includes(order.id) ? <CheckSquare size={24} className="text-brand-dark" /> : <Square size={24} />}
                        </button>
                      ) : (<div className="w-10 h-10" />)}
                    </div>
                  )}
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${order.orderItems?.[0]?.product.id}`);
                    }}
                  >
                    <img src={order.orderItems?.[0]?.product.imageUrl || ''} alt="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2"><span className={twMerge(["text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest", statusInfo.color])}>{statusInfo.label}</span><span className="text-xs font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                    <h4 className="text-xl font-black text-brand-dark mb-1">{order.orderItems?.[0]?.product.name} {order.orderItems?.length > 1 ? `외 ${order.orderItems.length - 1}건` : ''}</h4>
                    <p className="text-sm text-gray-400 font-medium">주문번호: {order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-brand-dark mb-3">₩ {(order.totalPrice || 0).toLocaleString()}</p>
                    <div className="flex gap-2 justify-end">
                      {statusInfo.canConfirm && (
                        <button onClick={() => confirmPurchaseMutation.mutate(order)} className="text-xs font-black text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl transition-colors shadow-md flex items-center gap-1"><CheckCircle size={14} /> 구매확정</button>
                      )}
                      {order.status === 'PURCHASE_COMPLETED' && (() => {
                        const orderProductIds = order.orderItems?.map((item: any) => item.product?.id || item.prodId) || [];
                        const existingReview = myReviewsData?.data?.find((review: any) =>
                          orderProductIds.includes(review.product.id)
                        );

                        if (existingReview) {
                          return (
                            <>
                              <button onClick={() => handleOpenEditReview(existingReview)} className="text-xs font-black text-brand-dark bg-white border-2 border-brand-yellow hover:bg-brand-yellow px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1"><MessageSquare size={14} /> 리뷰 수정</button>
                              <button onClick={() => handleDeleteReview(existingReview.id)} className="text-xs font-black text-red-500 bg-white border-2 border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1"><Trash2 size={14} /> 리뷰 삭제</button>
                            </>
                          );
                        } else {
                          return (
                            <button onClick={() => handleOpenReview(order)} className="text-xs font-black text-brand-dark bg-white border-2 border-brand-yellow hover:bg-brand-yellow px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1"><MessageSquare size={14} /> 리뷰 작성</button>
                          );
                        }
                      })()}
                      {statusInfo.isPending && !isCancelTab && (
                        <><button onClick={(e) => handlePayment(e, order)} className="text-xs font-black text-brand-dark bg-brand-yellow hover:bg-black hover:text-white px-4 py-2 rounded-xl transition-colors shadow-md">결제하기</button>
                          <button onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }} className="text-xs font-black text-gray-400 hover:text-red-500 border border-gray-200 px-4 py-2 rounded-xl transition-colors flex items-center gap-1"><Trash2 size={14} /> 삭제</button></>
                      )}
                      {statusInfo.canCancel && !statusInfo.isPending && (
                        <button onClick={() => handleCancelOrder(order.id)} className="text-xs font-black text-gray-400 hover:text-red-500 border border-gray-200 px-4 py-2 rounded-xl transition-colors">주문취소</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200"><Package size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-400 font-bold">{isCancelTab ? '취소된 내역이 없습니다.' : '주문 내역이 없습니다.'}</p></div>}

          {!isCancelTab && orderData?.pagination?.totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <button onClick={() => setOrderPage(Math.max(1, orderPage - 1))} disabled={orderPage === 1} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={20} /></button>
              {Array.from({ length: orderData.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button key={pageNum} onClick={() => setOrderPage(pageNum)} className={twMerge(["w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all", orderPage === pageNum ? "bg-brand-dark text-brand-yellow shadow-lg scale-110" : "hover:bg-gray-50 text-gray-400"])}>{pageNum}</button>
              ))}
              <button onClick={() => setOrderPage(Math.min(orderData.pagination.totalPages, orderPage + 1))} disabled={orderPage === orderData.pagination.totalPages} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      );
      break;

    case '내 정보 조회':
      content = (
        <div className="space-y-10 animate-in fade-in duration-500">
          <h3 className="text-3xl font-black text-brand-dark italic mb-10">Profile Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoCard icon={<User size={20} />} label="이름" value={user?.name} />
            <InfoCard icon={<Mail size={20} />} label="이메일" value={user?.email} />
            <InfoCard icon={<Phone size={20} />} label="연락처" value={user?.phone || '미등록'} />
            <InfoCard icon={<ShieldCheck size={20} />} label="회원등급" value={data.dynamicGrade} highlight />
            <div className="bg-brand-yellow/5 p-6 rounded-3xl border border-brand-yellow/20 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-brand-dark flex items-center justify-center shadow-sm"><Coins size={20} /></div>
              <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">주문 누적 금액</p><p className="text-lg font-black text-brand-dark">₩ {(data.totalSpent || 0).toLocaleString()}</p></div>
            </div>
            <InfoCard icon={<Calendar size={20} />} label="가입일" value={user ? new Date(user.createdAt).toLocaleDateString() : ''} />
          </div>
        </div>
      );
      break;

    case '내 정보 수정':
      content = (
        <div className="space-y-10 animate-in fade-in duration-500">
          <h3 className="text-3xl font-black text-brand-dark italic mb-10">Edit Profile</h3>
          <div className="max-w-xl space-y-6">
            <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">이름</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
            <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">연락처</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
            <button onClick={() => updateProfileMutation.mutate(editForm)} disabled={updateProfileMutation.isPending} className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"><Save size={20} /> {updateProfileMutation.isPending ? '저장 중...' : '수정 내용 저장'}</button>
          </div>
        </div>
      );
      break;

    case '비밀번호 변경':
      content = (
        <div className="space-y-10 animate-in fade-in duration-500">
          <h3 className="text-3xl font-black text-brand-dark italic mb-10">Change Password</h3>
          <div className="max-w-xl space-y-6">
            <input type="password" placeholder="현재 비밀번호" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
            <input type="password" placeholder="새 비밀번호 (6자 이상)" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
            <input type="password" placeholder="새 비밀번호 확인" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
            <button onClick={() => { if (pwForm.newPassword !== pwForm.confirmPassword) return showAlert('새 비밀번호가 일치하지 않습니다.', '알림', 'warning'); changePasswordMutation.mutate(pwForm); }} disabled={changePasswordMutation.isPending} className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-50"><Lock size={20} /> {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경하기'}</button>
          </div>
        </div>
      );
      break;

    case '내 리뷰 관리':
      content = (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black text-brand-dark italic">Manage My Reviews</h3>
            <span className="text-xs font-bold text-gray-400">Total {myReviewsData?.pagination.total || 0} reviews</span>
          </div>
          {isReviewsLoading ? (<div className="py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-yellow mx-auto"></div></div>) : myReviewsData?.data && myReviewsData.data.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {myReviewsData.data.map((review: any) => (
                  <div key={review.id} className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all group min-w-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50 cursor-pointer" onClick={() => navigate(`/products/${review.product.id}`)}><img src={review.product.imageUrl || ''} alt="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                    <div className="flex-1 flex flex-col space-y-3 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><span className="text-xs font-black text-brand-dark bg-brand-yellow px-3 py-1 rounded-full uppercase tracking-tighter">{review.product.name}</span><div className="flex text-brand-yellow">{Array.from({ length: 5 }).map((_, idx) => (<Star key={idx} size={10} fill={idx < review.rating ? "currentColor" : "none"} className={idx < review.rating ? "" : "text-gray-200"} />))}</div></div>
                        <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-500 font-medium text-sm leading-relaxed whitespace-pre-wrap break-all w-full">{review.content}</p>
                      {review.reviewImages && review.reviewImages.length > 0 && (<div className="flex gap-2">{review.reviewImages.map((img: any, idx: number) => (<div key={img.id} className="w-12 h-12 rounded-xl overflow-hidden border border-gray-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setLightboxImages(review.reviewImages.map((i: any) => i.url)); setLightboxIndex(idx); setLightboxOpen(true); }}><img src={img.url} alt="Review" className="w-full h-full object-cover" /></div>))}</div>)}
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 justify-end shrink-0">
                      <button onClick={() => handleOpenEditReview(review)} className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-gray-50 text-gray-400 font-black text-xs hover:bg-brand-dark hover:text-white transition-all flex items-center justify-center gap-1">수정</button>
                      <button onClick={() => handleDeleteReview(review.id)} className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-red-50 text-red-400 font-black text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1"><Trash2 size={14} /> 삭제</button>
                    </div>
                  </div>
                ))}
              </div>
              {myReviewsData.pagination.totalPages > 1 && (<div className="flex justify-center items-center gap-2 mt-8"><button onClick={() => setReviewPage((p: number) => Math.max(1, p - 1))} disabled={reviewPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={20} /></button>{Array.from({ length: myReviewsData.pagination.totalPages }, (_, i) => i + 1).map(num => (<button key={num} onClick={() => setReviewPage(num)} className={twMerge(["w-8 h-8 rounded-lg font-black text-xs transition-all", reviewPage === num ? "bg-brand-dark text-white" : "text-gray-400 hover:bg-gray-50"])}>{num}</button>))}<button onClick={() => setReviewPage((num: number) => Math.min(myReviewsData.pagination.totalPages, num + 1))} disabled={reviewPage === myReviewsData.pagination.totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={20} /></button></div>)}
            </div>
          ) : (<div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200"><MessageSquare size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-400 font-bold">작성하신 리뷰가 없습니다.</p></div>)}
        </div>
      );
      break;

    default:
      content = (<div className="py-20 text-center text-gray-400 font-bold">준비 중인 서비스입니다.</div>);
  }

  return (
    <>
      {content}
      <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} order={selectedOrder} editData={selectedReview} />
      <ImageLightbox images={lightboxImages} currentIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} onNavigate={setLightboxIndex} />
    </>
  );
};

const InfoCard = ({ icon, label, value, highlight = false }: any) => (
  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-5">
    <div className={twMerge(["w-12 h-12 rounded-2xl flex items-center justify-center", highlight ? 'bg-brand-yellow text-brand-dark' : 'bg-white text-gray-400 shadow-sm'])}>{icon}</div>
    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p><p className="text-lg font-black text-brand-dark">{value}</p></div>
  </div>
);

export default MyPageContent;
