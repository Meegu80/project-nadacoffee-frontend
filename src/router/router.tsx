import Layout from "../layouts/Layout.tsx";
import { createBrowserRouter, Navigate } from "react-router";
import PrivateRoute from "../components/common/PrivateRoute.tsx";
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
import AdminRoute from "../components/common/AdminRoute.tsx";
import AdminDashboard from "../pages/(admin)/AdminDashboard.tsx";
import AdminMemberList from "../pages/(admin)/members/AdminMemberList.tsx";
import AdminMemberNew from "../pages/(admin)/members/AdminMemberNew.tsx";
import AdminMemberEdit from "../pages/(admin)/members/AdminMemberEdit.tsx";
import AdminCategoryList from "../pages/(admin)/categories/AdminCategoryList.tsx";
import AdminCategoryNew from "../pages/(admin)/categories/AdminCategoryNew.tsx";
import AdminCategoryDetail from "../pages/(admin)/categories/AdminCategoryDetail.tsx";
import MyPage from "../pages/mypage/MyPage.tsx";
import OrderDetail from "../pages/mypage/OrderDetail.tsx";
import AdminProductList from "../pages/(admin)/products/AdminProductList.tsx";
import AdminProductNew from "../pages/(admin)/products/AdminProductNew.tsx";
import AdminProductDetail from "../pages/(admin)/products/AdminProductDetail.tsx";
import AdminOrderList from "../pages/(admin)/orders/AdminOrderList.tsx";
import AdminOrderDetail from "../pages/(admin)/orders/AdminOrderDetail.tsx";
import AdminInquiryList from "../pages/(admin)/inquiries/AdminInquiryList.tsx";
import AdminInquiryDetail from "../pages/(admin)/inquiries/AdminInquiryDetail.tsx";



const router = createBrowserRouter([
   {
      path: "/",
      element: <Layout />,
      children: [
         // 메인 및 공통 페이지
         { index: true, element: <Home /> },
         { path: "login", element: <LoginPage /> },
         { path: "signup", element: <SignUp /> },

         // 쇼핑 관련 페이지 (로그인 필요)
         { path: "cart", element: <PrivateRoute><Cart /></PrivateRoute> },
         {
            path: "payment",
            children: [
               { index: true, element: <PrivateRoute><Checkout /></PrivateRoute> },
               { path: "success", element: <PrivateRoute><SuccessPage /></PrivateRoute> },
               { path: "fail", element: <PrivateRoute><FailPage /></PrivateRoute> },
            ],
         },

         // 브랜드 및 메뉴 페이지
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

         // 고객지원 및 마이페이지
         { path: "news/news", element: <News /> },
         { path: "news/event", element: <Event /> },
         { path: "support/notice", element: <Notice /> },
         { path: "support/contact", element: <Contact /> },
         { path: "support/location", element: <LocationPage /> },
         { path: "support/shop", element: <SearchShop /> },
         {
            path: "mypage",
            // [수정] element를 MyPage로 변경하여 하위 경로들이 정상적으로 렌더링되도록 함
            element: <PrivateRoute><MyPage /></PrivateRoute>,
            children: [
               {
                  index: true,
                  element: <Navigate to="/mypage/order" replace />,
               },
               { path: "order", element: <MyPage /> },
               { path: "cancel", element: <MyPage /> },
               { path: "point", element: <MyPage /> },
               { path: "profile", element: <MyPage /> },
               { path: "edit", element: <MyPage /> },
               { path: "password", element: <MyPage /> },
               { path: "review", element: <MyPage /> },
               { path: "orders/:id", element: <OrderDetail /> },
            ],
         },
      ],
   },
   {
      path: "/admin",
      element: <AdminRoute><AdminLayout /></AdminRoute>,
      children: [
         // 관리자 대시보드 및 관리 페이지
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
            children: [
               { index: true, element: <AdminOrderList /> },
               { path: ":id", element: <AdminOrderDetail /> },
            ],
         },
         {
            path: "inquiries",
            children: [
               { index: true, element: <AdminInquiryList /> },
               { path: ":id", element: <AdminInquiryDetail /> },
            ],
         },
      ],
   },
]);

export default router;
