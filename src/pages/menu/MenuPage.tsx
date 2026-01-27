import React, { useState } from 'react';
import { useLocation, Link } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown, ChevronRight } from 'lucide-react';
import heroBanner from "../../assets/menu/herobanner.jpg";

const CATEGORIES = [
  { name: "전체", path: "/menu", eng: "ALL" },
  { name: "커피", path: "/menu/coffee", eng: "COFFEE" },
  { name: "음료", path: "/menu/beverage", eng: "BEVERAGE" },
  { name: "디저트", path: "/menu/dessert", eng: "DESSERT" },
  { name: "추천메뉴", path: "/menu/choice", eng: "ND'S CHOICE" },
];

// LNB용 전체 사이트 메뉴 구조 (서브 메뉴 포함)
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
      { name: "LOCATION", path: "/support/location" }
    ]
  },
];

const MOCK_PRODUCTS = [
  { id: 1, name: "아메리카노", eng: "Americano", price: "1,500", category: "coffee", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800" },
  { id: 2, name: "카페라떼", eng: "Cafe Latte", price: "2,500", category: "coffee", img: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=800" },
  { id: 3, name: "카푸치노", eng: "Cappuccino", price: "2,500", category: "coffee", img: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800" },
  { id: 4, name: "바닐라라떼", eng: "Vanilla Latte", price: "3,000", category: "coffee", img: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=800" },
  { id: 5, name: "리얼딸기주스", eng: "Real Strawberry Juice", price: "3,800", category: "beverage", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800" },
  { id: 6, name: "망고스무디", eng: "Mango Smoothie", price: "3,500", category: "beverage", img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=800" },
  { id: 7, name: "초코쿠키", eng: "Choco Cookie", price: "1,200", category: "dessert", img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800" },
  { id: 8, name: "치즈케이크", eng: "Cheese Cake", price: "4,500", category: "dessert", img: "https://images.unsplash.com/photo-1524351199679-46cddf530c94?q=80&w=800" },
  { id: 9, name: "너다 시그니처", eng: "Nerda Signature", price: "5,000", category: "choice", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800" },
];

const MenuPage: React.FC = () => {
  const [isLnbOpen, setIsLnbOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const currentCategory = currentPath.split('/').pop() || "menu";

  const activeCategoryName = CATEGORIES.find(cat => cat.path === currentPath)?.name || "전체";

  const filteredProducts = currentCategory === "menu" 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === currentCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Banner Section */}
      <section className="relative w-full h-auto z-30">
        <div className="w-full aspect-[21/6] md:aspect-[25/4.5] min-h-[200px] relative">
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={heroBanner} 
              alt="Menu Hero Banner" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-white px-4"
              >
                <h2 className="text-brand-yellow font-bold tracking-[0.3em] text-xs md:text-sm mb-1 md:mb-2 uppercase">Nerda Coffee Menu</h2>
                <h1 className="text-xl md:text-5xl font-black tracking-tight uppercase">Menu</h1>
              </motion.div>
            </div>
          </div>

          {/* LNB Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 z-40">
            <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center">
              <Link to="/" className="text-white/60 hover:text-white transition-colors mr-4">
                <Home size={18} />
              </Link>
              
              {/* Menu Dropdown Trigger */}
              <div className="relative h-full flex items-center border-l border-white/10 px-6 cursor-pointer"
                   onClick={() => setIsLnbOpen(!isLnbOpen)}>
                <span className="text-white font-bold text-sm md:text-base mr-2">MENU</span>
                <ChevronDown size={16} className={`text-white transition-transform duration-300 ${isLnbOpen ? 'rotate-180' : ''}`} />
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isLnbOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-48 bg-white shadow-2xl py-2 border-t-4 border-brand-yellow z-50"
                    >
                      {SITE_MENU.map((menu) => (
                        <div key={menu.name} className="relative group/item">
                          <Link 
                            to={menu.path}
                            className="flex items-center justify-between px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-dark transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {menu.name}
                            <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </Link>

                          {/* Sub Menu (Hover) */}
                          <div className="absolute left-full top-0 w-48 bg-white shadow-2xl py-2 border-l border-gray-100 hidden group-hover/item:block">
                            {menu.subItems.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                className="block px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-brand-yellow transition-colors"
                                onClick={() => setIsLnbOpen(false)}
                              >
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

              {/* Category Display */}
              <div className="h-full flex items-center border-l border-white/10 px-6">
                <span className="text-brand-yellow font-bold text-sm md:text-base uppercase">{activeCategoryName}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
        
        {/* 2. Title Section */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-black text-[#222222] mb-4 tracking-tight">MENU</h2>
          <p className="text-[#AAAAAA] text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
            Fresh Coffee & Delicious Desserts
          </p>
          <div className="w-12 h-1 bg-[#FFD400] mx-auto mt-6 md:mt-8"></div>
        </div>

        {/* 3. Category Navigation */}
        <div className="flex justify-center mb-16 md:mb-24">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {CATEGORIES.map((cat) => {
              const isActive = currentPath === cat.path || (cat.path === "/menu" && currentPath === "/menu");
              return (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`px-6 md:px-12 py-2.5 md:py-4 text-sm md:text-lg font-black rounded-full transition-all border-2 ${
                    isActive 
                      ? "bg-[#222222] text-white border-[#222222] shadow-xl scale-105" 
                      : "bg-white text-[#999999] border-[#EEEEEE] hover:border-[#222222] hover:text-[#222222]"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 4. Product Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-12 md:gap-y-20"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <div className="relative aspect-square overflow-hidden rounded-[40px] bg-[#F9F9F9] mb-6 md:mb-8 shadow-sm border border-[#F0F0F0]">
                  <img 
                    src={product.img} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                <div className="text-center px-2">
                  <h3 className="text-lg md:text-2xl font-black text-[#222222] mb-1 group-hover:text-[#FFD400] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[#AAAAAA] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
                    {product.eng}
                  </p>
                  <div className="inline-block bg-[#F9F9F9] px-5 py-1.5 rounded-full border border-[#EEEEEE]">
                    <p className="text-[#222222] font-black text-base md:text-lg">
                      ₩ {product.price}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 5. Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-32">
            <p className="text-[#AAAAAA] text-xl font-bold italic tracking-widest">COMING SOON</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MenuPage;
