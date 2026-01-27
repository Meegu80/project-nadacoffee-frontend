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
    
    // 관리자 여부 확인
    const isAdmin = user?.email === "knitterronin@nate.com";

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
                { name: 'Coffee', path: '/menu/coffee' },
                { name: 'Beverage', path: '/menu/beverage' },
                { name: 'Dessert', path: '/menu/dessert' },
                { name: 'ND\'s Choice', path: '/menu/choice' },
            ]
        },
        {
            name: 'NEWS/EVENT',
            path: '/news/news',
            subItems: [
                { name: 'News', path: '/news/news' },
                { name: 'Event', path: '/news/event' },
            ]
        },
        {
            name: '고객지원',
            path: '/support/notice',
            subItems: [
                { name: '공지사항', path: '/support/notice' },
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
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`transition-all duration-300 ${isNavbarActive ? 'py-4' : 'py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Grid Layout: 12컬럼 (2 + 7 + 3) */}
                    <div className="grid grid-cols-12 items-center">
                        
                        {/* 1. Logo (2컬럼) */}
                        <div className="col-span-6 md:col-span-2 flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <img src={logoImg} alt="NERDA COFFEE" className="h-12 w-auto object-contain" />
                            </Link>
                        </div>

                        {/* 2. Main Nav (7컬럼) */}
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

                        {/* 3. Right Actions (3컬럼) */}
                        <div className="hidden md:flex col-span-3 justify-end items-center space-x-4 border-l pl-6 border-brand-gray h-8">
                            {user ? (
                                <div className="flex items-center space-x-5">
                                    {isAdmin && (
                                        <Link to="/admin" className="flex flex-col items-center text-brand-dark hover:text-brand-yellow transition-colors" title="관리자">
                                            <Settings size={20} />
                                            <span className="text-[10px] font-black mt-0.5">ADMIN</span>
                                        </Link>
                                    )}
                                    <Link to="/mypage" className="flex flex-col items-center text-brand-dark hover:text-brand-yellow transition-colors" title="마이페이지">
                                        <User size={20} />
                                        <span className="text-[10px] font-black mt-0.5">MY</span>
                                    </Link>
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

            {/* Mega Menu: 상단과 동일한 2 + 7 + 3 구조 적용 */}
            <div 
                className={`hidden md:block absolute left-0 w-full bg-white border-t border-gray-100 shadow-lg transition-all duration-300 overflow-hidden ${isHovered ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-12">
                        {/* 1. Logo 영역 빈 공간 (2컬럼) */}
                        <div className="col-span-2"></div>

                        {/* 2. 서브 메뉴 영역 (7컬럼) - 상단 메뉴와 정확히 일치 */}
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

                        {/* 3. 버튼 영역 빈 공간 (3컬럼) */}
                        <div className="col-span-3"></div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (기존 로직 유지) */}
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
                                    <div className="flex gap-2">
                                        {isAdmin && (
                                            <Link to="/admin" className="flex-1 flex items-center justify-center space-x-2 bg-brand-dark text-brand-yellow font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>
                                                <Settings size={18} />
                                                <span>ADMIN</span>
                                            </Link>
                                        )}
                                        <Link to="/mypage" className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-brand-dark font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>
                                            <User size={18} />
                                            <span>MY</span>
                                        </Link>
                                    </div>
                                    <Link to="/cart" className="flex items-center justify-center space-x-2 bg-gray-100 text-brand-dark font-bold rounded-lg py-3" onClick={() => setIsMenuOpen(false)}>
                                        <ShoppingBag size={18} />
                                        <span>장바구니</span>
                                    </Link>
                                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center justify-center space-x-2 bg-red-50 text-red-500 font-bold rounded-lg py-3">
                                        <LogOut size={18} />
                                        <span>로그아웃</span>
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
