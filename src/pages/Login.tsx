import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-white dark:bg-zinc-900 font-sans">

            {/* Top Section - Banner Image (35% Height) */}
            <div className="h-[35%] relative w-full overflow-hidden bg-black flex-shrink-0">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1920')", // Top-down coffee view or cozy atmosphere
                        backgroundPosition: 'center 40%'
                    }}
                ></div>
                <div className="absolute inset-0 bg-black/30 z-10"></div>

                {/* Overlay Text */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
                    <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight drop-shadow-lg">
                        NADA COFFEE
                    </h2>
                    <p className="text-base md:text-lg text-brand-yellow font-medium tracking-wide drop-shadow-md">
                        Begin your day with perfection
                    </p>
                </div>

                {/* Back Button (Absolute Top Left) */}
                <Link to="/" className="absolute top-24 left-6 z-30 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <ArrowLeft size={18} />
                    <span className="font-medium text-sm">메인으로</span>
                </Link>
            </div>

            {/* Bottom Section - Login Form (65% Height) */}
            <div className="h-[65%] flex flex-col items-center justify-center px-4 relative">

                <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-5 -mt-8 bg-white dark:bg-zinc-900 px-2 sm:px-0">

                    <div className="text-center mb-2">
                        <h1 className="text-3xl font-bold text-brand-black dark:text-white">사용자 로그인</h1>
                        <p className="text-gray-500 text-sm mt-1">서비스 이용을 위해 로그인해주세요.</p>
                    </div>

                    <form className="space-y-4">
                        <div className="space-y-1">
                            <input
                                type="email"
                                placeholder="이메일 주소"
                                className="w-full h-12 px-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-brand-yellow transition-all dark:text-white"
                            />
                        </div>

                        <div className="space-y-1">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                className="w-full h-12 px-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-brand-yellow transition-all dark:text-white"
                            />
                            <div className="flex justify-end">
                                <a href="#" className="text-xs font-bold text-gray-400 hover:text-brand-black dark:hover:text-brand-yellow">비밀번호 찾기</a>
                            </div>
                        </div>

                        <button className="w-full h-12 bg-brand-yellow text-brand-black font-black rounded-lg text-lg hover:shadow-md hover:bg-yellow-400 transition-all">
                            로그인
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white dark:bg-zinc-900 px-2 text-gray-400">SNS 계정으로 로그인</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google" className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FAE100] hover:brightness-95 transition-all">
                            <span className="font-bold text-xs text-brand-black leading-none">K</span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#03C75A] hover:brightness-95 transition-all">
                            <span className="font-bold text-xs text-white leading-none">N</span>
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-400">아직 회원이 아니신가요? </span>
                        <Link to="/signup" className="font-bold text-brand-black dark:text-brand-yellow hover:underline">
                            회원가입 하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
