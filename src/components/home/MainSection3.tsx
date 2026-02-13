import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MdOutlineImageNotSupported, MdAccessTime, MdTrendingUp } from 'react-icons/md';
import { getProducts } from '../../api/product.api'; // [수정] adminOrderApi 제거

const MainSection3: React.FC = () => {
  const navigate = useNavigate();

  // [수정] 관리자 API 대신 공개 상품 목록 API 사용
  // sort: 'popular' 또는 백엔드에서 지원하는 인기순 정렬 파라미터 사용
  // 만약 백엔드가 인기순 정렬을 지원하지 않는다면, 일단 기본 목록을 가져오되
  // 추후 백엔드에 'GET /api/products/best' 같은 API를 요청해야 함.
  // 여기서는 일단 getProducts를 사용하여 데이터를 가져옴.
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: () => getProducts({ 
      limit: 10, 
      sort: 'price_desc' // [임시] 매출액 정보가 공개 API에 없다면 가격순 등으로 대체하거나, 백엔드 수정 필요
      // 이상적으로는 sort: 'sales' 또는 'popular'가 있어야 함
    }),
  });

  // [참고] 현재 공개 API로는 정확한 '매출액 기준 TOP 10'을 알 수 없음.
  // 관리자 API(adminOrderApi)는 일반 사용자가 호출할 수 없기 때문.
  // 따라서 백엔드에 "메인 페이지용 베스트 셀러 API"가 없다면, 
  // 임시로 상품 목록의 앞부분을 보여주거나, 백엔드 수정이 필수적임.
  
  // 여기서는 productsData를 그대로 사용하여 랭킹을 매김 (임시 조치)
  const topProducts = useMemo(() => {
    if (!productsData?.data) return [];

    return productsData.data.map((product, index) => ({
      rank: index + 1,
      id: product.id,
      name: product.name,
      categoryName: product.category?.name || "MENU",
      imageUrl: product.imageUrl || null,
      summary: product.summary || "나다커피 인기 메뉴",
      isDisplay: product.isDisplay,
      isDeleted: false, // 목록에서 가져왔으므로 삭제된 상품은 아님
      revenue: 0 // 공개 API에는 매출 정보가 없음
    }));
  }, [productsData]);

  const row1 = useMemo(() => {
    const items = topProducts.slice(0, 5);
    return items.length > 0 ? [...items, ...items, ...items, ...items] : [];
  }, [topProducts]);

  const row2 = useMemo(() => {
    const items = topProducts.slice(5, 10);
    const source = items.length > 0 ? items : topProducts.slice(0, 5);
    return source.length > 0 ? [...source, ...source, ...source, ...source] : [];
  }, [topProducts]);

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
                <MdTrendingUp size={14} /> WEEKLY BEST
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-[#222222] tracking-tighter">
                주간 베스트 셀러 <span className="text-brand-yellow font-black italic">TOP 10</span>
              </h2>
              <p className="text-gray-400 font-bold mt-4 text-sm md:text-lg">
                나다커피 고객들이 가장 사랑한 대표 메뉴입니다.
              </p>
            </motion.div>
            <Link to="/menu" className="mt-6 md:mt-0 bg-white border border-gray-100 px-8 py-4 rounded-2xl shadow-sm text-gray-400 hover:text-brand-dark font-black flex items-center transition-all hover:shadow-md text-sm">
              전체 메뉴 보기 <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
          </div>
        ) : topProducts.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 max-w-4xl mx-auto">
            <p className="text-gray-400 font-bold text-xl">등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1행: 좌 -> 우 */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              
              <motion.div
                className="flex gap-6 w-max"
                animate={{ x: ["-50%", "0%"] }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              >
                {row1.map((product, idx) => (
                  <ProductCard key={`row1-${idx}`} product={product} navigate={navigate} />
                ))}
              </motion.div>
            </div>

            {/* 2행: 우 -> 좌 */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              <motion.div
                className="flex gap-6 w-max"
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
    onClick={() => {
      if (!product.isDeleted) navigate(`/menu?highlight=${product.id}`);
    }}
    className={`w-[320px] group ${product.isDeleted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div className="relative aspect-[3/4] overflow-hidden rounded-[30px] bg-[#F9F9F9] mb-4 shadow-md border border-[#F0F0F0]">
      <div className="absolute top-4 left-4 z-20">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-xl border-2 border-white ${
          product.rank === 1 ? 'bg-brand-yellow text-brand-dark' :
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
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${(!product.isDisplay || product.isDeleted) ? 'grayscale opacity-50' : ''}`}
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

      {!product.isDeleted && (
        <div className="absolute inset-0 bg-brand-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-brand-yellow font-black text-sm mb-1 uppercase tracking-widest">Weekly Best</p>
          <p className="text-white font-bold text-xs line-clamp-2" dangerouslySetInnerHTML={{ __html: product.summary }} />
        </div>
      )}
    </div>

    <div className="px-2 text-center">
      <h3 className={`text-lg font-black truncate mb-1 transition-colors ${product.isDeleted ? 'text-gray-400' : 'text-[#222222] group-hover:text-brand-yellow'}`}>
        {product.name}
      </h3>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        {product.categoryName}
      </p>
    </div>
  </div>
);

export default MainSection3;
