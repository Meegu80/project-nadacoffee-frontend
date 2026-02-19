import React, { useMemo } from 'react';
import { useLocation } from 'react-router';
import MyPageSidebar from './components/MyPageSidebar';
import MyPageContent from './components/MyPageContent';
import { useMyPage } from './hooks/useMyPage';
import SEO from '../../components/common/SEO';
import SkeletonMyPage from '../../components/common/skeleton/SkeletonMyPage'; // [수정] 경로 변경

const MyPage: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const activeMenu = useMemo(() => {
    if (currentPath.includes('/mypage/order')) return 'My 주문내역';
    if (currentPath.includes('/mypage/cancel')) return 'My 취소/반품내역';
    if (currentPath.includes('/mypage/point')) return 'My 포인트';
    if (currentPath.includes('/mypage/profile')) return '내 정보 조회';
    if (currentPath.includes('/mypage/edit')) return '내 정보 수정';
    if (currentPath.includes('/mypage/password')) return '비밀번호 변경';
    if (currentPath.includes('/mypage/review')) return '내 리뷰 관리';
    return 'My 주문내역';
  }, [currentPath]);

  const {
    user, isUserLoading,
    orderData, isOrdersLoading,
    pointBalance, pointHistory, isPointLoading,
    myReviewsData, isReviewsLoading,
    pointPage, setPointPage,
    reviewPage, setReviewPage,
    orderPage, setOrderPage,
    selectedIds, setSelectedIds,
    updateProfileMutation,
    changePasswordMutation,
    confirmPurchaseMutation,
    deleteReviewMutation,
    handleCancelOrder,
    handleBulkCancel,
    refetchBalance, refetchHistory,
    totalSpent, dynamicGrade
  } = useMyPage(activeMenu);

  if (isUserLoading) return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">
        <div className="w-full md:w-72 shrink-0 animate-pulse">
          <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto" />
            <div className="h-5 bg-gray-200 rounded-full w-1/2 mx-auto" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
        <main className="flex-1 w-full min-w-0">
          <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 p-12">
            <SkeletonMyPage rows={6} />
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20">
      <SEO
        title={`마이페이지 - ${activeMenu}`}
        description="나다커피 회원 마이페이지에서 주문내역, 포인트, 리뷰 등 내 정보를 관리할 수 있습니다."
      />
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">
        <MyPageSidebar
          activeMenu={activeMenu}
          onMenuChange={() => { }}
        />

        <main className="flex-1 w-full min-w-0">
          <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 p-12">
            {isOrdersLoading ? (
              <SkeletonMyPage rows={5} />
            ) : (
              <MyPageContent
                activeMenu={activeMenu}
                data={{
                  user, orderData, pointBalance, pointHistory, isPointLoading, pointPage,
                  myReviewsData, isReviewsLoading, reviewPage, orderPage,
                  totalSpent, dynamicGrade
                }}
                actions={{
                  setPointPage, setReviewPage, setOrderPage, selectedIds, setSelectedIds,
                  updateProfileMutation, changePasswordMutation,
                  confirmPurchaseMutation, deleteReviewMutation,
                  handleCancelOrder,
                  handleBulkCancel,
                  refetchBalance, refetchHistory
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyPage;
