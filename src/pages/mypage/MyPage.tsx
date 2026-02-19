import React, { useMemo } from 'react';
import { useLocation } from 'react-router';
import MyPageSidebar from './components/MyPageSidebar';
import MyPageContent from './components/MyPageContent';
import { useMyPage } from './hooks/useMyPage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
    handleBulkCancel, // [추가] useMyPage에서 가져옴
    refetchBalance, refetchHistory,
    totalSpent, dynamicGrade
  } = useMyPage(activeMenu);

  if (isUserLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">
        <MyPageSidebar
          activeMenu={activeMenu}
          onMenuChange={() => {}} 
        />

        <main className="flex-1 w-full min-w-0">
          <div className="bg-white rounded-[50px] shadow-xl border border-gray-100 p-12">
            {isOrdersLoading ? (
              <LoadingSpinner />
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
                  handleBulkCancel // [추가] MyPageContent로 전달
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
