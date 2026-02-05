import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/product.api';
import { MdOutlineImageNotSupported } from 'react-icons/md';

const MainSection3: React.FC = () => {
  const navigate = useNavigate();

  // 최신 상품 4개 조회
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'home-latest'],
    queryFn: () => getProducts({ limit: 4, isDisplay: 'true' }), 
  });

  const products = data?.data || [];

  return (
    <section className="py-24 bg-gray-50">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16">
             <div>
                <span className="text-brand-yellow font-bold tracking-widest">
                   WHAT'S NEW
                </span>
                <h2 className="text-4xl md:text-5xl font-black mt-2 text-brand-dark">
                   지금 가장 핫한 메뉴
                </h2>
             </div>
             <Link to="/menu" className="mt-4 md:mt-0 text-gray-400 hover:text-brand-dark font-bold flex items-center transition-colors">
                전체 메뉴 보기 <span className="ml-2">→</span>
             </Link>
          </div>

          {isLoading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.length > 0 ? (
                   products.map((product, idx) => (
                      <motion.div
                         key={product.id}
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ delay: idx * 0.1 }}
                         whileHover={{ y: -10 }}
                         onClick={() => navigate(`/products/${product.id}`)}
                         className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                         
                         {/* [수정] 이미지 영역 높이 h-[400px]로 확대 */}
                         <div className="h-[400px] overflow-hidden bg-white flex items-center justify-center p-2">
                            {product.imageUrl ? (
                               <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                               />
                            ) : (
                               <MdOutlineImageNotSupported className="text-gray-300" size={48} />
                            )}
                         </div>
                         
                         <div className="p-6 pt-0 text-center">
                            <h4 className="text-lg font-black mb-2 text-brand-dark line-clamp-1">
                               {product.name}
                            </h4>
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                               {product.summary || "나다커피의 특별한 맛을 즐겨보세요."}
                            </p>
                         </div>
                      </motion.div>
                   ))
                ) : (
                   <div className="col-span-4 text-center py-20 text-gray-400 font-bold">
                      등록된 상품이 없습니다.
                   </div>
                )}
             </div>
          )}
       </div>
    </section>
  );
};

export default MainSection3;
