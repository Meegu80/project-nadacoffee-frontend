import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Link } from 'react-router';
import { Menu, X, User, LogIn } from 'lucide-react';
import logoImg from '../assets/logo/logo.png';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { user, logout } = useAuthStore();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isNavbarActive = isScrolled || isHovered || isMenuOpen;

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
                { name: 'Coffee', path: '/menu?category=COFFEE' },
                { name: 'Beverage', path: '/menu?category=NON-COFFEE' },
                { name: 'Dessert', path: '/menu?category=DESSERT' },
                { name: 'ND\'s Choice', path: '/menu?category=CHOICE' },
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
                    {/* Grid Layout 적용: 12컬럼 */}
                    <div className="grid grid-cols-12 items-center">

                        {/* 1. 로고 영역 (2컬럼) */}
                        <div className="col-span-6 md:col-span-2 flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <img src={logoImg} alt="NERDA COFFEE" className="h-12 w-auto object-contain" />
                            </Link>
                        </div>

                        {/* 2. 메인 메뉴 영역 (8컬럼) - 중앙 정렬 */}
                        <div className="hidden md:flex col-span-8 justify-center">
                            <div className="grid grid-cols-4 w-full max-w-3xl"> {/* 4개의 메뉴를 균등 분할 */}
                                {navLinks.map((link) => (
                                    <div key={link.name} className="text-center relative group">
                                        <Link
                                            to={link.path}
                                            className={`inline-block py-4 text-xl font-bold transition-all duration-200 origin-center ${isNavbarActive
                                                ? 'text-gray-400 hover:text-brand-yellow hover:scale-150'
                                                : 'text-white/80 hover:text-brand-yellow hover:scale-150'
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. 우측 버튼 영역 (2컬럼) - 우측 정렬 */}
                        <div className="hidden md:flex col-span-2 justify-end items-center space-x-4 border-l pl-6 border-brand-gray h-8">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className={`text-sm font-bold ${isNavbarActive ? 'text-brand-dark' : 'text-white/80'}`}>
                                        {user.name}님
                                    </span>
                                    <button
                                        onClick={logout}
                                        className={`flex items-center space-x-1 text-sm font-bold bg-gray-200 text-brand-dark px-3 py-1.5 rounded-full hover:bg-gray-300 transition-colors`}
                                    >
                                        <span>로그아웃</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className={`relative flex items-center space-x-1 text-sm font-bold ${isNavbarActive ? 'text-brand-dark' : 'text-white/80'} hover:text-brand-yellow transition-colors`}>
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

                        {/* 모바일 메뉴 버튼 (우측 정렬) */}
                        <div className="md:hidden col-span-6 flex justify-end">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`${isNavbarActive ? 'text-brand-brown' : 'text-white'} p-2`}
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Dropdown Menu (Mega Menu) */}
            <div
                className={`hidden md:block absolute left-0 w-full bg-white border-t border-gray-100 shadow-lg transition-all duration-300 overflow-hidden ${isHovered ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* 상단과 동일한 Grid 구조 사용 */}
                    <div className="grid grid-cols-12">
                        {/* 로고 영역 빈 공간 (2컬럼) */}
                        <div className="col-span-2"></div>

                        {/* 서브 메뉴 영역 (8컬럼) - 상단 메뉴와 정확히 일치하는 Grid 사용 */}
                        <div className="col-span-8 flex justify-center">
                            <div className="grid grid-cols-4 w-full max-w-3xl">
                                {navLinks.map((link) => (
                                    <div key={link.name} className="text-center">
                                        <ul className="space-y-3">
                                            {link.subItems?.map((sub) => (
                                                <li key={sub.name}>
                                                    <Link
                                                        to={sub.path}
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

                        {/* 우측 버튼 영역 빈 공간 (2컬럼) */}
                        <div className="col-span-2"></div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white shadow-lg absolute top-full left-0 w-full h-screen overflow-y-auto animate-in slide-in-from-top duration-300 pb-20">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <div key={link.name} className="border-b border-brand-gray">
                                <Link
                                    to={link.path}
                                    className="block px-3 py-4 text-base font-bold text-gray-500 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                                {link.subItems && (
                                    <div className="bg-gray-50 px-4 py-2 space-y-2">
                                        {link.subItems.map(sub => (
                                            <Link
                                                key={sub.name}
                                                to={sub.path}
                                                className="block py-2 text-sm text-gray-500 hover:text-brand-yellow"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                - {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="mt-6 flex flex-col space-y-3 px-3 pb-4">
                            <Link to="/login" className="flex items-center justify-center w-full space-x-2 text-gray-500 font-bold border border-brand-gray rounded-lg py-3">
                                <LogIn size={18} />
                                <span>로그인</span>
                            </Link>
                            <Link to="/signup" className="flex items-center justify-center w-full space-x-2 bg-brand-yellow text-brand-dark font-bold rounded-lg py-3">
                                <User size={18} />
                                <span>회원가입</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
