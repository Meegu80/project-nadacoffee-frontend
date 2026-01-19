import React, { useState } from 'react';
import { useCart } from '../stores/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard as CardIcon, MapPin, User, CheckCircle } from 'lucide-react';

const CheckoutPage: React.FC = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Mock Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        setIsComplete(true);
        setTimeout(() => {
            clearCart();
            navigate('/', { state: { orderSuccess: true } });
        }, 2000);
    };

    if (cartItems.length === 0 && !isComplete) {
        navigate('/menu');
        return null;
    }

    if (isComplete) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 transition-colors px-4 pb-20">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle size={48} className="text-green-500" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">주문이 완료되었습니다!</h1>
                <p className="text-gray-500 mb-8">맛있게 준비해서 보내드리겠습니다.</p>
                <div className="animate-pulse text-sm text-brand-yellow font-bold">
                    잠시 후 홈으로 이동합니다...
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">결제하기</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Payment Form */}
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <User size={20} className="text-brand-yellow" />
                                주문자 정보
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">이름</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 focus:outline-none focus:border-brand-yellow"
                                        placeholder="홍길동"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">연락처</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 focus:outline-none focus:border-brand-yellow"
                                        placeholder="010-1234-5678"
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <MapPin size={20} className="text-brand-yellow" />
                                배송지 정보
                            </h2>
                            <div>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 focus:outline-none focus:border-brand-yellow"
                                    placeholder="상세 주소를 입력해주세요"
                                    required
                                />
                            </div>
                        </section>

                        <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <CardIcon size={20} className="text-brand-yellow" />
                                결제 정보
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">카드 번호</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 focus:outline-none focus:border-brand-yellow"
                                        placeholder="0000-0000-0000-0000"
                                        required
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">유효기간</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            value={formData.expiry}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 focus:outline-none focus:border-brand-yellow"
                                            placeholder="MM/YY"
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">CVC</label>
                                        <input
                                            type="text"
                                            name="cvc"
                                            value={formData.cvc}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 focus:outline-none focus:border-brand-yellow"
                                            placeholder="123"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary & Submit */}
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">주문 내역</h2>
                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.product.id} className="flex justify-between items-start text-sm">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{item.product.name}</p>
                                            <p className="text-gray-500">{item.quantity}개</p>
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {(parseInt(item.product.price.replace(/,/g, '')) * item.quantity).toLocaleString()}원
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-700 pt-4 space-y-2">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-gray-900 dark:text-white">총 결제 금액</span>
                                    <span className="text-brand-yellow font-black text-2xl">{cartTotal.toLocaleString()}원</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="w-full mt-8 py-4 bg-brand-yellow text-brand-black font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-400/20 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <span>결제 처리 중...</span>
                                ) : (
                                    <>
                                        <span>{cartTotal.toLocaleString()}원 결제하기</span>
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
