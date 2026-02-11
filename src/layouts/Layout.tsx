import { twMerge } from "tailwind-merge";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet, useLocation } from "react-router";
import ScrollToTop from "../components/ScrollToTop";

function Layout() {
   const location = useLocation();
   const isHome = location.pathname === "/";
   const isMenu = location.pathname.startsWith("/menu");

   return (
      <div className="flex flex-col min-h-screen">
         <ScrollToTop />
         <Navbar />
         <main className={twMerge(["flex-1", (isHome || isMenu) ? "pt-0" : "pt-[60px]"])}>
            <Outlet />
         </main>
         <Footer />
      </div>
   );
}

export default Layout;
