import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '../../../api/member.api';
import { orderApi } from '../../../api/order.api';
import { adminMemberApi } from '../../../api/admin.member.api'; // [추가]
import { reviewApi } from '../../../api/review.api';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useMyPage = (activeMenu: string) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore(); // 현재 로그인한 유저 정보 가져오기
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pointPage, setPointPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['members', 'me'],
    queryFn: () => memberApi.getMe()
  });

  const { data: orderData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => orderApi.getMyOrders(1, 50),
    enabled: activeMenu === 'My 주문내역' || activeMenu === 'My 취소/반품내역'
  });

  const { data: pointBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['points', 'balance'],
    queryFn: () => memberApi.getPointBalance(),
    enabled: activeMenu === 'My 포인트',
    staleTime: 0
  });

  const { data: pointHistory, isLoading: isPointLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['points', 'history', pointPage],
    queryFn: () => memberApi.getPointHistory(pointPage, 10),
    enabled: activeMenu === 'My 포인트',
    staleTime: 0
  });

  const { data: myReviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviews', 'me', reviewPage],
    queryFn: () => reviewApi.getMyReviews(reviewPage, 5),
    enabled: activeMenu === '내 리뷰 관리',
    staleTime: 0
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => reviewApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      alert("리뷰가 삭제되었습니다.");
    },
    onError: (err: any) => {
      alert(`리뷰 삭제 실패: ${err.message}`);
    }
  });

  useEffect(() => {
    setSelectedIds([]);
    if (activeMenu === 'My 포인트') {
      refetchBalance();
      refetchHistory();
    }
  }, [activeMenu, refetchBalance, refetchHistory]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone: string }) => memberApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', 'me'] });
      alert("회원 정보가 수정되었습니다.");
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => memberApi.changePassword(data),
    onSuccess: () => alert("비밀번호가 변경되었습니다.")
  });

  // [수정] 구매확정 및 포인트 적립 로직
  const confirmPurchaseMutation = useMutation({
    mutationFn: async (order: any) => {
      // 1. 포인트 적립 (1%, 소수점 올림)
      const rewardAmount = Math.ceil(order.totalPrice * 0.01);
      if (currentUser?.id) {
        await adminMemberApi.grantPoints({
          memberId: currentUser.id,
          amount: rewardAmount,
          reason: `주문 #${order.id} 구매확정 적립`
        });
      }
    },
    onSuccess: (_, order) => {
      const reward = Math.ceil(order.totalPrice * 0.01);
      alert(`구매확정이 완료되었습니다! ${reward.toLocaleString()}P가 적립되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
    },
    onError: (err: any) => {
      alert(`구매확정 실패: ${err.response?.data?.message || err.message}`);
    }
  });

  const handleCancelOrder = (id: number) => {
    if (window.confirm('정말로 이 주문을 취소하시겠습니까?')) {
      orderApi.cancelOrder(id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        alert('주문이 취소되었습니다.');
      });
    }
  };

  return {
    user, isUserLoading,
    orderData, isOrdersLoading,
    pointBalance, pointHistory, isPointLoading,
    myReviewsData, isReviewsLoading,
    pointPage, setPointPage,
    reviewPage, setReviewPage,
    selectedIds, setSelectedIds,
    updateProfileMutation,
    changePasswordMutation,
    confirmPurchaseMutation,
    deleteReviewMutation,
    handleCancelOrder,
    refetchBalance, refetchHistory
  };
};
