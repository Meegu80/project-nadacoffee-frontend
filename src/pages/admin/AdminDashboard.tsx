import React from 'react';
import { motion } from "framer-motion";
import { Users, ShoppingBag, MessageSquare, Settings, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: "오늘 방문자", value: "1,234", icon: Users, color: "bg-blue-500" },
    { label: "신규 주문", value: "56", icon: ShoppingBag, color: "bg-green-500" },
    { label: "미답변 문의", value: "12", icon: MessageSquare, color: "bg-yellow-500" },
    { label: "매출 현황", value: "₩ 2,450,000", icon: BarChart3, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black text-brand-dark">ADMIN DASHBOARD</h1>
          <button className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-lg font-bold text-sm">
            <Settings size={18} />
            설정
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-6"
            >
              <div className={`${stat.color} p-4 rounded-2xl text-white`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold">{stat.label}</p>
                <p className="text-2xl font-black text-brand-dark">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[30px] shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-black mb-6">최근 주문 내역</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">{i}</div>
                    <div>
                      <p className="font-bold text-brand-dark">주문번호 #20240320-00{i}</p>
                      <p className="text-xs text-gray-400">아메리카노 외 2건</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">결제완료</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-brand-dark rounded-[30px] shadow-xl p-8 text-white">
            <h2 className="text-xl font-black mb-6 text-brand-yellow">관리자 공지</h2>
            <ul className="space-y-6">
              <li className="space-y-2">
                <p className="text-sm font-bold">서버 점검 안내</p>
                <p className="text-xs text-gray-400 leading-relaxed">금일 새벽 2시부터 4시까지 데이터베이스 최적화 작업이 예정되어 있습니다.</p>
              </li>
              <li className="space-y-2">
                <p className="text-sm font-bold">신규 가맹점 승인</p>
                <p className="text-xs text-gray-400 leading-relaxed">안산단원점 가맹 신청 서류 검토가 완료되었습니다. 최종 승인 바랍니다.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
