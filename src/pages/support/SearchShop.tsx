import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Phone, Clock, Home, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import heroBanner from "../../assets/menu/herobanner.jpg";

const MOCK_SHOPS = [
  { id: 1, name: "Nerda Coffee 강남본점", address: "서울특별시 강남구 테헤란로 123", phone: "02-123-4567", time: "08:00 - 22:00", lat: 37.498095, lng: 127.027610 },
  { id: 2, name: "Nerda Coffee 안산단원점", address: "경기도 안산시 단원구 중앙대로 123", phone: "031-123-4567", time: "09:00 - 21:00", lat: 37.317929, lng: 126.836123 },
  { id: 3, name: "Nerda Coffee 홍대입구점", address: "서울특별시 마포구 양화로 123", phone: "02-987-6543", time: "10:00 - 23:00", lat: 37.557527, lng: 126.924460 },
  { id: 4, name: "Nerda Coffee 부산해운대점", address: "부산광역시 해운대구 해운대해변로 123", phone: "051-123-4567", time: "08:00 - 24:00", lat: 35.158698, lng: 129.160384 },
  { id: 5, name: "Nerda Coffee 판교테크노점", address: "경기도 성남시 분당구 판교역로 123", phone: "031-987-6543", time: "07:30 - 20:00", lat: 37.402056, lng: 127.108909 },
];

const SearchShop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const [filteredShops, setFilteredShops] = useState(MOCK_SHOPS);

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
      setFilteredShops(MOCK_SHOPS.filter(s => s.name.includes(query) || s.address.includes(query)));
    }
  }, [searchParams]);

  useEffect(() => {
    const container = document.getElementById('shop-map');
    if (window.kakao && window.kakao.maps && container) {
      window.kakao.maps.load(() => {
        const newMap = new window.kakao.maps.Map(container, { center: new window.kakao.maps.LatLng(37.5665, 126.9780), level: 8 });
        setMap(newMap);
      });
    }
  }, []);

  useEffect(() => {
    if (!map) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    const bounds = new window.kakao.maps.LatLngBounds();
    filteredShops.forEach(shop => {
      const pos = new window.kakao.maps.LatLng(shop.lat, shop.lng);
      const marker = new window.kakao.maps.Marker({ position: pos, map: map });
      markersRef.current.push(marker);
      bounds.extend(pos);
    });
    if (filteredShops.length === 1) { map.setCenter(new window.kakao.maps.LatLng(filteredShops[0].lat, filteredShops[0].lng)); map.setLevel(3); }
    else if (filteredShops.length > 0) map.setBounds(bounds);
  }, [map, filteredShops]);

  const handleSearch = () => setFilteredShops(MOCK_SHOPS.filter(s => s.name.includes(searchQuery) || s.address.includes(searchQuery)));
  const handleReset = () => { setSearchQuery(""); setFilteredShops(MOCK_SHOPS); setSearchParams({}); };

  return (
    <div className="bg-brand-white min-h-screen">
      <section className="relative w-full h-auto z-30"><div className="w-full aspect-[21/6] md:aspect-[25/4.5] min-h-[180px] relative"><div className="absolute inset-0 overflow-hidden"><img src={heroBanner} alt="Banner" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/30" /></div></div></section>
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 h-[700px]">
          <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-[30px] shadow-xl overflow-hidden border border-brand-gray">
            <div className="p-6 bg-brand-dark"><div className="relative flex gap-2"><div className="relative flex-1"><input type="text" placeholder="검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-yellow" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} /></div><button onClick={handleSearch} className="bg-brand-yellow text-brand-dark px-4 py-3 rounded-xl font-bold text-xs">검색</button><button onClick={handleReset} className="bg-white/10 text-white px-3 py-3 rounded-xl"><RefreshCw size={18} /></button></div></div>
            <div className="flex-1 overflow-y-auto divide-y divide-brand-gray">{filteredShops.map(shop => (<div key={shop.id} onClick={() => map.panTo(new window.kakao.maps.LatLng(shop.lat, shop.lng))} className="p-6 cursor-pointer hover:bg-gray-50"><h3 className="text-lg font-bold text-brand-dark mb-2">{shop.name}</h3><p className="text-sm text-gray-500">{shop.address}</p></div>))}</div>
          </div>
          <div className="flex-1 bg-gray-100 rounded-[30px] overflow-hidden shadow-xl border border-brand-gray"><div id="shop-map" className="w-full h-full"></div></div>
        </div>
      </div>
    </div>
  );
};

export default SearchShop;
