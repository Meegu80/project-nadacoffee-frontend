import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Calendar, Eye } from 'lucide-react';
import SEO from '../../components/common/SEO';

// 이미지 일괄 임포트 (1~20)
const newsImages = Array.from({ length: 20 }, (_, i) => {
  return new URL(`../../assets/news/news1 (${i + 1}).jpg`, import.meta.url).href;
});

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  views: number;
  image: string;
}

const News: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('제목+내용');

  // 더미 데이터 생성
  const allNews: NewsItem[] = useMemo(() => {
    return newsImages.map((img, index) => ({
      id: 20 - index,
      title: `나다커피의 새로운 소식을 전해드립니다. (${20 - index})`,
      summary: "나다커피가 제안하는 새로운 커피 문화를 경험해보세요. 고객님들께 더 나은 서비스를 제공하기 위한 나다커피의 노력은 계속됩니다.",
      date: `2026.01.${30 - index > 0 ? 30 - index : '01'}`,
      views: 1200 + (index * 50),
      image: img
    }));
  }, []);

  const filteredNews = useMemo(() => {
    if (!searchQuery) return allNews;
    const query = searchQuery.toLowerCase();
    return allNews.filter(n => {
      if (searchFilter === '제목') return n.title.toLowerCase().includes(query);
      if (searchFilter === '내용') return n.summary.toLowerCase().includes(query);
      return n.title.toLowerCase().includes(query) || n.summary.toLowerCase().includes(query);
    });
  }, [searchQuery, searchFilter, allNews]);

  return (
    <div className="bg-white min-h-screen pt-10 pb-20">
      <SEO
        title="나다커피 소식"
        description="나다커피의 최신 소식, 신메뉴 출시, 이벤트 등 다양한 콘텐츠를 확인하세요."
        keywords="나다커피 소식, 커피 뉴스, 나다커피 업데이트"
      />
      <div className="max-w-6xl mx-auto px-4">

        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-brand-dark tracking-tighter italic uppercase">
            News
          </h2>
          <div className="w-16 h-1.5 bg-brand-yellow mx-auto mt-6 rounded-full" />
        </div>

        {/* Search Area: 우측 정렬 및 필터 추가 */}
        <div className="flex justify-end mb-12">
          <div className="flex items-center gap-0 border-b-2 border-gray-100 focus-within:border-brand-dark transition-colors">
            {/* 검색 필터 선택 */}
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent px-4 py-3 text-sm font-bold text-gray-500 outline-none cursor-pointer hover:text-brand-dark"
            >
              <option value="제목+내용">제목+내용</option>
              <option value="제목">제목</option>
              <option value="내용">내용</option>
            </select>

            <div className="w-[1px] h-4 bg-gray-200 mx-2" />

            {/* 검색창 */}
            <div className="relative w-64 md:w-80">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-2 pr-10 py-3 bg-transparent outline-none font-medium text-sm"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-10">
          <AnimatePresence mode='popLayout'>
            {filteredNews.map((news, idx) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col md:flex-row gap-10 p-2 group cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-72 h-52 shrink-0 overflow-hidden rounded-[20px] shadow-lg">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {news.date}</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span className="flex items-center gap-1"><Eye size={14} /> {news.views.toLocaleString()}</span>
                  </div>

                  <h3 className="text-2xl font-black text-brand-dark mb-4 group-hover:text-brand-yellow transition-colors leading-tight">
                    {news.title}
                  </h3>

                  <p className="text-gray-500 text-sm md:text-base font-medium line-clamp-2 mb-6 leading-relaxed">
                    {news.summary}
                  </p>

                  <div className="text-xs font-black text-brand-dark uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                    Read More <ChevronRight size={14} className="text-brand-yellow" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="py-40 text-center border-t border-gray-100 mt-10">
            <p className="text-gray-300 text-xl font-bold uppercase tracking-widest">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-24">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"><ChevronLeft size={20} /></button>
          <div className="flex gap-2">
            {[1, 2, 3].map(num => (
              <button key={num} className={`w-10 h-10 rounded-full text-sm font-black transition-all ${num === 1 ? "bg-brand-dark text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}>{num}</button>
            ))}
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"><ChevronRight size={20} /></button>
        </div>

      </div>
    </div>
  );
};

export default News;
