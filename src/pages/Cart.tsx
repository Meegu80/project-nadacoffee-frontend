import React from 'react';
import { useCart } from '../stores/CartContext';
import { Minus, Plus, Trash2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col items-center justify-center text-center px-4 transition-colors">
                <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">장바구니가 비어있습니다</h2>
                <p className="text-gray-500 mb-8">맛있는 커피와 디저트를 담아보세요!</p>
                <Link
                    to="/menu"
                    className="px-8 py-3 bg-brand-yellow text-brand-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-400/20"
                >
                    메뉴 보러가기
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">장바구니 <span className="text-brand-yellow text-xl ml-2">({cartCount})</span></h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.product.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 md:gap-6 border border-gray-100 dark:border-zinc-700 hover:border-brand-yellow/30 transition-colors"
                                >
                                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        <img src={item.product.img} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{item.product.name}</h3>
                                                <p className="text-sm text-gray-500">{item.product.nameEn}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                {(parseInt(item.product.price.replace(/,/g, '')) * item.quantity).toLocaleString()}원
                                            </p>
                                            <div className="flex items-center space-x-3 bg-gray-100 dark:bg-zinc-700 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="p-1 rounded-md hover:bg-white dark:hover:bg-zinc-600 disabled:opacity-30 transition-all"
                                                >
                                                    <Minus size={16} className="text-gray-600 dark:text-gray-300" />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="p-1 rounded-md hover:bg-white dark:hover:bg-zinc-600 transition-all"
                                                >
                                                    <Plus size={16} className="text-gray-600 dark:text-gray-300" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-700 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">주문 결제 금액</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>총 상품금액</span>
                                    <span>{cartTotal.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>배송비</span>
                                    <span>0원</span>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-zinc-700 my-4" />
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">최종 결제 금액</span>
                                    <span className="font-black text-2xl text-brand-yellow">{cartTotal.toLocaleString()}원</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-4 bg-brand-yellow text-brand-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-400/20 flex items-center justify-center space-x-2"
                            >
                                <span>주문하기</span>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
