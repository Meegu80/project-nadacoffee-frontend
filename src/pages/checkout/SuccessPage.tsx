import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle, MdArrowForward } from "react-icons/md";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const handleGoDetail = () => {
    // 주문 상세 페이지로 이동 (나중에 실제 ID로 변경 필요)
    navigate("/mypage"); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl text-center p-12">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <MdCheckCircle size={64} />
              </div>
              
              <h2 className="text-3xl font-black text-brand-dark mb-4">결제 성공!</h2>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                주문이 정상적으로 완료되었습니다.<br/>
                주문번호: <span className="text-brand-dark font-bold">{orderId}</span><br/>
                결제금액: <span className="text-brand-dark font-bold">₩ {Number(amount).toLocaleString()}</span>
              </p>

              <button 
                onClick={handleGoDetail}
                className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
              >
                주문 내역 확인하기 <MdArrowForward />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuccessPage;
