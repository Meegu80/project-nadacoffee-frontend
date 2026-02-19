import Skeleton from "./Skeleton";

const SkeletonDashboard = () => {
  return (
    <div className="space-y-8">
      {/* 상단 통계 카드 3개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-12 h-6 rounded-full" />
            </div>
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-32 h-8" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주간 매출 추이 차트 영역 */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <Skeleton className="w-40 h-6 mb-8" />
          <Skeleton className="w-full h-64 rounded-xl" />
        </div>
        
        {/* 재고 알림 영역 */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <Skeleton className="w-32 h-6 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* 베스트 셀러 테이블 영역 */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <Skeleton className="w-48 h-6 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonDashboard;
