import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../../components/common/SEO';

// 임시 공지사항 데이터
const MOCK_NOTICES = [
  { id: 10, title: "[공지] Nada Coffee 앱 런칭 기념 이벤트 안내", date: "2024.03.20", isNew: true },
  { id: 9, title: "[안내] 개인정보 처리방침 개정 안내", date: "2024.03.15", isNew: false },
  { id: 8, title: "[공지] 봄 시즌 신메뉴 '딸기 듬뿍 라떼' 출시", date: "2024.03.10", isNew: false },
  { id: 7, title: "[안내] 화이트데이 기념 원두 할인 프로모션", date: "2024.03.05", isNew: false },
  { id: 6, title: "[공지] 시스템 정기 점검 안내 (3/1 새벽)", date: "2024.02.28", isNew: false },
  { id: 5, title: "[안내] 설 연휴 매장 영업시간 안내", date: "2024.02.05", isNew: false },
  { id: 4, title: "[공지] 제 5회 바리스타 챔피언십 개최 안내", date: "2024.01.25", isNew: false },
  { id: 3, title: "[안내] 멤버십 등급별 혜택 변경 안내", date: "2024.01.15", isNew: false },
  { id: 2, title: "[공지] 신규 가맹점 '안산단원점' 오픈 안내", date: "2024.01.10", isNew: false },
  { id: 1, title: "[안내] Nada Coffee 홈페이지 리뉴얼 오픈", date: "2024.01.01", isNew: false },
];

const Notice: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-brand-white min-h-screen pt-10 pb-20">
      <SEO
        title="공지사항"
        description="나다커피의 새로운 소식과 다양한 정보를 전해드립니다. 시스템 공지, 신메뉴 출시, 이벤트 등 최신 공지를 확인하세요."
        keywords="나다커피 공지사항, 공지, 나다커피 소식"
      />
      <div className="max-w-5xl mx-auto px-4">

        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-brand-dark mb-4"
          >
            NOTICE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-medium"
          >
            Nada Coffee의 새로운 소식과 다양한 정보를 전해드립니다.
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-end mb-8">
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

        {/* Notice List Table */}
        <div className="bg-white rounded-[30px] shadow-xl overflow-hidden border border-brand-gray">
          <div className="hidden md:grid grid-cols-12 bg-brand-dark text-white py-5 px-8 font-bold text-sm tracking-widest">
            <div className="col-span-1 text-center">NO.</div>
            <div className="col-span-9 px-4">TITLE</div>
            <div className="col-span-2 text-center">DATE</div>
          </div>

          <div className="divide-y divide-brand-gray">
            {MOCK_NOTICES.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="grid grid-cols-12 items-center py-6 px-6 md:px-8 hover:bg-yellow-50/50 cursor-pointer transition-colors group"
              >
                <div className="col-span-2 md:col-span-1 text-center text-gray-400 font-medium text-sm">
                  {notice.id}
                </div>
                <div className="col-span-10 md:col-span-9 px-2 md:px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-brand-dark font-bold group-hover:text-brand-brown transition-colors line-clamp-1">
                      {notice.title}
                    </span>
                    {notice.isNew && (
                      <span className="bg-brand-yellow text-[10px] font-black px-2 py-0.5 rounded-full text-brand-dark">
                        NEW
                      </span>
                    )}
                  </div>
                  {/* Mobile Date Display */}
                  <div className="md:hidden text-xs text-gray-400 mt-1">{notice.date}</div>
                </div>
                <div className="hidden md:block col-span-2 text-center text-gray-400 text-sm font-medium">
                  {notice.date}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-12 gap-4">
          <button className="p-2 rounded-full hover:bg-brand-gray transition-colors text-gray-400">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded-full font-bold transition-all ${page === 1
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

export default Notice;
