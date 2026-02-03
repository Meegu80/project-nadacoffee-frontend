import React, { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/product.api';
import { adminCategoryApi } from '../../api/admin.category.api';
import heroBanner from "../../assets/menu/herobanner.jpg";

const CATEGORY_MAP = [
  { name: "전체", path: "/menu" },
  { name: "논커피 · 라떼", path: "/menu/non-coffee" },
  { name: "디저트", path: "/menu/dessert" },
  { name: "밀크쉐이크", path: "/menu/shake" },
  { name: "에이드 · 주스", path: "/menu/ade" },
  { name: "차", path: "/menu/tea" },
  { name: "커피 · 더치", path: "/menu/coffee" },
  { name: "프라페 · 스무디", path: "/menu/frappe" },
];

const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLnbOpen, setIsLnbOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: serverCategories } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => adminCategoryApi.getCategoryTree(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'all-list-stable'],
    queryFn: () => getProducts({ isDisplay: 'true', limit: 100 }),
  });

  const currentCategory = useMemo(() => {
    return CATEGORY_MAP.find(c => c.path === currentPath) || CATEGORY_MAP[0];
  }, [currentPath]);

  const filteredProducts = useMemo(() => {
    const allProducts = data?.data || [];
    if (currentCategory.name === "전체") return allProducts;

    const normalize = (str: string) => str.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
    const target = normalize(currentCategory.name);

    return allProducts.filter(product => {
      const productName = normalize(product.name || "");
      const imageUrl = product.imageUrl ? decodeURIComponent(product.imageUrl) : "";
      const nameMatch = productName.includes(target);
      const fileMatch = normalize(imageUrl).includes(target);
      
      const findId = (cats: any[], name: string): number | undefined => {
        for (const cat of cats) {
          if (normalize(cat.name) === target) return cat.id;
          const children = cat.categories || cat.children || [];
          const subId = findId(children, name);
          if (subId) return subId;
        }
        return undefined;
      };
      const categoryId = serverCategories ? findId(serverCategories, currentCategory.name) : null;
      const idMatch = categoryId ? product.catId === categoryId : false;

      return nameMatch || fileMatch || idMatch;
    });
  }, [data, currentCategory, serverCategories]);

  return (
    <div className="bg-white min-h-screen">
      <section className="relative w-full h-auto z-[100]">
        <div className="w-full aspect-[21/6] md:aspect-[25/4.5] min-h-[200px] relative">
          <div className="absolute inset-0 overflow-hidden">
            <img src={heroBanner} alt="Menu Hero Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 z-[110]">
            <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center">
              <Link to="/" className="text-white/60 hover:text-white transition-colors mr-4"><Home size={18} /></Link>
              <div className="relative h-full flex items-center border-l border-white/10 px-6 cursor-pointer group" onClick={() => setIsLnbOpen(!isLnbOpen)}>
                <span className="text-white font-bold text-sm md:text-base mr-2 uppercase tracking-widest">MENU</span>
                <ChevronDown size={16} className={`text-white transition-transform duration-300 ${isLnbOpen ? 'rotate-180' : ''}`} />
                <AnimatePresence>
                  {isLnbOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 w-56 bg-white shadow-2xl py-4 border-t-4 border-brand-yellow z-[120]">
                      {[
                        { name: "BRAND", path: "/brand/about", sub: [{name:"ABOUT US", path:"/brand/about"}, {name:"PROCESS", path:"/brand/process"}] },
                        { name: "MENU", path: "/menu", sub: CATEGORY_MAP.map(c => ({name:c.name, path:c.path})) },
                        { name: "NEWS", path: "/news/news", sub: [{name:"NEWS", path:"/news/news"}, {name:"EVENT", path:"/news/event"}] },
                        { name: "SUPPORT", path: "/support/notice", sub: [{name:"NOTICE", path:"/support/notice"}, {name:"CONTACT", path:"/support/contact"}, {name:"LOCATION", path:"/support/location"}] }
                      ].map((menu) => (
                        <div key={menu.name} className="relative group/item">
                          <div className="flex items-center justify-between px-6 py-3 text-sm font-black text-gray-600 hover:bg-gray-50 hover:text-brand-dark transition-colors cursor-default">{menu.name}<ChevronRight size={14} className="text-gray-300 group-hover/item:text-brand-yellow transition-colors" /></div>
                          <div className="absolute left-full top-0 w-56 bg-white shadow-2xl py-2 border-l border-gray-100 hidden group-hover/item:block z-[130]">
                            {menu.sub.map((sub) => (<Link key={sub.name} to={sub.path} className="block px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-brand-yellow transition-colors" onClick={() => setIsLnbOpen(false)}>{sub.name}</Link>))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-full flex items-center border-l border-white/10 px-6"><span className="text-brand-yellow font-bold text-sm md:text-base uppercase tracking-widest">{currentCategory.name}</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1800px] mx-auto px-4 md:px-10 py-6 md:py-8 relative z-10">
        <div className="flex justify-center mb-8 md:mb-10">
          <div className="flex flex-wrap justify-center border border-gray-200 rounded-full overflow-hidden shadow-sm">
            {CATEGORY_MAP.map((cat) => (
              <Link key={cat.name} to={cat.path} className={`px-5 md:px-8 py-2 md:py-2.5 text-xs md:text-sm font-black transition-all border-r last:border-r-0 border-gray-100 ${currentPath === cat.path ? "bg-[#222222] text-white" : "bg-white text-gray-400 hover:bg-gray-50 hover:text-[#222222]"}`}>{cat.name}</Link>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div></div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-14">
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  layout 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="group flex flex-col h-full cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#F9F9F9] mb-3 shadow-md border border-[#F0F0F0]">
                    <img src={product.imageUrl || ''} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    
                    {/* 호버 오버레이: 중앙 정렬 레이아웃 */}
                    <div className="absolute inset-0 bg-brand-yellow/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col p-6 backdrop-blur-[2px]">
                      <div className="flex items-center justify-center gap-2 mb-6 border-b border-brand-dark/10 pb-3">
                        <Info size={14} className="text-brand-dark" />
                        <span className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em]">Nutrition Info</span>
                      </div>
                      
                      <div className="text-brand-dark">
                        {/* 메뉴명 중앙 정렬 */}
                        <p className="text-sm font-black mb-6 text-center leading-tight px-2">{product.name}</p>
                        
                        {/* 상세표: 좌측 마진을 주어 전체적으로 중앙에 위치한 느낌 */}
                        <ul className="text-[10px] md:text-[11px] font-bold space-y-1.5 ml-4 md:ml-8 opacity-90">
                          <li>⚬ 용량 : 591.00</li>
                          <li>⚬ 열량(kcal) : 256.10</li>
                          <li>⚬ 나트륨(mg) : 15.80</li>
                          <li>⚬ 탄수화물(g) : 68.50</li>
                          <li>⚬ 당류(g) : 59.40</li>
                          <li>⚬ 지방(g) : 0.40</li>
                          <li>⚬ 포화지방(g) : 0.00</li>
                          <li>⚬ 단백질(g) : 1.30</li>
                        </ul>
                      </div>
                      
                      <div className="mt-auto text-[9px] font-black text-brand-dark/30 text-center tracking-widest">
                        CLICK FOR DETAIL
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-1 flex flex-col gap-1">
                    <h3 className="text-base md:text-lg font-black text-[#222222] group-hover:text-brand-yellow transition-colors line-clamp-1 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span>
                      <p className="text-brand-dark font-black text-base md:text-lg">
                        ₩ {product.basePrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-32"><p className="text-[#AAAAAA] text-xl font-bold italic tracking-widest">COMING SOON</p></div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
