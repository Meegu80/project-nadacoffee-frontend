import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogIn } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const { theme, toggleTheme } = useThemeStore();

    // Sync local state with store if needed, or just use store directly. 
    // Navbar was using local state for theme, now swapping to store.

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        {
            name: 'BRAND',
            path: '/brand/about', // Default link
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
                { name: 'Beverage', path: '/menu?category=NON-COFFEE' }, // Mapping 'Beverage' to NON-COFFEE for now
                { name: 'Dessert', path: '/menu?category=DESSERT' },
                { name: 'ND\'s Choice', path: '/menu?category=CHOICE' },
            ]
        },
        {
            name: 'NEWS/EVENT',
            path: '/news',
            subItems: [
                { name: 'News', path: '/news' },
                { name: 'Event', path: '/news?type=event' },
            ]
        },
        {
            name: '고객지원',
            path: '/support/notice',
            subItems: [
                { name: '공지사항', path: '/support/notice' },
                { name: '문의하기', path: '/support/contact' },
                { name: '오시는 길', path: '/support/location' },
                { name: '매장찾기', path: '/shop' },
            ]
        },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-zinc-900 shadow-md py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center">
                            <span className={isScrolled ? 'text-brand-black dark:text-white' : 'text-white'}>NADA</span>
                            <span className="text-brand-yellow ml-1 border-2 border-brand-yellow px-1">COFFEE</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {/* Nav Links */}
                        <div className="flex items-baseline space-x-12">
                            {navLinks.map((link) => (
                                <div
                                    key={link.name}
                                    className="relative group"
                                    onMouseEnter={() => setActiveDropdown(link.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        to={link.path}
                                        className={`px-6 py-4 text-xl font-bold transition-colors ${isScrolled
                                            ? 'text-[#4B3621] dark:text-white hover:text-brand-yellow'
                                            : 'text-white hover:text-brand-yellow'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>

                                    {/* Dropdown */}
                                    {link.subItems && (
                                        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 pt-4 w-48 transition-all duration-200 ${activeDropdown === link.name ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl overflow-hidden py-2 border border-gray-100 dark:border-zinc-700">
                                                {link.subItems.map(sub => (
                                                    <Link
                                                        key={sub.name}
                                                        to={sub.path}
                                                        className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-brand-gray dark:hover:bg-zinc-700 hover:text-brand-yellow transition-colors"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-4 border-l pl-6 border-gray-300 dark:border-gray-700">
                            <button onClick={toggleTheme} className={`${isScrolled ? 'text-[#4B3621] dark:text-white' : 'text-white'} hover:text-brand-yellow transition-colors`}>
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <Link to="/login" className={`relative flex items-center space-x-1 text-sm font-bold ${isScrolled ? 'text-[#4B3621] dark:text-white' : 'text-white'} hover:text-brand-yellow transition-colors`}>
                                <LogIn size={18} />
                                <span>로그인</span>
                            </Link>
                            <Link to="/signup" className={`flex items-center space-x-1 text-sm font-bold bg-brand-yellow text-brand-black px-3 py-1.5 rounded-full hover:bg-yellow-400 transition-colors`}>
                                <User size={18} />
                                <span>회원가입</span>
                            </Link>
                        </div>
                    </div>

                    <div className="md:hidden flex items-center space-x-4">
                        <button onClick={toggleTheme} className={`${isScrolled ? 'text-[#4B3621] dark:text-white' : 'text-[#4B3621] dark:text-white'}`}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`${isScrolled ? 'text-[#4B3621] dark:text-white' : 'text-[#4B3621] dark:text-white'} p-2`}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-zinc-800 shadow-lg absolute top-full left-0 w-full h-screen overflow-y-auto animate-in slide-in-from-top duration-300 pb-20">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <div key={link.name} className="border-b border-gray-100 dark:border-zinc-700">
                                <Link
                                    to={link.path}
                                    className="block px-3 py-4 text-base font-bold text-brand-black dark:text-white hover:bg-brand-gray dark:hover:bg-zinc-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                                {link.subItems && (
                                    <div className="bg-gray-50 dark:bg-zinc-900 px-4 py-2 space-y-2">
                                        {link.subItems.map(sub => (
                                            <Link
                                                key={sub.name}
                                                to={sub.path}
                                                className="block py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-yellow"
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
                            <Link to="/login" className="flex items-center justify-center w-full space-x-2 text-brand-black dark:text-white font-bold border border-gray-300 dark:border-gray-600 rounded-lg py-3">
                                <LogIn size={18} />
                                <span>로그인</span>
                            </Link>
                            <Link to="/signup" className="flex items-center justify-center w-full space-x-2 bg-brand-yellow text-brand-black font-bold rounded-lg py-3">
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
