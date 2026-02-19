import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memberApi } from "../../../api/member.api";
import { orderApi } from "../../../api/order.api";
import { adminMemberApi } from "../../../api/admin.member.api";
import { reviewApi } from "../../../api/review.api";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useAlertStore } from "../../../stores/useAlertStore";

export const useMyPage = (activeMenu: string) => {
   const queryClient = useQueryClient();
   const { user: currentUser } = useAuthStore();
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [pointPage, setPointPage] = useState(1);
   const [reviewPage, setReviewPage] = useState(1);
   const [orderPage, setOrderPage] = useState(1);

   const { data: user, isLoading: isUserLoading } = useQuery({
      queryKey: ["members", "me"],
      queryFn: () => memberApi.getMe(),
   });

   const {
      data: orderData,
      isLoading: isOrdersLoading,
      refetch: refetchOrders,
   } = useQuery({
      queryKey: ["orders", "my", orderPage],
      queryFn: () => orderApi.getMyOrders(orderPage, 10),
      enabled:
         activeMenu === "My 주문내역" || activeMenu === "My 취소/반품내역",
   });

   useEffect(() => {
      if (orderData) {
         const { totalPages } = orderData.pagination;
         if (orderData.data.length === 0 && orderPage > 1) {
            setOrderPage(prev => prev - 1);
         }
         else if (orderPage > totalPages && totalPages > 0) {
            setOrderPage(totalPages);
         }
      }
   }, [orderData, orderPage]);

   const { data: pointBalance, refetch: refetchBalance } = useQuery({
      queryKey: ["points", "balance"],
      queryFn: () => memberApi.getPointBalance(),
      enabled: activeMenu === "My 포인트",
      staleTime: 0,
   });

   const {
      data: pointHistory,
      isLoading: isPointLoading,
      refetch: refetchHistory,
   } = useQuery({
      queryKey: ["points", "history", pointPage],
      queryFn: () => memberApi.getPointHistory(pointPage, 10),
      enabled: activeMenu === "My 포인트",
      staleTime: 0,
   });

   const { data: myReviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["reviews", "me", reviewPage],
    queryFn: () => reviewApi.getMyReviews(reviewPage, 100),
    enabled:
       activeMenu === "내 리뷰 관리" ||
       activeMenu === "My 주문내역" ||
       activeMenu === "My 취소/반품내역",
    staleTime: 0,
 });

   const deleteReviewMutation = useMutation({
      mutationFn: (id: number) => reviewApi.deleteReview(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["reviews", "me"] });
         queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
         queryClient.invalidateQueries({ queryKey: ["orders"] });
         useAlertStore.getState().showAlert("리뷰가 삭제되었습니다.", "성공", "success");
      }
   });

   useEffect(() => {
      setSelectedIds([]);
      if (activeMenu === "My 포인트") {
         refetchBalance();
         refetchHistory();
      }
   }, [activeMenu, refetchBalance, refetchHistory]);

   // [수정] limit을 1000에서 100으로 하향 조정 (400 에러 방지)
   const { data: allOrdersForGrade } = useQuery({
      queryKey: ["orders", "all-for-grade"],
      queryFn: () => orderApi.getMyOrders(1, 100),
      enabled: !!currentUser,
      staleTime: 1000 * 60 * 5,
   });

   const { totalSpent, dynamicGrade } = (() => {
      if (!allOrdersForGrade?.data)
         return { totalSpent: 0, dynamicGrade: "SILVER" as const };
      
      const total = allOrdersForGrade.data
         .filter((order: any) => {
            const s = String(order.status || '').toUpperCase().replace(/\s/g, '');
            const isInvalid = ['CANCELLED', 'RETURNED', '취소됨', '반품됨', 'PENDING', '결제대기'].includes(s);
            return !isInvalid;
         })
         .reduce((sum: number, order: any) => sum + (Number(order.totalPrice) || 0), 0);

      let grade: "SILVER" | "GOLD" | "VIP" = "SILVER";
      if (total >= 300000) grade = "VIP";
      else if (total >= 100000) grade = "GOLD";
      return { totalSpent: total, dynamicGrade: grade };
   })();

   const updateProfileMutation = useMutation({
      mutationFn: (data: { name?: string; phone?: string; grade?: string }) =>
         memberApi.updateMe(data),
      onSuccess: (res: any) => {
         queryClient.invalidateQueries({ queryKey: ["members", "me"] });
         if (res.data) {
            useAuthStore.setState(state => ({
               user: state.user ? ({ ...state.user, ...res.data } as any) : null,
            }));
         }
      },
   });

   const hasCheckedGrade = useRef(false);
   useEffect(() => {
      if (user && dynamicGrade && !hasCheckedGrade.current) {
         if (user.grade !== dynamicGrade) {
            updateProfileMutation.mutate({ grade: dynamicGrade });
         }
         hasCheckedGrade.current = true;
      }
   }, [user, dynamicGrade, updateProfileMutation]);

   const changePasswordMutation = useMutation({
      mutationFn: (data: any) => memberApi.changePassword(data),
      onSuccess: () => useAlertStore.getState().showAlert("비밀번호가 변경되었습니다.", "성공", "success"),
   });

   const confirmPurchaseMutation = useMutation({
      mutationFn: async (order: any) => {
         const rewardAmount = Math.ceil(order.totalPrice * 0.01);
         if (currentUser?.id) {
            await adminMemberApi.grantPoints({
               memberId: currentUser.id,
               amount: rewardAmount,
               reason: `주문 #${order.id} 구매확정 적립`,
            });
         }
      },
      onSuccess: () => {
         useAlertStore.getState().showAlert("구매확정이 완료되었습니다!", "성공", "success");
         queryClient.invalidateQueries({ queryKey: ["orders"] });
         queryClient.invalidateQueries({ queryKey: ["points"] });
         hasCheckedGrade.current = false;
      }
   });

   const handleCancelOrder = async (id: number) => {
      useAlertStore.getState().showAlert("정말로 이 주문을 취소하시겠습니까?", "주문 취소 확인", "warning", [
         {
            label: "주문 취소",
            onClick: async () => {
               try {
                  await orderApi.cancelOrder(id);
                  await Promise.all([
                     queryClient.invalidateQueries({ queryKey: ["orders"] }),
                     queryClient.invalidateQueries({ queryKey: ["points"] }),
                  ]);
                  useAlertStore.getState().showAlert("주문이 취소되었습니다.", "성공", "success");
               } catch (err: any) {
                  useAlertStore.getState().showAlert(`취소 실패: ${err.message}`, "오류", "error");
               }
            },
         },
         { label: "아니오", onClick: () => {}, variant: "secondary" },
      ]);
   };

   const handleBulkCancel = () => {
      if (selectedIds.length === 0) return;
      useAlertStore.getState().showAlert(`선택한 ${selectedIds.length}건의 주문을 모두 취소하시겠습니까?`, "일괄 취소 확인", "warning", [
         {
            label: "일괄 취소",
            onClick: async () => {
               try {
                  await Promise.all(selectedIds.map(id => orderApi.cancelOrder(id)));
                  setSelectedIds([]);
                  await Promise.all([
                     queryClient.invalidateQueries({ queryKey: ["orders"] }),
                     queryClient.invalidateQueries({ queryKey: ["points"] }),
                  ]);
                  useAlertStore.getState().showAlert("선택한 주문들이 모두 취소되었습니다.", "성공", "success");
               } catch (err: any) {
                  useAlertStore.getState().showAlert(`일부 주문 취소 중 오류가 발생했습니다: ${err.message}`, "오류", "error");
               }
            },
         },
         { label: "아니오", onClick: () => {}, variant: "secondary" },
      ]);
   };

   return {
      user, isUserLoading, orderData, isOrdersLoading, pointBalance, pointHistory, isPointLoading,
      myReviewsData, isReviewsLoading, pointPage, setPointPage, reviewPage, setReviewPage,
      orderPage, setOrderPage, selectedIds, setSelectedIds, updateProfileMutation,
      changePasswordMutation, confirmPurchaseMutation, deleteReviewMutation,
      handleCancelOrder, handleBulkCancel, refetchBalance, refetchHistory,
      totalSpent, dynamicGrade,
   };
};
