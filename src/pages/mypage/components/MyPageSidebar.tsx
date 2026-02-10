import React from 'react';
import { ShoppingBag, RotateCcw, Coins, User, UserCog, Lock, ChevronRight, MessageSquare } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface MyPageSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const MyPageSidebar: React.FC<MyPageSidebarProps> = ({ activeMenu, onMenuChange }) => {
  const menuItems = [
    { name: 'My 주문내역', icon: <ShoppingBag size={20} /> },
    { name: 'My 취소/반품내역', icon: <RotateCcw size={20} /> },
    { name: 'My 포인트', icon: <Coins size={20} /> },
    { name: '내 리뷰 관리', icon: <MessageSquare size={20} /> },
    { name: 'divider' },
    { name: '내 정보 조회', icon: <User size={20} /> },
    { name: '내 정보 수정', icon: <UserCog size={20} /> },
    { name: '비밀번호 변경', icon: <Lock size={20} /> },
  ];

  return (
    <aside className="w-full md:w-80 shrink-0">
      <div className={twMerge(["bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden sticky top-32"])}>
        <div className="bg-brand-dark p-10 text-white">
          <h2 className="text-3xl font-black tracking-tight italic uppercase">My Page</h2>
          <p className="text-white/40 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">Premium Member Service</p>
        </div>
        <nav className="p-6">
          <ul className="space-y-3">
            {menuItems.map((item, idx) => {
              if (item.name === 'divider') return <hr key={idx} className="my-6 border-gray-100 mx-2" />;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => onMenuChange(item.name)}
                    className={twMerge([
                      "w-full flex items-center justify-between p-5 rounded-[20px] font-black transition-all",
                      activeMenu === item.name
                        ? "bg-brand-yellow text-brand-dark shadow-xl shadow-brand-yellow/20 translate-x-2"
                        : "text-gray-400 hover:bg-gray-50 hover:text-brand-dark"
                    ])}
                  >
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
  );
};

export default MyPageSidebar;
