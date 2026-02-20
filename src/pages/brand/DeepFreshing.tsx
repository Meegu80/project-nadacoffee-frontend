import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import deep1 from "../../assets/deepfresh/deep1.png";
import deep2 from "../../assets/deepfresh/deep2.png";

function DeepFreshing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-[#FFD400] selection:text-black">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0"><motion.img initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 0.4 }} transition={{ duration: 2 }} src={deep1} alt="Hero" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#0a0a0a]" /></div>
        <div className="relative z-10 text-center px-4"><motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}><span className="text-[#FFD400] font-black tracking-[0.8em] text-xs md:text-sm mb-4 block uppercase">The Art of Roasting</span><h1 className="text-6xl md:text-[10rem] font-black mb-6 leading-none tracking-tighter italic">DEEP<br/><span className="text-[#FFD400]">FRESHING</span></h1><p className="text-gray-400 text-sm md:text-xl max-w-xl mx-auto font-light leading-relaxed tracking-wide">로스팅 직후의 가장 완벽한 풍미를 가두는 기술,<br/>나다커피만의 독자적인 신선함 유지 공법</p></motion.div></div>
      </section>
      <section className="py-40 text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto space-y-10">
          <h3 className="text-4xl md:text-7xl font-black leading-none tracking-tighter">EXPERIENCE THE <br/><span className="text-[#FFD400]">DEEP FRESHNESS</span></h3>
          <p className="text-gray-500 text-lg md:text-xl font-medium">지금 가까운 나다커피 매장에서 <br className="md:hidden"/>로스팅 직후의 신선함을 직접 경험해보세요.</p>
          <button onClick={() => navigate('/support/shop')} className="group relative px-12 py-5 bg-[#FFD400] text-black font-black text-xl rounded-full overflow-hidden transition-all hover:pr-16 active:scale-95 shadow-[0_0_40px_rgba(255,212,0,0.2)]"><span className="relative z-10">FIND A STORE</span><span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span></button>
        </motion.div>
      </section>
    </div>
  );
}

export default DeepFreshing;
