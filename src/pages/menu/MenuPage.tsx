import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown, ChevronRight, Info, Star, ChevronLeft, AlertCircle, Search, X } from 'lucide-react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getProducts, getProduct } from '../../api/product.api';
import { adminOrderApi } from '../../api/admin.order.api';
import ProductRating from '../../components/ProductRating';
import heroBanner from "../../assets/menu/herobanner.jpg";
import SkeletonProductCard from '../../components/common/skeleton/SkeletonProductCard';
import SearchDropdown from '../../components/menu/SearchDropdown';
import SearchHighlight from '../../components/common/SearchHighlight';

const CATEGORY_MAP = [
  { name: "전체", path: "/menu" },
  { name: "논커피 · 라떼", path: "/menu/non-coffee", match: "논커피" },
  { name: "디저트", path: "/menu/dessert", match: "디저트" },
  { name: "밀크쉐이크", path: "/menu/shake", match: "쉐이크" },
  { name: "에이드 · 주스", path: "/menu/ade", match: "에이드" },
  { name: "차", path: "/menu/tea", match: "차" },
  { name: "커피 · 더치", path: "/menu/coffee", match: "커피" },
  { name: "프라페 · 스무디", path: "/menu/frappe", match: "스무디" },
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
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasScrolledToHighlight = useRef(false);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearchQuery(searchQuery); }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const currentCategory = useMemo(() => CATEGORY_MAP.find(c => c.path === currentPath) || CATEGORY_MAP[0], [currentPath]);
  const isAllCategory = currentCategory.name === "전체";

  const { data: infiniteData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isInfiniteLoading } = useInfiniteQuery({
    queryKey: ['products', 'infinite', debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => getProducts({ isDisplay: 'true', limit: itemsPerPage, page: pageParam, search: debouncedSearchQuery || undefined }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isAllCategory
  });

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isInfiniteLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => { if (entries[0].isIntersecting && hasNextPage) fetchNextPage(); });
    if (node) observerRef.current.observe(node);
  }, [isInfiniteLoading, hasNextPage, fetchNextPage]);

  const { data: allProductsData, isLoading: isAllLoading } = useQuery({
    queryKey: ['products', 'all-for-filter'],
    queryFn: async () => {
      let allData: any[] = [];
      const limit = 100;
      const firstRes = await getProducts({ isDisplay: 'true', limit, page: 1 });
      allData = [...firstRes.data];
      if (firstRes.pagination.totalPages > 1) {
        for (let p = 2; p <= firstRes.pagination.totalPages; p++) {
          const res = await getProducts({ isDisplay: 'true', limit, page: p });
          allData = [...allData, ...res.data];
        }
      }
      return { data: allData };
    },
    enabled: true, // 자동완성을 위해 항상 활성화
    staleTime: 1000 * 60 * 5
  });

  const { data: highlightProduct } = useQuery({
    queryKey: ['product', highlightId],
    queryFn: () => getProduct(Number(highlightId)),
    enabled: !!highlightId
  });

  // 관리자 주문 데이터로 7일 매출 TOP 10 계산
  const { data: ordersData, isError: isOrdersError } = useQuery({
    queryKey: ['admin', 'dashboard', 'orders', 'menu-hot-check-v3'],
    queryFn: () => adminOrderApi.getOrders({ page: 1, limit: 200 }),
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  // 관리자 API 실패 시 fallback용: 일반 상품 목록 첫 10개를 HOT으로 표시
  const { data: fallbackHotData } = useQuery({
    queryKey: ['products', 'fallback-hot', 'top10'],
    queryFn: () => getProducts({ isDisplay: 'true', limit: 10, page: 1 }),
    staleTime: 1000 * 60 * 30,
    enabled: isOrdersError,
  });

  const top10Ids = useMemo(() => {
    // 관리자 API 성공: 실제 매출 기반 TOP 10
    if (ordersData?.data && !isOrdersError) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const productSales = new Map<number, number>();

      ordersData.data.forEach(order => {
        const orderTime = new Date(order.createdAt);
        const status = String(order.status || '').toUpperCase().replace(/\s/g, '');
        const isValidStatus = !['CANCELLED', 'RETURNED', 'PENDING', '취소됨', '반품됨', '결제대기'].includes(status);

        if (orderTime >= sevenDaysAgo && isValidStatus) {
          order.orderItems?.forEach((item: any) => {
            const prodId = item.prodId || item.product?.id;
            if (!prodId) return;
            const revenue = (Number(item.salePrice) || 0) * (Number(item.quantity) || 0);
            productSales.set(prodId, (productSales.get(prodId) || 0) + revenue);
          });
        }
      });

      const result = Array.from(productSales.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      if (result.length > 0) return result;
    }

    // Fallback: 관리자 API 실패 시 상품 목록 첫 10개를 HOT으로 표시
    if (fallbackHotData?.data) {
      return fallbackHotData.data.slice(0, 10).map((p: any) => p.id);
    }
    return [];
  }, [ordersData, isOrdersError, fallbackHotData]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 검색어가 있으면 카테고리 무관하게 전역 데이터에서 필터링 (자동완성과 일치)
    if (query) {
      if (!allProductsData?.data) return [];
      let products = allProductsData.data;

      // 검색 시 현재 카테고리 내에서만 검색할지 여부 (현재는 전체 검색 정책)
      // 만약 카테고리 내 검색을 원한다면 matchKeyword 필터를 추가할 수 있음
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.summary || "").toLowerCase().includes(query)
      );
      return products;
    }

    // 검색어가 없으면 기존 카테고리별 로직 적용
    if (isAllCategory) {
      return infiniteData ? infiniteData.pages.flatMap(page => page.data) : [];
    }

    if (!allProductsData?.data) return [];
    let products = allProductsData.data;
    const matchKeyword = currentCategory.match;
    if (matchKeyword) {
      products = products.filter(p => {
        const catName = p.category?.name || "";
        return catName.includes(matchKeyword);
      });
    }
    return products;
  }, [isAllCategory, infiniteData, allProductsData, currentCategory, searchQuery]);


  const currentItems = useMemo(() => {
    let items = filteredProducts;
    if (highlightProduct?.data && !items.some((p: any) => p.id === highlightProduct.data.id)) {
      items = [highlightProduct.data, ...items];
    }
    if (isAllCategory) return items;
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [filteredProducts, isAllCategory, currentPage, highlightProduct]);

  const totalPages = !isAllCategory ? Math.ceil(filteredProducts.length / itemsPerPage) : 0;
  const isLoading = isAllCategory ? isInfiniteLoading : isAllLoading;

  useEffect(() => {
    setCurrentPage(1);
    hasScrolledToHighlight.current = false;
    setFocusedIndex(-1);
  }, [currentPath]);

  // 자동완성 제안 목록 (최대 8개)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !allProductsData?.data) return [];
    const trimmed = searchQuery.trim().toLowerCase();
    return allProductsData.data
      .filter((p: any) => p.name.toLowerCase().includes(trimmed))
      .slice(0, 8);
  }, [searchQuery, allProductsData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0) {
        e.preventDefault();
        navigate(`/products/${suggestions[focusedIndex].id}`);
        setSearchQuery("");
        setFocusedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setFocusedIndex(-1);
    }
  };

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
        <div className="w-full aspect-[21/6] md:aspect-[25/5.25] min-h-[225px] relative">
          <div className="absolute inset-0 overflow-hidden"><img src={heroBanner} alt="Menu Hero Banner" className="w-full h-full object-cover" /></div>
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
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFocusedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="상품명 또는 설명 검색"
                    className="bg-transparent border-2 border-brand-yellow rounded-full py-1.5 md:py-2 pl-10 pr-10 text-xs md:text-sm text-white placeholder:text-white/40 outline-none transition-all w-32 md:w-64 backdrop-blur-sm"
                  />
                  {searchQuery && (<button onClick={() => { setSearchQuery(""); setFocusedIndex(-1); }} className="absolute inset-y-0 right-3 flex items-center text-brand-yellow hover:text-white transition-colors"><X size={14} /></button>)}
                  <SearchDropdown
                    query={searchQuery}
                    products={allProductsData?.data || []}
                    focusedIndex={focusedIndex}
                    onClose={() => { setSearchQuery(""); setFocusedIndex(-1); }}
                    onFocusChange={setFocusedIndex}
                  />
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
                    ref={(el) => { itemRefs.current[product.id] = el; }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0, scale: isHighlighted ? [1, 1.05, 1] : 1, boxShadow: isHighlighted ? "0 0 0 4px #FFD400" : "none" }}
                    className={`group flex flex-col h-full cursor-pointer rounded-[24px] p-2 transition-all ${isHighlighted ? 'bg-brand-yellow/10' : ''}`}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#F9F9F9] mb-3 shadow-md border border-[#F0F0F0]">
                      <img src={product.imageUrl || ''} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 ${!isSoldOut && 'group-hover:scale-110'} ${isSoldOut && 'grayscale'}`} />
                      {!isSoldOut && (<div className="absolute top-4 left-4 z-10"><ProductRating prodId={product.id} className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/20" iconSize={16} /></div>)}
                      {totalStock > 0 && totalStock <= 5 && !isSoldOut && (<div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-bounce"><AlertCircle size={12} /><span className="text-[10px] font-black uppercase">품절임박</span></div>)}
                      {isNew && !isSoldOut && (<div className="absolute bottom-6 right-6 z-10 flex items-center justify-center rotate-12"><Star size={96} className="text-brand-yellow fill-brand-yellow drop-shadow-xl" /><span className="absolute text-brand-dark text-xl font-black tracking-tighter">NEW</span></div>)}
                      {isSoldOut && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-black text-2xl border-4 border-white px-6 py-3 rounded-lg rotate-[-10deg]">SOLD OUT</span></div>)}
                      {!isSoldOut && top10Ids.includes(product.id) && (
                        <div className="absolute bottom-6 left-6 z-10 flex items-center justify-center pointer-events-none">
                          <svg width="110" height="110" viewBox="0 0 100 100" className="text-red-600 fill-red-600 drop-shadow-2xl opacity-90"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 1" /><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" /><defs><path id="stampCurve" d="M 20,50 A 30,30 0 1,1 80,50" /></defs><text className="font-black" fontSize="7" fill="currentColor" letterSpacing="1"><textPath href="#stampCurve" startOffset="50%" textAnchor="middle">NADA BEST SELLER</textPath></text><text x="50" y="62" textAnchor="middle" fontSize="28" className="font-black" fill="currentColor" style={{ filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))' }}>HOT</text><path d="M 30,68 L 70,68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><text x="50" y="80" textAnchor="middle" fontSize="5" className="font-bold" fill="currentColor">EST. 2025</text></svg>
                        </div>
                      )}
                      {!isSoldOut && (<div className="absolute inset-0 bg-brand-yellow/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col p-6 backdrop-blur-[2px]"><div className="flex items-center justify-center gap-2 mb-6 border-b border-brand-dark/10 pb-3"><Info size={14} className="text-brand-dark" /><span className="text-[10px] font-black text-brand-dark uppercase tracking-[0.2em]">Nutrition Info</span></div><div className="text-brand-dark"><p className="text-sm font-black mb-6 text-center leading-tight px-2">{product.name}</p><ul className="text-[10px] md:text-[11px] font-bold space-y-1.5 ml-4 md:ml-8 opacity-90"><li>⚬ 용량 : 591.00</li><li>⚬ 열량(kcal) : 256.10</li><li>⚬ 나트륨(mg) : 15.80</li><li>⚬ 탄수화물(g) : 68.50</li><li>⚬ 당류(g) : 59.40</li><li>⚬ 지방(g) : 0.40</li><li>⚬ 포화지방(g) : 0.00</li><li>⚬ 단백질(g) : 1.30</li></ul></div><div className="mt-auto text-[9px] font-black text-brand-dark/30 text-center tracking-widest">CLICK FOR DETAIL</div></div>)}
                    </div>
                    <div className="px-1 flex flex-col gap-1">
                      <h3 className={`text-base md:text-lg font-black transition-colors line-clamp-1 leading-tight ${isSoldOut ? 'text-gray-400' : 'text-[#222222] group-hover:text-brand-yellow'}`}>
                        <SearchHighlight text={product.name} query={searchQuery} />
                      </h3>
                      <div className="flex justify-between items-center"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span><p className={`font-black text-base md:text-lg ${isSoldOut ? 'text-gray-400' : 'text-brand-dark'}`}>₩ {product.basePrice.toLocaleString()}</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {isAllCategory && (
              <div ref={loadMoreRef} className="flex justify-center py-10">
                {isFetchingNextPage && <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-yellow"></div>}
              </div>
            )}

            {!isAllCategory && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-20 mb-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
                <div className="flex gap-2">{Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (<button key={num} onClick={() => setCurrentPage(num)} className={`w-10 h-10 rounded-full font-black text-sm transition-all ${currentPage === num ? "bg-brand-dark text-white" : "text-gray-400 hover:bg-gray-50"}`}>{num}</button>))}</div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
              </div>
            )}
          </>
        )}
        {!isLoading && currentItems.length === 0 && (<div className="text-center py-32"><p className="text-[#AAAAAA] text-xl font-bold italic tracking-widest">COMING SOON</p></div>)}
      </div>
    </div>
  );
};

export default MenuPage;
