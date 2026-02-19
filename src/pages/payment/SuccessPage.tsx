import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle, MdArrowForward, MdError } from "react-icons/md";
import { orderApi } from "../../api/order.api";
import { cartApi } from "../../api/cart.api";
import { useCartStore } from "../../stores/useCartStore";
import { useQueryClient } from "@tanstack/react-query"; // [추가]

const DIRECT_ORDER_KEY = "nada_direct_order";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient(); // [추가]
  const clearCartStore = useCartStore((state) => state.clearCart);

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
      const isZeroAmount = Number(amount) === 0 || location.state?.amount === 0;

      if (isZeroAmount) {
        console.log("🎁 [Success] Zero amount payment");
        setStatus('success');
        
        // [추가] 포인트 정보 즉시 갱신
        queryClient.invalidateQueries({ queryKey: ['points'] });
        queryClient.invalidateQueries({ queryKey: ['members', 'me'] });

        const isDirectOrder = localStorage.getItem(DIRECT_ORDER_KEY);
        if (!isDirectOrder) {
          try { await cartApi.clearCart(); clearCartStore(); } catch (e) {}
        } else {
          localStorage.removeItem(DIRECT_ORDER_KEY);
        }
        return;
      }

      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setErrorMessage("결제 정보가 누락되었습니다.");
        return;
      }

      isProcessing.current = true;

      try {
        await orderApi.confirmOrder({
          paymentKey,
          orderId: orderId,
          amount: Number(amount)
        });

        setStatus('success');
        
        // [추가] 일반 결제 성공 시에도 포인트 정보 갱신 (적립 등 발생 가능)
        queryClient.invalidateQueries({ queryKey: ['points'] });
        queryClient.invalidateQueries({ queryKey: ['members', 'me'] });

        const isDirectOrder = localStorage.getItem(DIRECT_ORDER_KEY);
        if (isDirectOrder) {
          localStorage.removeItem(DIRECT_ORDER_KEY);
        } else {
          try {
            await cartApi.clearCart();
            clearCartStore();
          } catch (cartError) {
            console.warn("⚠️ Failed to clear cart:", cartError);
          }
        }

      } catch (error: unknown) {
        console.error("❌ Payment Confirmation Failed:", error);
        setStatus('error');
        const resData = error instanceof Error && 'response' in error ? (error as any).response?.data : null;
        const message = resData?.message || (error instanceof Error ? error.message : '알 수 없는 오류');
        setErrorMessage(message);
        setDebugInfo(JSON.stringify(resData, null, 2));
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amount, clearCartStore, location.state, queryClient]);

  const handleGoDetail = () => {
    navigate("/mypage/order");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            <p className="text-gray-500 font-medium mb-4 leading-relaxed">결제 승인 처리 중 오류가 발생했습니다.<br /><span className="text-red-500 font-bold">{errorMessage}</span></p>
            {debugInfo && <pre className="text-xs text-left bg-gray-100 p-4 rounded-xl overflow-x-auto mb-8 text-gray-600">{debugInfo}</pre>}
            <button onClick={() => navigate("/cart")} className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl">장바구니로 돌아가기</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuccessPage;
