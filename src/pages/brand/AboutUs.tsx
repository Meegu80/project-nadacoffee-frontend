import { motion } from "framer-motion";
import hero from "../../assets/brand/hero.png";
import story1 from "../../assets/brand/story1.png";
import story2 from "../../assets/brand/story2.png";
import story3 from "../../assets/brand/story3.png";

function AboutUs() {
  return (
    <div className="bg-brand-white min-h-screen">
      {/* Hero Section: Compact & Elegant */}
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden bg-brand-dark">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Brand Hero"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).src = story1;
            }}
          />
        </div>
        <div className="relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-yellow font-bold tracking-[0.4em] text-sm mb-4 block"
          >
            EST. 2006
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-black text-white"
          >
            OUR STORY
          </motion.h1>
        </div>
      </section>

      {/* Edited Image Sections with Spacing */}
      <section className="flex flex-col w-full max-w-7xl mx-auto px-4 py-20 gap-24">

        {/* Section 1: Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden rounded-[40px] shadow-2xl"
        >
          <img src={story1} alt="Philosophy" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-8 right-4 md:bottom-12 md:right-12 max-w-md bg-white/90 backdrop-blur-md p-8 md:p-10 shadow-2xl border-l-8 border-brand-yellow rounded-2xl">
            <span className="text-brand-brown font-bold tracking-widest text-xs mb-3 block">01. PHILOSOPHY</span>
            <h2 className="text-2xl md:text-3xl font-black text-brand-dark mb-4 leading-tight">
              진심을 담은<br/>한 잔의 미학
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              우리는 커피 한 잔이 줄 수 있는 가장 큰 가치는 '진심'이라고 믿습니다.
              단순한 음료를 넘어, 당신의 하루를 깨우는 따뜻한 빛이 되겠습니다.
            </p>
          </div>
        </motion.div>

        {/* Section 2: Quality */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden rounded-[40px] shadow-2xl"
        >
          <img src={story2} alt="Quality" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-8 left-4 md:top-12 md:left-12 max-w-md bg-brand-dark/90 backdrop-blur-md p-8 md:p-10 shadow-2xl border-r-8 border-brand-yellow text-white rounded-2xl">
            <span className="text-brand-yellow font-bold tracking-widest text-xs mb-3 block">02. QUALITY</span>
            <h2 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
              타협하지 않는<br/>최상의 원두
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              전 세계 상위 1% 스페셜티 원두만을 선별합니다.
              Nerda만의 독자적인 로스팅 공법은 원두가 가진 잠재력을 최대한으로 끌어올립니다.
            </p>
          </div>
        </motion.div>

        {/* Section 3: Culture */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden rounded-[40px] shadow-2xl"
        >
          <img src={story3} alt="Culture" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8 md:p-12 text-center text-white rounded-[30px]">
              <span className="text-brand-yellow font-bold tracking-widest text-xs mb-4 block">03. CULTURE</span>
              <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                함께 만드는 커피 문화
              </h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                우리는 지역 사회와 소통하며 지속 가능한 커피 생태계를 꿈꿉니다.
                Nerda Coffee와 함께하는 모든 순간이 당신에게 영감이 되기를 바랍니다.
              </p>
            </div>
          </div>
        </motion.div>

      </section>

      {/* Bottom Banner: Compact & Modern */}
      <section className="py-20 px-4 bg-brand-white">
        <div className="max-w-5xl mx-auto bg-brand-yellow rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-brand-dark mb-2">
              Nerda Coffee와 함께 여정을 시작하세요
            </h3>
            <p className="text-brand-dark/70 font-medium">가까운 매장에서 신선한 커피를 만나보실 수 있습니다.</p>
          </div>
          <button className="whitespace-nowrap bg-brand-dark text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg">
            매장 찾기
          </button>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
