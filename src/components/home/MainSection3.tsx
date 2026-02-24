import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MdOutlineImageNotSupported, MdTrendingUp } from 'react-icons/md';
import { getProducts } from '../../api/product.api';
import { useBestSellers } from '../../hooks/useBestSellers';

const MainSection3: React.FC = () => {
  const navigate = useNavigate();

  // 1. 베스트 셀러 데이터 (Admin Dashboard와 동일한 로직 사용)
  const { topProducts: rankedProducts, isLoading: isBestSellersLoading } = useBestSellers();

  // 2. 상품 상세 정보 조회 (30개 상품을 한 번만 가져와서 매핑)
  const { data: allProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'best-seller-all-batch'],
    queryFn: () => getProducts({ page: 1, limit: 30, isDisplay: 'true' }),
    staleTime: 1000 * 60 * 60,
  });


  // 3. 최종 표시 아이템 구성 (useBestSellers 순위 보존 + 상품 메타데이터 결합)
  const finalDisplayItems = useMemo(() => {
    if (!allProducts?.data) return [];

    // 랭킹 데이터가 있을 경우 랭킹 순서대로 매핑
    if (rankedProducts.length > 0) {
      return rankedProducts.map((rp, index) => {
        const detail = allProducts.data.find(p => p.id === rp.id);
        return {
          rank: index + 1,
          id: rp.id,
          name: detail?.name || rp.name,
          categoryName: detail?.category?.name || "MENU",
          imageUrl: detail?.imageUrl || rp.image,
          summary: detail?.summary || "나다커피 인기 메뉴",
          isDisplay: detail ? detail.isDisplay : true
        };
      });
    }

    // 랭킹 데이터가 없을 경우 (예: 주문 데이터 부족), 전체 상품 중 상위 10개 표시
    return allProducts.data.slice(0, 10).map((p, i) => ({
      rank: i + 1,
      id: p.id,
      name: p.name,
      categoryName: p.category?.name || "MENU",
      imageUrl: p.imageUrl,
      summary: p.summary || "나다커피 인기 메뉴",
      isDisplay: p.isDisplay
    }));
  }, [rankedProducts, allProducts]);

  // [수정] 2줄 마키를 위한 데이터 분할 및 복제
  const row1 = useMemo(() => {
    const items = finalDisplayItems.slice(0, 5);
    return items.length > 0 ? Array(4).fill(items).flat() : [];
  }, [finalDisplayItems]);

  const row2 = useMemo(() => {
    const items = finalDisplayItems.slice(5, 10);
    const source = items.length > 0 ? items : finalDisplayItems.slice(0, 5);
    return source.length > 0 ? Array(4).fill(source).flat() : [];
  }, [finalDisplayItems]);


  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex flex-col md:flex-row items-end justify-between px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-brand-yellow font-bold tracking-widest text-xs bg-brand-dark px-3 py-1.5 rounded-full mb-3 inline-block flex items-center gap-2 w-fit">
                <MdTrendingUp size={14} /> 최근 7일 매출액 기준 (매시 정각 갱신)
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-[#222222] tracking-tighter">
                주간 베스트 셀러 <span className="text-brand-yellow font-black italic">TOP 10</span>
              </h2>
              <p className="text-gray-400 font-bold mt-4 text-sm md:text-lg">
                나다커피 고객들이 선택한 최근 일주일간의 베스트 셀러 10종입니다.
              </p>
            </motion.div>
            <Link to="/menu" className="mt-6 md:mt-0 bg-white border border-gray-100 px-8 py-4 rounded-2xl shadow-sm text-gray-400 hover:text-brand-dark font-black flex items-center transition-all hover:shadow-md text-sm">
              전체 메뉴 보기 <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        {isProductsLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
          </div>
        ) : finalDisplayItems.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 max-w-4xl mx-auto">
            <p className="text-gray-400 font-bold text-xl">등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1행: 좌 -> 우 (x: -50% -> 0) */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              <motion.div
                className="flex gap-8 w-max"
                animate={{ x: ["-50%", "0%"] }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              >
                {row1.map((product, idx) => (
                  <ProductCard key={`row1-${idx}`} product={product} navigate={navigate} />
                ))}
              </motion.div>
            </div>

            {/* 2행: 우 -> 좌 (x: 0 -> -50%) */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              <motion.div
                className="flex gap-8 w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              >
                {row2.map((product, idx) => (
                  <ProductCard key={`row2-${idx}`} product={product} navigate={navigate} />
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ProductCard = ({ product, navigate }: any) => (
  <div
    onClick={() => navigate(`/products/${product.id}`)}
    className="w-[320px] group cursor-pointer"
  >
    <div className="relative aspect-[3/4] overflow-hidden rounded-[30px] bg-[#F9F9F9] mb-4 shadow-md border border-[#F0F0F0]">
      <div className="absolute top-4 left-4 z-20">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-xl border-2 border-white ${product.rank === 1 ? 'bg-brand-yellow text-brand-dark' :
          product.rank === 2 ? 'bg-gray-200 text-brand-dark' :
            product.rank === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-white text-gray-400'
          }`}>
          {product.rank}
        </div>
      </div>

      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!product.isDisplay ? 'grayscale opacity-50' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <MdOutlineImageNotSupported size={48} />
        </div>
      )}

      {!product.isDisplay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="bg-black/70 text-white px-3 py-1 rounded-lg font-bold text-xs backdrop-blur-sm">판매중지</span>
        </div>
      )}

      <div className="absolute inset-0 bg-brand-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <p className="text-brand-yellow font-black text-sm mb-1 uppercase tracking-widest">Weekly Best</p>
        <div className="text-white font-bold text-xs line-clamp-2" dangerouslySetInnerHTML={{ __html: product.summary }} />
      </div>
    </div>

    <div className="px-2 text-center">
      <h3 className="text-lg font-black truncate mb-1 transition-colors group-hover:text-brand-yellow text-[#222222]">
        {product.name}
      </h3>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {product.categoryName}
      </p>
    </div>
  </div>
);

export default MainSection3;
