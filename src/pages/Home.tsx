import { motion } from "framer-motion";
import { Link } from "react-router";
import MainSection1 from "../components/home/MainSection1";
import MainSection2 from "../components/home/MainSection2";
import MainSection3 from "../components/home/MainSection3";

function Home() {
    return (
       <div className="relative">
          {/* Hero Section */}
          <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
             {/* YouTube Background Video */}
             <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b
                from-black/60 via-transparent to-black/80 z-10" />
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                   <iframe
                      className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2
                      opacity-70"
                      src="https://www.youtube-nocookie.com/embed/RzkfAlV0fEI?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=RzkfAlV0fEI&modestbranding=1&iv_load_policy=3&playsinline=1&html5=1"
                      title="NadaCoffee Background Video"
                      allow="autoplay; encrypted-media"
                                         />
                </div>
             </div>

             <div className="relative z-20 text-center px-4 w-full max-w-4xl">
                <motion.div
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}>
                   <h2 className="text-brand-yellow font-bold text-xl md:text-2xl mb-4 tracking-widest">
                      SINCE 2006
                   </h2>
                   <h1 className="text-white text-5xl md:text-8xl font-black mb-8 leading-tight">
                      커피를 <span className="text-brand-yellow">커피답게</span>
                   </h1>
                   <p className="text-gray-300 text-lg md:text-xl mb-16 font-medium max-w-3xl mx-auto">
                      나다커피는 영화 해바라기의 명대사 "나다 이 OO야"에서
                      영감을 받아 창립한 브랜드입니다.
                      <br />
                      모두가 즐길 수 있는 최고의 커피 문화를 만듭니다, 다만
                      병진이 형은 나가있어.
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
                      <Link to="/brand/about" className="flex flex-col items-center gap-4 group cursor-pointer">
                         <p className="text-white font-black text-xl tracking-widest uppercase group-hover:text-brand-yellow transition-colors">
                            Our Story
                         </p>
                         <div className="w-full bg-brand-yellow/50 text-white/90 py-3 font-bold text-base rounded-[8px] shadow-lg backdrop-blur-sm border border-white/10 text-center group-hover:bg-brand-yellow group-hover:text-brand-dark transition-all">
                            브랜드 스토리
                         </div>
                      </Link>
                      <Link to="/menu" className="flex flex-col items-center gap-4 group cursor-pointer">
                         <p className="text-white font-black text-xl tracking-widest uppercase group-hover:text-brand-yellow transition-colors">
                            Fresh Menu
                         </p>
                         <div className="w-full bg-brand-yellow/50 text-white/90 py-3 font-bold text-base rounded-[8px] shadow-lg backdrop-blur-sm border border-white/10 text-center group-hover:bg-brand-yellow group-hover:text-brand-dark transition-all">
                            메뉴 둘러보기
                         </div>
                      </Link>
                      <Link to="/support/shop" className="flex flex-col items-center gap-4 group cursor-pointer">
                         <p className="text-white font-black text-xl tracking-widest uppercase group-hover:text-brand-yellow transition-colors">
                            Find Us
                         </p>
                         <div className="w-full bg-brand-yellow/50 text-white/90 py-3 font-bold text-base rounded-[8px] shadow-lg backdrop-blur-sm border border-white/10 text-center group-hover:bg-brand-yellow group-hover:text-brand-dark transition-all">
                            매장 찾기
                         </div>
                      </Link>
                   </div>
                </motion.div>
             </div>

             {/* 
                [Mouse Scroll Animation Section]
                위에서 Fade-in 하며 나타나 아래로 내려가며 사라지는 연출
             */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                   <motion.div
                      animate={{
                         y: [-4, 0, 8], // 약간 위에서 시작하여 아래로 이동
                         opacity: [0, 1, 0], // 나타났다가(Fade-in) 사라짐(Fade-out)
                      }}
                      transition={{
                         duration: 2, // 전체 주기를 2초로 설정
                         repeat: Infinity,
                         repeatType: "loop",
                         times: [0, 0.2, 1], // 0% 시점에 투명, 20% 시점에 완전 노출, 100% 시점에 사라짐
                         ease: "easeInOut",
                      }}
                      className="w-1 h-2 bg-white rounded-full"
                   />
                </div>
                <span className="text-white/60 text-[14px] font-bold tracking-[0.2em] uppercase">
                   SCROLL DOWN
                </span>
             </div>
          </section>

          {/* Main Sections */}
          <MainSection1 />
          <MainSection2 />
          <MainSection3 />
       </div>
    );
}

export default Home;
