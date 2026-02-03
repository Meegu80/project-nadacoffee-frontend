import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle, MdArrowForward, MdError } from "react-icons/md";
import { orderApi } from "../../api/order.api";
import { useCartStore } from "../../stores/useCartStore";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");

  // URL에서 토스 결제 정보 추출
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    async function confirmPayment() {
      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setErrorMessage("결제 정보가 누락되었습니다.");
        return;
      }

      try {
        // [핵심] 서버에 결제 승인 요청
        console.log("💳 Confirming Payment on Server...");
        
        // orderId에서 서버용 순수 ID 추출 (예: ORDER_123_timestamp -> 123)
        const pureOrderId = orderId.split('_')[1];

        await orderApi.confirmOrder({
          paymentKey,
          orderId: pureOrderId,
          amount: Number(amount)
        });

        // 승인 성공 시
        setStatus('success');
        clearCart(); // 장바구니 비우기
      } catch (error: any) {
        console.error("Payment Confirmation Error:", error);
        setStatus('error');
        setErrorMessage(error.response?.data?.message || "결제 승인 중 오류가 발생했습니다.");
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amount, clearCart]);

  const handleGoDetail = () => {
    navigate("/mypage"); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <AnimatePresence>
        {status === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-yellow mx-auto mb-6"></div>
            <p className="text-xl font-black text-brand-dark">결제 승인 처리 중입니다...</p>
            <p className="text-gray-400 mt-2">잠시만 기다려주세요.</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl text-center p-12"
          >
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <MdCheckCircle size={64} />
            </div>
            <h2 className="text-3xl font-black text-brand-dark mb-4">결제 성공!</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              주문이 정상적으로 완료되었습니다.<br/>
              주문번호: <span className="text-brand-dark font-bold">{orderId}</span>
            </p>
            <button 
              onClick={handleGoDetail}
              className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
            >
              주문 내역 확인하기 <MdArrowForward />
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl text-center p-12 border border-red-50"
          >
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <MdError size={64} />
            </div>
            <h2 className="text-3xl font-black text-brand-dark mb-4">승인 실패</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              결제 승인 처리 중 오류가 발생했습니다.<br/>
              <span className="text-red-500 font-bold">{errorMessage}</span>
            </p>
            <button 
              onClick={() => navigate("/checkout")}
              className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl"
            >
              다시 시도하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuccessPage;
