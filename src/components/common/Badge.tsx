import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'dark' | 'red' | 'blue' | 'green' | 'gray' | 'orange';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  outline?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gray', 
  size = 'xs', 
  className,
  outline = false
}) => {
  const variants = {
    yellow: outline ? ["border border-brand-yellow", "text-brand-yellow"] : ["bg-brand-yellow", "text-brand-dark"],
    dark: outline ? ["border border-brand-dark", "text-brand-dark"] : ["bg-brand-dark", "text-brand-yellow"],
    red: outline ? ["border border-red-500", "text-red-500"] : ["bg-red-50", "text-red-600"],
    blue: outline ? ["border border-blue-500", "text-blue-500"] : ["bg-blue-50", "text-blue-600"],
    green: outline ? ["border border-green-500", "text-green-500"] : ["bg-green-50", "text-green-600"],
    gray: outline ? ["border border-gray-300", "text-gray-400"] : ["bg-gray-100", "text-gray-500"],
    orange: outline ? ["border border-orange-500", "text-orange-500"] : ["bg-orange-50", "text-orange-600"]
  };

  const sizes = {
    xs: ["px-2", "py-0.5", "text-[10px]"],
    sm: ["px-3", "py-1", "text-xs"],
    md: ["px-4", "py-1.5", "text-sm"]
  };

  return (
    <span className={twMerge([
      // 기본 스타일
      "inline-flex items-center justify-center",
      "font-black uppercase tracking-widest",
      "rounded-full",
      
      // 변형 스타일
      variants[variant],
      sizes[size],
      
      className
    ])}>
      {children}
    </span>
  );
};

export default Badge;
