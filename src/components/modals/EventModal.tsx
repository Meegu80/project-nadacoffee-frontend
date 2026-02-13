import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const EventModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [doNotShow, setDoNotShow] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem('hideEventModal');
    if (!hideUntil || new Date().getTime() > Number(hideUntil)) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (doNotShow) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      localStorage.setItem('hideEventModal', String(tomorrow.getTime()));
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed left-10 top-1/2 -translate-y-1/2 z-[10000] pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }} 
            className="relative pointer-events-auto"
          >
            <div className="absolute -top-8 right-0 flex items-center gap-3">
              <button 
                onClick={() => setDoNotShow(!doNotShow)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer group"
              >
                <span className="text-[11px] font-medium shadow-black/50 drop-shadow-sm">오늘 하루 보지 않기</span>
                
                <div className={twMerge([
                  "w-3.5 h-3.5 border border-white/60 flex items-center justify-center transition-all",
                  // [수정] 체크 안 됐을 때 배경을 흰색(bg-white)으로 설정
                  doNotShow ? "bg-brand-yellow border-brand-yellow text-brand-dark" : "bg-white group-hover:border-white"
                ])}>
                  {doNotShow && <Check size={10} strokeWidth={4} />}
                </div>
              </button>

              <div className="w-[1px] h-3 bg-white/30 mx-1" />

              <button 
                onClick={handleClose} 
                className="flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-[520px] aspect-square bg-transparent">
              <img 
                src="/number1.jpg" 
                alt="Event" 
                className="w-full h-full object-cover block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/520x520/FFD400/222222?text=EVENT";
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EventModal;
