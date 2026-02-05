import React, { useEffect } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { MdDelete, MdAdd, MdRemove, MdShoppingCart } from 'react-icons/md';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../api/cart.api';
import { getProducts } from '../../api/product.api';

function Cart() {
  const queryClient = useQueryClient();
  const { items, setItems, totalAmount, totalCount } = useCartStore();

  // 1. 서버 장바구니 데이터 조회
  const { data: serverCart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  // 2. 상품 상세 정보와 결합하여 스토어 업데이트
  useEffect(() => {
    if (serverCart) {
      const syncCart = async () => {
        try {
          const productsRes = await getProducts({ limit: 100 });
          const allProducts = productsRes.data;

          const mappedItems = serverCart.map(item => {
            const product = allProducts.find(p => p.id === item.prodId);
            const selectedOption = product?.options?.find(opt => Number(opt.id) === Number(item.optionId));
            
            return {
              id: item.id,
              prodId: item.prodId,
              name: product?.name || '알 수 없는 상품',
              price: (product?.basePrice || 0) + (selectedOption?.addPrice || 0),
              imageUrl: product?.imageUrl || '',
              quantity: item.quantity,
              optionId: item.optionId,
              optionName: selectedOption?.name 
            };
          });
          setItems(mappedItems);
        } catch (error) {
          console.error("Cart Sync Error:", error);
        }
      };
      syncCart();
    }
  }, [serverCart, setItems]);

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }: { id: number, qty: number }) => cartApi.updateCart(id, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => alert('수량 수정에 실패했습니다.')
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartApi.removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => alert('상품 삭제에 실패했습니다.')
  });

  const handleRemoveItem = (id: number, name: string) => {
    if (window.confirm(`[${name}] 상품을 장바구니에서 삭제하시겠습니까?`)) {
      removeMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="min-h-screen pt-40 text-center font-bold text-gray-400">장바구니를 불러오는 중...</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-brand-dark text-white rounded-[20px] shadow-xl flex items-center justify-center rotate-3 shrink-0">
              <MdShoppingCart size={28} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-brand-dark tracking-tighter italic">장바구니</h2>
          </div>
          <div className="w-24 h-1.5 bg-brand-yellow mt-6 rounded-full opacity-50" />
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 p-24 text-center max-w-4xl mx-auto">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <MdShoppingCart size={64} className="text-gray-200" />
            </div>
            <p className="text-gray-400 text-2xl font-bold mb-2">장바구니가 비어있습니다.</p>
            <Link to="/menu" className="inline-block bg-brand-dark text-white px-16 py-5 rounded-full font-black text-xl hover:bg-black transition-all shadow-2xl shadow-black/10 active:scale-95">
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 px-10 py-6 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Selected Items</span>
                  <span className="text-sm font-bold text-brand-dark bg-brand-yellow px-4 py-1 rounded-full">{totalCount()} items</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-8 p-10 hover:bg-gray-50/30 transition-colors group relative">
                      <div className="w-32 h-32 shrink-0 rounded-[35px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-brand-dark">{item.name}</h3>
                          {item.optionName && (
                            <span className={`px-3 py-1 rounded-lg text-xs font-black ${item.optionName.includes('ICE') ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                              {item.optionName}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-bold text-brand-yellow">₩ {item.price.toLocaleString()}</p>
                        <div className="flex items-center mt-6 bg-gray-100 w-fit rounded-2xl p-1.5">
                          <button 
                            onClick={() => updateMutation.mutate({ id: item.id, qty: item.quantity - 1 })}
                            disabled={item.quantity === 1 || updateMutation.isPending}
                            className="w-10 h-10 rounded-xl bg-white text-gray-600 hover:text-brand-dark shadow-sm disabled:opacity-30 transition-all flex items-center justify-center"
                          >
                            <MdRemove size={20} />
                          </button>
                          <span className="px-6 text-brand-dark font-black text-lg">{item.quantity}</span>
                          <button 
                            onClick={() => updateMutation.mutate({ id: item.id, qty: item.quantity + 1 })}
                            disabled={updateMutation.isPending}
                            className="w-10 h-10 rounded-xl bg-white text-gray-600 hover:text-brand-dark shadow-sm transition-all flex items-center justify-center"
                          >
                            <MdAdd size={20} />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        disabled={removeMutation.isPending}
                        className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-gray-100"
                        title="삭제"
                      >
                        <MdDelete size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-brand-dark rounded-[50px] shadow-2xl p-12 text-white sticky top-32 border border-white/5">
                <h3 className="text-3xl font-black mb-10 border-b border-white/10 pb-8 italic tracking-tighter">Order Summary</h3>
                <div className="space-y-6">
                  <div className="flex justify-between text-white/50 text-lg font-medium"><span>총 상품 금액</span><span className="text-white font-bold">₩ {totalAmount().toLocaleString()}</span></div>
                  <div className="flex justify-between text-white/50 text-lg font-medium"><span>총 주문 수량</span><span className="text-white font-bold">{totalCount()}개</span></div>
                  <div className="flex justify-between text-white/50 text-lg font-medium"><span>배송비</span><span className="text-brand-yellow font-bold">FREE</span></div>
                </div>
                <div className="bg-white/5 rounded-[30px] p-8 mt-10 mb-10">
                  <div className="flex flex-col gap-2">
                    <span className="text-white/40 font-bold text-sm uppercase tracking-widest">Total Amount</span>
                    <span className="text-5xl font-black text-brand-yellow tracking-tighter">₩ {totalAmount().toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/payment" className="w-full block text-center bg-brand-yellow text-brand-dark py-6 rounded-[25px] font-black text-2xl hover:bg-white transition-all shadow-[0_20px_40px_rgba(255,212,0,0.2)] active:scale-95">주문하기</Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
