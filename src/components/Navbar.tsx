import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Link, useLocation } from 'react-router';
import { Menu, X, User, LogIn, Settings, ShoppingBag, LogOut, ChevronDown } from 'lucide-react';
import logoImg from '../assets/logo/logo.png';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMyPageHovered, setIsMyPageHovered] = useState(false);

    const location = useLocation();
    const isHome = location.pathname === "/";

    const { user, logout } = useAuthStore();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isNavbarActive = !isHome || isScrolled || isHovered || isMenuOpen;
    
    // 관리자 여부 확인
    const isAdmin = user?.role === "ADMIN";

    const navLinks = [
        {
            name: 'BRAND',
            path: '/brand/about',
            subItems: [
                { name: 'ABOUT US', path: '/brand/about' },
                { name: 'DEEP FRESHING 공법', path: '/brand/process' },
            ]
        },
        {
            name: 'MENU',
            path: '/menu',
            subItems: [
                { name: '전체', path: '/menu' },
                { name: '논커피라떼', path: '/menu/non-coffee' },
                { name: '디저트', path: '/menu/dessert' },
                { name: '밀크쉐이크', path: '/menu/shake' },
                { name: '에이드_주스', path: '/menu/ade' },
                { name: '차', path: '/menu/tea' },
                { name: '커피_더치', path: '/menu/coffee' },
                { name: '프라페_스무디', path: '/menu/frappe' },
            ]
        },
        {
            name: 'NEWS/EVENT',
            path: '/news/news',
            subItems: [
                { name: '공지사항', path: '/support/notice' },
                { name: 'News', path: '/news/news' },
                { name: 'Event', path: '/news/event' },
            ]
        },
        {
            name: 'SUPPORT',
            path: '/support/contact',
            subItems: [
                { name: '문의하기', path: '/support/contact' },
                { name: '오시는 길', path: '/support/location' },
                { name: '매장찾기', path: '/support/shop' },
            ]
        },
    ];

    return (
        <nav 
            className={`fixed w-full z-50 transition-all duration-300 ${isNavbarActive ? 'bg-white shadow-md' : 'bg-transparent'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsMyPageHovered(false);
            }}
        >
            <div className={`transition-all duration-300 ${isNavbarActive ? 'py-4' : 'py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-12 items-center">
                        
                        {/* 1. Logo */}
                        <div className="col-span-6 md:col-span-2 flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <img src={logoImg} alt="NADA COFFEE" className="h-12 w-auto object-contain" />
                            </Link>
                        </div>

                        {/* 2. Main Nav */}
                        <div className="hidden md:flex col-span-7 justify-center">
                            <div className="grid grid-cols-4 w-full max-w-2xl">
                                {navLinks.map((link) => (
                                    <div key={link.name} className="text-center relative group">
                                        <Link
                                            to={link.path}
                                            className={`inline-block py-4 text-lg font-black transition-all duration-200 origin-center ${isNavbarActive
                                                ? 'text-brand-brown hover:text-brand-yellow hover:scale-125'
                                                : 'text-white/80 hover:text-brand-yellow hover:scale-125'
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Right Actions */}
                        <div className="hidden md:flex col-span-3 justify-end items-center space-x-4 border-l pl-6 border-brand-gray h-8">
                            {user ? (
                                <div className="flex items-center space-x-5">
                                    {isAdmin && (
                                        <Link to="/admin" className="flex flex-col items-center text-brand-dark hover:text-brand-yellow transition-colors" title="관리자">
                                            <Settings size={20} />
                                            <span className="text-[10px] font-black mt-0.5">ADMIN</span>
                                        </Link>
                                    )}
                                    
                                    {/* My Page Dropdown Container */}
                                    <div 
                                        className="relative"
                                        onMouseEnter={() => setIsMyPageHovered(true)}
                                        onMouseLeave={() => setIsMyPageHovered(false)}
                                    >
                                        <Link to="/mypage" className="flex flex-col items-center text-brand-dark hover:text-brand-yellow transition-colors">
                                            <User size={20} />
                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                <span className="text-[10px] font-black">MY</span>
                                                <ChevronDown size={10} className={`transition-transform ${isMyPageHovered ? 'rotate-180' : ''}`} />
                                            </div>
                                        </Link>

                                        {/* Dropdown Menu */}
                                        {isMyPageHovered && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-[60]">
                                                <div className="bg-white shadow-2xl border border-gray-100 rounded-2xl py-3 w-44 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account</p>
                                                        <p className="text-xs font-bold text-brand-dark truncate">{user.name}님</p>
                                                    </div>
                                                    <Link to="/mypage" className="block px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-yellow transition-colors">내 정보 조회</Link>
                                                    <Link to="/mypage/edit" className="block px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-yellow transition-colors">내 정보 수정</Link>
                                                    <Link to="/mypage/password" className="block px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-yellow transition-colors">비밀번호 변경</Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Link to="/cart" className="flex flex-col items-center text-brand-dark hover:text-brand-yellow transition-colors relative" title="장바구니">
                                        <ShoppingBag size={20} />
                                        <span className="text-[10px] font-black mt-0.5">CART</span>
                                        <span className="absolute -top-1 -right-1 bg-brand-yellow text-brand-dark text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">0</span>
                                    </Link>
                                    <button onClick={logout} className="flex flex-col items-center text-brand-dark hover:text-red-500 transition-colors" title="로그아웃">
                                        <LogOut size={20} />
                                        <span className="text-[10px] font-black mt-0.5">OUT</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className={`relative flex items-center space-x-1 text-sm font-bold ${isNavbarActive ? 'text-brand-brown' : 'text-white/80'} hover:text-brand-yellow transition-colors`}>
                                        <LogIn size={18} />
                                        <span>로그인</span>
                                    </Link>
                                    <Link to="/signup" className={`flex items-center space-x-1 text-sm font-bold bg-brand-yellow text-brand-dark px-3 py-1.5 rounded-full hover:opacity-80 transition-colors`}>
                                        <User size={18} />
                                        <span>회원가입</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden col-span-6 flex justify-end">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`${isNavbarActive ? 'text-brand-brown' : 'text-white'} p-2`}>
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mega Menu */}
            <div 
                className={`hidden md:block absolute left-0 w-full bg-white border-t border-gray-100 shadow-lg transition-all duration-300 overflow-hidden ${isHovered && !isMyPageHovered ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-12">
                        <div className="col-span-2"></div>
                        <div className="col-span-7 flex justify-center">
                            <div className="grid grid-cols-4 w-full max-w-2xl">
                                {navLinks.map((link) => (
                                    <div key={link.name} className="text-center">
                                        <ul className="space-y-3">
                                            {link.subItems?.map((sub) => (
                                                <li key={sub.name}>
                                                    <Link 
                                                        to={sub.path}
                                                        onClick={() => setIsHovered(false)}
                                                        className="text-base text-gray-500 hover:text-brand-yellow font-medium transition-colors block py-1"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-3"></div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white shadow-lg absolute top-full left-0 w-full h-screen overflow-y-auto animate-in slide-in-from-top duration-300 pb-20">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <div key={link.name} className="border-b border-brand-gray">
                                <Link to={link.path} className="block px-3 py-4 text-base font-bold text-gray-500 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                                    {link.name}
                                </Link>
                                {link.subItems && (
                                    <div className="bg-gray-50 px-4 py-2 space-y-2">
                                        {link.subItems.map(sub => (
                                            <Link key={sub.name} to={sub.path} className="block py-2 text-sm text-gray-500 hover:text-brand-yellow" onClick={() => setIsMenuOpen(false)}>
                                                - {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="mt-6 flex flex-col space-y-3 px-3 pb-4">
                            {user ? (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <p className="text-xs font-black text-gray-400 uppercase">My Account</p>
                                        <p className="text-lg font-black text-brand-dark">{user.name}님</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 mb-4">
                                        <Link to="/mypage" className="flex items-center px-4 bg-gray-100 text-brand-dark font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>내 정보 조회</Link>
                                        <Link to="/mypage/edit" className="flex items-center px-4 bg-gray-100 text-brand-dark font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>내 정보 수정</Link>
                                        <Link to="/mypage/password" className="flex items-center px-4 bg-gray-100 text-brand-dark font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>비밀번호 변경</Link>
                                    </div>
                                    <div className="flex gap-2">
                                        {isAdmin && (
                                            <Link to="/admin" className="flex-1 flex items-center justify-center space-x-2 bg-brand-dark text-brand-yellow font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>
                                                <Settings size={18} />
                                                <span>ADMIN</span>
                                            </Link>
                                        )}
                                        <Link to="/cart" className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-brand-dark font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>
                                            <ShoppingBag size={18} />
                                            <span>장바구니</span>
                                        </Link>
                                    </div>
                                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="mt-2 flex items-center justify-center space-x-2 bg-red-50 text-red-500 font-bold rounded-lg py-3">
                                        <LogOut size={18} />
                                        <span>로그인아웃</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="flex items-center justify-center w-full space-x-2 text-gray-500 font-bold border border-brand-gray rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>
                                        <LogIn size={18} />
                                        <span>로그인</span>
                                    </Link>
                                    <Link to="/signup" className="flex items-center justify-center w-full space-x-2 bg-brand-yellow text-brand-dark font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>
                                        <User size={18} />
                                        <span>회원가입</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
