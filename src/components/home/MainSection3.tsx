import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MdOutlineImageNotSupported } from 'react-icons/md';
import { adminOrderApi } from '../../api/admin.order.api';
import { getProducts } from '../../api/product.api';

const MainSection3: React.FC = () => {
  const navigate = useNavigate();

  // 데이터 페칭
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'orders', 'home-hot'],
    queryFn: () => adminOrderApi.getOrders({ page: 1, limit: 100 }),
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'all-for-matching'],
    queryFn: () => getProducts({ limit: 100, isDisplay: 'true' }),
  });

  const isLoading = isOrdersLoading || isProductsLoading;

  // TOP 10 계산 및 요청된 순서[10, 1, 2, 3, 4, ..., 9]로 재배치
  const topProducts = useMemo(() => {
    if (!ordersData?.data || !productsData?.data) return [];

    const salesCount = new Map<string, number>();
    ordersData.data.forEach(order => {
      order.orderItems?.forEach(item => {
        const name = item.product?.name;
        if (!name) return;
        salesCount.set(name, (salesCount.get(name) || 0) + item.quantity);
      });
    });

    const sortedTop10 = Array.from(salesCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name], index) => {
        const detail = productsData.data.find(p => p.name === name);
        return {
          rank: index + 1,
          id: detail?.id,
          name: name,
          categoryName: detail?.category?.name || "MENU",
          imageUrl: detail?.imageUrl || null,
          summary: detail?.summary || "나다커피 인기 메뉴"
        };
      }).filter(p => p.id);

    if (sortedTop10.length < 10) return sortedTop10;

    // 요청된 순서: 9위가 가장 먼저 나오고 그 뒤로 [10위, 1위, 2위, ..., 8위]
    const rearranged = [sortedTop10[8], sortedTop10[9], ...sortedTop10.slice(0, 8)];
    return rearranged;
  }, [ordersData, productsData]);

  // 무한 루프를 위한 데이터 복제 (2세트)
  const marqueeItems = useMemo(() => [...topProducts, ...topProducts], [topProducts]);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-yellow font-bold tracking-widest text-xs bg-brand-dark px-3 py-1.5 rounded-full mb-3 inline-block">
              REAL-TIME TREND
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-[#222222] tracking-tighter">
              지금 가장 핫한 메뉴 <span className="text-brand-yellow font-black italic">No.1 ~ No.10</span>
            </h2>
            <p className="text-gray-400 font-bold mt-4 text-sm md:text-lg">
              나다커피 고객들이 선택한 실시간 베스트 셀러 10종입니다.
            </p>
          </motion.div>
          <Link to="/menu" className="mt-6 md:mt-0 bg-white border border-gray-100 px-8 py-4 rounded-2xl shadow-sm text-gray-400 hover:text-brand-dark font-black flex items-center transition-all hover:shadow-md text-sm">
            전체 메뉴 보기 <span className="ml-2">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden group">
            {/* 좌우 Fade-in/out 효과 레이어 */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-40 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-40 pointer-events-none" />

            {/* 무한 롤링 마키 영역 */}
            <motion.div
              className="flex gap-10"
              animate={{ x: [0, "-50%"] }}
              style={{ width: "fit-content" }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              <div className="flex gap-10" style={{ paddingRight: "40px" }}>
                {marqueeItems.map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="w-[320px] flex flex-col cursor-pointer transition-opacity"
                  >
                    {/* 이미지 영역 - MenuPage 스타일 매칭 (가장자리 레이어 느낌 제거) */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#F9F9F9] mb-4 shadow-md border border-[#F0F0F0] flex items-center justify-center">
                      {/* 순위 배지 (No.X 형식) - 크기 2배 확대 */}
                      <div className="absolute top-5 left-5 z-20">
                        <div className={`px-6 py-3 rounded-full flex items-center justify-center font-black text-xl shadow-xl tracking-tighter ${product.rank === 1 ? 'bg-brand-yellow text-brand-dark' :
                          product.rank === 2 ? 'bg-gray-200 text-brand-dark' :
                            product.rank === 3 ? 'bg-orange-100 text-orange-700' :
                              'bg-white text-gray-400 border border-gray-100'
                          }`}>
                          No.{product.rank}
                        </div>
                      </div>

                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <MdOutlineImageNotSupported className="text-gray-300" size={64} />
                      )}
                    </div>

                    {/* 텍스트 영역 - 카테고리 제거 및 메뉴명 강조 */}
                    <div className="px-1 flex flex-col">
                      <h4 className="text-xl font-black text-[#222222] line-clamp-1 leading-tight mb-2 uppercase tracking-tighter">
                        {product.name}
                      </h4>
                      <p className="text-gray-400 text-xs font-bold line-clamp-2 leading-tight">
                        {product.summary}
                      </p>
                    </div>

                    {/* 하단 강조 라인 */}
                    <div className={`mt-6 h-1 w-full rounded-full ${product.rank === 1 ? 'bg-brand-yellow' :
                      product.rank === 2 ? 'bg-gray-200' :
                        product.rank === 3 ? 'bg-orange-200' :
                          'bg-gray-50'
                      }`} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MainSection3;
