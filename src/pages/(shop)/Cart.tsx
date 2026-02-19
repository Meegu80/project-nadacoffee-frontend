import React, { useEffect, useMemo, useState } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { MdDelete, MdAdd, MdRemove, MdShoppingCart, MdCheckBox, MdCheckBoxOutlineBlank, MdDeleteSweep } from 'react-icons/md';
import { useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../api/cart.api';
import { useAlertStore } from '../../stores/useAlertStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { SkeletonCartList } from '../../components/common/SkeletonCartItem';

function Cart() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showAlert } = useAlertStore();
  const { setItems, clearCart, removeItem } = useCartStore();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: serverCart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const displayItems = useMemo(() => {
    if (!Array.isArray(serverCart)) return [];
    return serverCart.map(item => {
      const basePrice = Number(item.product?.basePrice || 0);
      const addPrice = Number(item.option?.addPrice || 0);
      return {
        id: item.id,
        prodId: item.prodId,
        name: item.product?.name || '알 수 없는 상품',
        price: basePrice + addPrice,
        imageUrl: item.product?.imageUrl || '',
        quantity: item.quantity,
        stockQty: item.option?.stockQty ?? 99,
        optionId: item.optionId,
        optionName: item.option?.value || '기본'
      };
    });
  }, [serverCart]);

  useEffect(() => {
    if (displayItems.length > 0) {
      setItems(displayItems);
      setSelectedIds(prev => prev.length > 0 ? prev : displayItems.map(i => i.id));
    }
  }, [displayItems, setItems]);

  const selectedItems = displayItems.filter(i => selectedIds.includes(i.id));
  const selectedTotalAmount = selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const selectedTotalCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0);

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === displayItems.length ? [] : displayItems.map(i => i.id));

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) { showAlert("주문하실 상품을 선택해주세요.", "알림", "info"); return; }
    const outOfStockItem = selectedItems.find(item => item.quantity > item.stockQty);
    if (outOfStockItem) { showAlert(`[${outOfStockItem.name}] 재고가 부족합니다.`, "재고 부족", "warning"); return; }
    const { user } = useAuthStore.getState();
    if (!user) { navigate('/login'); return; }
    const directOrder = {
      orderItems: selectedItems.map(i => ({
        prodId: i.prodId, product: { id: i.prodId, name: i.name, imageUrl: i.imageUrl },
        salePrice: i.price, quantity: i.quantity, optionId: i.optionId, option: { name: '온도', value: i.optionName }
      })),
      totalPrice: selectedTotalAmount
    };
    navigate('/payment', { state: { directOrder } });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }: { id: number, qty: number }) => cartApi.updateCart(id, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartApi.removeFromCart(id),
    onSuccess: (_, deletedId) => {
      removeItem(deletedId);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showAlert("상품이 삭제되었습니다.", "성공", "success");
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = displayItems.map(item => cartApi.removeFromCart(item.id));
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      showAlert("장바구니가 비워졌습니다.", "성공", "success");
    }
  });

  if (isLoading) return (
    <div className="min-h-screen pt-10 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark text-brand-yellow rounded-2xl shadow-xl flex items-center justify-center rotate-3 shrink-0"><MdShoppingCart size={24} /></div>
            <h2 className="text-4xl font-black text-brand-dark tracking-tighter italic uppercase">장바구니</h2>
          </div>
        </div>
        <SkeletonCartList count={4} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-10 pb-20 bg-gray-50">
      <SEO
        title="장바구니"
        description="나다커피 장바구니에서 선택한 상품을 확인하고 주문을 진행하세요."
        keywords="나다커피 장바구니, 커피 주문, 장바구니"
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark text-brand-yellow rounded-2xl shadow-xl flex items-center justify-center rotate-3 shrink-0"><MdShoppingCart size={24} /></div>
            <h2 className="text-4xl font-black text-brand-dark tracking-tighter italic uppercase">장바구니</h2>
          </div>
        </div>

        {displayItems.length === 0 ? (
          <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 p-24 text-center max-w-4xl mx-auto">
            <p className="text-gray-400 text-2xl font-bold mb-8">장바구니가 비어있습니다.</p>
            <Link to="/menu" className="inline-block bg-brand-dark text-white px-16 py-5 rounded-full font-black text-xl hover:bg-black transition-all shadow-2xl">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <button onClick={toggleSelectAll} className="flex items-center gap-3 group">
                    {selectedIds.length === displayItems.length ? <MdCheckBox size={28} className="text-brand-dark" /> : <MdCheckBoxOutlineBlank size={28} className="text-gray-300 group-hover:text-brand-dark" />}
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">전체 선택</span>
                  </button>
                  <button onClick={() => { if (window.confirm('장바구니를 비우시겠습니까?')) clearCartMutation.mutate() }} className="flex items-center gap-2 text-xs font-black text-red-400 hover:text-red-600 transition-colors border-l border-gray-200 pl-6"><MdDeleteSweep size={20} /> 장바구니 비우기</button>
                </div>
                <span className="text-sm font-black text-brand-dark bg-brand-yellow px-6 py-2 rounded-full shadow-sm">{selectedTotalCount}개 상품 선택됨</span>
              </div>

              <div className="divide-y divide-gray-50">
                <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-6 bg-gray-100/80 text-sm font-black text-brand-dark uppercase tracking-widest border-b border-gray-200">
                  <div className="col-span-1">선택</div>
                  <div className="col-span-3">상품 정보</div>
                  <div className="col-span-1 text-center">재고</div>
                  <div className="col-span-2 text-center">단가</div>
                  <div className="col-span-2 text-center">수량</div>
                  <div className="col-span-2 text-right">합계</div>
                  <div className="col-span-1 text-center">삭제</div>
                </div>

                {displayItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 px-8 py-10 transition-all group relative">
                    <div className="col-span-1"><button onClick={() => toggleSelect(item.id)} className="text-brand-dark">{selectedIds.includes(item.id) ? <MdCheckBox size={32} /> : <MdCheckBoxOutlineBlank size={32} className="text-gray-200" />}</button></div>
                    <div className="col-span-3 flex items-center gap-6">
                      <Link to={`/products/${item.prodId}`} className="w-24 h-24 shrink-0 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm"><img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /></Link>
                      <div className="min-w-0">
                        <Link to={`/products/${item.prodId}`} className="text-xl font-black text-brand-dark truncate hover:text-brand-yellow transition-colors block mb-1">{item.name}</Link>
                        {item.optionName && <span className={twMerge(["px-3 py-1 rounded-lg text-[10px] font-black shadow-sm text-white uppercase", item.optionName.toUpperCase().includes('ICE') ? 'bg-blue-500' : 'bg-red-500'])}>{item.optionName}</span>}
                      </div>
                    </div>
                    <div className="col-span-1 text-center"><span className={twMerge(["text-xs font-black px-3 py-1.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-400"])}>{item.stockQty}개</span></div>
                    <div className="col-span-2 text-center"><span className="text-lg font-black text-gray-600 italic">₩ {item.price.toLocaleString()}</span></div>
                    <div className="col-span-2 flex justify-center"><div className="flex items-center bg-gray-100 rounded-2xl p-1.5 shadow-inner border border-gray-200"><button onClick={() => updateMutation.mutate({ id: item.id, qty: item.quantity - 1 })} disabled={item.quantity === 1} className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-brand-dark shadow-sm transition-all flex items-center justify-center"><MdRemove size={20} /></button><span className="px-6 text-brand-dark font-black text-xl">{item.quantity}</span><button onClick={() => updateMutation.mutate({ id: item.id, qty: item.quantity + 1 })} disabled={item.quantity >= item.stockQty} className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-brand-dark shadow-sm transition-all flex items-center justify-center"><MdAdd size={20} /></button></div></div>
                    <div className="col-span-2 text-right pr-4"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">항목별 합계</span><p className="text-3xl font-black text-brand-dark tracking-tighter italic">₩ {(item.price * item.quantity).toLocaleString()}</p></div>
                    <div className="col-span-1 text-center"><button onClick={() => removeMutation.mutate(item.id)} className="p-3 rounded-2xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 shadow-sm"><MdDelete size={24} /></button></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[50px] shadow-2xl p-16 border border-gray-100 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8">
                  <h3 className="text-3xl font-black text-brand-dark italic tracking-tighter border-b-4 border-brand-yellow w-fit pb-2">주문 요약</h3>
                  <div className="space-y-5">
                    <div className="flex justify-between text-gray-400 text-lg font-bold"><span>총 상품 금액</span><span className="text-brand-dark font-black">₩ {selectedTotalAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-400 text-lg font-bold"><span>총 주문 수량</span><span className="text-brand-dark font-black">{selectedTotalCount} 개</span></div>
                    <div className="flex justify-between text-gray-400 text-lg font-bold"><span>배송비</span><span className="text-green-500 font-black">무료배송</span></div>
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="bg-gray-50 rounded-[40px] p-10 border-2 border-gray-100 shadow-inner"><div className="flex flex-col gap-2"><span className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-2">최종 결제 금액</span><div className="flex items-baseline justify-between"><span className="text-gray-300 text-3xl font-light italic">₩</span><span className="text-7xl font-black text-brand-dark tracking-tighter leading-none drop-shadow-sm">{selectedTotalAmount.toLocaleString()}</span></div></div></div>
                  <button onClick={handleCheckout} className="w-full py-8 bg-brand-yellow text-brand-dark rounded-[30px] font-black text-3xl hover:bg-black hover:text-white transition-all shadow-xl active:scale-95">주문하기</button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/5 rounded-full -mr-40 -mt-40 blur-3xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
