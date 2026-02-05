import { useNavigate, useSearchParams } from "react-router";
import { MdError, MdRefresh } from "react-icons/md";

function FailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const message = searchParams.get("message");
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl text-center p-12 border border-red-50">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <MdError size={64} />
        </div>
        
        <h2 className="text-3xl font-black text-brand-dark mb-4">결제 실패</h2>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          결제 진행 중 오류가 발생했습니다.<br/>
          <span className="text-red-500 font-bold">[{code}] {message}</span>
        </p>

        <button 
          onClick={() => navigate("/payment")}
          className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
        >
          다시 시도하기 <MdRefresh />
        </button>
      </div>
    </div>
  );
}

export default FailPage;
