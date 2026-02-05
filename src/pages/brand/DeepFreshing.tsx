import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import deep1 from "../../assets/deepfresh/deep1.png";
import deep2 from "../../assets/deepfresh/deep2.png";

function DeepFreshing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-[#FFD400] selection:text-black">
      
      {/* 1. Hero Section: Cinematic Impact */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={deep1} 
            alt="Deep Freshing Hero" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#0a0a0a]" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <span className="text-[#FFD400] font-black tracking-[0.8em] text-xs md:text-sm mb-4 block uppercase">
              The Art of Roasting
            </span>
            <h1 className="text-6xl md:text-[10rem] font-black mb-6 leading-none tracking-tighter italic">
              DEEP<br/>
              <span className="text-[#FFD400]">FRESHING</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-xl max-w-xl mx-auto font-light leading-relaxed tracking-wide">
              로스팅 직후의 가장 완벽한 풍미를 가두는 기술,<br/>
              나다커피만의 독자적인 신선함 유지 공법
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Scroll Down</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#FFD400] to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* 2. Brand Philosophy Section */}
      <section className="py-40 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black leading-tight"
          >
            "커피의 본질은 <span className="text-[#FFD400]">신선함</span>에 있습니다."
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-base md:text-lg leading-loose font-medium"
          >
            나다커피는 단순히 원두를 볶는 것에 그치지 않습니다.<br/>
            로스팅 머신에서 쏟아져 나오는 그 찰나의 향기를 고객의 컵까지<br/>
            그대로 전달하기 위해 수만 번의 테스트를 거쳐 DEEP FRESHING 공법을 완성했습니다.
          </motion.p>
        </div>
      </section>

      {/* 3. Process Detail: Visual Storytelling */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-[#FFD400]/5 rounded-full blur-3xl" />
              <img src={deep2} alt="Roasting Process" className="relative z-10 w-full rounded-2xl grayscale hover:grayscale-0 transition-all duration-1000" />
              <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-white/5 select-none">01</div>
            </motion.div>

            <div className="space-y-10">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <span className="text-[#FFD400] font-bold text-sm tracking-widest uppercase">Precision Control</span>
                <h3 className="text-4xl md:text-6xl font-black italic">1℃의 집착</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  원두마다 다른 최적의 로스팅 포인트를 찾기 위해 1도 단위의 정밀한 온도 제어를 수행합니다. 
                  이 과정에서 원두 내부의 수분율을 최적으로 유지하여 텁텁함 없는 깔끔한 뒷맛을 완성합니다.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <span className="text-[#FFD400] font-bold text-sm tracking-widest uppercase">Aroma Lock</span>
                <h3 className="text-4xl md:text-6xl font-black italic">향기를 가두다</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  로스팅 직후 급속 냉각 시스템을 가동하여 아로마 오일의 증발을 막습니다. 
                  DEEP FRESHING 공법의 핵심인 이 단계는 원두가 가진 본연의 단맛을 극대화합니다.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Flavor Profile: Inspired by Bitter Holic */}
      <section className="py-40 bg-[#0f0f0f]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h3 className="text-4xl md:text-6xl font-black italic mb-4 uppercase tracking-tighter">Flavor Profile</h3>
            <div className="w-24 h-1 bg-[#FFD400] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            {/* Body */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 p-10 rounded-3xl border border-white/5 hover:border-[#FFD400]/30 transition-colors group"
            >
              <h4 className="text-[#FFD400] font-black tracking-widest mb-6 uppercase text-sm">Body</h4>
              <div className="flex gap-2 mb-4">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-8 rounded-full ${i <= 5 ? 'bg-[#FFD400]' : 'bg-white/10'}`} />)}
              </div>
              <p className="text-gray-500 text-sm font-medium">묵직하고 깊은 바디감</p>
            </motion.div>

            {/* Acidity */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 p-10 rounded-3xl border border-white/5 hover:border-[#FFD400]/30 transition-colors group"
            >
              <h4 className="text-[#FFD400] font-black tracking-widest mb-6 uppercase text-sm">Acidity</h4>
              <div className="flex gap-2 mb-4">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-8 rounded-full ${i <= 2 ? 'bg-[#FFD400]' : 'bg-white/10'}`} />)}
              </div>
              <p className="text-gray-500 text-sm font-medium">부드럽고 은은한 산미</p>
            </motion.div>

            {/* Sweetness */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 p-10 rounded-3xl border border-white/5 hover:border-[#FFD400]/30 transition-colors group"
            >
              <h4 className="text-[#FFD400] font-black tracking-widest mb-6 uppercase text-sm">Sweetness</h4>
              <div className="flex gap-2 mb-4">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-8 rounded-full ${i <= 4 ? 'bg-[#FFD400]' : 'bg-white/10'}`} />)}
              </div>
              <p className="text-gray-500 text-sm font-medium">오래 남는 기분 좋은 단맛</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="py-40 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-10"
        >
          <h3 className="text-4xl md:text-7xl font-black leading-none tracking-tighter">
            EXPERIENCE THE <br/>
            <span className="text-[#FFD400]">DEEP FRESHNESS</span>
          </h3>
          <p className="text-gray-500 text-lg md:text-xl font-medium">
            지금 가까운 나다커피 매장에서 <br className="md:hidden"/>
            로스팅 직후의 신선함을 직접 경험해보세요.
          </p>
          <button 
            onClick={() => navigate('/support/shop')}
            className="group relative px-12 py-5 bg-[#FFD400] text-black font-black text-xl rounded-full overflow-hidden transition-all hover:pr-16 active:scale-95 shadow-[0_0_40px_rgba(255,212,0,0.2)]"
          >
            <span className="relative z-10">FIND A STORE</span>
            <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">→</span>
          </button>
        </motion.div>
      </section>
    </div>
  );
}

export default DeepFreshing;
