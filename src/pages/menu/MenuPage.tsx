import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown, ChevronRight, Info, Star, ChevronLeft, AlertCircle, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getProduct } from '../../api/product.api';
import ProductRating from '../../components/ProductRating';
import heroBanner from "../../assets/menu/herobanner.jpg";
import SkeletonProductCard from '../../components/common/SkeletonProductCard';
import { useBestSellers } from '../../hooks/useBestSellers';

const CATEGORY_MAP = [
  { name: "전체", path: "/menu" },
  { name: "논커피 · 라떼", path: "/menu/non-coffee", match: "논커피" },
  { name: "디저트", path: "/menu/dessert", match: "디저트" },
  { name: "밀크쉐이크", path: "/menu/shake", match: "쉐이크" },
  { name: "에이드 · 주스", path: "/menu/ade", match: "에이드" },
  { name: "차", path: "/menu/tea", match: "차" },
  { name: "커피 · 더치", path: "/menu/coffee", match: "커피" },
  { name: "프라페 · 스무디", path: "/menu/frappe", match: "프라페" },
];

const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const queryParams = new URLSearchParams(location.search);
  const highlightId = queryParams.get('highlight');

  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(15);
  const itemsPerPage = 15;
  const [isLnbOpen, setIsLnbOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const hasScrolledToHighlight = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearchQuery(searchQuery); }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const currentCategory = useMemo(() => CATEGORY_MAP.find(c => c.path === currentPath) || CATEGORY_MAP[0], [currentPath]);
  const isAllCategory = currentCategory.name === "전체";

  // 1. 전체 상품 가져오기 (1~3페이지 배치 조회)
  const { data: allProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'all_batch'],
    queryFn: async () => {
      // 카테고리 관계없이 모든 상품을 100개씩 3번(총 300개) 한 번에 가져와서 프론트에서 필터링
      const reqs = Array.from({ length: 9 }, (_, i) =>
        getProducts({ isDisplay: 'true', limit: 30, page: i + 1 })
      );

      const results = await Promise.allSettled(reqs);
      const combined = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof getProducts>>>).value.data);

      // 최신순 정렬
      return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    staleTime: 1000 * 60 * 5 // 5분 캐싱
  });

  const { data: highlightProduct } = useQuery({
    queryKey: ['product', highlightId],
    queryFn: () => getProduct(Number(highlightId)),
    enabled: !!highlightId
  });

  // 3. 글로벌 검색 자동완성용 쿼리 (카테고리 무관, limit 10)
  const { data: searchAutocompleteData } = useQuery({
    queryKey: ['products', 'autocomplete', debouncedSearchQuery],
    queryFn: () => getProducts({ isDisplay: 'true', limit: 10, page: 1, search: debouncedSearchQuery }),
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 1000 * 60,
  });

  const { top10Ids } = useBestSellers();

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let products = allProducts;

    // 카테고리를 프론트엔드에서 필터링
    if (!isAllCategory && currentCategory.match) {
      products = products.filter(p => p.category?.name?.includes(currentCategory.match || ''));
    }

    // 이름 또는 요약 검색
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      products = products.filter(p => p.name.toLowerCase().includes(query) || (p.summary || "").toLowerCase().includes(query));
    }

    return products;
  }, [allProducts, isAllCategory, currentCategory, debouncedSearchQuery]);

  const currentItems = useMemo(() => {
    let items = filteredProducts;
    if (highlightProduct?.data && !items.some((p: any) => p.id === highlightProduct.data.id)) {
      items = [highlightProduct.data, ...items];
    }

    if (isAllCategory) {
      return items.slice(0, visibleCount);
    } else {
      const start = (currentPage - 1) * itemsPerPage;
      return items.slice(start, start + itemsPerPage);
    }
  }, [filteredProducts, currentPage, visibleCount, highlightProduct, isAllCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 0;
  const isLoading = isProductsLoading;

  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(15);
    hasScrolledToHighlight.current = false;
  }, [currentPath]);

  useEffect(() => {
    if (!isAllCategory) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + itemsPerPage, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isAllCategory, filteredProducts.length, itemsPerPage]);

  useEffect(() => {
    if (highlightId && currentItems.length > 0 && !hasScrolledToHighlight.current) {
      const element = itemRefs.current[Number(highlightId)];
      if (element) {
        setTimeout(() => {
          const headerOffset = 150;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          hasScrolledToHighlight.current = true;
        }, 800);
      }
    }
  }, [highlightId, currentItems]);

  const isNewProduct = (createdAt: string) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(createdAt) >= oneMonthAgo;
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="relative w-full h-auto z-[100]">
        <div className="w-full aspect-[21/6] md:aspect-[25/5.5] min-h-[250px] relative">
          <div className="absolute inset-0 overflow-hidden"><img src={heroBanner} alt="Menu Hero Banner" className="w-full h-full object-cover" /></div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 z-[110]">
            <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center">
              <Link to="/" className="text-white/60 hover:text-white transition-colors mr-4"><Home size={18} /></Link>
              <div className="relative h-full flex items-center border-l border-white/10 px-6 cursor-pointer group" onMouseEnter={() => setIsLnbOpen(true)} onMouseLeave={() => setIsLnbOpen(false)}>
                <span className="text-white font-bold text-sm md:text-base mr-2 uppercase tracking-widest font-premium">MENU</span>
                <ChevronDown size={16} className={`text-white transition-transform duration-300 ${isLnbOpen ? 'rotate-180' : ''}`} />
                <AnimatePresence>
                  {isLnbOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 w-56 bg-white shadow-2xl py-4 border-t-4 border-brand-yellow z-[120]">
                      {CATEGORY_MAP.map((menu) => (<Link key={menu.name} to={menu.path} className={`block px-6 py-3 text-sm font-black transition-colors ${currentPath === menu.path ? 'text-brand-yellow bg-brand-dark' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark'}`} onClick={() => setIsLnbOpen(false)}>{menu.name}</Link>))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-full flex items-center border-l border-white/10 px-6"><span className="text-brand-yellow font-bold text-sm md:text-base uppercase tracking-widest font-premium">{currentCategory.name}</span></div>
              <div className="ml-auto h-full flex items-center pr-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search size={16} className="text-brand-yellow transition-colors" /></div>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="상품명 검색" className="bg-transparent border-2 border-brand-yellow rounded-full py-1.5 md:py-2 pl-10 pr-10 text-xs md:text-sm text-white placeholder:text-white/40 outline-none transition-all w-36 md:w-72 backdrop-blur-sm focus:bg-black/40" />
                  {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center text-brand-yellow hover:text-white transition-colors"><X size={14} /></button>)}
                  <AnimatePresence>
                    {searchQuery && searchAutocompleteData?.data && searchAutocompleteData.data.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl py-2 z-[120]">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {searchAutocompleteData.data.slice(0, 8).map(p => (
                            <Link key={p.id} to={`/products/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-b-0">
                              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                                <p className="text-xs font-medium text-gray-500">{p.basePrice?.toLocaleString()}원</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

        {isLoading && currentItems.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-14">
            {Array.from({ length: 10 }).map((_, idx) => <SkeletonProductCard key={idx} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-14">
              {currentItems.map((product) => {
                const totalStock = product.options?.reduce((sum: number, opt: any) => sum + opt.stockQty, 0) ?? 0;
                const isSoldOut = totalStock === 0;
                const isNew = isNewProduct(product.createdAt);
                const isHighlighted = Number(highlightId) === product.id;

                return (
                  <motion.div
                    key={product.id}
                    ref={(el: HTMLDivElement | null) => { itemRefs.current[product.id] = el; }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0, scale: isHighlighted ? [1, 1.05, 1] : 1, boxShadow: isHighlighted ? "0 0 0 4px #FFD400" : "none" }}
                    className={`group flex flex-col h-full cursor-pointer rounded-[24px] p-2 transition-all ${isHighlighted ? 'bg-brand-yellow/10' : ''}`}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#F9F9F9] mb-3 shadow-md border border-[#F0F0F0]">
                      <img src={product.imageUrl || ''} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 ${!isSoldOut && 'group-hover:scale-110'} ${isSoldOut && 'grayscale'}`} />
                      {!isSoldOut && (<div className="absolute top-4 left-4 z-10"><ProductRating prodId={product.id} className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/20" iconSize={16} /></div>)}
                      {totalStock > 0 && totalStock <= 5 && !isSoldOut && (<div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-bounce"><AlertCircle size={12} /><span className="text-[10px] font-black uppercase">품절임박</span></div>)}
                      {isNew && !isSoldOut && (<div className="absolute bottom-6 right-6 z-10 flex items-center justify-center rotate-12"><Star size={96} className="text-brand-yellow fill-brand-yellow drop-shadow-xl" /><span className="absolute text-brand-dark text-xl font-black tracking-tighter font-premium">NEW</span></div>)}
                      {isSoldOut && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-black text-2xl border-4 border-white px-6 py-3 rounded-lg rotate-[-10deg] font-premium">SOLD OUT</span></div>)}
                      {!isSoldOut && top10Ids.includes(product.id) && (
                        <div className="absolute bottom-6 left-6 z-10 flex items-center justify-center pointer-events-none">
                          <svg width="110" height="110" viewBox="0 0 100 100" className="text-red-600 fill-red-600 drop-shadow-2xl opacity-90"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 1" /><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" /><defs><path id="stampCurve" d="M 20,50 A 30,30 0 1,1 80,50" /></defs><text className="font-black" fontSize="7" fill="currentColor" letterSpacing="1"><textPath href="#stampCurve" startOffset="50%" textAnchor="middle">NADA BEST SELLER</textPath></text><text x="50" y="62" textAnchor="middle" fontSize="28" className="font-black" fill="currentColor" style={{ filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))' }}>HOT</text><path d="M 30,68 L 70,68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><text x="50" y="80" textAnchor="middle" fontSize="5" className="font-bold" fill="currentColor">EST. 2025</text></svg>
                        </div>
                      )}
                      {!isSoldOut && (<div className="absolute inset-0 bg-brand-yellow/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col p-6 backdrop-blur-[2px]"><div className="flex items-center justify-center gap-2 mb-6 border-b border-brand-dark/10 pb-3"><Info size={14} className="text-brand-dark" /><span className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em] font-premium">Nutrition Info</span></div><div className="text-brand-dark"><p className="text-sm font-black mb-6 text-center leading-tight px-2">{product.name}</p><ul className="text-[10px] md:text-[11px] font-bold space-y-1.5 ml-4 md:ml-8 opacity-90"><li>⚬ 용량 : 591.00</li><li>⚬ 열량(kcal) : 256.10</li><li>⚬ 나트륨(mg) : 15.80</li><li>⚬ 탄수화물(g) : 68.50</li><li>⚬ 당류(g) : 59.40</li><li>⚬ 지방(g) : 0.40</li><li>⚬ 포화지방(g) : 0.00</li><li>⚬ 단백질(g) : 1.30</li></ul></div><div className="mt-auto text-[9px] font-black text-brand-dark/30 text-center tracking-widest font-premium">CLICK FOR DETAIL</div></div>)}
                    </div>
                    <div className="px-1 flex flex-col gap-1">
                      <h3 className={`text-base md:text-lg font-black transition-colors line-clamp-1 leading-tight ${isSoldOut ? 'text-gray-400' : 'text-[#222222] group-hover:text-brand-yellow'}`}>{product.name}</h3>
                      <div className="flex justify-between items-center"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-premium">Price</span><p className={`font-black text-base md:text-lg ${isSoldOut ? 'text-gray-400' : 'text-brand-dark'}`}>₩ {product.basePrice.toLocaleString()}</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {isAllCategory ? (
              visibleCount < filteredProducts.length && (
                <div ref={observerTarget} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-14 mt-10 md:mt-14 w-full col-span-full">
                  {Array.from({ length: 5 }).map((_, idx) => <SkeletonProductCard key={idx} />)}
                </div>
              )
            ) : (
              totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-20 mb-10 w-full col-span-full">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
                  <div className="flex gap-2 text-gray-400 font-bold items-center">{Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (<button key={num} onClick={() => setCurrentPage(num)} className={`w-10 h-10 rounded-full font-black text-sm transition-all ${currentPage === num ? "bg-brand-dark text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}>{num}</button>))}</div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
                </div>
              )
            )}
          </>
        )}
        {!isLoading && currentItems.length === 0 && (<div className="text-center py-32"><p className="text-[#AAAAAA] text-xl font-bold italic tracking-widest font-premium">COMING SOON</p></div>)}
      </div>
    </div>
  );
};

export default MenuPage;
