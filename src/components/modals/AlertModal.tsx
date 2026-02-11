import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useAlertStore } from '../../stores/useAlertStore';

const AlertModal: React.FC = () => {
    const { isOpen, title, message, type, actions, hideAlert } = useAlertStore();

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="text-green-500" size={48} />;
            case 'error':
                return <XCircle className="text-red-500" size={48} />;
            case 'warning':
                return <AlertCircle className="text-yellow-500" size={48} />;
            case 'info':
            default:
                return <Info className="text-blue-500" size={48} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={hideAlert}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={hideAlert}
                            className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Icon */}
                        <div className="mb-6 mt-2">
                            {getIcon()}
                        </div>

                        {/* Title */}
                        {title && (
                            <h3 className="text-xl font-black text-brand-dark mb-2 tracking-tight">
                                {title}
                            </h3>
                        )}

                        {/* Message */}
                        <p className="text-gray-500 font-medium leading-relaxed mb-8 whitespace-pre-wrap">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 w-full">
                            {actions && actions.length > 0 ? (
                                actions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            action.onClick();
                                            hideAlert();
                                        }}
                                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${action.variant === 'secondary'
                                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            : 'bg-brand-dark text-white hover:bg-black'
                                            }`}
                                    >
                                        {action.label}
                                    </button>
                                ))
                            ) : (
                                <button
                                    onClick={hideAlert}
                                    className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                >
                                    확인
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AlertModal;
