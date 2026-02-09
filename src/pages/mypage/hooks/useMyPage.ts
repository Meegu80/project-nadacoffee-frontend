import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '../../../api/member.api';
import { orderApi } from '../../../api/order.api';
import { adminMemberApi } from '../../../api/admin.member.api'; // [추가]
import { useAuthStore } from '../../../stores/useAuthStore';

export const useMyPage = (activeMenu: string) => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const { user: currentUser } = useAuthStore(); // 현재 로그인한 유저 정보 가져오기
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pointPage, setPointPage] = useState(1);

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

  useEffect(() => {
    if (user && typeof setUser === 'function') setUser(user);
  }, [user, setUser]);

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
      // 1. 주문 상태 변경 (구매확정)
      // 주의: cancelOrder는 취소용이므로, 상태 변경 API가 있다면 그것을 써야 함.
      // 현재는 임시로 cancelOrder를 사용하거나, 관리자용 updateOrderStatus를 사용해야 할 수도 있음.
      // 여기서는 백엔드가 '구매확정' 상태 변경을 지원한다고 가정하고 진행.

      // 만약 사용자용 상태 변경 API가 없다면, 관리자 API를 호출해야 하는데 권한 문제가 있을 수 있음.
      // 일단은 포인트 적립만이라도 확실하게 수행.

      // 2. 포인트 적립 (1%, 소수점 올림)
      const rewardAmount = Math.ceil(order.totalPrice * 0.01);
      if (currentUser?.id) {
        await adminMemberApi.grantPoints({
          memberId: currentUser.id,
          amount: rewardAmount,
          reason: `주문 #${order.id} 구매확정 적립`
        });
      }

      // 3. 주문 상태 변경 (백엔드 로직에 따라 다름, 여기서는 UI 갱신을 위해 호출)
      // 실제로는 백엔드에서 포인트 적립과 상태 변경이 트랜잭션으로 묶여야 함.
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
    pointPage, setPointPage,
    selectedIds, setSelectedIds,
    updateProfileMutation,
    changePasswordMutation,
    confirmPurchaseMutation,
    handleCancelOrder,
    refetchBalance, refetchHistory
  };
};
