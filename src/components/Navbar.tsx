import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Link, useLocation } from 'react-router';
import { Menu, X, User, LogIn, Settings, ShoppingBag, LogOut } from 'lucide-react';
import logoImg from '../assets/logo/logo.png';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    const isAdmin = user?.role === "ADMIN";
    const textColorClass = isNavbarActive ? 'text-brand-brown' : 'text-white/80';

    const navLinks = [
        { name: 'BRAND', path: '/brand/about', subItems: [{ name: 'ABOUT US', path: '/brand/about' }, { name: 'DEEP FRESHING 공법', path: '/brand/process' }] },
        { name: 'MENU', path: '/menu', subItems: [{ name: '전체', path: '/menu' }, { name: '논커피라떼', path: '/menu/non-coffee' }, { name: '디저트', path: '/menu/dessert' }, { name: '밀크쉐이크', path: '/menu/shake' }, { name: '에이드_주스', path: '/menu/ade' }, { name: '차', path: '/menu/tea' }, { name: '커피_더치', path: '/menu/coffee' }, { name: '프라페_스무디', path: '/menu/frappe' }] },
        { name: 'NEWS/EVENT', path: '/news/news', subItems: [{ name: '공지사항', path: '/support/notice' }, { name: 'News', path: '/news/news' }, { name: 'Event', path: '/news/event' }] },
        { name: 'SUPPORT', path: '/support/contact', subItems: [{ name: '문의하기', path: '/support/contact' }, { name: '오시는 길', path: '/support/location' }, { name: '매장찾기', path: '/support/shop' }] },
    ];

    return (
        <nav 
            className={`fixed w-full z-50 transition-all duration-300 ${isNavbarActive ? 'bg-white shadow-md' : 'bg-transparent'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`transition-all duration-300 ${isNavbarActive ? 'py-4' : 'py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-12 items-center">
                        
                        <div className="col-span-6 md:col-span-2 flex items-center">
                            <Link to="/" className="flex items-center gap-2 group">
                                <img src={logoImg} alt="NADA COFFEE" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                            </Link>
                        </div>

                        <div className="hidden md:flex col-span-7 justify-center">
                            <div className="grid grid-cols-4 w-full max-w-2xl">
                                {navLinks.map((link) => (
                                    <div key={link.name} className="text-center relative group">
                                        <Link to={link.path} className={`inline-block py-4 text-lg font-black transition-all duration-200 origin-center hover:text-brand-yellow hover:scale-125 ${textColorClass}`}>{link.name}</Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:flex col-span-3 justify-end items-center space-x-4 border-l pl-6 border-brand-gray h-8">
                            {user ? (
                                <div className="flex items-center space-x-5">
                                    {isAdmin && (
                                        <Link to="/admin" className={`flex flex-col items-center hover:text-brand-yellow transition-colors ${textColorClass}`} title="관리자">
                                            <Settings size={20} />
                                            <span className="text-[10px] font-black mt-0.5">ADMIN</span>
                                        </Link>
                                    )}
                                    
                                    {/* My Page: 드롭다운 제거, 단순 링크로 변경 */}
                                    <Link to="/mypage" className={`flex flex-col items-center hover:text-brand-yellow transition-colors ${textColorClass}`}>
                                        <User size={20} />
                                        <span className="text-[10px] font-black mt-0.5">MY</span>
                                    </Link>

                                    <Link to="/cart" className={`flex flex-col items-center hover:text-brand-yellow transition-colors relative ${textColorClass}`} title="장바구니">
                                        <ShoppingBag size={20} />
                                        <span className="text-[10px] font-black mt-0.5">CART</span>
                                    </Link>
                                    <button onClick={logout} className={`flex flex-col items-center hover:text-red-500 transition-colors ${textColorClass}`} title="로그아웃">
                                        <LogOut size={20} />
                                        <span className="text-[10px] font-black mt-0.5">OUT</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className={`relative flex items-center space-x-1 text-sm font-bold hover:text-brand-yellow transition-colors ${textColorClass}`}>
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

                        <div className="md:hidden col-span-6 flex justify-end">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`${isNavbarActive ? 'text-brand-brown' : 'text-white'} p-2`}>
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mega Menu */}
            <div className={`hidden md:block absolute left-0 w-full bg-white border-t border-gray-100 shadow-lg transition-all duration-300 overflow-hidden ${isHovered ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
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
                                                    <Link to={sub.path} onClick={() => setIsHovered(false)} className="text-base text-gray-500 hover:text-brand-yellow font-medium transition-colors block py-1">{sub.name}</Link>
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
        </nav>
    );
};

export default Navbar;
