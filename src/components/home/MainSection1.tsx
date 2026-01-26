import { motion } from "framer-motion";

function MainSection1() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
           <div className="h-96 bg-gray-100 rounded-3xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop" 
                alt="Coffee Beans" 
                className="w-full h-full object-cover"
              />
           </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
          <span className="text-brand-yellow font-bold tracking-widest mb-2 block">PREMIUM QUALITY</span>
          <h2 className="text-4xl font-black mb-6 leading-tight">
            엄선된 원두,<br/>최상의 로스팅
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8 text-lg">
            Nerda Coffee는 전 세계 커피 산지에서 엄선한 상위 1%의 스페셜티 원두만을 사용합니다. 
            숙련된 로스터의 섬세한 손길을 거쳐 탄생한 깊고 풍부한 맛을 경험해보세요.
          </p>
          <button className="text-brand-dark font-bold border-b-2 border-brand-yellow hover:text-brand-yellow transition-colors pb-1">
            원두 이야기 더보기
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default MainSection1;
