import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { reviewApi } from '../../../api/review.api';
import { twMerge } from 'tailwind-merge';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, order }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const product = order?.orderItems?.[0]?.product;

    const submitMutation = useMutation({
        mutationFn: () => reviewApi.createReview({
            orderId: order.id,
            prodId: order.orderItems?.[0]?.product.id,
            rating,
            content
        }),
        onSuccess: (res) => {
            alert(res.message);
            queryClient.invalidateQueries({ queryKey: ['orders'] });

            const prodId = order?.orderItems?.[0]?.product.id;
            if (prodId) {
                navigate(`/menu/${prodId}#reviews`);
            }

            onClose();
            // 리셋
            setRating(5);
            setContent('');
        },
        onError: (err: any) => {
            alert(`리뷰 등록 실패: ${err.message}`);
        }
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-brand-dark italic">Write a Review</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">나다커피의 맛과 향을 기록해주세요.</p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-gray-400 transition-all shadow-sm"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Product Info Summary */}
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                                    <img src={product?.imageUrl || ''} alt="product" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-black text-brand-dark">{product?.name}</h4>
                                    <p className="text-xs font-bold text-gray-400">주문번호: {order.id}</p>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="text-center">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">How was the taste?</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onMouseEnter={() => setHoverRating(num)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(num)}
                                            className="transition-transform active:scale-95"
                                        >
                                            <Star
                                                size={48}
                                                className={twMerge([
                                                    "transition-all duration-200",
                                                    (hoverRating || rating) >= num ? "text-brand-yellow fill-brand-yellow scale-110" : "text-gray-200"
                                                ])}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-4 text-sm font-black text-brand-dark">
                                    {rating === 5 ? "최고예요! 🤩" : rating === 4 ? "좋아요! 😄" : rating === 3 ? "보통이에요 😐" : rating === 2 ? "별로예요 😕" : "아쉬워요 😢"}
                                </p>
                            </div>

                            {/* Text Area */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Review Detail</label>
                                <textarea
                                    rows={4}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="커피의 풍미나 서비스에 대한 솔직한 후기를 남겨주세요."
                                    className="w-full px-6 py-5 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-brand-yellow font-medium text-sm resize-none"
                                />
                            </div>

                            <div className="flex items-start gap-2 text-gray-400">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <p className="text-[10px] font-bold leading-relaxed">작성하신 리뷰는 다른 고객님들께 큰 도움이 됩니다. <br />관리자에 의해 부득이하게 블라인드 처리될 수 있습니다.</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-0">
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isPending || !content.trim()}
                                className="w-full py-5 bg-brand-dark text-white rounded-[25px] font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                                {submitMutation.isPending ? '등록 중...' : '리뷰 등록 완료'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
