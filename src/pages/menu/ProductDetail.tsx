import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct } from '../../api/product.api';
import { cartApi } from '../../api/cart.api';
import { useCartStore } from '../../stores/useCartStore';
import { ShoppingCart, CreditCard, Plus, Minus, ArrowLeft, Star, MessageSquare, Info, ShieldCheck, ChevronRight, Coffee, Snowflake, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tempOption, setTempOption] = useState<'HOT' | 'ICE'>('HOT');
  
  // [신규] 커스텀 알림 모달 상태
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(Number(id)),
    enabled: !!id
  });

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

  // [수정] 재고 체크 함수: alert 대신 커스텀 모달 사용
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

    navigate('/checkout', { state: { directOrder } });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-yellow mx-auto"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">상품을 찾을 수 없습니다.</div>;

  const item = product.data;
  const subImages = [item.imageUrl, item.imageUrl, item.imageUrl, item.imageUrl];

  return (
    <div className="bg-white min-h-screen pt-32 pb-40 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="aspect-square rounded-[60px] overflow-hidden shadow-2xl border border-gray-50 bg-gray-50">
              <img src={subImages[activeImg]} alt={item.name} className="w-full h-full object-cover" />
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {subImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImg(idx)} className={`w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0 ${activeImg === idx ? 'border-brand-yellow shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="sub" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-brand-yellow text-brand-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Premium Choice</span>
                <div className="flex text-brand-yellow"><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/></div>
              </div>
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
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all"><Minus size={20}/></button>
                <span className="text-2xl font-black text-brand-dark min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-all"><Plus size={20}/></button>
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

        <div>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-dark text-brand-yellow rounded-2xl flex items-center justify-center shadow-lg"><MessageSquare size={24} /></div>
              <h3 className="text-3xl font-black text-brand-dark italic">Customer Reviews</h3>
            </div>
            {/* 리뷰 작성하기 버튼 제거됨 */}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[30px] p-8 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-brand-dark text-xs">JD</div>
                    <div><p className="text-sm font-black text-brand-dark">나다매니아_{i}</p><div className="flex text-brand-yellow"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div></div>
                  </div>
                  <span className="text-xs font-bold text-gray-300">2026.01.30</span>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed">정말 맛있어요! 나다커피 특유의 진한 향이 일품입니다. 배송도 빠르고 포장도 꼼꼼해서 아주 만족스럽네요. 재구매 의사 200%입니다!</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* [신규] 커스텀 알림 모달 */}
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
