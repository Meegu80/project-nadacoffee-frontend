import { twMerge } from "tailwind-merge";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet, useLocation } from "react-router";
import ScrollToTop from "../components/ScrollToTop";

function Layout() {
   const location = useLocation();
   const isHome = location.pathname === "/";

   return (
      <div className="flex flex-col min-h-screen">
         <ScrollToTop />
         <Navbar />
         <main className={twMerge(["flex-1", isHome ? "pt-0" : "pt-[60px]"])}>
            <Outlet />
         </main>
         <Footer />
      </div>
   );
}

export default Layout;
