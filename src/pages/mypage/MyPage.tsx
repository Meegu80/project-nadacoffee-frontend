import React, { useState } from 'react';
import { User, UserCog, Lock, ChevronRight, ShoppingBag, RotateCcw, Package } from 'lucide-react';

const MyPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('My 주문내역');

  const menuItems = [
    { name: 'My 주문내역', icon: <ShoppingBag size={20} /> },
    { name: 'My 취소/반품내역', icon: <RotateCcw size={20} /> },
    { name: 'divider' },
    { name: '내 정보 조회', icon: <User size={20} /> },
    { name: '내 정보 수정', icon: <UserCog size={20} /> },
    { name: '비밀번호 변경', icon: <Lock size={20} /> },
  ];

  // 더미 데이터
  const orders = [
    { id: 'ORD-20260130-001', date: '2026.01.30', name: '에티오피아 예가체프 외 1건', price: 28500, status: '배송준비중', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=200' },
    { id: 'ORD-20260125-042', date: '2026.01.25', name: '나다 시그니처 블렌드 500g', price: 18000, status: '배송완료', img: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=200' },
  ];

  const cancellations = [
    { id: 'ORD-20260110-012', date: '2026.01.10', name: '콜롬비아 수프레모', price: 15000, status: '취소완료', img: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=200' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'My 주문내역':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black text-brand-dark italic">Order History</h3>
              <span className="text-sm font-bold text-gray-400">최근 3개월 내역</span>
            </div>
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 p-8 flex items-center gap-8 hover:shadow-lg transition-all group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                    <img src={order.img} alt={order.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-brand-yellow bg-brand-dark px-3 py-1 rounded-full uppercase tracking-widest">{order.status}</span>
                      <span className="text-xs font-bold text-gray-400">{order.date}</span>
                    </div>
                    <h4 className="text-xl font-black text-brand-dark mb-1">{order.name}</h4>
                    <p className="text-sm text-gray-400 font-medium">주문번호: {order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-brand-dark mb-3">₩ {order.price.toLocaleString()}</p>
                    <button className="text-xs font-black text-gray-400 hover:text-brand-dark border border-gray-200 px-4 py-2 rounded-xl transition-colors">상세보기</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                <Package size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">주문 내역이 없습니다.</p>
              </div>
            )}
          </div>
        );

      case 'My 취소/반품내역':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black text-brand-dark italic">Cancellations & Returns</h3>
            </div>
            {cancellations.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl border border-gray-100 p-8 flex items-center gap-8 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest">{item.status}</span>
                    <span className="text-xs font-bold text-gray-400">{item.date}</span>
                  </div>
                  <h4 className="text-xl font-black text-brand-dark mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-400 font-medium">주문번호: {item.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-400 line-through mb-3">₩ {item.price.toLocaleString()}</p>
                  <button className="text-xs font-black text-gray-400 hover:text-brand-dark border border-gray-200 px-4 py-2 rounded-xl transition-colors">내역확인</button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="bg-gray-50 p-10 rounded-full mb-6 text-brand-dark">
              {React.cloneElement(menuItems.find(m => m.name === activeMenu)?.icon as React.ReactElement, { size: 48 })}
            </div>
            <h3 className="text-2xl font-black text-brand-dark mb-2">{activeMenu}</h3>
            <p className="text-gray-400 font-medium">해당 서비스 준비 중입니다.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden sticky top-32">
            <div className="bg-brand-dark p-10 text-white">
              <h2 className="text-3xl font-black tracking-tight italic">MY PAGE</h2>
              <p className="text-white/40 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">Premium Member Service</p>
            </div>
            
            <nav className="p-6">
              <ul className="space-y-3">
                {menuItems.map((item, idx) => {
                  if (item.name === 'divider') {
                    return <hr key={idx} className="my-6 border-gray-100 mx-2" />;
                  }
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => setActiveMenu(item.name)}
                        className={`w-full flex items-center justify-between p-5 rounded-[20px] font-black transition-all ${
                          activeMenu === item.name
                            ? "bg-brand-yellow text-brand-dark shadow-xl shadow-brand-yellow/20 translate-x-2"
                            : "text-gray-400 hover:bg-gray-50 hover:text-brand-dark"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {item.icon}
                          <span className="text-sm">{item.name}</span>
                        </div>
                        {activeMenu === item.name && <ChevronRight size={18} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 w-full">
          <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 p-12">
            {renderContent()}
          </div>
        </main>

      </div>
    </div>
  );
};

export default MyPage;
