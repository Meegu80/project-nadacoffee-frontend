import { Link, useLocation, useNavigate } from "react-router";
import {
   MdDashboard,
   MdPeople,
   MdCategory,
   MdShoppingBag,
   MdAssignment,
   MdLogout,
   MdQuestionAnswer
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
      { name: "문의 관리", path: "/admin/inquiries", icon: MdQuestionAnswer }, // [추가]
   ];

   return (
      <aside className="w-64 bg-[#222222] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-[#333]">
         <div className="h-16 flex items-center px-6 border-b border-[#333]">
            <Link to="/" className="flex items-center gap-1 group">
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
               const isDashboard = item.path === "/admin";
               const isActive =
                  isDashboard
                     ? location.pathname === "/admin"
                     : location.pathname === item.path ||
                       location.pathname.startsWith(item.path + "/");
               
               const subMenus = [
                  { name: "최근 주문 내역", hash: "#recent-orders" },
                  { name: "베스트 셀러 TOP 10", hash: "#best-sellers" },
                  { name: "주간 매출 추이", hash: "#sales-trend" },
                  { name: "재고 알림", hash: "#stock-alert" },
               ];

               return (
                  <div key={item.name} className="space-y-1">
                     <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-black transition-all ${
                           isActive
                              ? "bg-brand-yellow text-[#222222] shadow-[0_4px_10px_rgba(255,212,0,0.2)]"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}>
                        <item.icon className={`w-5 h-5 ${isActive ? "text-[#222222]" : "text-gray-500 group-hover:text-white"}`} />
                        {item.name}
                     </Link>
                     
                     {/* 대시보드 하부 메뉴 (내비게이션이 대시보드일 때 표시) */}
                     {isDashboard && isActive && (
                        <div className="ml-10 space-y-1 py-1">
                           {subMenus.map(sub => (
                              <Link
                                 key={sub.name}
                                 to={`/admin${sub.hash}`}
                                 onClick={() => {
                                    window.dispatchEvent(new CustomEvent('admin-dashboard-scroll', { detail: sub.hash }));
                                 }}
                                 className={`block py-2 text-[11px] font-bold transition-colors ${
                                    location.hash === sub.hash 
                                       ? "text-brand-yellow" 
                                       : "text-gray-500 hover:text-gray-300"
                                 }`}
                              >
                                 • {sub.name}
                              </Link>
                           ))}
                        </div>
                     )}
                  </div>
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
