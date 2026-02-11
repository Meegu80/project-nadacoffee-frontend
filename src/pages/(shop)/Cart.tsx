import React, { useEffect } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { MdDelete, MdAdd, MdRemove, MdShoppingCart, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../api/cart.api';
import { getProducts, getProduct } from '../../api/product.api';
import { useAlertStore } from '../../stores/useAlertStore';
import { useAuthStore } from '../../stores/useAuthStore';

function Cart() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { items, setItems } = useCartStore(); // totalAmount, totalCount는 선택된 항목 기준으로 재계산
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

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
          let allProducts = productsRes.data;

          // ID 내림차순 정렬 (최신 상품이 위로)
          const sortedServerCart = [...serverCart].sort((a, b) => b.id - a.id);

          const mappedItems = await Promise.all(sortedServerCart.map(async item => {
            let product = allProducts.find(p => p.id === item.prodId);

            // 상품이 없거나, 옵션 정보가 필요한데 없는 경우 개별 조회
            const needsOptionDetail = item.optionId && (!product || !product.options || product.options.length === 0);

            if (!product || needsOptionDetail) {
              try {
                const res = await getProduct(item.prodId);
                product = res.data;
              } catch (e) {
                console.warn(`Product ${item.prodId} sync fallback failed`);
              }
            }

            const selectedOption = product?.options?.find(opt => Number(opt.id) === Number(item.optionId));

            // [최종 수정] 옵션 라벨 개선: HOT/ICE 키워드를 명시적으로 추출
            let finalOptionName = '';
            if (selectedOption) {
              const nameText = (selectedOption.name || '').toUpperCase();
              const valueText = (selectedOption.value || '').toUpperCase();

              if (nameText.includes('ICE') || valueText.includes('ICE')) {
                finalOptionName = 'ICE';
              } else if (nameText.includes('HOT') || valueText.includes('HOT')) {
                finalOptionName = 'HOT';
              } else {
                finalOptionName = selectedOption.value || selectedOption.name || '';
              }
            }

            return {
              id: item.id,
              prodId: item.prodId,
              name: product?.name || '알 수 없는 상품',
              price: (product?.basePrice || 0) + (selectedOption?.addPrice || 0),
              imageUrl: product?.imageUrl || '',
              quantity: item.quantity,
              stockQty: selectedOption?.stockQty || 0,
              optionId: item.optionId,
              optionName: finalOptionName
            };
          }));
          setItems(mappedItems);
          // 처음 로드 시 모든 항목 선택
          setSelectedIds(mappedItems.map(i => i.id));
        } catch (error) {
          console.error("Cart Sync Error:", error);
        }
      };
      syncCart();
    }
  }, [serverCart, setItems]);

  // 선택된 항목들에 대한 계산
  const selectedItems = items.filter(i => selectedIds.includes(i.id));
  const selectedTotalAmount = selectedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const selectedTotalCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      useAlertStore.getState().showAlert("주문하실 상품을 선택해주세요.", "알림", "info");
      return;
    }

    const outOfStockItems = selectedItems.filter(item => item.quantity > item.stockQty);

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(i => `[${i.name}]`).join(', ');
      useAlertStore.getState().showAlert(
        `${itemNames} 상품의 재고가 부족합니다.\n현재 주문 가능한 수량을 확인해주세요.`,
        "재고 부족",
        "warning"
      );
      return;
    }

    const { user } = useAuthStore.getState();
    if (!user) {
      useAlertStore.getState().showAlert("로그인이 필요한 서비스입니다.", "알림", "info", [
        { label: "로그인하러 가기", onClick: () => navigate('/login') },
        { label: "취소", onClick: () => { }, variant: "secondary" }
      ]);
      return;
    }

    // 선택된 상품들만 결제 페이지로 전달
    const directOrder = {
      orderItems: selectedItems.map(i => ({
        prodId: i.prodId,
        product: { id: i.prodId, name: i.name, imageUrl: i.imageUrl },
        salePrice: i.price,
        quantity: i.quantity,
        optionId: i.optionId,
        option: { name: i.optionName }
      })),
      totalPrice: selectedTotalAmount
    };

    navigate('/payment', { state: { directOrder } });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }: { id: number, qty: number }) => cartApi.updateCart(id, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => useAlertStore.getState().showAlert('수량 수정에 실패했습니다.', '실패', 'error')
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => cartApi.removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => useAlertStore.getState().showAlert('상품 삭제에 실패했습니다.', '실패', 'error')
  });

  const handleRemoveItem = (id: number, name: string) => {
    useAlertStore.getState().showAlert(
      `[${name}] 상품을 장바구니에서 삭제하시겠습니까?`,
      '상품 삭제 확인',
      'warning',
      [
        { label: '삭제하기', onClick: () => removeMutation.mutate(id) },
        { label: '취소', onClick: () => { }, variant: 'secondary' }
      ]
    );
  };

  if (isLoading) return <div className="min-h-screen pt-20 text-center font-bold text-gray-400">장바구니를 불러오는 중...</div>;

  return (
    <div className="min-h-screen pt-10 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-dark text-white rounded-xl shadow-lg flex items-center justify-center rotate-3 shrink-0">
              <MdShoppingCart size={20} />
            </div>
            <h2 className="text-4xl font-black text-brand-dark tracking-tighter italic">장바구니</h2>
          </div>
          <div className="w-16 h-1 bg-brand-yellow mt-3 rounded-full opacity-50" />
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
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button onClick={toggleSelectAll} className="text-brand-dark hover:scale-110 transition-transform">
                    {selectedIds.length === items.length ? <MdCheckBox size={20} /> : <MdCheckBoxOutlineBlank size={20} />}
                  </button>
                  <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Select All</span>
                </div>
                <span className="text-sm font-bold text-brand-dark bg-brand-yellow px-4 py-1 rounded-full">{selectedTotalCount} items selected</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item: any) => (
                  <div key={item.id} className={`flex items-center gap-4 p-5 hover:bg-gray-50/30 transition-colors group relative ${!selectedIds.includes(item.id) && 'opacity-60 grayscale-[0.5]'}`}>
                    <button onClick={() => toggleSelect(item.id)} className="shrink-0 text-brand-dark hover:scale-110 transition-transform">
                      {selectedIds.includes(item.id) ? <MdCheckBox size={24} /> : <MdCheckBoxOutlineBlank size={24} />}
                    </button>
                    <div className="w-20 h-20 shrink-0 rounded-[20px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-lg font-black text-brand-dark truncate">{item.name}</h3>
                          {item.optionName && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.optionName === 'ICE' ? 'bg-blue-50 text-blue-500' :
                                item.optionName === 'HOT' ? 'bg-red-50 text-red-500' :
                                  'bg-gray-100 text-gray-500'
                              }`}>
                              {item.optionName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xs font-bold text-gray-600">단가 ₩ {item.price.toLocaleString()}</p>
                          <p className={`text-xs font-black px-3 py-1 rounded-lg border flex items-center gap-1.5 ${item.stockQty <= 5 ? 'border-orange-200 bg-orange-50 text-orange-600' : 'border-gray-200 bg-gray-100 text-gray-600'}`}>
                            재고: {item.stockQty}개 {item.stockQty <= 5 && <span className="animate-pulse text-xs">●</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                          <button
                            onClick={() => updateMutation.mutate({ id: item.id, qty: item.quantity - 1 })}
                            disabled={item.quantity === 1 || updateMutation.isPending}
                            className="w-8 h-8 rounded-lg bg-white text-gray-600 hover:text-brand-dark shadow-sm disabled:opacity-30 transition-all flex items-center justify-center"
                          >
                            <MdRemove size={16} />
                          </button>
                          <span className="px-4 text-brand-dark font-black text-base">{item.quantity}</span>
                          <button
                            onClick={() => updateMutation.mutate({ id: item.id, qty: item.quantity + 1 })}
                            disabled={updateMutation.isPending || item.quantity >= item.stockQty}
                            className="w-8 h-8 rounded-lg bg-white text-gray-600 hover:text-brand-dark shadow-sm transition-all flex items-center justify-center disabled:opacity-30"
                          >
                            <MdAdd size={16} />
                          </button>
                        </div>

                        <div className="text-right min-w-[140px]">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Item Total</span>
                          <p className="text-2xl font-black text-brand-dark tracking-tighter">₩ {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      disabled={removeMutation.isPending}
                      className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-gray-100"
                      title="삭제"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary at the Bottom */}
            <div className="bg-brand-dark rounded-[50px] shadow-2xl p-10 text-white border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black border-b border-white/10 pb-4 italic tracking-tighter">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-white/50 text-base font-medium"><span>총 상품 금액</span><span className="text-white font-bold">₩ {selectedTotalAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-white/50 text-base font-medium"><span>총 주문 수량</span><span className="text-white font-bold">{selectedTotalCount}개</span></div>
                    <div className="flex justify-between text-white/50 text-base font-medium"><span>배송비</span><span className="text-brand-yellow font-bold">FREE</span></div>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="bg-white/5 rounded-[30px] p-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 font-bold text-xs uppercase tracking-widest">Total Amount</span>
                      <span className="text-5xl font-black text-brand-yellow tracking-tighter">₩ {selectedTotalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full block text-center bg-brand-yellow text-brand-dark py-5 rounded-[20px] font-black text-2xl hover:bg-white transition-all shadow-[0_20px_40px_rgba(255,212,0,0.2)] active:scale-95"
                  >
                    주문하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
