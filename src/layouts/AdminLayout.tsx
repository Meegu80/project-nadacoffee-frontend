import { Outlet, Link, useNavigate } from "react-router";
import AdminSidebar from "../components/admin/AdminSidebar.tsx";
import ScrollToTop from "../components/ScrollToTop";
import { twMerge } from "tailwind-merge";
import { MdHome, MdLaunch, MdLogout, MdPerson } from "react-icons/md";
import { useAuthStore } from "../stores/useAuthStore";
import { useAlertStore } from "../stores/useAlertStore";

function AdminLayout() {
   const navigate = useNavigate();
   const { user, logout } = useAuthStore();

   const gnbLinks = [
      { name: "BRAND", path: "/brand/about" },
      { name: "MENU", path: "/menu" },
      { name: "NEWS", path: "/news/news" },
      { name: "SUPPORT", path: "/support/notice" },
   ];

   const handleLogout = () => {
      useAlertStore.getState().showAlert(
         "로그아웃 하시겠습니까?",
         "로그아웃 확인",
         "info",
         [
            {
               label: "로그아웃", onClick: () => {
                  logout();
                  navigate("/login");
               }
            },
            { label: "취소", onClick: () => { }, variant: "secondary" }
         ]
      );
   };

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
                        target="_blank"
                        className="text-[11px] font-black text-gray-400 hover:text-brand-dark tracking-widest flex items-center gap-1 group"
                     >
                        {link.name}
                        <MdLaunch size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </Link>
                  ))}
               </nav>

               {/* Right: User Info & Logout */}
               <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                     <span className="text-xs font-black text-[#222222]">{user?.name} 관리자님</span>
                     <span className="text-[10px] text-green-500 font-bold uppercase">Online</span>
                  </div>

                  <Link
                     to="/mypage"
                     className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black hover:bg-gray-100 transition-all border border-gray-100"
                     title="마이페이지"
                  >
                     <MdPerson size={18} />
                     <span>MY PAGE</span>
                  </Link>

                  <button
                     onClick={handleLogout}
                     className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all border border-red-100"
                     title="로그아웃"
                  >
                     <MdLogout size={18} />
                     <span>LOGOUT</span>
                  </button>
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
