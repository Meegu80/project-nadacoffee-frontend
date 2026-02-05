import Layout from "../layouts/Layout.tsx";
import { createBrowserRouter, redirect } from "react-router";
import Home from "../pages/Home.tsx";
import LoginPage from "../pages/(auth)/LoginPage.tsx";
import SignUp from "../pages/(auth)/SignUp.tsx";
import Cart from "../pages/(shop)/Cart.tsx";
import Checkout from "../pages/payment/Checkout.tsx";
import SuccessPage from "../pages/payment/SuccessPage.tsx";
import FailPage from "../pages/payment/FailPage.tsx";
import AboutUs from "../pages/brand/AboutUs.tsx";
import DeepFreshing from "../pages/brand/DeepFreshing.tsx";
import MenuPage from "../pages/menu/MenuPage.tsx";
import ProductDetail from "../pages/menu/ProductDetail.tsx";
import News from "../pages/news/News.tsx";
import Event from "../pages/news/Event.tsx";
import Notice from "../pages/support/Notice.tsx";
import Contact from "../pages/support/Contact.tsx";
import LocationPage from "../pages/support/LocationPage.tsx";
import SearchShop from "../pages/support/SearchShop.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import { useAuthStore } from "../stores/useAuthStore.ts";
import AdminDashboard from "../pages/(admin)/AdminDashboard.tsx";
import AdminMemberList from "../pages/(admin)/members/AdminMemberList.tsx";
import AdminMemberNew from "../pages/(admin)/members/AdminMemberNew.tsx";
import AdminMemberEdit from "../pages/(admin)/members/AdminMemberEdit.tsx";
import AdminCategoryList from "../pages/(admin)/categories/AdminCategoryList.tsx";
import AdminCategoryNew from "../pages/(admin)/categories/AdminCategoryNew.tsx";
import AdminCategoryDetail from "../pages/(admin)/categories/AdminCategoryDetail.tsx";
import MyPage from "../pages/mypage/MyPage.tsx";
import AdminProductList from "../pages/(admin)/products/AdminProductList.tsx";
import AdminProductNew from "../pages/(admin)/products/AdminProductNew.tsx";
import AdminProductDetail from "../pages/(admin)/products/AdminProductDetail.tsx";
import AdminOrderList from "../pages/(admin)/orders/AdminOrderList.tsx";

export const adminOnlyLoader = () => {
   const { user } = useAuthStore.getState();
   if (!user) {
      alert("관리자 로그인이 필요합니다.");
      return redirect("/login");
   }
   if (user?.role !== "ADMIN") {
      alert("접근 권한이 없습니다.");
      return redirect("/");
   }
   return null;
};

const router = createBrowserRouter([
   {
      path: "/",
      element: <Layout />,
      children: [
         { index: true, element: <Home /> },
         { path: "login", element: <LoginPage /> },
         { path: "signup", element: <SignUp /> },
         { path: "cart", element: <Cart /> },
         {
            path: "payment",
            children: [
               { index: true, element: <Checkout /> },
               { path: "success", element: <SuccessPage /> },
               { path: "fail", element: <FailPage /> },
            ],
         },
         {
            path: "checkout",
            children: [
               { index: true, element: <Checkout /> },
               { path: "success", element: <SuccessPage /> },
               { path: "fail", element: <FailPage /> },
            ],
         },
         { path: "brand/about", element: <AboutUs /> },
         { path: "brand/process", element: <DeepFreshing /> },
         {
            path: "menu",
            children: [
               { index: true, element: <MenuPage /> },
               { path: "coffee", element: <MenuPage /> },
               { path: "non-coffee", element: <MenuPage /> },
               { path: "frappe", element: <MenuPage /> },
               { path: "shake", element: <MenuPage /> },
               { path: "ade", element: <MenuPage /> },
               { path: "tea", element: <MenuPage /> },
               { path: "dessert", element: <MenuPage /> },
            ],
         },
         { path: "products/:id", element: <ProductDetail /> },
         { path: "news/news", element: <News /> },
         { path: "news/event", element: <Event /> },
         { path: "support/notice", element: <Notice /> },
         { path: "support/contact", element: <Contact /> },
         { path: "support/location", element: <LocationPage /> },
         { path: "support/shop", element: <SearchShop /> },
         { path: "mypage", element: <MyPage /> },
      ],
   },
   {
      path: "/admin",
      element: <AdminLayout />,
      children: [
         { index: true, element: <AdminDashboard /> },
         {
            path: "members",
            children: [
               { index: true, element: <AdminMemberList /> },
               { path: "new", element: <AdminMemberNew /> },
               { path: ":id", element: <AdminMemberEdit /> },
            ],
         },
         {
            path: "categories",
            children: [
               { index: true, element: <AdminCategoryList /> },
               { path: "new", element: <AdminCategoryNew /> },
               { path: ":id", element: <AdminCategoryDetail /> },
            ],
         },
         {
            path: "products",
            children: [
               { index: true, element: <AdminProductList /> },
               { path: "new", element: <AdminProductNew /> },
               { path: ":id", element: <AdminProductDetail /> },
            ],
         },
         {
            path: "orders",
            children: [{ index: true, element: <AdminOrderList /> }],
         },
      ],
   },
]);

export default router;
