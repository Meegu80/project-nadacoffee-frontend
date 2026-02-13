import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  
  // 부드러운 애니메이션을 위해 spring 적용
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-brand-yellow origin-left z-[10002]"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
