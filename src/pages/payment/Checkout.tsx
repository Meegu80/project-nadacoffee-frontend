import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { useCartStore } from "../../stores/useCartStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate, useLocation } from "react-router";
import DaumPostcodeEmbed from 'react-daum-postcode';
import { MdClose, MdLocationOn, MdSecurity, MdArrowBack } from "react-icons/md";
import { orderApi } from "../../api/order.api";
import { twMerge } from "tailwind-merge";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "NADA_CUSTOMER_" + Math.random().toString(36).substring(7);
const DIRECT_ORDER_KEY = "nada_direct_order";

function Checkout() {
  const { items: cartItems, totalAmount } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [directOrder, setDirectOrder] = useState<any>(null);
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("경기 안산시 단원구 와동 860");
  const [detailAddress, setDetailAddress] = useState("202호");
  const [zipCode, setZipCode] = useState("15230");

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
  const [isRendered, setIsRendered] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, price } = (() => {
    if (existingOrder) return { items: existingOrder.orderItems.map((i: any) => ({ ...i, name: i.product.name, price: i.salePrice })), price: existingOrder.totalPrice };
    if (directOrder) return { items: directOrder.orderItems.map((i: any) => ({ ...i, name: i.product.name, price: i.salePrice })), price: directOrder.totalPrice };
    return { items: cartItems, price: totalAmount() };
  })();

  useEffect(() => {
    if (!isStateLoaded) return;
    if (!existingOrder && !directOrder && items.length === 0) { navigate("/cart"); return; }

    async function initWidget() {
      try {
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods("#payment-widget", { value: price }, { variantKey: "DEFAULT" });
        paymentWidget.renderAgreement("#agreement");
        paymentMethodsWidget.on("ready", () => setIsRendered(true));
        paymentWidgetRef.current = paymentWidget;
      } catch (error) { console.error("Toss Widget Init Error:", error); }
    }
    initWidget();
  }, [price, isStateLoaded, existingOrder, directOrder, items.length, navigate]);

  const handleAddressComplete = (data: any) => { setAddress(data.address); setZipCode(data.zonecode); setIsPostcodeOpen(false); };

  const openPaymentModal = () => {
    if (!receiver.trim() || !phone.trim() || !address.trim()) { alert("배송 정보를 모두 입력해주세요."); return; }
    setIsPaymentModalOpen(true);
  };

  const handleCancelCheckout = () => {
    if (window.confirm("결제를 취소하고 이전 페이지로 돌아가시겠습니까?")) {
      navigate(-1);
    }
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
          items: items.map((i: any) => ({ prodId: Number(i.prodId || i.product?.id), quantity: Number(i.quantity), optionId: i.optionId || i.option?.id || null })),
          recipientName: receiver, recipientPhone: phone.replace(/[^0-9]/g, ''),
          zipCode, address1: address, address2: detailAddress, usePoint: 0
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
    } catch (error: any) { alert(`결제 요청 실패: ${error.message}`); } finally { setIsProcessing(false); }
  };

  if (!isStateLoaded) return null;

  return (
    <div className="min-h-screen pt-10 pb-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">
            <h2 className="text-3xl font-black text-brand-dark mb-8 italic">Order Items</h2>
            <div className="divide-y divide-gray-50">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-6 py-6">
                  <img src={item.imageUrl || item.product?.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-gray-100" alt={item.name} />
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
              <div className="flex justify-between items-end mb-8"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Payment</span><span className="text-4xl font-black text-brand-dark tracking-tighter">₩ {price.toLocaleString()}</span></div>

              {/* [수정] 결제하기와 결제 취소 버튼 나란히 배치 */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={openPaymentModal}
                  className="w-full py-6 bg-brand-yellow text-brand-dark rounded-[25px] font-black text-2xl hover:bg-black hover:text-white transition-all shadow-xl active:scale-95"
                >
                  결제하기
                </button>
                <button
                  onClick={handleCancelCheckout}
                  className="w-full py-4 bg-white text-gray-400 rounded-[20px] font-bold text-sm hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <MdArrowBack /> 결제 취소하고 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 모달창 */}
      <div className={twMerge(["fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300", isPaymentModalOpen ? "opacity-100 visible" : "opacity-0 invisible"])}>
        <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50 shrink-0">
            <div>
              <h3 className="text-2xl font-black text-brand-dark flex items-center gap-2"><MdSecurity className="text-green-500" /> 안전 결제</h3>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Secure Payment Gateway</p>
            </div>
            <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdClose size={28} className="text-gray-400 hover:text-brand-dark" /></button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div id="payment-widget" className="w-full" />
            <div id="agreement" className="w-full" />
          </div>
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
