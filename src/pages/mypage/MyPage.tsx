import React, { useState } from 'react';
import MyPageSidebar from './components/MyPageSidebar';
import MyPageContent from './components/MyPageContent';
import { useMyPage } from './hooks/useMyPage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('My 주문내역');

  // 비즈니스 로직 분리 (Custom Hook)
  const {
    user, isUserLoading,
    orderData, isOrdersLoading,
    pointBalance, pointHistory, isPointLoading,
    myReviewsData, isReviewsLoading,
    pointPage, setPointPage,
    reviewPage, setReviewPage,
    orderPage, setOrderPage, // [추가]
    selectedIds, setSelectedIds,
    updateProfileMutation,
    changePasswordMutation,
    confirmPurchaseMutation,
    deleteReviewMutation,
    handleCancelOrder,
    refetchBalance, refetchHistory,
    totalSpent, dynamicGrade
  } = useMyPage(activeMenu);

  if (isUserLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">
        {/* 사이드바 분리 */}
        <MyPageSidebar
          activeMenu={activeMenu}
          onMenuChange={setActiveMenu}
        />

        {/* 메인 콘텐츠 분리 */}
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
                  confirmPurchaseMutation, deleteReviewMutation, handleCancelOrder,
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
