import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

const eventImages = Array.from({ length: 20 }, (_, i) => {
  return new URL(`../../assets/event/1 (${i + 1}).jpg`, import.meta.url).href;
});

interface EventItem {
  id: number;
  title: string;
  date: string;
  image: string;
  status: '진행중' | '종료';
}

const Event: React.FC = () => {
  const [activeTab, setActiveMenu] = useState<'전체' | '진행중' | '종료'>('전체');

  const allEvents: EventItem[] = useMemo(() => {
    return eventImages.map((img, index) => ({
      id: index + 1,
      title: `나다커피 스페셜 이벤트 Vol.${index + 1}`,
      date: `2026.01.${30 - index} ~ 2026.02.${15 + index}`,
      image: img,
      status: index < 12 ? '진행중' : '종료'
    }));
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeTab === '전체') return allEvents;
    return allEvents.filter(event => event.status === activeTab);
  }, [activeTab, allEvents]);

  return (
    <div className="bg-white min-h-screen pt-10 pb-20">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Header Section: GNB와의 간격 축소 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tight mb-8">
            EVENT
          </h2>

          {/* Filter Tabs */}
          <div className="flex justify-center border-b border-gray-200">
            {['전체', '진행중', '종료'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMenu(tab as any)}
                className={`px-12 py-4 text-sm font-bold transition-all relative ${activeTab === tab
                    ? "text-brand-dark"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand-dark"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group cursor-pointer border border-gray-100"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute top-0 left-0 px-4 py-2 text-[11px] font-black uppercase tracking-widest ${event.status === '진행중'
                      ? "bg-brand-yellow text-brand-dark"
                      : "bg-gray-400 text-white"
                    }`}>
                    {event.status}
                  </div>
                </div>

                <div className="p-5 bg-white">
                  <h3 className="text-base font-bold text-brand-dark mb-2 line-clamp-1 group-hover:text-brand-yellow transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-400 font-medium text-xs">
                    <Calendar size={12} />
                    <span>{event.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredEvents.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-gray-300 text-xl font-bold uppercase tracking-widest">진행 중인 이벤트가 없습니다.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Event;
