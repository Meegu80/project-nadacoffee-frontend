import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// 임시 통합 데이터 (공지사항 + 뉴스 + 이벤트)
const MOCK_DATA = [
  { id: 10, title: "[공지] Nada Coffee 앱 런칭 기념 이벤트 안내", date: "2024.03.20", category: "공지사항", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800" },
  { id: 9, title: "Nada Coffee, 2024 한국 소비자 만족도 1위 수상", date: "2024.03.15", category: "뉴스", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800" },
  { id: 8, title: "봄 시즌 한정 '체리 블라썸 라떼' 전국 매장 출시", date: "2024.03.10", category: "뉴스", img: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=800" },
  { id: 7, title: "[이벤트] 화이트데이 기념 원두 1+1 프로모션", date: "2024.03.05", category: "이벤트", img: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800" },
  { id: 6, title: "Nada Coffee, 친환경 종이 빨대 전면 도입 실시", date: "2024.02.28", category: "뉴스", img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800" },
  { id: 5, title: "[공지] 시스템 정기 점검 안내 (3/1 새벽)", date: "2024.02.25", category: "공지사항", img: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=800" },
];

const News: React.FC = () => {
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["전체", "공지사항", "뉴스", "이벤트"];

  const filteredData = MOCK_DATA.filter(item => {
    const matchesTab = activeTab === "전체" || item.category === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. Hero Section (Compose Style) */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-brand-dark">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000" 
            alt="News Hero" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        </div>
        <div className="relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4"
          >
            NEWS
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            className="h-1 bg-brand-yellow mx-auto"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-20">
        
        {/* 2. Tabs & Search Bar (Compose Style) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 border-b border-gray-100 pb-8">
          <div className="flex gap-2 md:gap-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-2 text-base md:text-xl font-black transition-all ${
                  activeTab === tab ? "text-brand-dark" : "text-gray-300 hover:text-gray-500"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-8 left-0 right-0 h-1 bg-brand-dark z-10"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-brand-dark transition-all font-medium"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-dark text-white rounded-full flex items-center justify-center hover:bg-black transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* 3. News Grid (Compose Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          <AnimatePresence mode='wait'>
            {filteredData.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6 shadow-sm border border-gray-100">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full shadow-sm ${
                      item.category === '공지사항' ? 'bg-brand-dark text-white' : 
                      item.category === '이벤트' ? 'bg-brand-yellow text-brand-dark' : 
                      'bg-white text-brand-dark'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="text-lg md:text-xl font-bold text-brand-dark mb-3 line-clamp-2 group-hover:text-brand-brown transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 font-bold text-xs tracking-wider">
                    {item.date}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 4. Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-40">
            <p className="text-gray-300 text-2xl font-black italic">NO RESULTS FOUND</p>
          </div>
        )}

        {/* 5. Pagination (Compose Style) */}
        <div className="flex justify-center items-center mt-24 gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
            <ChevronLeft size={20} />
          </button>
          {[1, 2, 3].map((page) => (
            <button 
              key={page}
              className={`w-10 h-10 rounded-lg font-bold transition-all ${
                page === 1 
                ? "bg-brand-dark text-white shadow-lg" 
                : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default News;
