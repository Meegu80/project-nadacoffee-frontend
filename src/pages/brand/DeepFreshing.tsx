import { motion } from "framer-motion";
import deep1 from "../../assets/deepfresh/deep1.png";
import deep2 from "../../assets/deepfresh/deep2.png";

function DeepFreshing() {
  return (
    <div className="bg-[#222222] min-h-screen text-white">
      
      {/* 1. Hero Section: Full Screen Impact */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={deep1} 
            alt="Deep Freshing Hero" 
            className="w-full h-full object-cover opacity-40 scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#222222]" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#FFD400] font-bold tracking-[0.5em] text-sm md:text-base mb-6 block">
              NERDA SPECIAL ROASTING
            </span>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
              DEEP<br/>FRESHING
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              로스팅 직후의 가장 완벽한 풍미를 가두는 기술,<br/>
              Nerda만의 독자적인 신선함 유지 공법을 소개합니다.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-20 bg-gradient-to-b from-[#FFD400] to-transparent" />
        </div>
      </section>

      {/* 2. Process Detail 1: Freshness Technology */}
      <section className="py-32 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#FFD400]/20 rounded-[40px] blur-2xl group-hover:bg-[#FFD400]/30 transition-all" />
              <img src={deep1} alt="Freshness" className="relative w-full h-[600px] object-cover rounded-[40px] shadow-2xl" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 space-y-8"
          >
            <h2 className="text-[#FFD400] text-6xl font-black italic opacity-20">01</h2>
            <h3 className="text-4xl md:text-5xl font-black leading-tight">
              시간을 멈추는<br/>신선함의 기술
            </h3>
            <div className="w-20 h-1 bg-[#FFD400]" />
            <p className="text-gray-400 text-lg leading-relaxed">
              Deep Freshing 공법은 원두가 로스팅된 직후 발생하는 가스를 정교하게 조절하여 
              산소와의 접촉을 완벽하게 차단합니다. 이는 원두 내부의 아로마 성분이 
              외부로 유출되는 것을 방지하여, 매장에서 추출하는 그 순간까지 
              최상의 신선도를 유지하게 합니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. Process Detail 2: Precision Roasting */}
      <section className="py-32 bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-20">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#FFD400]/10 rounded-[40px] blur-2xl group-hover:bg-[#FFD400]/20 transition-all" />
                <img src={deep2} alt="Precision" className="relative w-full h-[600px] object-cover rounded-[40px] shadow-2xl" />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2 space-y-8"
            >
              <h2 className="text-[#FFD400] text-6xl font-black italic opacity-20">02</h2>
              <h3 className="text-4xl md:text-5xl font-black leading-tight">
                1도씨의 차이가 만드는<br/>완벽한 밸런스
              </h3>
              <div className="w-20 h-1 bg-[#FFD400]" />
              <p className="text-gray-400 text-lg leading-relaxed">
                데이터에 기반한 정밀한 온도 제어 시스템을 통해 각 원두가 가진 
                고유의 잠재력을 최대한으로 끌어올립니다. 쓴맛은 줄이고 단맛과 
                바디감을 극대화하는 Nerda만의 로스팅 프로파일은 
                누구도 흉내 낼 수 없는 깊은 풍미를 완성합니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Flavor Profile Section: Inspired by Bitter Holic */}
      <section className="py-32 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-black mb-16">FLAVOR PROFILE</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "BODY", value: "★★★★★" },
              { label: "SWEETNESS", value: "★★★★☆" },
              { label: "ACIDITY", value: "★★☆☆☆" },
              { label: "AROMA", value: "★★★★★" },
            ].map((item) => (
              <div key={item.label} className="space-y-4">
                <p className="text-[#FFD400] font-bold tracking-widest">{item.label}</p>
                <p className="text-2xl tracking-widest">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 5. Bottom Banner */}
      <section className="py-24 px-4 bg-[#222222]">
        <div className="max-w-5xl mx-auto bg-[#FFD400] rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_20px_50px_rgba(255,212,0,0.2)]">
          <div className="text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-[#222222] mb-4">
              가장 신선한 커피를 경험해보세요
            </h3>
            <p className="text-[#222222]/70 text-lg font-medium">Deep Freshing 공법으로 완성된 원두를 매장에서 만나보세요.</p>
          </div>
          <button className="whitespace-nowrap bg-[#222222] text-white px-12 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-xl">
            매장 찾기
          </button>
        </div>
      </section>
    </div>
  );
}

export default DeepFreshing;
