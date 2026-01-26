import { motion } from "framer-motion";

function MainSection2() {
  return (
    <section className="py-20 bg-brand-white">
      <div className="container mx-auto px-4 flex flex-col md:flex-row-reverse items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
           <div className="h-96 bg-gray-100 rounded-3xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop" 
                alt="Barista" 
                className="w-full h-full object-cover"
              />
           </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2"
        >
          <span className="text-brand-yellow font-bold tracking-widest mb-2 block">EXPERT BARISTA</span>
          <h2 className="text-4xl font-black mb-6 leading-tight">
            전문 바리스타의<br/>정성 어린 한 잔
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8 text-lg">
            최고의 원두도 누가 내리느냐에 따라 맛이 달라집니다. 
            Nerda의 모든 바리스타는 전문 교육 과정을 이수하여, 
            언제나 완벽한 밸런스의 커피를 제공합니다.
          </p>
          <button className="text-brand-dark font-bold border-b-2 border-brand-yellow hover:text-brand-yellow transition-colors pb-1">
            아카데미 알아보기
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default MainSection2;
