import React from 'react';

const SkeletonProductCard: React.FC = () => {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* 이미지 영역 */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-gray-200 mb-3 border border-gray-100">
        {/* 뱃지 위치 스켈레톤 */}
        <div className="absolute top-4 left-4 w-16 h-6 bg-gray-300 rounded-xl" />
      </div>
      
      {/* 텍스트 영역 */}
      <div className="px-1 flex flex-col gap-2">
        {/* 상품명 */}
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        
        {/* 가격 */}
        <div className="flex justify-between items-center mt-1">
          <div className="h-3 bg-gray-200 rounded-md w-10" />
          <div className="h-5 bg-gray-200 rounded-md w-24" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;
