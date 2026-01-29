import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Phone, Clock, Home, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import heroBanner from "../../assets/menu/herobanner.jpg"; // 동일한 배너 사용

declare global {
  interface Window {
    kakao: any;
  }
}

const MOCK_SHOPS = [
  { id: 1, name: "Nerda Coffee 강남본점", address: "서울특별시 강남구 테헤란로 123", phone: "02-123-4567", time: "08:00 - 22:00", lat: 37.498095, lng: 127.027610 },
  { id: 2, name: "Nerda Coffee 안산단원점", address: "경기도 안산시 단원구 중앙대로 123", phone: "031-123-4567", time: "09:00 - 21:00", lat: 37.317929, lng: 126.836123 },
  { id: 3, name: "Nerda Coffee 홍대입구점", address: "서울특별시 마포구 양화로 123", phone: "02-987-6543", time: "10:00 - 23:00", lat: 37.557527, lng: 126.924460 },
  { id: 4, name: "Nerda Coffee 부산해운대점", address: "부산광역시 해운대구 해운대해변로 123", phone: "051-123-4567", time: "08:00 - 24:00", lat: 35.158698, lng: 129.160384 },
  { id: 5, name: "Nerda Coffee 판교테크노점", address: "경기도 성남시 분당구 판교역로 123", phone: "031-987-6543", time: "07:30 - 20:00", lat: 37.402056, lng: 127.108909 },
];

const SITE_MENU = [
  { 
    name: "BRAND", 
    path: "/brand/about",
    subItems: [
      { name: "ABOUT US", path: "/brand/about" },
      { name: "PROCESS", path: "/brand/process" }
    ]
  },
  { 
    name: "MENU", 
    path: "/menu",
    subItems: [
      { name: "COFFEE", path: "/menu/coffee" },
      { name: "BEVERAGE", path: "/menu/beverage" },
      { name: "DESSERT", path: "/menu/dessert" },
      { name: "CHOICE", path: "/menu/choice" }
    ]
  },
  { 
    name: "NEWS", 
    path: "/news/news",
    subItems: [
      { name: "NEWS", path: "/news/news" },
      { name: "EVENT", path: "/news/event" }
    ]
  },
  { 
    name: "SUPPORT", 
    path: "/support/notice",
    subItems: [
      { name: "NOTICE", path: "/support/notice" },
      { name: "CONTACT", path: "/support/contact" },
      { name: "LOCATION", path: "/support/location" },
      { name: "SHOP", path: "/support/shop" }
    ]
  },
];

const SearchShop: React.FC = () => {
  const [isLnbOpen, setIsLnbOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const [filteredShops, setFilteredShops] = useState(MOCK_SHOPS);

  useEffect(() => {
    const container = document.getElementById('shop-map');
    if (window.kakao && window.kakao.maps && container) {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 8
        };
        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);
      });
    }
  }, []);

  useEffect(() => {
    if (!map) return;
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    const bounds = new window.kakao.maps.LatLngBounds();
    filteredShops.forEach(shop => {
      const position = new window.kakao.maps.LatLng(shop.lat, shop.lng);
      const marker = new window.kakao.maps.Marker({ position: position, map: map });
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:10px; font-size:12px; font-weight:bold; color:#222;">${shop.name}</div>`
      });
      window.kakao.maps.event.addListener(marker, 'click', () => infowindow.open(map, marker));
      markersRef.current.push(marker);
      bounds.extend(position);
    });
    if (filteredShops.length > 0) map.setBounds(bounds);
  }, [map, filteredShops]);

  const handleSearch = () => {
    const filtered = MOCK_SHOPS.filter(shop => 
      shop.name.includes(searchQuery) || shop.address.includes(searchQuery)
    );
    setFilteredShops(filtered);
  };

  const moveToShop = (shop: any) => {
    const moveLatLon = new window.kakao.maps.LatLng(shop.lat, shop.lng);
    map.panTo(moveLatLon);
    map.setLevel(3);
  };

  return (
    <div className="bg-brand-white min-h-screen">
      {/* 1. Hero Banner Section */}
      <section className="relative w-full h-auto z-30">
        <div className="w-full aspect-[21/6] md:aspect-[25/4.5] min-h-[180px] relative">
          <div className="absolute inset-0 overflow-hidden">
            <img src={heroBanner} alt="Shop Hero Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-white px-4">

              </motion.div>
            </div>
          </div>

          {/* LNB Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 z-40">
            <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center">
              <Link to="/" className="text-white/60 hover:text-white transition-colors mr-4">
                <Home size={18} />
              </Link>
              
              <div className="relative h-full flex items-center border-l border-white/10 px-6 cursor-pointer"
                   onClick={() => setIsLnbOpen(!isLnbOpen)}>
                <span className="text-white font-bold text-sm md:text-base mr-2">SUPPORT</span>
                <ChevronDown size={16} className={`text-white transition-transform duration-300 ${isLnbOpen ? 'rotate-180' : ''}`} />
                
                <AnimatePresence>
                  {isLnbOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-48 bg-white shadow-2xl py-2 border-t-4 border-brand-yellow z-50">
                      {SITE_MENU.map((menu) => (
                        <div key={menu.name} className="relative group/item">
                          <Link to={menu.path} className="flex items-center justify-between px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-dark transition-colors">
                            {menu.name}
                            <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </Link>
                          <div className="absolute left-full top-0 w-48 bg-white shadow-2xl py-2 border-l border-gray-100 hidden group-hover/item:block">
                            {menu.subItems.map((sub) => (
                              <Link key={sub.name} to={sub.path} className="block px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-brand-yellow transition-colors" onClick={() => setIsLnbOpen(false)}>
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-full flex items-center border-l border-white/10 px-6">
                <span className="text-brand-yellow font-bold text-sm md:text-base uppercase">매장찾기</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-[#222222] mb-4 tracking-tight uppercase">Find a Shop</h2>
          <p className="text-[#AAAAAA] text-xs md:text-sm font-medium tracking-[0.2em] uppercase">가까운 Nerda Coffee 매장을 찾아보세요.</p>
          <div className="w-12 h-1 bg-[#FFD400] mx-auto mt-6 md:mt-8"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 h-[700px]">
          <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-[30px] shadow-xl overflow-hidden border border-brand-gray">
            <div className="p-6 border-b border-brand-gray bg-brand-dark">
              <div className="relative">
                <input type="text" placeholder="매장명 또는 주소 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-yellow transition-colors" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-yellow text-brand-dark px-3 py-1 rounded-lg font-bold text-xs">검색</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-brand-gray">
              {filteredShops.map(shop => (
                <motion.div key={shop.id} whileHover={{ bg: "#F9F9F9" }} onClick={() => moveToShop(shop)} className="p-6 cursor-pointer transition-colors group">
                  <h3 className="text-lg font-bold text-brand-dark mb-3 group-hover:text-brand-brown">{shop.name}</h3>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p className="flex items-start gap-2"><MapPin size={16} className="text-brand-yellow shrink-0 mt-0.5" />{shop.address}</p>
                    <p className="flex items-center gap-2"><Phone size={16} className="text-brand-yellow shrink-0" />{shop.phone}</p>
                    <p className="flex items-center gap-2"><Clock size={16} className="text-brand-yellow shrink-0" />{shop.time}</p>
                  </div>
                </motion.div>
              ))}
              {filteredShops.length === 0 && <div className="p-10 text-center text-gray-400">검색 결과가 없습니다.</div>}
            </div>
          </div>
          <div className="flex-1 bg-gray-100 rounded-[30px] overflow-hidden shadow-xl border border-brand-gray relative">
            <div id="shop-map" className="w-full h-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchShop;
