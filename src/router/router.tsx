import Layout from "../layouts/Layout.tsx";
import { createBrowserRouter } from "react-router";
import Home from "../pages/Home.tsx";
import LoginPage from "../pages/(auth)/LoginPage.tsx";
import SignUp from "../pages/(auth)/SignUp.tsx";
import Cart from "../pages/(shop)/Cart.tsx";
import Checkout from "../pages/checkout/Checkout.tsx";
import AboutUs from "../pages/brand/AboutUs.tsx";
import DeepFreshing from "../pages/brand/DeepFreshing.tsx";
import MenuPage from "../pages/menu/MenuPage.tsx";
import News from "../pages/news/News.tsx";
import Event from "../pages/news/Event.tsx";
import Notice from "../pages/support/Notice.tsx";
import Contact from "../pages/support/Contact.tsx";
import LocationPage from "../pages/support/LocationPage.tsx";
import Shop from "../pages/support/Shop.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "login", element: <LoginPage /> },
            { path: "signup", element: <SignUp /> },
            { path: "cart", element: <Cart /> },
            { path: "checkout", element: <Checkout /> },

            /* BRAND */
            { path: "brand/about", element: <AboutUs /> },
            { path: "brand/process", element: <DeepFreshing /> },

            /* MENU */
            { path: "menu", element: <MenuPage /> },

            /* NEWS */
            { path: "news/news", element: <News /> },
            { path: "news/event", element: <Event /> },

            /* SUPPORT / CUSTOMER */
            { path: "support/notice", element: <Notice /> },
            { path: "support/contact", element: <Contact /> },
            { path: "support/location", element: <LocationPage /> },
            { path: "support/shop", element: <Shop /> },
        ],
    },
]);

export default router;
