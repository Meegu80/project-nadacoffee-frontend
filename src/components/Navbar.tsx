import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Link, useLocation } from 'react-router';
import { Menu, X, User, LogIn, Settings, ShoppingBag, LogOut } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === "/";
    const isMenu = location.pathname.startsWith("/menu");
    const { user, logout } = useAuthStore();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isNavbarActive = (!isHome && !isMenu) || isScrolled || isHovered || isMenuOpen;
    const isAdmin = user?.role === "ADMIN";
    const textColorClass = isNavbarActive
        ? (isHovered ? 'text-gray-700' : 'text-gray-500')
        : 'text-white/80';

    const navLinks = [
        { name: 'BRAND', path: '/brand/about', subItems: [{ name: 'ABOUT US', path: '/brand/about' }, { name: 'DEEP FRESHING 공법', path: '/brand/process' }] },
        { name: 'MENU', path: '/menu', subItems: [{ name: '전체', path: '/menu' }, { name: '논커피라떼', path: '/menu/non-coffee' }, { name: '디저트', path: '/menu/dessert' }, { name: '밀크쉐이크', path: '/menu/shake' }, { name: '에이드_주스', path: '/menu/ade' }, { name: '차', path: '/menu/tea' }, { name: '커피_더치', path: '/menu/coffee' }, { name: '프라페_스무디', path: '/menu/frappe' }] },
        { name: 'NEWS/EVENT', path: '/news/news', subItems: [{ name: '공지사항', path: '/support/notice' }, { name: 'News', path: '/news/news' }, { name: 'Event', path: '/news/event' }] },
        { name: 'SUPPORT', path: '/support/contact', subItems: [{ name: '문의하기', path: '/support/contact' }, { name: '오시는 길', path: '/support/location' }, { name: '매장찾기', path: '/support/shop' }] },
    ];

    return (
        <nav
            className={twMerge([
                "fixed w-full z-[9999] transition-all duration-300",
                isNavbarActive ? "bg-white shadow-md" : "bg-transparent"
            ])}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={twMerge(["transition-all duration-300", isNavbarActive ? "py-2" : "py-3"])}>
                <div className="w-full px-4 md:pl-[150px] md:pr-10">
                    <div className="flex items-center h-full">
                        {/* Logo Slot */}
                        <div className="w-[200px] flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center gap-2 group whitespace-nowrap">
                                <span className={twMerge([
                                    "text-2xl font-black tracking-tighter uppercase italic transition-colors",
                                    isNavbarActive ? "text-brand-dark" : "text-white"
                                ])}>
                                    Nada<span className="text-brand-yellow">Coffee</span>
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Slot */}
                        <div className="hidden md:flex flex-1 justify-center relative">
                            <div className={twMerge([
                                "flex items-center transition-all duration-500 ease-in-out",
                                isHovered ? "gap-[128px]" : "gap-[48px]"
                            ])}>
                                {navLinks.map((link) => (
                                    <div key={link.name} className="w-32 text-center relative group py-2">
                                        <Link to={link.path} className={twMerge([
                                            "inline-block py-2 text-base font-black transition-all duration-300 relative whitespace-nowrap",
                                            "hover:text-brand-yellow",
                                            textColorClass
                                        ])}>
                                            {link.name}
                                        </Link>
                                        <span className={twMerge([
                                            "absolute left-1/2 w-0 h-0.5 bg-brand-yellow transition-all duration-300 -translate-x-1/2 group-hover:w-full",
                                            isNavbarActive ? "-bottom-2" : "-bottom-3"
                                        ])} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Slot */}
                        <div className="hidden md:flex w-[350px] flex-shrink-0 items-center justify-start border-l pl-6 border-brand-gray h-8">
                            {user ? (
                                <div className="flex items-center space-x-10">
                                    {isAdmin && (
                                        <Link to="/admin" className={twMerge(["flex items-center space-x-1.5 hover:text-brand-yellow transition-colors whitespace-nowrap", textColorClass])}>
                                            <Settings size={20} /><span className="text-[12px] font-black">ADMIN</span>
                                        </Link>
                                    )}
                                    <Link to="/mypage" className={twMerge(["flex items-center space-x-1.5 hover:text-brand-yellow transition-colors whitespace-nowrap", textColorClass])}>
                                        <User size={20} /><span className="text-[12px] font-black">MY</span>
                                    </Link>
                                    <Link to="/cart" className={twMerge(["flex items-center space-x-1.5 hover:text-brand-yellow transition-colors relative whitespace-nowrap", textColorClass])}>
                                        <ShoppingBag size={20} /><span className="text-[12px] font-black">CART</span>
                                    </Link>
                                    <button onClick={logout} className={twMerge(["flex items-center space-x-1.5 hover:text-red-500 transition-colors whitespace-nowrap", textColorClass])}>
                                        <LogOut size={20} /><span className="text-[12px] font-black">OUT</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4 whitespace-nowrap">
                                    <Link to="/login" className={twMerge(["relative flex items-center space-x-1 text-sm font-bold hover:text-brand-yellow transition-colors", textColorClass])}>
                                        <LogIn size={18} /><span>로그인</span>
                                    </Link>
                                    <Link to="/signup" className="flex items-center space-x-1 text-sm font-bold bg-brand-yellow text-brand-dark px-3 py-1.5 rounded-full hover:opacity-80 transition-colors">
                                        <User size={18} /><span>회원가입</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex-1 flex justify-end">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={twMerge([isNavbarActive ? "text-brand-dark" : "text-white", "p-2"])}>
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={twMerge([
                "hidden md:block absolute left-0 w-full bg-white border-t border-gray-100 shadow-lg overflow-hidden",
                "transition-all duration-500",
                isHovered ? "max-h-96 opacity-100 visible delay-300" : "max-h-0 opacity-0 invisible"
            ])}>
                <div className="w-full px-4 md:pl-[150px] md:pr-10 py-4">
                    <div className="flex items-start">
                        <div className="w-[200px] flex-shrink-0" />
                        <div className="flex-1 flex justify-center">
                            <div className={twMerge([
                                "flex transition-all duration-500 ease-in-out",
                                isHovered ? "gap-[128px]" : "gap-[48px]"
                            ])}>
                                {navLinks.map((link) => (
                                    <div key={link.name} className="w-32 text-center">
                                        <ul className="space-y-1.5">
                                            {link.subItems?.map((sub) => (
                                                <li key={sub.name}>
                                                    <Link
                                                        to={sub.path}
                                                        onClick={() => setIsHovered(false)}
                                                        className={twMerge([
                                                            "text-sm font-medium transition-colors block py-0.5 whitespace-nowrap hover:text-brand-yellow",
                                                            isHovered ? "text-gray-700" : "text-gray-500"
                                                        ])}
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
                        <div className="w-[350px] flex-shrink-0" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
