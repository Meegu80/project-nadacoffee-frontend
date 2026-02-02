import { Outlet } from "react-router";
import AdminSidebar from "../components/admin/AdminSidebar.tsx";
import ScrollToTop from "../components/ScrollToTop";

function AdminLayout() {
   return (
      <div className="min-h-screen bg-[#F5F5F5] flex">
         <ScrollToTop />
         <AdminSidebar />

         <main className="flex-1 ml-64 min-w-0">
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
               <h1 className="font-bold text-lg text-[#222222]">
                  관리자 페이지
               </h1>
               <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                     관리자님, 환영합니다.
                  </span>
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
