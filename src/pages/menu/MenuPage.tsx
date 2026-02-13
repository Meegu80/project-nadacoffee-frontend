import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown, ChevronRight, Info, Star, ChevronLeft, AlertCircle, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getProduct } from '../../api/product.api';
import { adminOrderApi } from '../../api/admin.order.api';
import ProductRating from '../../components/ProductRating';
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
  
  const queryParams = new URLSearchParams(location.search);
  const highlightId = queryParams.get('highlight');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [isLnbOpen, setIsLnbOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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

  // [수정] 하이라이트 상품 조회 (실패 시에도 에러 없이 처리)
  const { data: highlightProduct } = useQuery({
    queryKey: ['product', highlightId],
    queryFn: () => getProduct(Number(highlightId)),
    enabled: !!highlightId
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'dashboard', 'orders', 'menu-hot-check'],
    queryFn: () => adminOrderApi.getOrders({ page: 1, limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const top10Names = useMemo(() => {
    if (!ordersData?.data) return [];
    const salesCount = new Map<string, number>();
    ordersData.data.forEach(order => {
      order.orderItems?.forEach(item => {
        const name = item.product?.name;
        if (!name) return;
        salesCount.set(name, (salesCount.get(name) || 0) + item.quantity);
      });
    });
    return Array.from(salesCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name]) => name);
  }, [ordersData]);

  const currentCategory = useMemo(() => {
    return CATEGORY_MAP.find(c => c.path === currentPath) || CATEGORY_MAP[0];
  }, [currentPath]);

  // [수정] 카테고리 자동 이동 로직 (하이라이트 상품 기준)
  useEffect(() => {
    const targetProduct = highlightProduct?.data || allProducts?.find((p: any) => p.id === Number(highlightId));
    
    if (highlightId && targetProduct && targetProduct.category) {
      const targetCatName = targetProduct.category.name;
      const normalize = (str: string) => str.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
      const normalizedTarget = normalize(targetCatName);

      const matchedCategory = CATEGORY_MAP.find(cat => {
        if (cat.name === "전체") return false;
        const normalizedCat = normalize(cat.name);
        return normalizedCat.includes(normalizedTarget) || normalizedTarget.includes(normalizedCat);
      });

      // 현재 카테고리와 다르면 이동 (단, 이미 이동했으면 반복 방지)
      if (matchedCategory && matchedCategory.path !== currentPath && currentCategory.name !== "전체") {
         navigate(`${matchedCategory.path}?highlight=${highlightId}`);
      }
    }
  }, [highlightId, allProducts, highlightProduct, currentPath, navigate, currentCategory]);

  const filteredProducts = useMemo(() => {
    let products = allProducts || [];

    // [중요] 하이라이트 상품 강제 추가 로직 강화
    // 1. 하이라이트 상품 데이터가 있고
    // 2. 현재 목록에 없다면
    // 3. 무조건 맨 앞에 추가 (카테고리 필터링 전)
    if (highlightProduct?.data) {
      const target = highlightProduct.data;
      const exists = products.some((p: any) => p.id === target.id);
      if (!exists) {
        console.log("🔥 [DEBUG] Force adding highlight product:", target.name);
        products = [target, ...products];
      }
    }

    if (currentCategory.name !== "전체") {
      const normalize = (str: string) => str.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
      const target = normalize(currentCategory.name);
      products = products.filter(product => {
        // [중요] 하이라이트 상품은 카테고리 필터 무시하고 무조건 통과
        if (product.id === Number(highlightId)) return true;

        const productCatName = normalize(product.category?.name || "");
        return productCatName.includes(target) || target.includes(productCatName);
      });
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      products = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const summaryMatch = (product.summary || "").toLowerCase().includes(query);
        return nameMatch || summaryMatch;
      });
    }

    return products;
  }, [allProducts, currentCategory, debouncedSearchQuery, highlightProduct, highlightId]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentPath]);

  // 스크롤 위치 정밀 제어
  useEffect(() => {
    if (highlightId && filteredProducts.length > 0) {
      const targetIndex = filteredProducts.findIndex(p => p.id === Number(highlightId));
      
      if (targetIndex !== -1) {
        const targetPage = Math.floor(targetIndex / itemsPerPage) + 1;
        if (currentPage !== targetPage) {
          setCurrentPage(targetPage);
        }
        
        // 렌더링 후 스크롤 이동 (좌표 계산 방식)
        setTimeout(() => {
          const element = itemRefs.current[Number(highlightId)];
          if (element) {
            const headerOffset = 150;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          } else {
             console.warn("⚠️ [DEBUG] Element not found for scroll:", highlightId);
          }
        }, 800);
      } else {
         console.warn("⚠️ [DEBUG] Target product not found in filtered list:", highlightId);
      }
    }
  }, [highlightId, filteredProducts, itemsPerPage]); // currentPage 의존성 제거

  const isNewProduct = (createdAt: string) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(createdAt) >= oneMonthAgo;
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="relative w-full h-auto z-[100]">
        <div className="w-full aspect-[21/4] md:aspect-[25/3.5] min-h-[150px] relative">
          <div className="absolute inset-0 overflow-hidden"><img src={heroBanner} alt="Menu Hero Banner" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/10" /></div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 z-[110]">
            <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center">
              <Link to="/" className="text-white/60 hover:text-white transition-colors mr-4"><Home size={18} /></Link>
              <div className="relative h-full flex items-center border-l border-white/10 px-6 cursor-pointer group" onMouseEnter={() => setIsLnbOpen(true)} onMouseLeave={() => setIsLnbOpen(false)}>
                <span className="text-white font-bold text-sm md:text-base mr-2 uppercase tracking-widest">MENU</span>
                <ChevronDown size={16} className={`text-white transition-transform duration-300 ${isLnbOpen ? 'rotate-180' : ''}`} />
                <AnimatePresence>
                  {isLnbOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 w-56 bg-white shadow-2xl py-4 border-t-4 border-brand-yellow z-[120]">
                      {CATEGORY_MAP.map((menu) => (<Link key={menu.name} to={menu.path} className={`block px-6 py-3 text-sm font-black transition-colors ${currentPath === menu.path ? 'text-brand-yellow bg-brand-dark' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark'}`} onClick={() => setIsLnbOpen(false)}>{menu.name}</Link>))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-full flex items-center border-l border-white/10 px-6"><span className="text-brand-yellow font-bold text-sm md:text-base uppercase tracking-widest">{currentCategory.name}</span></div>
              <div className="ml-auto h-full flex items-center pr-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search size={16} className="text-brand-yellow transition-colors" /></div>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="상품명 또는 설명 검색" className="bg-transparent border-2 border-brand-yellow rounded-full py-1.5 md:py-2 pl-10 pr-10 text-xs md:text-sm text-white placeholder:text-white/40 outline-none transition-all w-32 md:w-64 backdrop-blur-sm" />
                  {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center text-brand-yellow hover:text-white transition-colors"><X size={14} /></button>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1800px] mx-auto px-4 md:px-10 py-6 md:py-8 relative z-10">
        <div className="flex justify-center mb-8 md:mb-10">
          <div className="flex flex-wrap justify-center border border-gray-200 rounded-full overflow-hidden shadow-sm bg-white">
            {CATEGORY_MAP.map((cat) => (<Link key={cat.name} to={cat.path} className={`px-5 md:px-8 py-2 md:py-2.5 text-xs md:text-sm font-black transition-all border-r last:border-r-0 border-gray-100 ${currentPath === cat.path ? "bg-[#222222] text-white" : "bg-white text-gray-400 hover:bg-gray-50 hover:text-[#222222]"}`}>{cat.name}</Link>))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-40"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div></div>
        ) : (
          <>
            <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-14">
              <AnimatePresence>
                {currentItems.map((product) => {
                  const totalStock = product.options?.reduce((sum: number, opt: any) => sum + opt.stockQty, 0) ?? 0;
                  const isSoldOut = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= 5;
                  const isNew = isNewProduct(product.createdAt);
                  const isHighlighted = Number(highlightId) === product.id;

                  return (
                    <motion.div
                      key={`${debouncedSearchQuery}-${product.id}`}
                      ref={(el) => (itemRefs.current[product.id] = el)}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isHighlighted ? [1, 1.05, 1] : 1,
                        boxShadow: isHighlighted ? "0 0 0 4px #FFD400" : "none"
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`group flex flex-col h-full cursor-pointer rounded-[24px] p-2 transition-all ${isHighlighted ? 'bg-brand-yellow/10' : ''}`}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#F9F9F9] mb-3 shadow-md border border-[#F0F0F0]">
                        <img src={product.imageUrl || ''} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 ${!isSoldOut && 'group-hover:scale-110'} ${isSoldOut && 'grayscale'}`} />
                        {!isSoldOut && (<div className="absolute top-4 left-4 z-10"><ProductRating prodId={product.id} className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/20" iconSize={16} /></div>)}
                        {isLowStock && !isSoldOut && (<div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-bounce"><AlertCircle size={12} /><span className="text-[10px] font-black uppercase">품절임박</span></div>)}
                        {isNew && !isSoldOut && (<div className="absolute bottom-6 right-6 z-10 flex items-center justify-center rotate-12"><Star size={96} className="text-brand-yellow fill-brand-yellow drop-shadow-xl" /><span className="absolute text-brand-dark text-xl font-black tracking-tighter">NEW</span></div>)}
                        {isSoldOut && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-black text-2xl border-4 border-white px-6 py-3 rounded-lg rotate-[-10deg]">SOLD OUT</span></div>)}
                        {!isSoldOut && top10Names.includes(product.name) && (
                          <motion.div animate={{ x: [-3, 3, -3], rotate: [-12, -10, -12] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute bottom-6 left-6 z-10 flex items-center justify-center pointer-events-none">
                            <svg width="110" height="110" viewBox="0 0 100 100" className="text-red-600 fill-red-600 drop-shadow-2xl opacity-90"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 1" /><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" /><defs><path id="stampCurve" d="M 20,50 A 30,30 0 1,1 80,50" /></defs><text className="font-black" fontSize="7" fill="currentColor" letterSpacing="1"><textPath href="#stampCurve" startOffset="50%" textAnchor="middle">NADA BEST SELLER</textPath></text><text x="50" y="62" textAnchor="middle" fontSize="28" className="font-black" fill="currentColor" style={{ filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))' }}>HOT</text><path d="M 30,68 L 70,68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><text x="50" y="80" textAnchor="middle" fontSize="5" className="font-bold" fill="currentColor">EST. 2025</text></svg>
                          </motion.div>
                        )}
                        {!isSoldOut && (<div className="absolute inset-0 bg-brand-yellow/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col p-6 backdrop-blur-[2px]"><div className="flex items-center justify-center gap-2 mb-6 border-b border-brand-dark/10 pb-3"><Info size={14} className="text-brand-dark" /><span className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em]">Nutrition Info</span></div><div className="text-brand-dark"><p className="text-sm font-black mb-6 text-center leading-tight px-2">{product.name}</p><ul className="text-[10px] md:text-[11px] font-bold space-y-1.5 ml-4 md:ml-8 opacity-90"><li>⚬ 용량 : 591.00</li><li>⚬ 열량(kcal) : 256.10</li><li>⚬ 나트륨(mg) : 15.80</li><li>⚬ 탄수화물(g) : 68.50</li><li>⚬ 당류(g) : 59.40</li><li>⚬ 지방(g) : 0.40</li><li>⚬ 포화지방(g) : 0.00</li><li>⚬ 단백질(g) : 1.30</li></ul></div><div className="mt-auto text-[9px] font-black text-brand-dark/30 text-center tracking-widest">CLICK FOR DETAIL</div></div>)}
                      </div>
                      <div className="px-1 flex flex-col gap-1">
                        <h3 className={`text-base md:text-lg font-black transition-colors line-clamp-1 leading-tight ${isSoldOut ? 'text-gray-400' : 'text-[#222222] group-hover:text-brand-yellow'}`}>{product.name}</h3>
                        <div className="flex justify-between items-center"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span><p className={`font-black text-base md:text-lg ${isSoldOut ? 'text-gray-400' : 'text-brand-dark'}`}>₩ {product.basePrice.toLocaleString()}</p></div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-20 mb-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
                <div className="flex gap-2">{Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (<button key={num} onClick={() => setCurrentPage(num)} className={`w-10 h-10 rounded-full font-black text-sm transition-all ${currentPage === num ? "bg-brand-dark text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}>{num}</button>))}</div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
              </div>
            )}
          </>
        )}
        {!isLoading && filteredProducts.length === 0 && (<div className="text-center py-32"><p className="text-[#AAAAAA] text-xl font-bold italic tracking-widest">COMING SOON</p></div>)}
      </div>
    </div>
  );
};

export default MenuPage;
