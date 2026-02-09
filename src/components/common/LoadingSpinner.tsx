import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', fullPage = false }) => {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-t-2 border-b-2",
    lg: "w-16 h-16 border-t-4 border-b-4"
  };

  const spinner = (
    <div className={`${sizes[size]} border-brand-yellow rounded-full animate-spin mx-auto`}></div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/50 backdrop-blur-sm fixed inset-0 z-[9999]">
        {spinner}
      </div>
    );
  }

  return <div className="py-20 flex justify-center">{spinner}</div>;
};

export default LoadingSpinner;
