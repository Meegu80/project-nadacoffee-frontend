import { useEffect, useRef, useState, useMemo } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { useCartStore } from "../../stores/useCartStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate, useLocation } from "react-router";
import DaumPostcodeEmbed from 'react-daum-postcode';
import { MdClose, MdLocationOn, MdSecurity, MdArrowBack } from "react-icons/md";
import { orderApi } from "../../api/order.api";
import { memberApi } from "../../api/member.api";
import { useAlertStore } from "../../stores/useAlertStore";
import { twMerge } from "tailwind-merge";
import type { Order } from "../../types/order";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Coins } from 'lucide-react';

interface DaumPostcodeData {
  address: string;
  zonecode: string;
}

interface CheckoutItem {
  id?: number;
  prodId?: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  optionId?: number | null;
  product?: {
    id: number;
    name: string;
    imageUrl: string | null;
  };
  option?: {
    id?: number;
    name: string;
    value: string;
  } | null;
}

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "NADA_CUSTOMER_" + Math.random().toString(36).substring(7);
const DIRECT_ORDER_KEY = "nada_direct_order";

function Checkout() {
  const { items: cartItems, totalAmount } = useCartStore();
  const { user } = useAuthStore();
  const { showAlert } = useAlertStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [directOrder, setDirectOrder] = useState<Order | null>(null);
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("경기 안산시 단원구 와동 860");
  const [detailAddress, setDetailAddress] = useState("202호");
  const [zipCode, setZipCode] = useState("15230");

  const [usePoint, setUsePoint] = useState<number>(0);

  const { data: pointData } = useQuery({
    queryKey: ['points', 'balance'],
    queryFn: () => memberApi.getPointBalance(),
    enabled: !!user
  });
  const availablePoint = pointData?.balance || 0;

  useEffect(() => {
    const stateDirectOrder = location.state?.directOrder;
    const stateExistingOrder = location.state?.existingOrder;
    let finalDirectOrder = stateDirectOrder;

    if (stateDirectOrder) {
      localStorage.setItem(DIRECT_ORDER_KEY, JSON.stringify(stateDirectOrder));
    } else if (!stateExistingOrder) {
      const saved = localStorage.getItem(DIRECT_ORDER_KEY);
      if (saved) { try { finalDirectOrder = JSON.parse(saved); } catch { localStorage.removeItem(DIRECT_ORDER_KEY); } }
    }

    setDirectOrder(finalDirectOrder);
    setExistingOrder(stateExistingOrder);

    if (stateExistingOrder) {
      setReceiver(stateExistingOrder.recipientName);
      setPhone(stateExistingOrder.recipientPhone);
      setAddress(stateExistingOrder.address1);
      setDetailAddress(stateExistingOrder.address2);
      setZipCode(stateExistingOrder.zipCode);
    } else {
      setReceiver(user?.name || "");
      setPhone(user?.phone || "");
    }
    setIsStateLoaded(true);
  }, [location.state, user]);

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, totalPrice }: { items: CheckoutItem[]; totalPrice: number } = (() => {
    if (existingOrder) return { items: existingOrder.orderItems.map((i) => ({ ...i, name: i.product.name, price: i.salePrice })), totalPrice: existingOrder.totalPrice };
    if (directOrder) return { items: directOrder.orderItems.map((i) => ({ ...i, name: i.product.name, price: i.salePrice })), totalPrice: directOrder.totalPrice };
    return { items: cartItems, totalPrice: totalAmount() };
  })();

  const finalPrice = useMemo(() => {
    const result = totalPrice - usePoint;
    return result < 0 ? 0 : result;
  }, [totalPrice, usePoint]);

  useEffect(() => {
    if (!isStateLoaded || finalPrice === 0) return;
    if (!existingOrder && !directOrder && items.length === 0) { navigate("/cart"); return; }

    async function initWidget() {
      try {
        if (!paymentWidgetRef.current) {
          const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
          const paymentMethodsWidget = paymentWidget.renderPaymentMethods("#payment-widget", { value: finalPrice }, { variantKey: "DEFAULT" });
          paymentWidget.renderAgreement("#agreement");
          paymentMethodsWidget.on("ready", () => setIsRendered(true));
          paymentWidgetRef.current = paymentWidget;
          paymentMethodsWidgetRef.current = paymentMethodsWidget;
        } else {
          paymentMethodsWidgetRef.current.updateAmount(finalPrice);
        }
      } catch (error) { console.error("Toss Widget Init Error:", error); }
    }
    initWidget();
  }, [finalPrice, isStateLoaded, existingOrder, directOrder, items.length, navigate]);

  const handleAddressComplete = (data: DaumPostcodeData) => { setAddress(data.address); setZipCode(data.zonecode); setIsPostcodeOpen(false); };

  const handleCheckoutClick = async () => {
    if (!receiver.trim() || !phone.trim() || !address.trim()) {
      showAlert("배송 정보를 모두 입력해주세요.", "주문 오류", "warning");
      return;
    }

    if (finalPrice === 0) {
      setIsProcessing(true);
      try {
        // [최종 수정] 모든 필드를 명시적으로 채워서 전송 (usePoint로 복구)
        const serverOrder = await orderApi.createOrder({
          items: items.map((i) => ({ 
            prodId: Number(i.prodId || i.product?.id), 
            quantity: Number(i.quantity), 
            optionId: i.optionId || i.option?.id || null 
          })),
          recipientName: receiver, 
          recipientPhone: phone.replace(/[^0-9]/g, ''),
          zipCode: zipCode || "",
          address1: address || "",
          address2: detailAddress || "", 
          deliveryMessage: "", // 명시적 빈 문자열
          entrancePassword: "", // 명시적 빈 문자열
          usePoint: usePoint // usePoint로 복구
        });
        
        showAlert(
          "포인트로 전액 결제가 완료되었습니다.\n주문 내역으로 이동합니다.", 
          "결제 성공", 
          "success",
          [{ label: "확인", onClick: () => navigate("/payment/success", { state: { orderId: serverOrder.orderId, amount: 0 } }) }]
        );
      } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        showAlert(`주문 처리 실패: ${msg}`, "오류", "error");
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handleCancelCheckout = () => {
    showAlert("결제를 취소하고 이전 페이지로 돌아가시겠습니까?", "결제 취소 확인", "warning", [
      { label: "네, 취소합니다.", onClick: () => navigate(-1) },
      { label: "아니오", onClick: () => { } }
    ]);
  };

  const handleFinalPayment = async () => {
    if (!paymentWidgetRef.current || isProcessing) return;
    setIsProcessing(true);
    try {
      let tossOrderId = "";
      if (existingOrder) {
        tossOrderId = `ORDER_${existingOrder.id}_${new Date().getTime()}`;
      } else {
        const serverOrder = await orderApi.createOrder({
          items: items.map((i) => ({ prodId: Number(i.prodId || i.product?.id), quantity: Number(i.quantity), optionId: i.optionId || i.option?.id || null })),
          recipientName: receiver, recipientPhone: phone.replace(/[^0-9]/g, ''),
          zipCode: zipCode || "", address1: address || "", address2: detailAddress || "", 
          deliveryMessage: "", entrancePassword: "",
          usePoint: usePoint
        });
        tossOrderId = `ORDER_${serverOrder.orderId}_${new Date().getTime()}`;
      }
      await paymentWidgetRef.current.requestPayment({
        orderId: tossOrderId,
        orderName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
        customerName: receiver, customerEmail: user?.email || "",
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      showAlert(`결제 요청 실패: ${message}`, "결제 오류", "error");
    } finally { setIsProcessing(false); }
  };

  const handlePointChange = (val: number) => {
    if (val < 0) setUsePoint(0);
    else if (val > availablePoint) setUsePoint(availablePoint);
    else if (val > totalPrice) setUsePoint(totalPrice);
    else setUsePoint(val);
  };

  if (!isStateLoaded) return null;

  return (
    <div className="min-h-screen pt-10 pb-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">
            <h2 className="text-3xl font-black text-brand-dark mb-8 italic">Order Items</h2>
            <div className="divide-y divide-gray-50">
              {items.map((item, idx: number) => (
                <div key={idx} className="flex items-center gap-6 py-6">
                  <img src={item.imageUrl || item.product?.imageUrl || ''} className="w-20 h-20 rounded-2xl object-cover border border-gray-100" alt={item.name} />
                  <div className="flex-1">
                    <p className="font-black text-brand-dark text-lg">{item.name}</p>
                    <p className="text-gray-400 font-bold text-sm">{item.quantity}개 / ₩ {item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-black text-brand-dark">₩ {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">
            <h2 className="text-3xl font-black text-brand-dark mb-8 italic flex items-center gap-2">
              <Coins className="text-brand-yellow" /> Point Usage
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Available Points</p>
                  <p className="text-xl font-black text-brand-dark">{availablePoint.toLocaleString()} P</p>
                </div>
                <button onClick={() => handlePointChange(availablePoint)} className="px-6 py-2 bg-brand-dark text-brand-yellow rounded-xl font-black text-xs hover:bg-black transition-all">전액 사용</button>
              </div>
              <div className="relative">
                <input type="number" placeholder="사용할 포인트를 입력하세요" value={usePoint || ''} onChange={(e) => handlePointChange(Number(e.target.value))} className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-brand-yellow outline-none font-black text-lg transition-all" />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300">P</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">
            <h2 className="text-3xl font-black text-brand-dark mb-8 italic">Shipping Info</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="수령인 성함" value={receiver} onChange={(e) => setReceiver(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" readOnly={!!existingOrder} />
                <input type="text" placeholder="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" readOnly={!!existingOrder} />
              </div>
              <div className="relative">
                <input type="text" placeholder="주소 검색 (클릭)" value={address} readOnly onClick={() => !existingOrder && setIsPostcodeOpen(true)} className={twMerge(["w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold", !existingOrder && "cursor-pointer"])} />
                {!existingOrder && <MdLocationOn className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} />}
              </div>
              <input type="text" placeholder="상세 주소" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" readOnly={!!existingOrder} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 sticky top-32">
            <div className="p-10 bg-brand-dark text-white"><h3 className="text-2xl font-black italic">Order Summary</h3></div>
            <div className="p-10 bg-gray-50 border-t border-gray-100">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-400 font-bold text-sm"><span>총 상품 금액</span><span className="text-brand-dark">₩ {totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-400 font-bold text-sm"><span>포인트 사용</span><span className="text-red-500 font-black">- {usePoint.toLocaleString()} P</span></div>
                <div className="flex justify-between items-center text-gray-400 font-bold text-sm"><span>배송비</span><span className="text-green-500 font-black">무료배송</span></div>
              </div>
              <div className="flex justify-between items-end mb-8 pt-6 border-t border-gray-200"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Final Payment</span><span className="text-4xl font-black text-brand-dark tracking-tighter">₩ {finalPrice.toLocaleString()}</span></div>
              <div className="flex flex-col gap-4">
                <button onClick={handleCheckoutClick} disabled={isProcessing} className="w-full py-6 bg-brand-yellow text-brand-dark rounded-[25px] font-black text-2xl hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50">
                  {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : (finalPrice === 0 ? "포인트로 결제하기" : "결제하기")}
                </button>
                <button onClick={handleCancelCheckout} className="w-full py-4 bg-white text-gray-400 rounded-[20px] font-bold text-sm hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"><MdArrowBack /> 결제 취소하고 돌아가기</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={twMerge(["fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300", isPaymentModalOpen ? "opacity-100 visible" : "opacity-0 invisible"])}>
        <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50 shrink-0">
            <div><h3 className="text-2xl font-black text-brand-dark flex items-center gap-2"><MdSecurity className="text-green-500" /> 안전 결제</h3><p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Secure Payment Gateway</p></div>
            <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdClose size={28} className="text-gray-400 hover:text-brand-dark" /></button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1"><div id="payment-widget" className="w-full" /><div id="agreement" className="w-full" /></div>
          <div className="p-10 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
            <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-5 bg-gray-200 text-gray-500 rounded-2xl font-black text-xl hover:bg-red-100 hover:text-red-600 transition-all">취소하기</button>
            <button onClick={handleFinalPayment} disabled={!isRendered || isProcessing} className="flex-[2] py-5 bg-brand-dark text-white rounded-2xl font-black text-xl shadow-lg hover:bg-black transition-all disabled:opacity-50">{isProcessing ? "처리 중..." : "결제 승인하기"}</button>
          </div>
        </div>
      </div>

      {isPostcodeOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsPostcodeOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b"><h3 className="font-black text-brand-dark">주소 검색</h3><button onClick={() => setIsPostcodeOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdClose size={24} /></button></div>
            <DaumPostcodeEmbed onComplete={handleAddressComplete} style={{ height: '500px' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
