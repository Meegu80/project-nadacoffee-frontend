import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown, ChevronRight, Info, Star, ChevronLeft, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/product.api';
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
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isLnbOpen, setIsLnbOpen] = useState(false);

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['products', 'all-menu-merged-100'],
    queryFn: async () => {
      let allData: any[] = [];
      const limit = 100;
      const firstRes = await getProducts({ isDisplay: 'true', limit, page: 1 });
      allData = [...firstRes.data];
      const totalPages = firstRes.pagination.totalPages;
      if (totalPages > 1) {
        for (let p = 2; p <= totalPages; p++) {
          const res = await getProducts({ isDisplay: 'true', limit, page: p });
          allData = [...allData, ...res.data];
        }
      }
      return allData;
    },
    staleTime: 1000 * 60 * 5,
  });

  const currentCategory = useMemo(() => {
    return CATEGORY_MAP.find(c => c.path === currentPath) || CATEGORY_MAP[0];
  }, [currentPath]);

  const filteredProducts = useMemo(() => {
    const products = allProducts || [];
    if (currentCategory.name === "전체") return products;
    const normalize = (str: string) => str.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
    const target = normalize(currentCategory.name);
    return products.filter(product => {
      const productCatName = normalize(product.category?.name || "");
      return productCatName.includes(target) || target.includes(productCatName);
    });
  }, [allProducts, currentCategory]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentPath]);

  const isNewProduct = (createdAt: string) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(createdAt) >= oneMonthAgo;
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="relative w-full h-auto z-[100]">
        <div className="w-full aspect-[21/6] md:aspect-[25/4.5] min-h-[200px] relative">
          <div className="absolute inset-0 overflow-hidden"><img src={heroBanner} alt="Menu Hero Banner" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/10" /></div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 z-[110]">
            <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center">
              <Link to="/" className="text-white/60 hover:text-white transition-colors mr-4"><Home size={18} /></Link>
              
              {/* [수정] 마우스 커서가 벗어나면 닫히도록 onMouseLeave 추가 */}
              <div 
                className="relative h-full flex items-center border-l border-white/10 px-6 cursor-pointer group" 
                onMouseEnter={() => setIsLnbOpen(true)}
                onMouseLeave={() => setIsLnbOpen(false)}
              >
                <span className="text-white font-bold text-sm md:text-base mr-2 uppercase tracking-widest">MENU</span>
                <ChevronDown size={16} className={`text-white transition-transform duration-300 ${isLnbOpen ? 'rotate-180' : ''}`} />
                <AnimatePresence>
                  {isLnbOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} 
                      className="absolute top-full left-0 w-56 bg-white shadow-2xl py-4 border-t-4 border-brand-yellow z-[120]"
                    >
                      {CATEGORY_MAP.map((menu) => (
                        <Link 
                          key={menu.name} 
                          to={menu.path} 
                          className={`block px-6 py-3 text-sm font-black transition-colors ${currentPath === menu.path ? 'text-brand-yellow bg-brand-dark' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark'}`} 
                          onClick={() => setIsLnbOpen(false)}
                        >
                          {menu.name}
                        </Link>
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
          <div className="flex flex-wrap justify-center border border-gray-200 rounded-full overflow-hidden shadow-sm bg-white">
            {CATEGORY_MAP.map((cat) => (
              <Link key={cat.name} to={cat.path} className={`px-5 md:px-8 py-2 md:py-2.5 text-xs md:text-sm font-black transition-all border-r last:border-r-0 border-gray-100 ${currentPath === cat.path ? "bg-[#222222] text-white" : "bg-white text-gray-400 hover:bg-gray-50 hover:text-[#222222]"}`}>{cat.name}</Link>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div></div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-14">
              <AnimatePresence mode='popLayout'>
                {currentItems.map((product) => {
                  const totalStock = product.options?.reduce((sum, opt) => sum + opt.stockQty, 0) ?? 0;
                  const isSoldOut = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= 5;
                  const isNew = isNewProduct(product.createdAt);

                  return (
                    <motion.div 
                      key={product.id} 
                      layout 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className={`group flex flex-col h-full ${isSoldOut ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => !isSoldOut && navigate(`/products/${product.id}`)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#F9F9F9] mb-3 shadow-md border border-[#F0F0F0]">
                        <img src={product.imageUrl || ''} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 ${!isSoldOut && 'group-hover:scale-110'} ${isSoldOut && 'grayscale'}`} />
                        {!isSoldOut && (<div className="absolute top-4 left-4 z-10"><Star size={24} className="text-brand-yellow fill-brand-yellow drop-shadow-md" /></div>)}
                        {isLowStock && !isSoldOut && (<div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-bounce"><AlertCircle size={12} /><span className="text-[10px] font-black uppercase">품절임박</span></div>)}
                        {isNew && !isSoldOut && (<div className="absolute bottom-6 right-6 z-10 flex items-center justify-center rotate-12"><Star size={96} className="text-brand-yellow fill-brand-yellow drop-shadow-xl" /><span className="absolute text-brand-dark text-xl font-black tracking-tighter">NEW</span></div>)}
                        {isSoldOut && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-black text-2xl border-4 border-white px-6 py-3 rounded-lg rotate-[-10deg]">SOLD OUT</span></div>)}
                        {!isSoldOut && (<div className="absolute inset-0 bg-brand-yellow/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col p-6 backdrop-blur-[2px]"><div className="flex items-center justify-center gap-2 mb-6 border-b border-brand-dark/10 pb-3"><Info size={14} className="text-brand-dark" /><span className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em]">Nutrition Info</span></div><div className="text-brand-dark"><p className="text-sm font-black mb-6 text-center leading-tight px-2">{product.name}</p><ul className="text-[10px] md:text-[11px] font-bold space-y-1.5 ml-4 md:ml-8 opacity-90"><li>⚬ 용량 : 591.00</li><li>⚬ 열량(kcal) : 256.10</li><li>⚬ 나트륨(mg) : 15.80</li><li>⚬ 탄수화물(g) : 68.50</li><li>⚬ 당류(g) : 59.40</li><li>⚬ 지방(g) : 0.40</li><li>⚬ 포화지방(g) : 0.00</li><li>⚬ 단백질(g) : 1.30</li></ul></div><div className="mt-auto text-[9px] font-black text-brand-dark/30 text-center tracking-widest">CLICK FOR DETAIL</div></div>)}
                      </div>
                      <div className="px-1 flex flex-col gap-1">
                        <h3 className={`text-base md:text-lg font-black transition-colors line-clamp-1 leading-tight ${isSoldOut ? 'text-gray-400' : 'text-[#222222] group-hover:text-brand-yellow'}`}>{product.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span>
                          <p className={`font-black text-base md:text-lg ${isSoldOut ? 'text-gray-400' : 'text-brand-dark'}`}>₩ {product.basePrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-20 mb-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button key={num} onClick={() => setCurrentPage(num)} className={`w-10 h-10 rounded-full font-black text-sm transition-all ${currentPage === num ? "bg-brand-dark text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}>{num}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
              </div>
            )}
          </>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-32"><p className="text-[#AAAAAA] text-xl font-bold italic tracking-widest">COMING SOON</p></div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
