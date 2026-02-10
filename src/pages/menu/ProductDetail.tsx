import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getProduct } from '../../api/product.api';
import { orderApi } from '../../api/order.api'; // [추가]
import { adminOrderApi } from '../../api/admin.order.api';
import { cartApi } from '../../api/cart.api';
import { reviewApi } from '../../api/review.api';
import { ShoppingCart, CreditCard, Plus, Minus, Star, MessageSquare, Info, ShieldCheck, ChevronRight, Coffee, Snowflake, AlertTriangle, Trash2, Edit, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/useAuthStore';
import ReviewModal from '../mypage/components/ReviewModal';
import ImageLightbox from '../../components/ImageLightbox';
import ProductRating from '../../components/ProductRating';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tempOption, setTempOption] = useState<'HOT' | 'ICE'>('HOT');

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [writeOrder, setWriteOrder] = useState<any>(null); // [추가] 리뷰 작성용 주문 정보
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false); // [추가] 스크롤 트리거

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // [추가] 특정 섹션(#reviews)으로의 자동 스크롤 지원
  React.useEffect(() => {
    if (window.location.hash === '#reviews') {
      const element = document.getElementById('reviews');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500); // 렌더링 완료 시간을 고려한 딜레이
      }
    }
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(Number(id)),
    enabled: !!id
  });

  // [수정] 무한 스크롤을 위한 useInfiniteQuery 사용
  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['product-reviews', id],
    queryFn: ({ pageParam = 1 }) => reviewApi.getProductReviews(Number(id), pageParam, 10),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!id,
    initialPageParam: 1,
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewApi.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
      alert("리뷰가 삭제되었습니다.");
    },
    onError: (err: any) => {
      alert(`리뷰 삭제 실패: ${err.message}`);
    }
  });

  const handleEditReview = (review: any) => {
    setSelectedReview(review);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  // [추가] 실시간 베스트 셀러 TOP 10 계산 (HOT 배지용)
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'dashboard', 'orders', 'detail-hot-check'],
    queryFn: () => adminOrderApi.getOrders({ page: 1, limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const isHotItem = useMemo(() => {
    if (!ordersData?.data || !product?.data) return false;
    const salesCount = new Map<string, number>();
    ordersData.data.forEach(order => {
      order.orderItems?.forEach(item => {
        const name = item.product?.name;
        if (!name) return;
        salesCount.set(name, (salesCount.get(name) || 0) + item.quantity);
      });
    });

    const top10 = Array.from(salesCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    return top10.includes(product.data.name);
  }, [ordersData, product]);

  // [추가] 리뷰 작성을 위한 구매 이력 조회
  const { data: myOrders } = useQuery({
    queryKey: ['orders', 'my', 'check-review', id],
    queryFn: () => orderApi.getMyOrders(1, 100),
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5
  });

  // [추가] 내가 작성한 리뷰 전체 목록 조회 (이미 작성했는지 체크용)
  const { data: myReviews } = useQuery({
    queryKey: ['reviews', 'me', 'check', id],
    queryFn: () => reviewApi.getMyReviews(1, 100),
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5
  });

  // [추가] 현재 상품에 대해 이미 리뷰를 작성했는지 확인
  const isAlreadyReviewed = useMemo(() => {
    if (!myReviews?.data || !id) return false;
    return myReviews.data.some(review =>
      Number(review.product.id) === Number(id)
    );
  }, [myReviews, id]);

  // [추가] 리뷰 작성 가능한 주문 찾기 (구매확정 + 해당상품포함 + 아직 리뷰를 안 쓴 상태)
  const reviewableOrder = useMemo(() => {
    if (!myOrders?.data || !product?.data || isAlreadyReviewed) return null;

    for (const order of myOrders.data) {
      if (order.status !== 'PURCHASE_COMPLETED') continue;
      const targetItem = order.orderItems.find((item: any) =>
        Number(item.product.id) === Number(id)
      );
      if (targetItem) {
        return { ...order, orderItems: [targetItem] };
      }
    }
    return null;
  }, [myOrders, product, id, isAlreadyReviewed]);

  // [추가] 구매 이력이 있는지 확인 (리뷰 여부 상관없이 구매확정 상태인 주문)
  const hasPurchasedHistory = useMemo(() => {
    if (!myOrders?.data || !product?.data) return false;
    return myOrders.data.some(order =>
      order.status === 'PURCHASE_COMPLETED' &&
      order.orderItems.some((item: any) => Number(item.product.id) === Number(id))
    );
  }, [myOrders, product, id]);

  const isNewProduct = (createdAt: string) => {
    if (!createdAt) return false;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return new Date(createdAt) >= oneMonthAgo;
  };

  const basePrice = product?.data.basePrice || 0;
  const optionPrice = tempOption === 'ICE' ? 500 : 0;
  const totalPrice = (basePrice + optionPrice) * quantity;

  const getSelectedOption = () => {
    if (!product?.data.options || product.data.options.length === 0) return null;
    return product.data.options.find(opt =>
      opt.name.toUpperCase().includes(tempOption) ||
      opt.value.toUpperCase().includes(tempOption)
    ) || product.data.options[0];
  };

  const selectedOption = getSelectedOption();
  const currentStock = selectedOption?.stockQty ?? 0;

  const checkStock = () => {
    if (currentStock < quantity) {
      setAlertMessage(`재고가 부족합니다.\n(현재 재고: ${currentStock}개)`);
      setIsAlertOpen(true);
      return false;
    }
    return true;
  };

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!checkStock()) throw new Error("재고 부족");
      if (!product?.data) throw new Error("상품 정보가 없습니다.");

      const optionId = selectedOption ? Number(selectedOption.id) : null;

      const payload = {
        prodId: Number(id),
        quantity: Number(quantity),
        optionId: optionId
      };

      return cartApi.addToCart(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (window.confirm('상품이 장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) navigate('/cart');
    },
    onError: (err: any) => {
      if (err.message !== "재고 부족") {
        setAlertMessage(`장바구니 담기 실패: ${err.response?.data?.message || '서버 옵션 설정을 확인해주세요.'}`);
        setIsAlertOpen(true);
      }
    }
  });

  // [추가] 리뷰 작성 후 자동 스크롤 이펙트
  React.useEffect(() => {
    if (shouldScrollToBottom && !isFetchingNextPage) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        setShouldScrollToBottom(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToBottom, isFetchingNextPage]); // reviewsData가 디펜던시에 없어도 동작 (shouldScrollToBottom이 트리거)


  const handleBuyNow = () => {
    if (!checkStock()) return;
    if (!product?.data) return;

    const realOptionId = selectedOption ? Number(selectedOption.id) : null;

    const directOrder = {
      orderItems: [{
        product: {
          id: Number(id),
          name: product.data.name,
          imageUrl: product.data.imageUrl || '',
        },
        salePrice: basePrice + optionPrice,
        quantity: quantity,
        option: {
          id: realOptionId,
          name: tempOption,
          value: tempOption
        }
      }],
      totalPrice: totalPrice
    };

    navigate('/payment', { state: { directOrder } });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-yellow mx-auto"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">상품을 찾을 수 없습니다.</div>;

  const item = product.data;
  const subImages = [item.imageUrl, item.imageUrl, item.imageUrl, item.imageUrl];


  return (
    <div className="bg-white min-h-screen pt-10 pb-40 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="aspect-square rounded-[60px] overflow-hidden shadow-2xl border border-gray-50 bg-gray-50 relative group">
              <img src={subImages[activeImg] || ''} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

              {/* [추가] 동적 별점 오버레이 - 좌측 상단 */}
              <div className="absolute top-10 left-10 z-[20]">
                <ProductRating
                  prodId={Number(id)}
                  iconSize={24}
                  className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-[30px] shadow-2xl border border-white/20"
                />
              </div>

              {/* 배지 오버레이 시스템 */}
              <div className="absolute inset-0 pointer-events-none p-10">
                {/* 1. SOLD OUT */}
                {currentStock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                    <span className="text-white font-black text-6xl border-8 border-white px-12 py-6 rounded-2xl rotate-[-10deg]">SOLD OUT</span>
                  </div>
                )}

                {/* 2. Low Stock (품절임박) */}
                {currentStock > 0 && currentStock <= 5 && (
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute top-12 right-12 bg-orange-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-2xl"
                  >
                    <AlertTriangle size={24} /><span className="text-xl font-black uppercase">품절임박</span>
                  </motion.div>
                )}

                {/* 3. NEW 배지 (우측 하단) */}
                {isNewProduct(item.createdAt) && currentStock > 0 && (
                  <div className="absolute bottom-12 right-12 flex items-center justify-center rotate-12 drop-shadow-2xl">
                    <Star size={160} className="text-brand-yellow fill-brand-yellow" />
                    <span className="absolute text-brand-dark text-3xl font-black tracking-tighter">NEW</span>
                  </div>
                )}

                {/* 4. HOT 배지 (현실적인 원형 인장 스탬프 - 좌측 하단) */}
                {isHotItem && currentStock > 0 && (
                  <motion.div
                    animate={{
                      x: [-5, 5, -5],
                      rotate: [-12, -10, -12]
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute bottom-12 left-12 flex items-center justify-center"
                  >
                    <svg width="200" height="200" viewBox="0 0 100 100" className="text-red-600 fill-red-600 drop-shadow-2xl opacity-90">
                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 1" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="2" />
                      <defs>
                        <path id="stampCurveDetail" d="M 20,50 A 30,30 0 1,1 80,50" />
                      </defs>
                      <text className="font-black" fontSize="7" fill="currentColor" letterSpacing="1">
                        <textPath href="#stampCurveDetail" startOffset="50%" textAnchor="middle">NADA BEST SELLER</textPath>
                      </text>
                      <text x="50" y="62" textAnchor="middle" fontSize="28" className="font-black" fill="currentColor" style={{ filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))' }}>HOT</text>
                      <path d="M 30,68 L 70,68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <text x="50" y="80" textAnchor="middle" fontSize="5" className="font-bold" fill="currentColor">EST. 2025</text>
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {subImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImg(idx)} className={`w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0 ${activeImg === idx ? 'border-brand-yellow shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img || ''} className="w-full h-full object-cover" alt="sub" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h2 className="text-5xl font-black text-brand-dark mb-6 leading-tight">{item.name}</h2>
              <p className="text-gray-400 text-xl font-medium leading-relaxed">{item.summary || '나다커피만의 특별한 풍미를 경험해보세요.'}</p>
            </div>

            <div className="py-8 border-y border-gray-100 flex items-center justify-between">
              <span className="text-gray-400 font-bold text-xl uppercase tracking-widest">Base Price</span>
              <span className="text-4xl font-black text-brand-dark tracking-tighter">₩ {item.basePrice.toLocaleString()}</span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Option</span>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setTempOption('HOT')} className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black border-2 transition-all ${tempOption === 'HOT' ? 'border-red-500 bg-red-50 text-red-600 shadow-lg' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}><Coffee size={20} /> HOT</button>
                <button onClick={() => setTempOption('ICE')} className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black border-2 transition-all ${tempOption === 'ICE' ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}><Snowflake size={20} /> ICE (+500)</button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-3xl p-4 border border-gray-100">
              <span className="ml-4 font-black text-brand-dark uppercase tracking-widest text-sm">Quantity</span>
              <div className="flex items-center gap-6 bg-white rounded-2xl p-1 shadow-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all"><Minus size={20} /></button>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) return;
                    if (val < 1) val = 1;
                    if (currentStock > 0 && val > currentStock) val = currentStock;
                    setQuantity(val);
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-16 text-center text-2xl font-black text-brand-dark bg-transparent outline-none border-b-2 border-transparent focus:border-brand-dark transition-all appearance-none m-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all"><Plus size={20} /></button>
              </div>
              <span className="text-xs font-bold text-gray-400 mr-4">재고: {currentStock}개</span>
            </div>

            <div className="flex items-end justify-between px-4">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Total Amount</span>
              <div className="text-right">
                {tempOption === 'ICE' && <p className="text-xs font-bold text-blue-500 mb-1">+ ICE 옵션 500원 포함</p>}
                <span className="text-4xl font-black text-brand-dark tracking-tighter">₩ {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending || currentStock === 0}
                className={`py-6 rounded-[25px] font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${currentStock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-brand-dark hover:bg-gray-200'}`}
              >
                <ShoppingCart size={24} /> {currentStock === 0 ? '품절' : '장바구니 담기'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={currentStock === 0}
                className={`py-6 rounded-[25px] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${currentStock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-brand-yellow text-brand-dark hover:bg-black hover:text-white'}`}
              >
                <CreditCard size={24} /> {currentStock === 0 ? '품절' : '바로 구매하기'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-brand-dark text-brand-yellow rounded-2xl flex items-center justify-center shadow-lg"><Info size={24} /></div>
            <h3 className="text-3xl font-black text-brand-dark italic">Product Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 bg-gray-50 rounded-[40px] p-12 border border-gray-100">
              <h4 className="text-xl font-black text-brand-dark mb-8 flex items-center gap-2"><ShieldCheck className="text-green-500" /> 영양 성분 가이드</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-8">
                <NutritionItem label="열량" value="256.10" unit="kcal" />
                <NutritionItem label="나트륨" value="15.80" unit="mg" />
                <NutritionItem label="탄수화물" value="68.50" unit="g" />
                <NutritionItem label="당류" value="59.40" unit="g" />
                <NutritionItem label="지방" value="0.40" unit="g" />
                <NutritionItem label="포화지방" value="0.00" unit="g" />
                <NutritionItem label="단백질" value="1.30" unit="g" />
                <NutritionItem label="카페인" value="120.00" unit="mg" />
              </div>
            </div>
            <div className="bg-brand-yellow/10 rounded-[40px] p-12 border border-brand-yellow/20">
              <h4 className="text-xl font-black text-brand-dark mb-6">Product Highlights</h4>
              <ul className="space-y-4 text-brand-dark/70 font-bold text-sm">
                <li className="flex items-start gap-2"><ChevronRight size={16} className="mt-0.5 shrink-0 text-brand-yellow" /> 당일 로스팅된 신선한 원두 사용</li>
                <li className="flex items-start gap-2"><ChevronRight size={16} className="mt-0.5 shrink-0 text-brand-yellow" /> 나다커피만의 독자적인 딥 프레싱 공법</li>
                <li className="flex items-start gap-2"><ChevronRight size={16} className="mt-0.5 shrink-0 text-brand-yellow" /> 인공 감미료를 최소화한 자연스러운 맛</li>
              </ul>
            </div>
          </div>
        </div>

        <div id="reviews">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-dark text-brand-yellow rounded-2xl flex items-center justify-center shadow-lg"><MessageSquare size={24} /></div>
              <h3 className="text-3xl font-black text-brand-dark italic">Customer Reviews</h3>
            </div>

            {/* [추가] 리뷰 작성 버튼 - 구매 이력이 있을 때만 표시 */}
            {currentUser && hasPurchasedHistory && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={reviewableOrder ? { scale: 1.05 } : {}}
                whileTap={reviewableOrder ? { scale: 0.95 } : {}}
                disabled={!reviewableOrder}
                onClick={() => {
                  if (!reviewableOrder) return;
                  setSelectedReview(null);
                  setWriteOrder(reviewableOrder);
                  setIsReviewModalOpen(true);
                }}
                className={twMerge(
                  "px-6 py-3 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg text-sm md:text-base",
                  reviewableOrder
                    ? "bg-brand-dark text-brand-yellow hover:bg-black"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                )}
              >
                {reviewableOrder ? <Edit size={18} /> : <Check size={18} />}
                {reviewableOrder ? "리뷰 작성하기" : "리뷰 작성 완료"}
              </motion.button>
            )}
          </div>
          <div className="space-y-6">
            {!reviewsData || reviewsData.pages[0]?.data.length === 0 ? (
              <div className="bg-gray-50 rounded-[30px] p-20 text-center border border-dashed border-gray-200">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold">아직 작성된 리뷰가 없습니다.</p>
                <p className="text-sm text-gray-300 mt-1">첫 번째 리뷰의 주인공이 되어보세요!</p>
              </div>
            ) : (
              <>
                {reviewsData.pages.map((page) =>
                  page.data.map((review: any) => (
                    <div key={review.id} className="bg-white rounded-[30px] p-8 border border-gray-100 hover:shadow-xl transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex text-brand-yellow">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                size={18}
                                fill={idx < review.rating ? "currentColor" : "none"}
                                className={idx < review.rating ? "" : "text-gray-200"}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-brand-dark">
                              {review.member.name.length > 2
                                ? review.member.name[0] + '*'.repeat(review.member.name.length - 2) + review.member.name[review.member.name.length - 1]
                                : review.member.name.length === 2
                                  ? review.member.name[0] + '*'
                                  : review.member.name}
                            </p>
                            <span className="text-xs font-bold text-gray-300">|</span>
                            <span className="text-xs font-bold text-gray-300">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {(currentUser?.id && review.member.id && currentUser.id === review.member.id) ||
                            (!review.member.id && currentUser?.name === review.member.name) ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="p-2 text-gray-400 hover:text-brand-dark transition-colors"
                                title="수정"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-gray-500 font-medium leading-relaxed mb-6 whitespace-pre-wrap break-words">{review.content}</p>

                      {/* 리뷰 이미지 렌더링 */}
                      {review.reviewImages && review.reviewImages.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {review.reviewImages.map((img: any, idx: number) => (
                            <div
                              key={img.id}
                              className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                setLightboxImages(review.reviewImages.map((i: any) => i.url));
                                setLightboxIndex(idx);
                                setLightboxOpen(true);
                              }}
                            >
                              <img src={img.url} alt="Review" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* 무한 스크롤 트리거 & 로딩 더보기 버튼 */}
                {hasNextPage && (
                  <div className="flex justify-center pt-8">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-8 py-4 bg-brand-dark text-white rounded-2xl font-black hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          로딩 중...
                        </>
                      ) : (
                        '더 많은 리뷰 보기'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAlertOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-[30px] shadow-2xl p-8 text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-brand-dark mb-2">알림</h3>
              <p className="text-gray-500 font-medium mb-8 whitespace-pre-line">{alertMessage}</p>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg"
              >
                확인
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setWriteOrder(null);
        }}
        editData={selectedReview}
        currentProduct={product?.data}
        order={writeOrder}
        onSuccess={() => {
          setShouldScrollToBottom(true);
        }}
      />

      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};

const NutritionItem = ({ label, value, unit }: any) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</span>
    <div className="flex items-baseline gap-0.5"><span className="text-2xl font-black text-brand-dark">{value}</span><span className="text-xs font-bold text-gray-400">{unit}</span></div>
  </div>
);

export default ProductDetail;
