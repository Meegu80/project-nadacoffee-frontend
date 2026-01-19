import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Home from '../pages/Home';
import MenuPage from '../pages/Menu';
import StorePage from '../pages/Shops';
import News from '../pages/News';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import BrandPage from '../pages/Brand';
import SupportPage from '../pages/Support';
import SignUp from '../pages/SignUp';
import LoginPage from '../pages/Login';
import FranchisePage from '../pages/Franchise';
import PartnerPage from '../pages/Partner';

const AppRouter: React.FC = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />

                {/* BRAND */}
                <Route path="/brand/about" element={<BrandPage />} />
                <Route path="/brand/process" element={<BrandPage />} />
                <Route path="/franchise" element={<FranchisePage />} />
                <Route path="/partner" element={<PartnerPage />} />

                {/* MENU */}
                <Route path="/menu" element={<MenuPage />} />

                {/* NEWS */}
                <Route path="/news" element={<News />} />

                {/* SUPPORT / CUSTOMER */}
                <Route path="/support/notice" element={<SupportPage />} />
                <Route path="/support/contact" element={<SupportPage />} />
                <Route path="/support/location" element={<SupportPage />} />

                {/* SHOPS (Mapped to 매장찾기) */}
                <Route path="/shop" element={<StorePage />} />

                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Layout>
    );
};

export default AppRouter;
