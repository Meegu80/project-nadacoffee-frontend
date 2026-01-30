import React, { useState } from 'react';
import { User, UserCog, Lock, ChevronRight } from 'lucide-react';

const MyPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('내 정보 조회');

  const menuItems = [
    { name: '내 정보 조회', icon: <User size={20} /> },
    { name: '내 정보 수정', icon: <UserCog size={20} /> },
    { name: '비밀번호 변경', icon: <Lock size={20} /> },
  ];

  return (
    <div className="bg-brand-white min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10">
        
        {/* Left Sidebar Navbar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-[30px] shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-brand-dark p-8 text-white">
              <h2 className="text-2xl font-black tracking-tight">MY PAGE</h2>
              <p className="text-white/40 text-xs font-bold mt-1 uppercase tracking-widest">Member Service</p>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => setActiveMenu(item.name)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                        activeMenu === item.name
                          ? "bg-brand-yellow text-brand-dark shadow-md"
                          : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      {activeMenu === item.name && <ChevronRight size={18} />}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Right Content Area (Empty for now) */}
        <main className="flex-1">
          <div className="bg-white rounded-[30px] shadow-xl border border-gray-100 p-12 min-h-[600px] flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-10 rounded-full mb-6 text-brand-dark">
              {React.cloneElement(menuItems.find(m => m.name === activeMenu)?.icon as React.ReactElement, { size: 48 })}
            </div>
            <h3 className="text-2xl font-black text-brand-dark mb-2">{activeMenu}</h3>
            <p className="text-gray-400 font-medium">해당 서비스 준비 중입니다.</p>
          </div>
        </main>

      </div>
    </div>
  );
};

export default MyPage;
