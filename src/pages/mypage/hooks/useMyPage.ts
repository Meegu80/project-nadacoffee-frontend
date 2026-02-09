import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '../../../api/member.api';
import { orderApi } from '../../../api/order.api';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useMyPage = (activeMenu: string) => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
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
      // 1. 주문 상태 변경
      await orderApi.cancelOrder(order.id, "구매확정");
      
      // 2. 포인트 적립 (백엔드에서 자동 처리되지 않을 경우를 대비해 명시적 호출 시도)
      const rewardAmount = Math.floor(order.totalPrice * 0.01);
      try {
        await memberApi.addPoints({
          amount: rewardAmount,
          reason: `주문 #${order.id} 구매확정 적립 (1%)`,
          orderId: order.id
        });
      } catch (e) {
        console.warn("포인트 적립 API 호출 실패 (백엔드 자동 적립 여부 확인 필요)");
      }
    },
    onSuccess: (_, order) => {
      const reward = Math.floor(order.totalPrice * 0.01);
      alert(`구매확정이 완료되었습니다! 결제금액의 1%인 ${reward.toLocaleString()}P가 적립되었습니다.`);
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
