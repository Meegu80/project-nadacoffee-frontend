import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  fullWidth, 
  className, 
  disabled,
  ...props 
}) => {
  const variants = {
    primary: ["bg-brand-dark", "text-white", "hover:bg-black", "shadow-lg shadow-black/10"],
    secondary: ["bg-brand-yellow", "text-brand-dark", "hover:bg-yellow-400", "shadow-lg shadow-brand-yellow/20"],
    outline: ["border-2 border-gray-200", "text-gray-500", "hover:bg-gray-50 hover:text-brand-dark"],
    danger: ["bg-red-50", "text-red-600", "hover:bg-red-100"],
    ghost: ["bg-transparent", "text-gray-400", "hover:bg-gray-100 hover:text-brand-dark"]
  };

  const sizes = {
    sm: ["px-4", "py-2", "text-xs"],
    md: ["px-6", "py-3", "text-sm"],
    lg: ["px-10", "py-4", "text-lg"],
    xl: ["px-16", "py-5", "text-xl"]
  };

  return (
    <button 
      className={twMerge([
        // 레이아웃 & 기본 스타일
        "inline-flex items-center justify-center",
        "font-black uppercase tracking-tight",
        "transition-all active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "rounded-2xl",
        
        // 변형 스타일
        variants[variant],
        sizes[size],
        
        // 추가 옵션
        fullWidth && "w-full",
        className
      ])}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className={twMerge([
          "w-5 h-5 mr-2",
          "border-2 border-current border-t-transparent",
          "rounded-full animate-spin"
        ])} />
      )}
      {children}
    </button>
  );
};

export default Button;
