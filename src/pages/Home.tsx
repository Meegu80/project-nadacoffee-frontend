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
                            src="https://www.youtube-nocookie.com/embed/-6WXSOhcM98?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=-6WXSOhcM98&modestbranding=1&iv_load_policy=3&playsinline=1&html5=1"
                            title="Compose Coffee Background Video"
                            allow="autoplay; encrypted-media"
                            frameBorder="0"
                        />
                    </div>
                </div>

                <div className="relative z-20 text-center px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-brand-yellow font-bold text-xl md:text-2xl mb-4 tracking-widest">
                            SINCE 2006
                        </h2>
                        <h1 className="text-white text-5xl md:text-8xl font-black mb-8 leading-tight">
                            커피를 <span className="text-brand-yellow">커피답게</span>
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl mb-12 font-medium">
                            나다커피는 영화 해바라기의 명대사 "나다 이 띱때꺄"에서 영감을 받아 창립한 브랜드입니다.<br />
                            모두가 즐길 수 있는 최고의 커피 문화를 만듭니다, 다만 병진이 형은 나가있어.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-brand-yellow text-brand-dark px-10 py-4 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 transition-all"
                        >
                            브랜드 스토리 보기
                        </motion.button>
                    </motion.div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white rounded-full" />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <h3 className="text-brand-yellow text-6xl font-black italic">11<span className="text-2xl not-italic ml-1">th</span></h3>
                            <p className="text-xl font-bold">ANNIVERSARY</p>
                            <p className="text-gray-500">11년의 역사와 노하우</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            <h3 className="text-brand-yellow text-6xl font-black italic">3100<span className="text-2xl not-italic ml-1">+</span></h3>
                            <p className="text-xl font-bold">STORES</p>
                            <p className="text-gray-500">전국 3,100여 개 가맹점</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                        >
                            <h3 className="text-brand-yellow text-6xl font-black italic">12M<span className="text-2xl not-italic ml-1">+</span></h3>
                            <p className="text-xl font-bold">APP MEMBERS</p>
                            <p className="text-gray-500">1,200만 명의 선택</p>
                        </motion.div>
                    </div>
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
                            <span className="text-brand-yellow font-bold tracking-widest">WHAT'S NEW</span>
                            <h2 className="text-4xl md:text-5xl font-black mt-2">지금 가장 핫한 메뉴</h2>
                        </div>
                        <button className="mt-4 md:mt-0 text-gray-400 hover:text-brand-dark font-bold flex items-center transition-colors">
                            전체 메뉴 보기 <span className="ml-2">→</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: '벨지움 초코 라떼', desc: '깊고 진한 벨기에산 초콜릿의 풍미', img: 'https://images.unsplash.com/photo-1544787210-2213d84ad960?auto=format&fit=crop&q=80&w=800' },
                            { title: '딸기 라떼', desc: '신선한 딸기가 듬뿍 들어간 시즌 메뉴', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800' },
                            { title: '돌체 라떼', desc: '부드러운 연유와 에스프레소의 만남', img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="h-64 overflow-hidden">
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                </div>
                                <div className="p-8">
                                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
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
