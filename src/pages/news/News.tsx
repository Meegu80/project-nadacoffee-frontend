import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// 임시 뉴스 데이터
const MOCK_NEWS = [
  { id: 6, title: "Nerda Coffee, 2024 한국 소비자 만족도 1위 수상", date: "2024.03.15", category: "보도자료", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800" },
  { id: 5, title: "봄 시즌 한정 '체리 블라썸 라떼' 전국 매장 출시", date: "2024.03.10", category: "뉴스", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800" },
  { id: 4, title: "Nerda Coffee, 친환경 종이 빨대 전면 도입 실시", date: "2024.02.28", category: "보도자료", img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800" },
  { id: 3, title: "제 12회 Nerda 바리스타 챔피언십 성료", date: "2024.02.15", category: "뉴스", img: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800" },
  { id: 2, title: "안산 단원구 신규 가맹점 오픈 및 이벤트 안내", date: "2024.01.20", category: "뉴스", img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800" },
  { id: 1, title: "Nerda Coffee, 누적 가맹점 3,000호점 돌파 기념식", date: "2024.01.05", category: "보도자료", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800" },
];

const News: React.FC = () => {
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["전체", "뉴스", "보도자료"];

  return (
    <div className="bg-brand-white min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-brand-dark mb-4"
          >
            NEWS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-medium"
          >
            Nerda Coffee의 생생한 소식을 가장 빠르게 만나보세요.
          </motion.p>
        </div>

        {/* Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-brand-gray pb-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-2 text-lg font-bold transition-colors ${
                  activeTab === tab ? "text-brand-dark" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand-yellow"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-brand-gray rounded-full focus:outline-none focus:border-brand-yellow transition-colors shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_NEWS.map((news, index) => (
            <motion.div 
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] mb-6 shadow-lg">
                <img 
                  src={news.img} 
                  alt={news.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-brand-yellow text-brand-dark text-xs font-black px-4 py-1.5 rounded-full shadow-md">
                    {news.category}
                  </span>
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-xl font-bold text-brand-dark mb-3 line-clamp-2 group-hover:text-brand-brown transition-colors leading-snug">
                  {news.title}
                </h3>
                <p className="text-gray-400 font-medium text-sm">
                  {news.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-20 gap-4">
          <button className="p-2 rounded-full hover:bg-brand-gray transition-colors text-gray-400">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map((page) => (
              <button 
                key={page}
                className={`w-10 h-10 rounded-full font-bold transition-all ${
                  page === 1 
                  ? "bg-brand-yellow text-brand-dark shadow-md" 
                  : "hover:bg-brand-gray text-gray-400"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="p-2 rounded-full hover:bg-brand-gray transition-colors text-gray-400">
            <ChevronRight size={24} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default News;
