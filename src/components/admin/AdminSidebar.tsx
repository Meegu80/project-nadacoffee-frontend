import { Link, useLocation, useNavigate } from "react-router";
import {
   MdDashboard,
   MdPeople,
   MdCategory,
   MdShoppingBag,
   MdAssignment,
   MdLogout,
} from "react-icons/md";
import { useAuthStore } from "../../stores/useAuthStore.ts";

function AdminSidebar() {
   const location = useLocation();
   const navigate = useNavigate();
   const { logout } = useAuthStore();

   const menuItems = [
      { name: "대시보드", path: "/admin", icon: MdDashboard },
      { name: "회원 관리", path: "/admin/members", icon: MdPeople },
      { name: "카테고리 관리", path: "/admin/categories", icon: MdCategory },
      { name: "상품 관리", path: "/admin/products", icon: MdShoppingBag },
      { name: "주문 관리", path: "/admin/orders", icon: MdAssignment },
   ];

   return (
      <aside className="w-64 bg-[#222222] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-[#333]">
         <div className="h-16 flex items-center px-6 border-b border-[#333]">
            {/* [수정] Navbar와 동일한 텍스트 로고 스타일 적용 */}
            <Link
               to="/"
               className="flex items-center gap-1 group">
               <span className="text-xl font-black tracking-tighter uppercase italic text-white">
                  Nada<span className="text-brand-yellow">Coffee</span>
               </span>
               <span className="text-[10px] font-black bg-white/10 text-gray-400 px-1.5 py-0.5 rounded ml-1 mt-1">
                  ADMIN
               </span>
            </Link>
         </div>

         <nav className="flex-1 py-6 px-3 space-y-1">
            {menuItems.map(item => {
               const isActive =
                  item.path === "/admin"
                     ? location.pathname === "/admin"
                     : location.pathname === item.path ||
                       location.pathname.startsWith(item.path + "/");
               return (
                  <Link
                     key={item.name}
                     to={item.path}
                     className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                           ? "bg-[#FFD400] text-[#222222]"
                           : "text-gray-400 hover:bg-[#333] hover:text-white"
                     }`}>
                     <item.icon className="w-5 h-5" />
                     {item.name}
                  </Link>
               );
            })}
         </nav>

         <div className="p-4 border-t border-[#333]">
            <button
               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
               onClick={() => {
                  logout();
                  navigate("/login");
               }}>
               <MdLogout className="w-5 h-5" />
               로그아웃
            </button>
         </div>
      </aside>
   );
}

export default AdminSidebar;
