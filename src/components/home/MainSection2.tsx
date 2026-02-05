import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

// 이미지 임포트
import shop1 from '../../assets/shop/0712e1b6a9a7faa3f1e8676c16210819.jpg';
import shop2 from '../../assets/shop/441f86fd61867b5f8707280737e302e8.jpg';
import shop3 from '../../assets/shop/851ab48f6ed0ef6f20430b1e48323aee.jpg';
import shop4 from '../../assets/shop/aa27fb623ecf2a4c7bd0a8d8dcb61390.jpg';

const MainSection2: React.FC = () => {
  const navigate = useNavigate();

  // [수정] 실제 매장 정보로 업데이트
  const stores = [
    { name: '강남본점', address: '서울특별시 강남구 테헤란로 123', img: shop2 },
    { name: '안산단원점', address: '경기도 안산시 단원구 중앙대로 123', img: shop1 },
    { name: '홍대입구점', address: '서울특별시 마포구 양화로 123', img: shop4 },
    { name: '부산해운대점', address: '부산광역시 해운대구 해운대해변로 123', img: shop3 },
  ];

  const handleStoreClick = (storeName: string) => {
    navigate(`/support/shop?search=${encodeURIComponent(storeName)}`);
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-end justify-between mb-16"
        >
          <div className="text-left">
            <span className="text-brand-yellow font-black tracking-[0.3em] text-sm uppercase mb-4 block">Store Locator</span>
            <h2 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tighter">
              가까운 <span className="italic">나다커피</span> 매장을 찾아보세요
            </h2>
          </div>
          <Link to="/support/shop" className="mt-6 md:mt-0 flex items-center gap-2 text-gray-400 hover:text-brand-dark font-bold transition-colors group">
            전체 매장 보기 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stores.map((store, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group cursor-pointer overflow-hidden rounded-[30px] shadow-2xl aspect-[3/4]"
              onClick={() => handleStoreClick(store.name)}
            >
              {/* Image */}
              <img 
                src={store.img} 
                alt={store.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90 transition-opacity group-hover:from-brand-yellow/90" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex items-center gap-2 text-brand-yellow group-hover:text-brand-dark mb-2 transition-colors">
                  <MapPin size={16} fill="currentColor" />
                  <span className="text-xs font-black uppercase tracking-widest">Nada Coffee</span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-brand-dark transition-colors mb-1">
                  {store.name}
                </h3>
                <p className="text-xs text-gray-300 group-hover:text-brand-dark/70 font-medium truncate">
                  {store.address}
                </p>
              </div>

              {/* Hover Button */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <ChevronRight size={20} className="text-brand-dark" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default MainSection2;
