import { motion } from "framer-motion";

function MainSection3() {
  return (
    <section className="py-24 bg-brand-dark text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            가맹점 개설 문의
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Nerda Coffee와 함께 성공적인 비즈니스를 시작하세요.<br/>
            체계적인 교육 시스템과 안정적인 물류 공급으로 여러분의 성공을 지원합니다.
          </p>
          <button className="bg-brand-yellow text-brand-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg hover:shadow-yellow-400/20">
            가맹 상담 신청하기
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default MainSection3;
