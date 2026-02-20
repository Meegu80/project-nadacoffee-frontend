import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { adminOrderApi } from "../api/admin.order.api";
import { formatDate } from "../utils/date";

export const useBestSellers = () => {
    const {
        data: ordersData,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["best-sellers-orders"],
        queryFn: () => adminOrderApi.getOrders({ page: 1, limit: 100 }),
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const getKSTDateString = (dateStr: string | Date) =>
        new Date(dateStr).toLocaleDateString("en-CA");

    const topProducts = useMemo(() => {
        if (!ordersData?.data) return [];
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgoStr = getKSTDateString(sevenDaysAgo);

        const productSales = new Map<
            string,
            {
                id: number;
                name: string;
                quantity: number;
                recentRevenue: number;
                cumulativeRevenue: number;
                image: string | null;
            }
        >();

        ordersData.data.forEach(order => {
            const orderDate = getKSTDateString(order.createdAt);
            const isRecent = orderDate >= sevenDaysAgoStr;
            order.orderItems?.forEach(item => {
                const prodId = item.prodId || (item as any).product?.id;
                if (!prodId) return;
                const existing = productSales.get(String(prodId));
                const itemRevenue = (item.salePrice || 0) * (item.quantity || 0);

                if (existing) {
                    existing.quantity += item.quantity || 0;
                    existing.cumulativeRevenue += itemRevenue;
                    if (isRecent) existing.recentRevenue += itemRevenue;
                } else {
                    productSales.set(String(prodId), {
                        id: prodId,
                        name: item.product?.name || "Unknown",
                        quantity: item.quantity || 0,
                        recentRevenue: isRecent ? itemRevenue : 0,
                        cumulativeRevenue: itemRevenue,
                        image: item.product?.imageUrl || null,
                    });
                }
            });
        });

        // 최근 7일 매출액 기준 내림차순 정렬 후 상위 10개 추출
        return Array.from(productSales.values())
            .sort((a, b) => b.recentRevenue - a.recentRevenue)
            .slice(0, 10);
    }, [ordersData]);

    const top10Ids = useMemo(() => topProducts.map(p => p.id), [topProducts]);

    return {
        topProducts,
        top10Ids,
        isLoading,
        refetch,
    };
};
