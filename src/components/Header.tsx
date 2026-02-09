import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";
import { MdShoppingCart, MdPerson, MdLogout, MdMenu } from "react-icons/md";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <header 
      className={twMerge([
        // [수정] z-index를 최상위로 설정 (z-[9999])
        "fixed top-0 left-0 right-0 z-[9999]",
        "flex items-center transition-all duration-500",
        isScrolled 
          ? ["h-20", "bg-white/80", "backdrop-blur-lg", "shadow-[0_8px_30px_rgb(0,0,0,0.04)]"] 
          : ["h-24", "bg-white"]
      ])}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group relative">
          <div className={twMerge(["relative w-11 h-11 bg-brand-dark rounded-2xl flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-brand-yellow/20 transition-all duration-500 group-hover:-rotate-6"])}>
            <span className="text-brand-yellow font-black text-2xl italic relative z-10">N</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-black to-gray-800 opacity-50"></div>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-2xl font-black text-brand-dark tracking-tighter uppercase italic leading-none">Nada<span className="text-brand-yellow">Coffee</span></span>
            <span className="text-[8px] font-black text-gray-300 tracking-[0.3em] uppercase ml-0.5">Premium Roastery</span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center space-x-10">
          {[
            { name: 'Brand', sub: [{n:'About Us', p:'/brand/about'}, {n:'Deep Freshing', p:'/brand/process'}] },
            { name: 'Menu', p: '/menu' },
            { name: 'News', sub: [{n:'News', p:'/news/news'}, {n:'Event', p:'/news/event'}] },
            { name: 'Support', sub: [{n:'Notice', p:'/support/notice'}, {n:'Contact', p:'/support/contact'}, {n:'Location', p:'/support/location'}, {n:'Find Shop', p:'/support/shop'}] }
          ].map((item) => (
            <div key={item.name} className="relative group py-4">
              {item.p ? (
                <Link to={item.p} className="text-sm font-black text-brand-dark/70 hover:text-brand-dark uppercase tracking-widest transition-colors">{item.name}</Link>
              ) : (
                <>
                  <button className="text-sm font-black text-brand-dark/70 hover:text-brand-dark uppercase tracking-widest transition-colors cursor-default">{item.name}</button>
                  <div className={twMerge(["absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-2"])}>
                    {item.sub?.map(s => (<Link key={s.n} to={s.p} className="block px-6 py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-brand-dark transition-colors">{s.n}</Link>))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/cart" className={twMerge(["p-3 text-brand-dark hover:bg-gray-100 rounded-full transition-all relative group"])}><MdShoppingCart size={24} /><span className="absolute top-2 right-2 w-2 h-2 bg-brand-yellow rounded-full scale-0 group-hover:scale-100 transition-transform"></span></Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/mypage" className={twMerge(["flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100"])}><MdPerson size={20} className="text-brand-dark" /><span className="text-xs font-black text-brand-dark hidden md:block">{user.name}님</span></Link>
              {user.role === 'ADMIN' && (<Link to="/admin" className="text-[10px] font-black bg-brand-dark text-brand-yellow px-2 py-1 rounded-md hover:bg-black transition-colors">ADMIN</Link>)}
              <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="로그아웃"><MdLogout size={22} /></button>
            </div>
          ) : (
            <Link to="/login" className={twMerge(["px-8 py-3 bg-brand-dark text-white rounded-full text-sm font-black hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-95"])}>LOGIN</Link>
          )}
          <button className="lg:hidden p-3 text-brand-dark hover:bg-gray-100 rounded-full transition-all"><MdMenu size={24} /></button>
        </div>
      </div>
    </header>
  );
}

export default Header;
