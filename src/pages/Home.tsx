import { motion } from "framer-motion";
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                   <iframe
                      className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 opacity-70"
                      src="https://www.youtube-nocookie.com/embed/RzkfAlV0fEI?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=RzkfAlV0fEI&modestbranding=1&iv_load_policy=3&playsinline=1&html5=1"
                      title="NadaCoffee Background Video"
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
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
                      나다커피는 영화 해바라기의 명대사 "나다 이 띱때꺄"에서
                      영감을 받아 창립한 브랜드입니다.
                      <br />
                      모두가 즐길 수 있는 최고의 커피 문화를 만듭니다, 다만
                      병진이 형은 나가있어.
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
                      <div className="flex flex-col items-center gap-4">
                         <p className="text-white font-black text-xl tracking-widest uppercase">
                            Our Story
                         </p>
                         <div className="w-full bg-brand-yellow/50 text-white/90 py-3 font-bold text-base rounded-[8px] shadow-lg backdrop-blur-sm border border-white/10 text-center">
                            브랜드 스토리
                         </div>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                         <p className="text-white font-black text-xl tracking-widest uppercase">
                            Fresh Menu
                         </p>
                         <div className="w-full bg-brand-yellow/50 text-white/90 py-3 font-bold text-base rounded-[8px] shadow-lg backdrop-blur-sm border border-white/10 text-center">
                            메뉴 둘러보기
                         </div>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                         <p className="text-white font-black text-xl tracking-widest uppercase">
                            Find Us
                         </p>
                         <div className="w-full bg-brand-yellow/50 text-white/90 py-3 font-bold text-base rounded-[8px] shadow-lg backdrop-blur-sm border border-white/10 text-center">
                            매장 찾기
                         </div>
                      </div>
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

          {/* Promotions / Featured */}
          <section className="py-24 bg-gray-50">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16">
                   <div>
                      <span className="text-brand-yellow font-bold tracking-widest">
                         WHAT'S NEW
                      </span>
                      <h2 className="text-4xl md:text-5xl font-black mt-2">
                         지금 가장 핫한 메뉴
                      </h2>
                   </div>
                   <button className="mt-4 md:mt-0 text-gray-400 hover:text-brand-dark font-bold flex items-center transition-colors">
                      전체 메뉴 보기 <span className="ml-2">→</span>
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {[
                      {
                         title: "벨지움 초코 라떼",
                         desc: "깊고 진한 벨기에산 초콜릿의 풍미",
                         img: "https://images.unsplash.com/photo-1544787210-2213d84ad960?auto=format&fit=crop&q=80&w=800",
                      },
                      {
                         title: "딸기 라떼",
                         desc: "신선한 딸기가 듬뿍 들어간 시즌 메뉴",
                         img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800",
                      },
                      {
                         title: "돌체 라떼",
                         desc: "부드러운 연유와 에스프레소의 만남",
                         img: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800",
                      },
                   ].map((item, idx) => (
                      <motion.div
                         key={idx}
                         whileHover={{ y: -10 }}
                         className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                         <div className="h-64 overflow-hidden">
                            <img
                               src={item.img}
                               alt={item.title}
                               className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                         </div>
                         <div className="p-8">
                            <h4 className="text-xl font-bold mb-2">
                               {item.title}
                            </h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                               {item.desc}
                            </p>
                         </div>
                      </motion.div>
                   ))}
                </div>
             </div>
          </section>
       </div>
    );
}

export default Home;
