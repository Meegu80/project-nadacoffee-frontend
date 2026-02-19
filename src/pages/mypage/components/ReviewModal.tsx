import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, AlertCircle, ImagePlus, Loader2, Coffee } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { reviewApi, type MyReview } from '../../../api/review.api';
import { uploadImage } from '../../../api/upload.api';
import { useAlertStore } from '../../../stores/useAlertStore';
import { twMerge } from 'tailwind-merge';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order?: any;
    editData?: MyReview | null;
    currentProduct?: any;
    onSuccess?: () => void;
}

interface ReviewImageItem {
    url: string;
    isUploading: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, order, editData, currentProduct, onSuccess }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showAlert } = useAlertStore();
    
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [images, setImages] = useState<ReviewImageItem[]>([]);
    const [hoverRating, setHoverRating] = useState(0);

    const prevOpenRef = useRef(false);
    React.useEffect(() => {
        if (isOpen && !prevOpenRef.current) {
            if (editData) {
                setRating(editData.rating);
                setContent(editData.content);
                setImages(editData.reviewImages?.map(img => ({ url: img.url, isUploading: false })) || []);
            } else {
                setRating(5);
                setContent('');
                setImages([]);
            }
        }
        prevOpenRef.current = isOpen;
    }, [isOpen, editData]);

    const product = currentProduct || editData?.product || order?.orderItems?.[0]?.product;

    // [수정] 순차적 이미지 업로드 핸들러 (안정성 최우선)
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const remainingSlots = 5 - images.length;
        
        if (fileArray.length > remainingSlots) {
            showAlert(`이미지는 최대 5장까지 가능합니다. (현재 ${remainingSlots}장 추가 가능)`, '알림', 'warning');
            return;
        }

        // 1. 즉시 미리보기 생성 및 상태 추가
        const tempItems = fileArray.map(file => ({
            url: URL.createObjectURL(file),
            isUploading: true
        }));
        setImages(prev => [...prev, ...tempItems]);

        // 2. 순차적으로 실제 업로드 진행 (안정성 확보)
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            const tempUrl = tempItems[i].url;

            try {
                console.log(`🚀 [Upload] Starting file ${i + 1}/${fileArray.length}:`, file.name);
                const uploadedUrl = await uploadImage(file, 'reviews');
                
                setImages(prev => prev.map(img => 
                    img.url === tempUrl ? { url: uploadedUrl, isUploading: false } : img
                ));
                successCount++;
            } catch (error: any) {
                console.error(`❌ [Upload] Failed file ${i + 1}:`, error);
                setImages(prev => prev.filter(img => img.url !== tempUrl));
                failCount++;
            } finally {
                URL.revokeObjectURL(tempUrl);
            }
        }

        if (failCount > 0) {
            showAlert(`${failCount}장의 이미지 업로드에 실패했습니다.`, '실패', 'error');
        }
        
        e.target.value = ''; // input 초기화
    }, [images, showAlert]);

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const submitMutation = useMutation({
        mutationFn: () => {
            if (content.trim().length < 10) {
                showAlert('리뷰 내용은 최소 10자 이상 입력해주세요.', '리뷰 안내', 'warning');
                throw new Error('Validation failed');
            }
            if (images.some(img => img.isUploading)) {
                showAlert('이미지 업로드가 진행 중입니다.', '알림', 'info');
                throw new Error('Uploading in progress');
            }

            const finalImageUrls = images.map(img => img.url);

            if (editData) {
                return reviewApi.updateReview(editData.id, {
                    rating: Number(rating),
                    content: content.trim(),
                    imageUrls: finalImageUrls
                });
            } else {
                const item = order?.orderItems?.[0];
                const prodId = item?.prodId || item?.product?.id;
                return reviewApi.createReview({
                    orderId: Number(order.id),
                    prodId: Number(prodId),
                    rating: Number(rating),
                    content: content.trim(),
                    imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined
                });
            }
        },
        onSuccess: (res) => {
            showAlert(res.message || "처리가 완료되었습니다.", '성공', 'success');
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['reviews', 'me'] });
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (err: any) => {
            if (err.message === 'Uploading in progress' || err.message === 'Validation failed') return;
            const serverMessage = err.response?.data?.message;
            showAlert(`리뷰 처리 실패: ${serverMessage || err.message}`, '실패', 'error');
        }
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-[540px] rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 shrink-0">
                            <div><h3 className="text-2xl font-black text-brand-dark italic">{editData ? 'Edit Review' : 'Write a Review'}</h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">나다커피의 맛과 향을 기록해주세요.</p></div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-gray-400 transition-all shadow-sm"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            {product ? (
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-200 flex items-center justify-center">
                                        {product.imageUrl ? <img src={product.imageUrl} alt="product" className="w-full h-full object-cover" /> : <Coffee size={32} className="text-gray-400" />}
                                    </div>
                                    <div><h4 className="font-black text-brand-dark">{product.name}</h4>{order?.id && <p className="text-xs font-bold text-gray-400">주문번호: {order.id}</p>}</div>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold text-sm">상품 정보를 불러올 수 없습니다.</div>
                            )}
                            <div className="text-center">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">How was the taste?</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button key={num} onMouseEnter={() => setHoverRating(num)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(num)} className="transition-transform active:scale-95">
                                            <Star size={48} className={twMerge(["transition-all duration-200", (hoverRating || rating) >= num ? "text-brand-yellow fill-brand-yellow scale-110" : "text-gray-200"])} />
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-4 text-sm font-black text-brand-dark">{rating === 5 ? "최고예요! 🤩" : rating === 4 ? "좋아요! 😄" : rating === 3 ? "보통이에요 😐" : rating === 2 ? "별로예요 😕" : "아쉬워요 😢"}</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between"><span>Review Images</span><span className="text-[10px] font-bold text-brand-dark opacity-50">{images.length}/5</span></label>
                                <div className="flex flex-wrap gap-3">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                                            <img src={img.url} alt="upload" className={twMerge(["w-full h-full object-cover transition-opacity", img.isUploading && "opacity-40"])} />
                                            {img.isUploading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-brand-dark" /></div>}
                                            <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X size={16} /></button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <label className={twMerge([
                                            "w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-gray-400 hover:text-brand-dark",
                                        ])}>
                                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                            <ImagePlus size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Add Photos</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Review Detail</label>
                                    <span className={`text-xs font-bold ${content.trim().length < 10 ? 'text-red-500' : 'text-gray-400'}`}>{content.trim().length} / 10자 이상</span>
                                </div>
                                <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="커피의 풍미나 서비스에 대한 솔직한 후기를 남겨주세요. (최소 10자)" className="w-full px-6 py-5 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-brand-yellow font-medium text-sm resize-none" />
                            </div>
                        </div>
                        <div className="p-8 pt-0 shrink-0">
                            <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !content.trim() || images.some(img => img.isUploading)} className="w-full py-5 bg-brand-dark text-white rounded-[25px] font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                                <Send size={20} />
                                {submitMutation.isPending ? '처리 중...' : (editData ? '리뷰 수정 완료' : '리뷰 등록 완료')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReviewModal;
