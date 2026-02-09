import { Outlet, Link } from "react-router";
import AdminSidebar from "../components/admin/AdminSidebar.tsx";
import ScrollToTop from "../components/ScrollToTop";
import { twMerge } from "tailwind-merge";
import { MdHome, MdLaunch } from "react-icons/md";

function AdminLayout() {
   const gnbLinks = [
      { name: "BRAND", path: "/brand/about" },
      { name: "MENU", path: "/menu" },
      { name: "NEWS", path: "/news/news" },
      { name: "SUPPORT", path: "/support/notice" },
   ];

   return (
      <div className="min-h-screen bg-[#F5F5F5] flex">
         <ScrollToTop />
         <AdminSidebar />

         <main className="flex-1 ml-64 min-w-0">
            <header className={twMerge([
               "h-16 bg-white border-b border-gray-200",
               "flex items-center justify-between px-8",
               "sticky top-0 z-30 shadow-sm"
            ])}>
               {/* Left: Title */}
               <div className="flex items-center gap-4">
                  <h1 className="font-black text-lg text-[#222222] italic uppercase tracking-tighter">
                     Admin <span className="text-brand-yellow">Panel</span>
                  </h1>
               </div>

               {/* Center: User GNB Links */}
               <nav className="hidden xl:flex items-center bg-gray-50 px-6 py-2 rounded-full border border-gray-100 gap-8">
                  <Link to="/" className="text-gray-400 hover:text-brand-dark transition-colors" title="홈페이지 바로가기">
                     <MdHome size={20} />
                  </Link>
                  <div className="w-px h-3 bg-gray-200" />
                  {gnbLinks.map((link) => (
                     <Link 
                        key={link.name} 
                        to={link.path} 
                        target="_blank" // 새 탭에서 열기 (관리 업무 방해 금지)
                        className="text-[11px] font-black text-gray-400 hover:text-brand-dark tracking-widest flex items-center gap-1 group"
                     >
                        {link.name}
                        <MdLaunch size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </Link>
                  ))}
               </nav>

               {/* Right: User Info */}
               <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                     <span className="text-xs font-black text-[#222222]">관리자님</span>
                     <span className="text-[10px] text-green-500 font-bold uppercase">Online</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                     <span className="text-xs font-black text-gray-400">A</span>
                  </div>
               </div>
            </header>

            <div className="p-8">
               <Outlet />
            </div>
         </main>
      </div>
   );
}

export default AdminLayout;
