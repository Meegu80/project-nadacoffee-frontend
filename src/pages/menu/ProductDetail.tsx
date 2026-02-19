import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
   useQuery,
   useMutation,
   useQueryClient,
   useInfiniteQuery,
} from "@tanstack/react-query";
import { getProduct, getProducts } from "../../api/product.api";
import { orderApi } from "../../api/order.api";
import { adminOrderApi } from "../../api/admin.order.api";
import { cartApi } from "../../api/cart.api";
import { reviewApi } from "../../api/review.api";
import {
   ShoppingCart,
   CreditCard,
   Plus,
   Minus,
   Star,
   MessageSquare,
   Info,
   ShieldCheck,
   ChevronRight,
   Coffee,
   Snowflake,
   AlertTriangle,
   Trash2,
   Edit,
   Check,
   Loader2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../stores/useAuthStore";
import { useCartStore } from "../../stores/useCartStore";
import ReviewModal from "../mypage/components/ReviewModal";
import ImageLightbox from "../../components/ImageLightbox";
import ProductRating from "../../components/ProductRating";
import { useAlertStore } from "../../stores/useAlertStore";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import SEO from "../../components/common/SEO";
import SkeletonProductDetail from "../../components/common/SkeletonProductDetail";

const ProductDetail: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const { user: currentUser } = useAuthStore();
   const addItemToStore = useCartStore(state => state.addItem);
   const { showAlert } = useAlertStore();

   const [quantity, setQuantity] = useState(1);
   const [activeImgIdx, setActiveImgIdx] = useState(0);
   const [tempOption, setTempOption] = useState<"HOT" | "ICE">("HOT");
   const [isInitialSet, setIsInitialSet] = useState(false);
   const [isAdded, setIsAdded] = useState(false);

   // [추가] 연속 수량 조절을 위한 타이머 Ref
   const timerRef = useRef<NodeJS.Timeout | null>(null);
   const intervalRef = useRef<NodeJS.Timeout | null>(null);

   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
   const [selectedReview, setSelectedReview] = useState<any>(null);
   const [writeOrder, setWriteOrder] = useState<any>(null);

   const [lightboxOpen, setLightboxOpen] = useState(false);
   const [lightboxIndex, setLightboxIndex] = useState(0);
   const [lightboxImages, setLightboxImages] = useState<string[]>([]);

   const { data: productResponse, isLoading } = useQuery({
      queryKey: ["product", id],
      queryFn: () => getProduct(Number(id)),
      enabled: !!id,
   });

   const product = productResponse?.data;

   // 관리자 주문 데이터로 7일 매출 TOP 10 계산
   const { data: ordersData, isError: isOrdersError } = useQuery({
      queryKey: ['admin', 'dashboard', 'orders', 'detail-hot-check'],
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

   const isBestSeller = useMemo(() => {
      if (!product) return false;

      // 관리자 API 성공: 실제 7일 매출 기반 TOP10 계산
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

         const top10 = Array.from(productSales.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([id]) => id);

         if (top10.length > 0) return top10.includes(product.id);
      }

      // Fallback: 관리자 API 실패 시 상품 목록 첫 10개를 HOT으로 표시
      if (fallbackHotData?.data) {
         return fallbackHotData.data.slice(0, 10).some((p: any) => p.id === product.id);
      }
      return false;
   }, [ordersData, isOrdersError, fallbackHotData, product]);


   const {
      data: reviewsData,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
   } = useInfiniteQuery({
      queryKey: ["product-reviews", id],
      queryFn: ({ pageParam = 1 }) =>
         reviewApi.getProductReviews(Number(id), pageParam, 10),
      getNextPageParam: lastPage => {
         const { currentPage, totalPages } = lastPage.pagination;
         return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      enabled: !!id,
      initialPageParam: 1,
   });

   const isNewProduct = (createdAt: string) => {
      if (!createdAt) return false;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(createdAt) >= oneMonthAgo;
   };

   const basePrice = product?.basePrice || 0;
   const selectedOption = useMemo(() => {
      const options = product?.options || [];
      const matched = options.find((opt: any) =>
         (opt.name + opt.value).toUpperCase().includes(tempOption),
      );
      return matched || options[0];
   }, [product, tempOption]);

   const unitPrice = basePrice + (selectedOption?.addPrice || 0);
   const totalPrice = unitPrice * quantity;
   const currentStock = selectedOption?.stockQty ?? 0;

   const allImages = useMemo(() => {
      if (!product) return [];
      const detailUrls = product.images?.map(img => img.url) || [];
      const combined = [product.imageUrl, ...detailUrls].filter(
         url => url && url.trim() !== "",
      );
      const uniqueUrls = Array.from(new Set(combined));
      if (uniqueUrls.length === 0)
         return ["https://placehold.co/600x600?text=No+Image"];
      const result = [...uniqueUrls];
      while (result.length < 5) {
         result.push(uniqueUrls[0]);
      }
      return result.slice(0, 5);
   }, [product]);

   // [추가] 연속 수량 조절 로직
   const startAdjusting = (type: "plus" | "minus") => {
      const adjust = () => {
         setQuantity(prev => {
            if (type === "plus") return prev < currentStock ? prev + 1 : prev;
            return prev > 1 ? prev - 1 : prev;
         });
      };

      adjust(); // 즉시 1회 실행

      timerRef.current = setTimeout(() => {
         intervalRef.current = setInterval(adjust, 100); // 0.1초 간격으로 연속 실행
      }, 500); // 0.5초 누르고 있으면 시작
   };

   const stopAdjusting = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
   };

   // 컴포넌트 언마운트 시 타이머 정리
   useEffect(() => {
      return () => stopAdjusting();
   }, []);

   const addToCartMutation = useMutation({
      mutationFn: async () => {
         if (!product) throw new Error("상품 정보를 불러오는 중입니다.");
         if (currentStock < quantity) throw new Error(`재고가 부족합니다.`);
         const realOptionId = selectedOption?.id;
         const response = await cartApi.addToCart({
            prodId: Number(id),
            quantity: Number(quantity),
            optionId: realOptionId,
         });
         const serverItemId =
            (response as any).data?.id || (response as any).id;
         addItemToStore({
            id: serverItemId || Date.now(),
            prodId: Number(id),
            name: product.name,
            price: unitPrice,
            imageUrl: allImages[0],
            stockQty: currentStock,
            optionId: realOptionId,
            optionName: tempOption,
            quantity: quantity,
         });
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["cart"] });
         setIsAdded(true);
         setTimeout(() => setIsAdded(false), 2000);
      },
      onError: (err: any) => {
         const errorMsg = err.response?.data?.message || err.message;
         toast.error(`장바구니 담기 실패: ${errorMsg}`);
      },
   });

   const handleBuyNow = () => {
      if (currentStock < quantity) {
         toast.error(`재고가 부족합니다.`);
         return;
      }
      const directOrder = {
         orderItems: [
            {
               product: {
                  id: Number(id),
                  name: product?.name,
                  imageUrl: allImages[0],
               },
               salePrice: unitPrice,
               quantity: quantity,
               option: {
                  id: selectedOption?.id,
                  name: tempOption,
                  value: tempOption,
               },
            },
         ],
         totalPrice: totalPrice,
      };
      navigate("/payment", { state: { directOrder } });
   };

   const deleteReviewMutation = useMutation({
      mutationFn: (reviewId: number) => reviewApi.deleteReview(reviewId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["product-reviews", id] });
         toast.success("리뷰가 삭제되었습니다.");
      },
   });

   const handleReviewImageClick = (reviewImages: any[], index: number) => {
      setLightboxImages(reviewImages.map(img => img.url));
      setLightboxIndex(index);
      setLightboxOpen(true);
   };

   const maskName = (name: string) => {
      if (!name) return "****";
      if (name.length <= 1) return name;
      if (name.length === 2) return name[0] + "*";
      return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
   };

   if (isLoading) return <SkeletonProductDetail />;
   if (!product)
      return (
         <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">
            상품을 찾을 수 없습니다.
         </div>
      );

   return (
      <div className="bg-white min-h-screen pt-10 pb-40 relative">
         <SEO
            title={product.name}
            description={product.summary ? DOMPurify.sanitize(product.summary).replace(/<[^>]+>/g, '').slice(0, 150) : `나다커피 ${product.name}. 당일 로스팅된 신선한 원두로 만든 프리미엄 커피를 맛보세요.`}
            keywords={`나다커피 ${product.name}, 커피, ${product.name} 주문`}
         />
         <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
               <div className="space-y-6">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className={twMerge([
                        "aspect-square rounded-[60px] overflow-hidden shadow-2xl border border-gray-50 bg-gray-50 relative group cursor-zoom-in",
                     ])}
                     onClick={() => {
                        setLightboxImages(allImages);
                        setLightboxIndex(activeImgIdx);
                        setLightboxOpen(true);
                     }}>
                     <img
                        src={allImages[activeImgIdx]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                     <div className="absolute top-10 left-10 z-[20]">
                        <ProductRating
                           prodId={Number(id)}
                           iconSize={24}
                           className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-[30px] shadow-2xl border border-white/20"
                        />
                     </div>
                     <div className="absolute inset-0 pointer-events-none p-10">
                        {currentStock === 0 && (
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 pointer-events-auto">
                              <span className="text-white font-black text-6xl border-8 border-white px-12 py-6 rounded-2xl rotate-[-10deg]">
                                 SOLD OUT
                              </span>
                           </div>
                        )}
                        {currentStock > 0 && currentStock <= 5 && (
                           <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute top-12 right-12 bg-orange-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-2xl pointer-events-auto">
                              <AlertTriangle size={24} />
                              <span className="text-xl font-black uppercase">
                                 품절임박
                              </span>
                           </motion.div>
                        )}
                        {isNewProduct(product.createdAt) &&
                           currentStock > 0 && (
                              <div className="absolute bottom-12 right-12 flex items-center justify-center rotate-12 drop-shadow-2xl">
                                 <Star
                                    size={160}
                                    className="text-brand-yellow fill-brand-yellow"
                                 />
                                 <span className="absolute text-brand-dark text-3xl font-black tracking-tighter">
                                    NEW
                                 </span>
                              </div>
                           )}
                        {isBestSeller && currentStock > 0 && (
                           <motion.div
                              animate={{
                                 x: [-5, 5, -5],
                                 rotate: [-12, -10, -12],
                              }}
                              transition={{
                                 repeat: Infinity,
                                 duration: 4,
                                 ease: "easeInOut",
                              }}
                              className="absolute bottom-12 left-12 flex items-center justify-center pointer-events-auto">
                              <svg
                                 width="180"
                                 height="180"
                                 viewBox="0 0 100 100"
                                 className="text-red-600 fill-red-600 drop-shadow-2xl opacity-90">
                                 <circle
                                    cx="50"
                                    cy="50"
                                    r="48"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray="2 1"
                                 />
                                 <circle
                                    cx="50"
                                    cy="50"
                                    r="42"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                 />
                                 <defs>
                                    <path
                                       id="stampCurve"
                                       d="M 20,50 A 30,30 0 1,1 80,50"
                                    />
                                 </defs>
                                 <text
                                    className="font-black"
                                    fontSize="7"
                                    fill="currentColor">
                                    <textPath
                                       href="#stampCurve"
                                       startOffset="50%"
                                       textAnchor="middle">
                                       NADA BEST SELLER
                                    </textPath>
                                 </text>
                                 <text
                                    x="50"
                                    y="62"
                                    textAnchor="middle"
                                    fontSize="28"
                                    className="font-black"
                                    fill="currentColor">
                                    HOT
                                 </text>
                                 <path
                                    d="M 30,68 L 70,68"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                 />
                              </svg>
                           </motion.div>
                        )}
                     </div>
                  </motion.div>
                  <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                     {allImages.map((img, idx) => (
                        <button
                           key={idx}
                           onClick={() => setActiveImgIdx(idx)}
                           className={twMerge([
                              "w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0",
                              activeImgIdx === idx
                                 ? "border-brand-yellow shadow-lg scale-105"
                                 : "border-transparent opacity-60 hover:opacity-100",
                           ])}>
                           <img
                              src={img}
                              className="w-full h-full object-cover"
                              alt={`sub-${idx}`}
                           />
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col justify-center space-y-8">
                  <div>
                     <h2 className="text-5xl font-black text-brand-dark mb-6 leading-tight">
                        {product.name}
                     </h2>
                     <div
                        className="text-gray-400 text-xl font-medium leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                           __html: DOMPurify.sanitize(
                              product.summary ||
                              "나다커피만의 특별한 풍미를 경험해보세요.",
                           ),
                        }}
                     />
                  </div>

                  <div className="py-8 border-y border-gray-100 flex items-center justify-between">
                     <span className="text-gray-400 font-bold text-xl uppercase tracking-widest">
                        Base Price
                     </span>
                     <span className="text-4xl font-black text-brand-dark tracking-tighter">
                        ₩ {product.basePrice.toLocaleString()}
                     </span>
                  </div>
                  <div className="space-y-4">
                     <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Select Option
                     </span>
                     <div className="grid grid-cols-2 gap-4">
                        <button
                           type="button"
                           onClick={() => setTempOption("HOT")}
                           className={twMerge([
                              "flex items-center justify-center gap-3 py-4 rounded-2xl font-black border-2 transition-all",
                              tempOption === "HOT"
                                 ? "border-red-500 bg-red-50 text-red-600 shadow-lg scale-105"
                                 : "border-gray-100 text-gray-400 hover:bg-gray-50",
                           ])}>
                           <Coffee size={20} /> HOT
                        </button>
                        <button
                           type="button"
                           onClick={() => setTempOption("ICE")}
                           className={twMerge([
                              "flex items-center justify-center gap-3 py-4 rounded-2xl font-black border-2 transition-all",
                              tempOption === "ICE"
                                 ? "border-blue-500 bg-blue-50 text-blue-600 shadow-lg scale-105"
                                 : "border-gray-100 text-gray-400 hover:bg-gray-50",
                           ])}>
                           <Snowflake size={20} /> ICE (+500)
                        </button>
                     </div>
                  </div>

                  {/* [수정] 수량 조절 버튼에 연속 증감 로직 적용 */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-3xl p-4 border border-gray-100">
                     <span className="ml-4 font-black text-brand-dark uppercase tracking-widest text-sm">
                        Quantity
                     </span>
                     <div className="flex items-center gap-6 bg-white rounded-2xl p-1 shadow-sm">
                        <button
                           onMouseDown={() => startAdjusting("minus")}
                           onMouseUp={stopAdjusting}
                           onMouseLeave={stopAdjusting}
                           onTouchStart={() => startAdjusting("minus")}
                           onTouchEnd={stopAdjusting}
                           className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all active:scale-90">
                           <Minus size={20} />
                        </button>
                        <span className="w-12 text-center text-2xl font-black text-brand-dark">
                           {quantity}
                        </span>
                        <button
                           onMouseDown={() => startAdjusting("plus")}
                           onMouseUp={stopAdjusting}
                           onMouseLeave={stopAdjusting}
                           onTouchStart={() => startAdjusting("plus")}
                           onTouchEnd={stopAdjusting}
                           className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all active:scale-90">
                           <Plus size={20} />
                        </button>
                     </div>
                     <span className="text-xs font-bold text-gray-400 mr-4">
                        재고: {currentStock}개
                     </span>
                  </div>

                  <div className="relative overflow-hidden rounded-[35px] p-10 bg-white border-2 border-gray-100 shadow-2xl">
                     <div className="relative z-10 flex flex-col gap-1">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                              Total Order Amount
                           </span>
                           <div className="flex gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase">
                                 {quantity} Qty
                              </span>
                              <span
                                 className={twMerge([
                                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                                    tempOption === "ICE"
                                       ? "bg-blue-50 text-blue-500"
                                       : "bg-red-50 text-red-500",
                                 ])}>
                                 {tempOption} Option
                              </span>
                           </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                           <span className="text-gray-200 text-2xl font-light italic">
                              ₩
                           </span>
                           <span className="text-6xl font-black text-brand-dark tracking-tighter leading-none">
                              {totalPrice.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <button
                        onClick={() => addToCartMutation.mutate()}
                        disabled={
                           addToCartMutation.isPending ||
                           currentStock === 0 ||
                           isAdded
                        }
                        className={twMerge([
                           "py-6 rounded-[25px] font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                           currentStock === 0
                              ? "bg-gray-200 text-gray-400"
                              : isAdded
                                 ? "bg-green-500 text-white"
                                 : "bg-gray-100 text-brand-dark hover:bg-gray-200",
                        ])}>
                        {addToCartMutation.isPending ? (
                           <Loader2 className="animate-spin" size={24} />
                        ) : isAdded ? (
                           <Check size={24} />
                        ) : (
                           <ShoppingCart size={24} />
                        )}{" "}
                        {currentStock === 0
                           ? "품절"
                           : isAdded
                              ? "담기 완료!"
                              : "장바구니 담기"}
                     </button>
                     <button
                        onClick={handleBuyNow}
                        disabled={currentStock === 0}
                        className={twMerge([
                           "py-6 rounded-[25px] font-black text-xl flex items-center justify-center gap-3 bg-brand-yellow text-brand-dark hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                           currentStock === 0
                              ? "bg-gray-200 text-gray-400"
                              : "shadow-brand-yellow/20",
                        ])}>
                        {" "}
                        <CreditCard size={24} />{" "}
                        {currentStock === 0 ? "품절" : "바로 구매하기"}
                     </button>
                  </div>
               </div>
            </div>

            <div className="mb-32">
               <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-brand-dark text-brand-yellow rounded-2xl flex items-center justify-center shadow-lg">
                     <Info size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-brand-dark italic">
                     Product Information
                  </h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 bg-gray-50 rounded-[40px] p-12 border border-gray-100">
                     <h4 className="text-xl font-black text-brand-dark mb-8 flex items-center gap-2">
                        <ShieldCheck className="text-green-500" /> 영양 성분
                        가이드
                     </h4>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-8">
                        <NutritionItem
                           label="열량"
                           value="256.10"
                           unit="kcal"
                        />
                        <NutritionItem label="나트륨" value="15.80" unit="mg" />
                        <NutritionItem
                           label="탄수화물"
                           value="68.50"
                           unit="g"
                        />
                        <NutritionItem label="당류" value="59.40" unit="g" />
                        <NutritionItem label="지방" value="0.40" unit="g" />
                        <NutritionItem label="포화지방" value="0.00" unit="g" />
                        <NutritionItem label="단백질" value="1.30" unit="g" />
                        <NutritionItem
                           label="카페인"
                           value="120.00"
                           unit="mg"
                        />
                     </div>
                  </div>
                  <div className="bg-brand-yellow/10 rounded-[40px] p-12 border border-brand-yellow/20">
                     <h4 className="text-xl font-black text-brand-dark mb-6">
                        Product Highlights
                     </h4>
                     <ul className="space-y-4 text-brand-dark/70 font-bold text-sm">
                        <li className="flex items-start gap-2">
                           <ChevronRight
                              size={16}
                              className="mt-0.5 shrink-0 text-brand-yellow"
                           />{" "}
                           당일 로스팅된 신선한 원두 사용
                        </li>
                        <li className="flex items-start gap-2">
                           <ChevronRight
                              size={16}
                              className="mt-0.5 shrink-0 text-brand-yellow"
                           />{" "}
                           나다커피만의 독자적인 딥 프레싱 공법
                        </li>
                        <li className="flex items-start gap-2">
                           <ChevronRight
                              size={16}
                              className="mt-0.5 shrink-0 text-brand-yellow"
                           />{" "}
                           인공 감미료를 최소화한 자연스러운 맛
                        </li>
                     </ul>
                  </div>
               </div>
            </div>

            <div id="reviews">
               <div className="flex items-center justify-between mb-12">
                  <div className="w-12 h-12 bg-brand-dark text-brand-yellow rounded-2xl flex items-center justify-center shadow-lg">
                     <MessageSquare size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-brand-dark italic">
                     Customer Reviews
                  </h3>
               </div>
               <div className="space-y-6">
                  {!reviewsData || reviewsData.pages[0]?.data.length === 0 ? (
                     <div className="bg-gray-50 rounded-[30px] p-20 text-center border border-dashed border-gray-200">
                        <MessageSquare
                           size={48}
                           className="mx-auto mb-4 text-gray-200"
                        />
                        <p className="text-gray-400 font-bold">
                           아직 작성된 리뷰가 없습니다.
                        </p>
                     </div>
                  ) : (
                     <>
                        {reviewsData.pages.map(page =>
                           page.data.map((review: any) => (
                              <div
                                 key={review.id}
                                 className="bg-white rounded-[30px] p-8 border border-gray-100 hover:shadow-xl transition-all group">
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                       <div className="flex text-brand-yellow">
                                          {Array.from({ length: 5 }).map(
                                             (_, idx) => (
                                                <Star
                                                   key={idx}
                                                   size={18}
                                                   fill={
                                                      idx < review.rating
                                                         ? "currentColor"
                                                         : "none"
                                                   }
                                                   className={
                                                      idx < review.rating
                                                         ? ""
                                                         : "text-gray-200"
                                                   }
                                                />
                                             ),
                                          )}
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <p className="text-sm font-black text-brand-dark">
                                             {maskName(review.member.name)}
                                          </p>
                                          <span className="text-xs font-bold text-gray-300">
                                             |
                                          </span>
                                          <span className="text-xs font-bold text-gray-300">
                                             {new Date(
                                                review.createdAt,
                                             ).toLocaleDateString()}
                                          </span>
                                       </div>
                                    </div>
                                    {currentUser &&
                                       (currentUser.id === review.member.id ||
                                          currentUser.name ===
                                          review.member.name) && (
                                          <div className="flex gap-2">
                                             <button
                                                onClick={() => {
                                                   setSelectedReview(review);
                                                   setIsReviewModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1"
                                                title="수정">
                                                <Edit size={16} />
                                                <span className="text-xs font-bold">
                                                   수정
                                                </span>
                                             </button>
                                             <button
                                                onClick={() => {
                                                   showAlert(
                                                      "리뷰를 삭제하시겠습니까?",
                                                      "리뷰 삭제",
                                                      "warning",
                                                      [
                                                         {
                                                            label: "삭제",
                                                            onClick: () =>
                                                               deleteReviewMutation.mutate(
                                                                  review.id,
                                                               ),
                                                         },
                                                         {
                                                            label: "취소",
                                                            onClick: () => { },
                                                            variant:
                                                               "secondary",
                                                         },
                                                      ],
                                                   );
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1"
                                                title="삭제">
                                                <Trash2 size={16} />
                                                <span className="text-xs font-bold">
                                                   삭제
                                                </span>
                                             </button>
                                          </div>
                                       )}
                                 </div>
                                 <p className="text-gray-500 font-medium leading-relaxed mb-6 whitespace-pre-wrap break-words">
                                    {review.content}
                                 </p>
                                 {review.reviewImages &&
                                    review.reviewImages.length > 0 && (
                                       <div className="flex gap-3 mt-6 overflow-x-auto pb-2 custom-scrollbar">
                                          {review.reviewImages.map(
                                             (img: any, idx: number) => (
                                                <div
                                                   key={img.id}
                                                   className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-zoom-in shrink-0 hover:opacity-80 transition-opacity"
                                                   onClick={() =>
                                                      handleReviewImageClick(
                                                         review.reviewImages,
                                                         idx,
                                                      )
                                                   }>
                                                   <img
                                                      src={img.url}
                                                      alt="review"
                                                      className="w-full h-full object-cover"
                                                   />
                                                </div>
                                             ),
                                          )}
                                       </div>
                                    )}
                              </div>
                           )),
                        )}
                        {hasNextPage && (
                           <div className="flex justify-center pt-8">
                              <button
                                 onClick={() => fetchNextPage()}
                                 disabled={isFetchingNextPage}
                                 className="px-8 py-4 bg-brand-dark text-white rounded-2xl font-black hover:bg-black transition-all disabled:opacity-50">
                                 더 많은 리뷰 보기
                              </button>
                           </div>
                        )}
                     </>
                  )}
               </div>
            </div>
         </div>

         <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
               setIsReviewModalOpen(false);
               setWriteOrder(null);
               setSelectedReview(null);
            }}
            editData={selectedReview}
            order={writeOrder}
            currentProduct={product}
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
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
         {label}
      </span>
      <div className="flex items-baseline gap-0.5">
         <span className="text-2xl font-black text-brand-dark">{value}</span>
         <span className="text-xs font-bold text-gray-400">{unit}</span>
      </div>
   </div>
);

export default ProductDetail;
