import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CreditCard, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart, type Product } from '../stores/CartContext';
import { useNavigate } from 'react-router-dom';

const categories = ['전체', 'COFFEE', 'NON-COFFEE', 'SMOOTHIE & FRAPPE', 'TEA', 'DESSERT'];

// Updated images with more reliable Unsplash IDs
const menuItems: Product[] = [
    {
        id: 1, category: 'COFFEE', name: '아메리카노', nameEn: 'Americano', price: '1,500',
        img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400',
        desc: '나다커피만의 스페셜 블렌딩으로 깊고 진한 맛을 느낄 수 있는 아메리카노입니다. 풍부한 바디감과 깔끔한 뒷맛이 특징입니다.'
    },
    {
        id: 2, category: 'COFFEE', name: '카페라떼', nameEn: 'Cafe Latte', price: '2,900',
        img: 'https://images.unsplash.com/photo-1588775224326-72e6b7b6531d?auto=format&fit=crop&q=80&w=400',
        desc: '진한 에스프레소와 부드러운 우유가 조화로운 카페라떼입니다. 고소한 우유의 풍미가 커피의 쓴맛을 감싸줍니다.'
    },
    {
        id: 3, category: 'COFFEE', name: '바닐라라떼', nameEn: 'Vanilla Latte', price: '3,300',
        img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=400',
        desc: '달콤한 바닐라 시럽이 더해져 기분 좋은 달콤함을 선사하는 바닐라라떼입니다.'
    },
    {
        id: 4, category: 'NON-COFFEE', name: '리얼초코라떼', nameEn: 'Real Chocolate Latte', price: '3,500',
        img: 'https://images.unsplash.com/photo-1544787210-2213d84ad960?auto=format&fit=crop&q=80&w=400',
        desc: '진한 초콜릿의 풍미를 그대로 담은 리얼 초코라떼입니다. 달콤한 휴식이 필요할 때 추천합니다.'
    },
    {
        id: 5, category: 'NON-COFFEE', name: '딸기라떼', nameEn: 'Strawberry Latte', price: '3,500',
        img: 'https://images.unsplash.com/photo-1593443320739-77f74952d060?auto=format&fit=crop&q=80&w=400',
        desc: '상큼한 딸기 과육이 씹히는 딸기라떼입니다. 봄의 싱그러움을 가득 담았습니다.'
    },
    {
        id: 6, category: 'SMOOTHIE & FRAPPE', name: '쿠키초코프라페', nameEn: 'Cookie Choco Frappe', price: '3,900',
        img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400',
        desc: '바삭한 쿠키와 달콤한 초콜릿이 시원하게 갈린 프라페입니다.'
    },
    {
        id: 7, category: 'TEA', name: '자몽허니블랙티', nameEn: 'Grapefruit Honey Black Tea', price: '3,500',
        img: 'https://images.unsplash.com/photo-1576091160550-2173bdd99611?auto=format&fit=crop&q=80&w=400',
        desc: '쌉싸름한 자몽과 향긋한 홍차, 달콤한 꿀이 어우러진 베스트셀러 티입니다.'
    },
    {
        id: 8, category: 'DESSERT', name: '크로와플', nameEn: 'Cro-Waffle', price: '2,500',
        img: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=400',
        desc: '겉은 바삭하고 속은 촉촉한 크로와상 반죽으로 구운 와플입니다.'
    },
];

interface ProductModalProps {
    item: Product;
    onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ item, onClose }) => {
    const [isDescOpen, setIsDescOpen] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        addToCart(item);
        onClose(); // Optional: close modal on add? Or just show feedback. Let's close for now or maybe keep open. 
        // User asked for "add to cart", often implies staying. But let's close to be safe or add a toast.
        // For now, I'll close it to give clear feedback by navigating back or showing the sticky footer update.
        alert(`${item.name}이(가) 장바구니에 담겼습니다.`); // Simple feedback for now
        onClose();
    };

    const handleBuyNow = () => {
        addToCart(item);
        navigate('/checkout');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-64 md:h-80 bg-gray-100">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                        <X size={20} className="text-black" />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs font-bold text-brand-yellow tracking-wider">{item.category}</span>
                            <h2 className="text-2xl font-bold text-brand-black dark:text-white mt-1">{item.name}</h2>
                            <p className="text-gray-400 text-sm">{item.nameEn}</p>
                        </div>
                        <p className="text-2xl font-black text-brand-black dark:text-white">{item.price}원</p>
                    </div>

                    <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <button
                            onClick={() => setIsDescOpen(!isDescOpen)}
                            className="flex justify-between items-center w-full text-left font-bold text-brand-black dark:text-white mb-2"
                        >
                            <span>상세설명</span>
                            {isDescOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <AnimatePresence>
                            {isDescOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-gray-500 text-sm leading-relaxed pb-4">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 py-3.5 rounded-xl border-2 border-brand-yellow text-brand-black dark:text-white font-bold flex items-center justify-center space-x-2 hover:bg-brand-yellow/10 transition-colors"
                        >
                            <ShoppingCart size={20} />
                            <span>장바구니</span>
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 py-3.5 rounded-xl bg-brand-yellow text-brand-black font-bold flex items-center justify-center space-x-2 hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-400/20"
                        >
                            <CreditCard size={20} />
                            <span>바로구매</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const MenuPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<Product | null>(null);
    const itemsPerPage = 4;
    const { addToCart, cartCount } = useCart();
    const navigate = useNavigate();

    const filteredItems = selectedCategory === '전체'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    // Pagination Logic
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setCurrentPage(1); // Reset to page 1 on category change
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const handleQuickAdd = (e: React.MouseEvent, item: Product) => {
        e.stopPropagation();
        addToCart(item);
        alert(`${item.name}이(가) 장바구니에 담겼습니다.`);
    };

    const handleQuickBuy = (e: React.MouseEvent, item: Product) => {
        e.stopPropagation();
        addToCart(item);
        navigate('/checkout');
    };

    return (
        <div className="pt-24 min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-300 pb-24">
            {/* Header */}
            <section className="bg-brand-gray dark:bg-zinc-800 py-20 text-center transition-colors">
                <h2 className="text-brand-yellow font-bold tracking-widest mb-4">MENU</h2>
                <h1 className="text-4xl md:text-5xl font-black text-brand-black dark:text-white">나다커피 메뉴</h1>
            </section>

            {/* Category Tabs */}
            <section className="sticky top-20 z-40 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-gray-800 py-6 transition-colors">
                <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                    <div className="flex justify-center space-x-2 md:space-x-8 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-2 text-sm md:text-base font-bold transition-all border-b-2 ${selectedCategory === cat
                                    ? 'border-brand-yellow text-brand-black dark:text-white'
                                    : 'border-transparent text-gray-400 hover:text-brand-black dark:hover:text-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Menu Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    <AnimatePresence mode='wait'>
                        {currentItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group bg-white dark:bg-zinc-800 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-brand-yellow/30"
                            >
                                <div
                                    className="aspect-square rounded-2xl overflow-hidden bg-brand-gray dark:bg-zinc-700 mb-6 relative cursor-pointer"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-bold border border-white px-4 py-1.5 rounded-full">상세보기</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-bold text-brand-yellow mb-1 block tracking-wider uppercase">{item.category}</span>
                                    <h3
                                        className="text-lg font-bold text-brand-black dark:text-white mb-1 cursor-pointer hover:text-brand-yellow transition-colors"
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="text-gray-400 text-xs mb-3">{item.nameEn}</p>
                                    <p className="text-brand-black dark:text-white font-black text-lg mb-4">{item.price}원</p>

                                    <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                        <button
                                            onClick={(e) => handleQuickAdd(e, item)}
                                            className="p-2 border border-brand-yellow rounded-lg hover:bg-brand-yellow hover:text-brand-black text-brand-black dark:text-white transition-colors"
                                            title="장바구니 담기"
                                        >
                                            <ShoppingCart size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleQuickBuy(e, item)}
                                            className="p-2 bg-brand-yellow rounded-lg text-brand-black font-bold hover:bg-yellow-400 transition-colors"
                                            title="바로 구매"
                                        >
                                            <CreditCard size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-16 flex justify-center items-center space-x-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="p-3 rounded-full border border-gray-200 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-brand-black dark:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <span className="font-bold text-brand-black dark:text-white">
                            {currentPage} <span className="text-gray-400 mx-1">/</span> {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-3 rounded-full border border-gray-200 dark:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-brand-black dark:text-white"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </section>

            {/* Cart Sticky Footer */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
                    >
                        <div className="max-w-7xl mx-auto pointer-events-auto">
                            <div className="bg-brand-black text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-brand-yellow text-brand-black w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </div>
                                    <span className="font-bold hidden md:inline">장바구니에 상품이 담겼습니다.</span>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
                                    >
                                        장바구니
                                    </button>
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="px-6 py-2 bg-brand-yellow text-brand-black hover:bg-yellow-400 rounded-xl font-bold transition-colors"
                                    >
                                        결제하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuPage;
