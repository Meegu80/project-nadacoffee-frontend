import React, { useState, useEffect } from 'react';
import { User, UserCog, Lock, ChevronRight, ShoppingBag, RotateCcw, Package, Mail, Phone, Calendar, ShieldCheck, Save, X, MapPin, CreditCard, AlertCircle, Coins, History, Gift, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { memberApi } from '../../api/member.api';
import { orderApi } from '../../api/order.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const MyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  
  // 1. 메뉴 아이템 정의 (최상단으로 이동하여 참조 에러 방지)
  const menuItems = [
    { name: 'My 주문내역', icon: <ShoppingBag size={20} /> },
    { name: 'My 취소/반품내역', icon: <RotateCcw size={20} /> },
    { name: 'My 포인트', icon: <Coins size={20} /> },
    { name: 'divider' },
    { name: '내 정보 조회', icon: <User size={20} /> },
    { name: '내 정보 수정', icon: <UserCog size={20} /> },
    { name: '비밀번호 변경', icon: <Lock size={20} /> },
  ];

  const [activeMenu, setActiveMenu] = useState('My 주문내역');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // 2. 내 정보 조회
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['members', 'me'],
    queryFn: () => memberApi.getMe(),
  });

  // 3. 내 주문 목록 조회
  const { data: orderData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => orderApi.getMyOrders(1, 10),
    enabled: activeMenu === 'My 주문내역' || activeMenu === 'My 취소/반품내역'
  });

  // 4. 포인트 잔액 및 내역 조회
  const { data: pointBalance } = useQuery({
    queryKey: ['points', 'balance'],
    queryFn: () => memberApi.getPointBalance(),
    enabled: activeMenu === 'My 포인트'
  });

  const { data: pointHistory, isLoading: isPointLoading } = useQuery({
    queryKey: ['points', 'history'],
    queryFn: () => memberApi.getPointHistory(1, 10),
    enabled: activeMenu === 'My 포인트'
  });

  // 5. 주문 상세 조회
  const { data: orderDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['orders', 'detail', selectedOrderId],
    queryFn: () => orderApi.getOrderDetail(selectedOrderId!),
    enabled: !!selectedOrderId
  });

  // 폼 상태 관리
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || '', phone: user.phone || '' });
      if (typeof setUser === 'function') setUser(user);
    }
  }, [user, setUser]);

  // Mutation 정의
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone: string }) => memberApi.updateMe(data),
    onSuccess: (res) => {
      if (typeof setUser === 'function') setUser(res.data);
      queryClient.invalidateQueries({ queryKey: ['members', 'me'] });
      alert('회원 정보가 성공적으로 수정되었습니다.');
      setActiveMenu('내 정보 조회');
    },
    onError: () => alert('정보 수정 중 오류가 발생했습니다.')
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => memberApi.changePassword(data),
    onSuccess: (res: any) => {
      alert(res.message || '비밀번호가 성공적으로 변경되었습니다.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setActiveMenu('내 정보 조회');
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || '비밀번호 변경에 실패했습니다.';
      alert(errMsg);
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: number) => orderApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
      alert('주문이 성공적으로 취소되었습니다.');
      setSelectedOrderId(null);
    },
    onError: (err: any) => alert(err.response?.data?.message || '주문 취소에 실패했습니다.')
  });

  const handleCancelOrder = (id: number) => {
    if (window.confirm('정말로 이 주문을 취소하시겠습니까?')) {
      cancelOrderMutation.mutate(id);
    }
  };

  const renderContent = () => {
    if (isUserLoading) return <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-yellow mx-auto"></div></div>;
    if (!user) return <div className="py-20 text-center font-bold text-gray-400">정보를 불러올 수 없습니다.</div>;

    switch (activeMenu) {
      case 'My 포인트':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h3 className="text-3xl font-black text-brand-dark italic mb-8">My Points</h3>
            <div className="bg-brand-dark rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-white/40 font-bold uppercase tracking-widest text-sm mb-4">Available Balance</p>
                <div className="flex items-baseline gap-2"><span className="text-6xl font-black text-brand-yellow tracking-tighter">{pointBalance?.balance.toLocaleString() || '0'}</span><span className="text-2xl font-bold text-white/60">P</span></div>
              </div>
              <Coins size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-black text-brand-dark flex items-center gap-2"><History size={20} /> 포인트 이용 내역</h4>
              {isPointLoading ? (
                <div className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-yellow mx-auto"></div></div>
              ) : pointHistory?.data && pointHistory.data.length > 0 ? (
                <div className="bg-white rounded-[30px] border border-gray-100 overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    {pointHistory.data.map((item) => (
                      <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.amount > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>{item.amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}</div>
                          <div><p className="font-black text-brand-dark">{item.reason}</p><p className="text-xs text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</p></div>
                        </div>
                        <span className={`text-lg font-black ${item.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} P</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">포인트 이용 내역이 없습니다.</p></div>}
            </div>
          </div>
        );

      case 'My 주문내역':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-3xl font-black text-brand-dark italic mb-8">Order History</h3>
            {isOrdersLoading ? (
              <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-yellow mx-auto"></div></div>
            ) : orderData?.data && orderData.data.length > 0 ? (
              orderData.data.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 p-8 flex items-center gap-8 hover:shadow-lg transition-all group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0"><img src={order.orderItems[0]?.product.imageUrl || ''} alt="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2"><span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${order.status === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-brand-dark text-brand-yellow'}`}>{order.status}</span><span className="text-xs font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                    <h4 className="text-xl font-black text-brand-dark mb-1">{order.orderItems[0]?.product.name} {order.orderItems.length > 1 ? `외 ${order.orderItems.length - 1}건` : ''}</h4>
                    <p className="text-sm text-gray-400 font-medium">주문번호: {order.id}</p>
                  </div>
                  <div className="text-right"><p className="text-2xl font-black text-brand-dark mb-3">₩ {order.totalPrice.toLocaleString()}</p><button onClick={() => setSelectedOrderId(order.id)} className="text-xs font-black text-gray-400 hover:text-brand-dark border border-gray-200 px-4 py-2 rounded-xl transition-colors">상세보기</button></div>
                </div>
              ))
            ) : <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200"><Package size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-400 font-bold">주문 내역이 없습니다.</p></div>}
          </div>
        );

      case 'My 취소/반품내역':
        const cancelledOrders = orderData?.data.filter(o => o.status === 'CANCELLED' || o.status === 'RETURNED') || [];
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-3xl font-black text-brand-dark italic mb-8">Cancellations</h3>
            {cancelledOrders.length > 0 ? (
              cancelledOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 p-8 flex items-center gap-8 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0"><img src={order.orderItems[0]?.product.imageUrl || ''} alt="product" className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2"><span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest">{order.status}</span><span className="text-xs font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                    <h4 className="text-xl font-black text-brand-dark mb-1">{order.orderItems[0]?.product.name}</h4>
                    <p className="text-sm text-gray-400 font-medium">주문번호: {order.id}</p>
                  </div>
                  <div className="text-right"><p className="text-2xl font-black text-brand-dark line-through mb-3">₩ {order.totalPrice.toLocaleString()}</p><button onClick={() => setSelectedOrderId(order.id)} className="text-xs font-black text-gray-400 hover:text-brand-dark border border-gray-200 px-4 py-2 rounded-xl transition-colors">내역확인</button></div>
                </div>
              ))
            ) : <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200"><RotateCcw size={48} className="mx-auto text-gray-200 mb-4" /><p className="text-gray-400 font-bold">취소/반품 내역이 없습니다.</p></div>}
          </div>
        );

      case '내 정보 조회':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h3 className="text-3xl font-black text-brand-dark italic mb-10">Profile Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoCard icon={<User size={20}/>} label="이름" value={user.name} />
              <InfoCard icon={<Mail size={20}/>} label="이메일" value={user.email} />
              <InfoCard icon={<Phone size={20}/>} label="연락처" value={user.phone || '미등록'} />
              <InfoCard icon={<ShieldCheck size={20}/>} label="회원등급" value={user.grade} highlight />
              <InfoCard icon={<Calendar size={20}/>} label="가입일" value={new Date(user.createdAt).toLocaleDateString()} />
            </div>
          </div>
        );

      case '내 정보 수정':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h3 className="text-3xl font-black text-brand-dark italic mb-10">Edit Profile</h3>
            <div className="max-w-xl space-y-6">
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">이름</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
              <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">연락처</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" /></div>
              <button onClick={() => updateProfileMutation.mutate(editForm)} disabled={updateProfileMutation.isPending} className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"><Save size={20} /> {updateProfileMutation.isPending ? '저장 중...' : '수정 내용 저장'}</button>
            </div>
          </div>
        );

      case '비밀번호 변경':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h3 className="text-3xl font-black text-brand-dark italic mb-10">Change Password</h3>
            <div className="max-w-xl space-y-6">
              <input type="password" placeholder="현재 비밀번호" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
              <input type="password" placeholder="새 비밀번호 (6자 이상)" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
              <input type="password" placeholder="새 비밀번호 확인" value={pwForm.confirmPassword} onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
              <button onClick={() => { if(pwForm.newPassword !== pwForm.confirmPassword) return alert('새 비밀번호가 일치하지 않습니다.'); changePasswordMutation.mutate(pwForm); }} disabled={changePasswordMutation.isPending} className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-50"><Lock size={20} /> {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경하기'}</button>
            </div>
          </div>
        );

      default:
        return <div className="py-20 text-center text-gray-400 font-bold">준비 중인 서비스입니다.</div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">
        <aside className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden sticky top-32">
            <div className="bg-brand-dark p-10 text-white">
              <h2 className="text-3xl font-black tracking-tight italic">MY PAGE</h2>
              <p className="text-white/40 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">Premium Member Service</p>
            </div>
            <nav className="p-6">
              <ul className="space-y-3">
                {menuItems.map((item, idx) => {
                  if (item.name === 'divider') return <hr key={idx} className="my-6 border-gray-100 mx-2" />;
                  return (
                    <li key={item.name}>
                      <button onClick={() => setActiveMenu(item.name)} className={`w-full flex items-center justify-between p-5 rounded-[20px] font-black transition-all ${activeMenu === item.name ? "bg-brand-yellow text-brand-dark shadow-xl shadow-brand-yellow/20 translate-x-2" : "text-gray-400 hover:bg-gray-50 hover:text-brand-dark"}`}>
                        <div className="flex items-center gap-4">{item.icon}<span className="text-sm">{item.name}</span></div>
                        {activeMenu === item.name && <ChevronRight size={18} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>
        <main className="flex-1 w-full">
          <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 p-12">{renderContent()}</div>
        </main>
      </div>

      <AnimatePresence>
        {selectedOrderId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div><h3 className="text-2xl font-black text-brand-dark italic">Order Details</h3><p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Order ID: {selectedOrderId}</p></div>
                <button onClick={() => setSelectedOrderId(null)} className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm border border-gray-100"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {isDetailLoading ? (
                  <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-yellow mx-auto"></div></div>
                ) : orderDetail && (
                  <>
                    <section>
                      <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Package size={16} /> Ordered Items</h4>
                      <div className="space-y-4">
                        {orderDetail.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                            <img src={item.product.imageUrl || ''} className="w-16 h-16 rounded-2xl object-cover" alt="prod" />
                            <div className="flex-1"><p className="font-black text-brand-dark">{item.product.name}</p><p className="text-xs text-gray-400 font-bold">{item.option?.name}: {item.option?.value} / {item.quantity}개</p></div>
                            <p className="font-black text-brand-dark">₩ {(item.salePrice * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14} /> Shipping Info</h4>
                        <div className="space-y-2 text-sm"><p className="font-bold text-brand-dark">{orderDetail.recipientName}</p><p className="text-gray-500">{orderDetail.recipientPhone}</p><p className="text-gray-500">[{orderDetail.zipCode}] {orderDetail.address1} {orderDetail.address2}</p></div>
                      </div>
                      <div className="bg-brand-dark rounded-3xl p-6 text-white">
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={14} /> Payment Summary</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between"><span>총 상품 금액</span><span className="font-bold">₩ {orderDetail.totalPrice.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>포인트 사용</span><span className="text-brand-yellow">-{orderDetail.usedPoint} P</span></div>
                          <div className="pt-3 border-t border-white/10 flex justify-between items-end"><span className="text-xs text-white/40">최종 결제 금액</span><span className="text-2xl font-black text-brand-yellow">₩ {orderDetail.totalPrice.toLocaleString()}</span></div>
                        </div>
                      </div>
                    </section>
                    {orderDetail.status !== 'CANCELLED' && (
                      <section className="bg-red-50 rounded-3xl p-8 border border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm"><AlertCircle size={24} /></div><div><p className="font-black text-red-600">주문 취소가 필요하신가요?</p><p className="text-xs text-red-400 font-bold mt-0.5">배송 시작 전까지만 취소가 가능합니다.</p></div></div>
                        <button onClick={() => handleCancelOrder(orderDetail.id)} disabled={cancelOrderMutation.isPending} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg shadow-red-200 disabled:opacity-50">{cancelOrderMutation.isPending ? '처리 중...' : '주문 취소하기'}</button>
                      </section>
                    )}
                  </>
                )}
              </div>
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end"><button onClick={() => setSelectedOrderId(null)} className="px-10 py-4 bg-brand-dark text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl">닫기</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoCard = ({ icon, label, value, highlight = false }: any) => (
  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-5">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${highlight ? 'bg-brand-yellow text-brand-dark' : 'bg-white text-gray-400 shadow-sm'}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-brand-dark">{value}</p>
    </div>
  </div>
);

export default MyPage;
