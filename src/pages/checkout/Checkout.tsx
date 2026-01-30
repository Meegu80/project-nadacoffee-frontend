import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { useCartStore } from "../../stores/useCartStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router";
import DaumPostcodeEmbed from 'react-daum-postcode';
import { MdClose, MdLocationOn, MdSecurity } from "react-icons/md";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "NADA_CUSTOMER_" + Math.random().toString(36).substring(7);

function Checkout() {
  const { items, totalAmount, totalCount } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  
  const [receiver, setReceiver] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const price = totalAmount();
  const vat = Math.floor(price / 11);
  const points = Math.floor(price * 0.01);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    async function initWidget() {
      try {
        console.log("Initializing Toss Widget...");
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        
        // 결제 수단 렌더링
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          "#payment-widget", 
          { value: price }, 
          { variantKey: "DEFAULT" }
        );
        
        // 이용약관 렌더링
        paymentWidget.renderAgreement("#agreement");
        
        // 렌더링 완료 감지 (이벤트와 Promise 병행)
        paymentMethodsWidget.on("ready", () => {
          console.log("Toss Widget Rendered (Event)");
          setIsRendered(true);
        });

        // 수동으로 렌더링 상태 확인 (안전장치)
        setTimeout(() => {
          if (document.querySelector('#payment-widget iframe')) {
            console.log("Toss Widget Rendered (Manual Check)");
            setIsRendered(true);
          }
        }, 2000);

        paymentWidgetRef.current = paymentWidget;
      } catch (error) {
        console.error("Toss Widget Init Error:", error);
      }
    }
    initWidget();
  }, [price, navigate]);

  const handleAddressComplete = (data: any) => {
    setAddress(data.address);
    setIsPostcodeOpen(false);
  };

  const openPaymentModal = () => {
    if (!receiver.trim() || !phone.trim() || !address.trim()) {
      alert("배송 정보를 모두 입력해주세요.");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleFinalPayment = async () => {
    if (!paymentWidgetRef.current) {
      alert("결제 시스템이 초기화되지 않았습니다.");
      return;
    }

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId: "ORDER_" + new Date().getTime(),
        orderName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
        customerName: receiver,
        customerEmail: user?.email || "",
        successUrl: window.location.origin + "/checkout/success",
        failUrl: window.location.origin + "/checkout/fail",
      });
    } catch (error: any) {
      console.error("Payment Request Error:", error);
      if (error.code !== 'USER_CANCEL') {
        alert(error.message || "결제 진행 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100">
            <h2 className="text-3xl font-black text-brand-dark mb-8 italic">Order Items</h2>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-6 py-6">
                  <img src={item.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-gray-100" alt={item.name} />
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
                <input type="text" placeholder="수령인 성함" value={receiver} onChange={(e) => setReceiver(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
                <input type="text" placeholder="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
              </div>
              <div className="relative">
                <input type="text" placeholder="주소 검색 (클릭)" value={address} readOnly onClick={() => setIsPostcodeOpen(true)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold cursor-pointer" />
                <MdLocationOn className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
              </div>
              <input type="text" placeholder="상세 주소" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-yellow font-bold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 sticky top-32">
            <div className="p-10 bg-brand-dark text-white">
              <h3 className="text-2xl font-black italic">Order Summary</h3>
              <p className="text-white/50 text-sm mt-1 font-medium uppercase tracking-widest">Final Review</p>
            </div>
            
            <div className="px-10 py-10 space-y-5">
              <div className="flex justify-between text-gray-500 font-bold text-sm"><span>총 상품 금액 ({totalCount()}개)</span><span className="text-brand-dark">₩ {price.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500 font-bold text-sm"><span>배송비</span><span className="text-brand-yellow">무료배송</span></div>
              <div className="pt-5 border-t border-gray-50 space-y-3">
                <div className="flex justify-between text-gray-400 text-xs font-medium"><span>부가세 포함</span><span>₩ {vat.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-400 text-xs font-medium"><span>적립 예정 포인트</span><span className="text-brand-dark font-bold">{points.toLocaleString()} P</span></div>
              </div>
            </div>

            <div className="p-10 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Payment</span>
                <span className="text-4xl font-black text-brand-dark tracking-tighter">₩ {price.toLocaleString()}</span>
              </div>
              
              <button 
                onClick={openPaymentModal}
                className="w-full py-6 bg-brand-yellow text-brand-dark rounded-[25px] font-black text-2xl hover:bg-black hover:text-white transition-all shadow-xl active:scale-95"
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 위젯 모달 */}
      <div className={`fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300 ${isPaymentModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
            <div>
              <h3 className="text-2xl font-black text-brand-dark flex items-center gap-2">
                <MdSecurity className="text-green-500" /> 안전 결제
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Secure Payment Gateway</p>
            </div>
            <button onClick={() => setIsPaymentModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm border border-gray-100">
              <MdClose size={24} />
            </button>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* 위젯 영역: 모달이 닫혀있어도 DOM에는 존재해야 함 */}
            <div id="payment-widget" className="w-full" />
            <div id="agreement" className="w-full" />
          </div>

          <div className="p-10 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Final Amount</span>
              <span className="text-3xl font-black text-brand-dark">₩ {price.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleFinalPayment}
              disabled={!isRendered}
              className={`flex-1 py-5 rounded-2xl font-black text-xl transition-all shadow-lg ${
                isRendered ? "bg-brand-dark text-white hover:bg-black" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isRendered ? "결제 승인하기" : "준비 중..."}
            </button>
          </div>
        </div>
      </div>

      {/* 주소 검색 모달 */}
      {isPostcodeOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsPostcodeOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-black text-brand-dark">주소 검색</h3>
              <button onClick={() => setIsPostcodeOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MdClose size={24} /></button>
            </div>
            <DaumPostcodeEmbed onComplete={handleAddressComplete} style={{ height: '500px' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
