import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle, MdArrowForward, MdError } from "react-icons/md";
import { orderApi } from "../../api/order.api";
import { useCartStore } from "../../stores/useCartStore";

const DIRECT_ORDER_KEY = "nada_direct_order";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const isProcessing = useRef(false);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (isProcessing.current) return;

    async function confirmPayment() {
      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setErrorMessage("결제 정보가 누락되었습니다.");
        return;
      }

      isProcessing.current = true;

      try {
        // "NADA_17"에서 숫자만 추출
        const pureId = orderId.startsWith("NADA_") ? orderId.replace("NADA_", "") : orderId;
        const finalOrderId = Number(pureId);

        await orderApi.confirmOrder({
          paymentKey,
          orderId: finalOrderId,
          amount: Number(amount)
        });

        setStatus('success');
        
        // 클린업
        clearCart(); 
        localStorage.removeItem(DIRECT_ORDER_KEY);
      } catch (error: any) {
        console.error("❌ Payment Confirmation Failed:", error);
        setStatus('error');
        const resData = error.response?.data;
        setErrorMessage(resData?.message || error.message);
        setDebugInfo(JSON.stringify(resData, null, 2));
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
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl text-center p-12">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <MdCheckCircle size={64} />
            </div>
            <h2 className="text-3xl font-black text-brand-dark mb-4">결제 성공!</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">주문이 정상적으로 완료되었습니다.</p>
            <button onClick={handleGoDetail} className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95">
              주문 내역 확인하기 <MdArrowForward />
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl text-center p-12 border border-red-50">
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <MdError size={64} />
            </div>
            <h2 className="text-3xl font-black text-brand-dark mb-4">승인 실패</h2>
            <p className="text-gray-500 font-medium mb-4 leading-relaxed">결제 승인 처리 중 오류가 발생했습니다.<br/><span className="text-red-500 font-bold">{errorMessage}</span></p>
            <pre className="text-xs text-left bg-gray-100 p-4 rounded-xl overflow-x-auto mb-8 text-gray-600">{debugInfo}</pre>
            <button onClick={() => navigate("/checkout")} className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl">다시 시도하기</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuccessPage;
