import { motion } from "framer-motion";
import {
  MdOutlinePayments, MdOutlineShoppingCart, MdOutlinePeopleAlt,
  MdTrendingUp, MdOutlineInventory2, MdOutlineChevronRight,
  MdArrowUpward, MdArrowDownward, MdRefresh
} from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrderApi } from "../../api/admin.order.api";
import { adminMemberApi } from "../../api/admin.member.api";
import { getProducts } from "../../api/product.api";
import { useState, useMemo, useEffect } from "react";

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orderSortField, setOrderSortField] = useState<string>("id");
  const [orderSortOrder, setOrderSortOrder] = useState<"asc" | "desc">("desc");

  const { data: ordersData, isLoading: isOrdersLoading, refetch: refetchOrders } = useQuery({ 
    queryKey: ["admin", "dashboard", "orders"], 
    queryFn: () => adminOrderApi.getOrders({ page: 1, limit: 100 }),
    staleTime: 0 
  });
  
  const { data: membersData } = useQuery({ 
    queryKey: ["admin", "dashboard", "members"], 
    queryFn: () => adminMemberApi.getMembers(1, 100) 
  });
  
  const { data: productsData, isLoading: isProductsLoading, refetch: refetchProducts } = useQuery({ 
    queryKey: ["admin", "dashboard", "products"], 
    queryFn: () => getProducts({ limit: 100 }),
    staleTime: 0 
  });

  useEffect(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const msUntilNextHour = ((60 - minutes) * 60 - seconds) * 1000;

    const timer = setTimeout(() => {
      console.log("🔄 [Auto Refresh] Updating Dashboard Data...");
      refetchOrders();
      refetchProducts();
      setInterval(() => {
        refetchOrders();
        refetchProducts();
      }, 1000 * 60 * 60);
    }, msUntilNextHour);

    return () => clearTimeout(timer);
  }, [refetchOrders, refetchProducts]);

  const getKSTDateString = (dateStr: string | Date) => new Date(dateStr).toLocaleDateString('en-CA');

  const sortedRecentOrders = useMemo(() => {
    if (!ordersData?.data) return [];
    return [...ordersData.data].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (orderSortField) {
        case "id": valA = a.id; valB = b.id; break;
        case "user": valA = a.recipientName || a.userName || ""; valB = b.recipientName || b.userName || ""; break;
        case "amount": valA = a.totalPrice || 0; valB = b.totalPrice || 0; break;
        case "status": valA = a.status || ""; valB = b.status || ""; break;
        case "date": valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime(); break;
        default: valA = a.id; valB = b.id;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        const cmp = valA.localeCompare(valB);
        return orderSortOrder === "asc" ? cmp : -cmp;
      }

      if (valA < valB) return orderSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return orderSortOrder === "asc" ? 1 : -1;
      return 0;
    }).slice(0, 20);
  }, [ordersData, orderSortField, orderSortOrder]);

  const handleOrderSort = (field: string) => {
    if (orderSortField === field) {
      setOrderSortOrder(orderSortOrder === "asc" ? "desc" : "asc");
    } else {
      setOrderSortField(field);
      setOrderSortOrder("asc");
    }
  };

  const OrderSortIcon = ({ field }: { field: string }) => {
    if (orderSortField !== field) return <div className="w-4" />;
    return orderSortOrder === "asc" ? <MdArrowUpward size={14} className="ml-1" /> : <MdArrowDownward size={14} className="ml-1" />;
  };

  const calculateStats = () => {
    const today = getKSTDateString(new Date());
    const weeklySales = Array(8).fill(0);
    const weekLabels: string[] = [];
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const month = weekStart.getMonth() + 1;
      const weekOfMonth = Math.ceil(weekStart.getDate() / 7);
      weekLabels.push(`${month}월 ${weekOfMonth}주`);
      return { start: getKSTDateString(weekStart), end: getKSTDateString(weekEnd) };
    });

    if (!ordersData || !membersData) {
      return { todaySales: 0, todayOrders: 0, newMembers: 0, weeklySales, weekLabels };
    }

    const todayCompletedOrders = ordersData.data.filter(o =>
      getKSTDateString(o.createdAt) === today &&
      (o.status === 'PAYMENT_COMPLETED' || o.status === 'PREPARING' || o.status === 'SHIPPING' || o.status === 'DELIVERED' || o.status === 'PURCHASE_COMPLETED')
    );
    const todaySales = todayCompletedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const todayOrdersList = ordersData.data.filter(o => getKSTDateString(o.createdAt) === today);
    const newMembers = membersData.data.filter(m => getKSTDateString(m.createdAt) === today).length;

    ordersData.data.forEach(order => {
      const orderDate = getKSTDateString(order.createdAt);
      const isPaid = order.status === 'PAYMENT_COMPLETED' || order.status === 'PREPARING' || order.status === 'SHIPPING' || order.status === 'DELIVERED' || order.status === 'PURCHASE_COMPLETED';

      if (isPaid) {
        last8Weeks.forEach((week, index) => {
          if (orderDate >= week.start && orderDate <= week.end) {
            weeklySales[index] += (order.totalPrice || 0);
          }
        });
      }
    });

    return { todaySales, todayOrders: todayOrdersList.length, newMembers, weeklySales, weekLabels };
  };

  const statsData = calculateStats();
  const stats = [
    { id: 1, label: "오늘의 매출", value: `₩ ${statsData.todaySales.toLocaleString()}`, change: "Today", icon: MdOutlinePayments, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, label: "오늘의 주문", value: `${statsData.todayOrders}건`, change: "Today", icon: MdOutlineShoppingCart, color: "text-orange-600", bg: "bg-orange-50" },
    { id: 3, label: "신규 회원", value: `${statsData.newMembers}명`, change: "Today", icon: MdOutlinePeopleAlt, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const lowStockProducts = productsData?.data.flatMap(p => {
    const lowStockOptions = p.options?.filter(opt => opt.stockQty < 10) || [];
    return lowStockOptions.map(opt => ({ id: `${p.id}-${opt.id}`, productId: p.id, name: `${p.name} (${opt.name}: ${opt.value})`, stock: opt.stockQty, status: opt.stockQty === 0 ? "품절" : "품절임박" }));
  }).slice(0, 10) || [];

  const topProducts = (() => {
    if (!ordersData?.data) return [];

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = getKSTDateString(sevenDaysAgo);

    const productSales = new Map<string, { id: number; name: string; quantity: number; recentRevenue: number; cumulativeRevenue: number; image: string | null }>();

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
            name: item.product?.name || 'Unknown',
            quantity: item.quantity || 0,
            recentRevenue: isRecent ? itemRevenue : 0,
            cumulativeRevenue: itemRevenue,
            image: item.product?.imageUrl || null
          });
        }
      });
    });

    return Array.from(productSales.values())
      .map(p => {
        const product = productsData?.data.find(item => item.id === p.id);
        const totalStock = product?.options?.reduce((sum, opt) => sum + opt.stockQty, 0) || 0;
        return { ...p, stock: totalStock };
      })
      // [수정] 정렬 기준 변경: cumulativeRevenue -> recentRevenue (최근 7일 매출액)
      .sort((a, b) => b.recentRevenue - a.recentRevenue)
      .slice(0, 10);
  })();

  const maxSales = Math.max(...statsData.weeklySales, 1);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-black text-[#222222] tracking-tight">DASHBOARD</h2><p className="text-sm text-gray-500 mt-1 font-medium">오늘의 나다커피 운영 현황입니다.</p></div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">마지막 업데이트: {new Date().toLocaleTimeString()}</div>
          <button onClick={() => { refetchOrders(); refetchProducts(); }} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-brand-dark transition-colors shadow-sm"><MdRefresh size={20} /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={stat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4"><div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div><span className={`text-xs font-black px-2 py-1 rounded-full ${stat.change === 'Today' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{stat.change}</span></div>
            <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p><h3 className="text-2xl font-black text-[#222222]">{stat.value}</h3>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8"><h3 className="text-lg font-black text-[#222222] flex items-center gap-2"><MdTrendingUp className="text-green-500" size={24} />주간 매출 추이</h3></div>
            <div className="h-64 w-full relative px-2">
              <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[calc(100%-24px)] w-full overflow-visible pointer-events-none z-10 px-2">
                <motion.path d={statsData.weeklySales.map((sales, i) => { const x = (i + 0.5) * 100; const y = 100 - (sales / maxSales) * 100; return `${i === 0 ? 'M' : 'L'} ${x} ${y}`; }).join(' ')} fill="none" stroke="#3B82F6" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
                {statsData.weeklySales.map((sales, i) => { const x = (i + 0.5) * 100; const y = 100 - (sales / maxSales) * 100; return (<motion.circle key={i} cx={x} cy={y} r="0.8" fill="white" stroke="#3B82F6" strokeWidth="0.75" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.1 }} />); })}
              </svg>
              <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
                {statsData.weeklySales.map((sales, i) => {
                  const heightPercent = (sales / maxSales) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20">₩ {sales.toLocaleString()}</div>
                      <div className="w-full max-w-[40px] flex-1 bg-gray-50 rounded-t-lg relative overflow-hidden flex items-end"><motion.div initial={{ height: 0 }} animate={{ height: `${heightPercent}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`w-full rounded-t-lg transition-all ${i === 7 ? 'bg-[#FFD400]' : 'bg-blue-100 group-hover:bg-blue-200'}`} /></div>
                      <span className="text-[10px] font-bold text-gray-400 h-4">{statsData.weekLabels[i] || "-"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#222222]">최근 주문 내역</h3>
              <Link to="/admin/orders" className="text-xs font-bold text-gray-400 hover:text-[#222222] flex items-center gap-1">전체보기 <MdOutlineChevronRight size={16} /></Link>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-center">
                <thead className="bg-gray-50 text-sm font-black text-gray-600 uppercase tracking-widest sticky top-0 z-10 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-all group" onClick={() => handleOrderSort('id')}><div className="flex items-center justify-center group-hover:text-[#222222]">주문번호 <OrderSortIcon field="id" /></div></th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-all group" onClick={() => handleOrderSort('user')}><div className="flex items-center justify-center group-hover:text-[#222222]">주문자 <OrderSortIcon field="user" /></div></th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-all group" onClick={() => handleOrderSort('amount')}><div className="flex items-center justify-center group-hover:text-[#222222]">결제금액 <OrderSortIcon field="amount" /></div></th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-all group" onClick={() => handleOrderSort('status')}><div className="flex items-center justify-center group-hover:text-[#222222]">상태 <OrderSortIcon field="status" /></div></th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-all group" onClick={() => handleOrderSort('date')}><div className="flex items-center justify-center group-hover:text-[#222222]">시간 <OrderSortIcon field="date" /></div></th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {isOrdersLoading ? (<tr><td colSpan={5} className="py-10 text-center text-gray-400">로딩 중...</td></tr>) : sortedRecentOrders.length === 0 ? (<tr><td colSpan={5} className="py-10 text-center text-gray-400">주문 내역이 없습니다.</td></tr>) : sortedRecentOrders.map((order) => {
                    const statusLabels: Record<string, string> = { 'PENDING': '결제대기', 'PAYMENT_COMPLETED': '결제완료', 'PREPARING': '배송준비', 'SHIPPING': '배송중', 'DELIVERED': '배송완료', 'PURCHASE_COMPLETED': '구매확정', 'CANCELLED': '취소됨', 'RETURNED': '반품됨' };
                    const displayStatus = statusLabels[order.status] || order.status;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm font-bold text-[#222222]">#{order.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#222222]">{order.recipientName || order.userName}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#222222]">₩ {(order.totalPrice || 0).toLocaleString()}</td>
                        <td className="px-6 py-4"><div className="flex justify-center"><span className={`px-2 py-1 rounded-md text-[10px] font-black ${order.status === 'DELIVERED' || order.status === 'PURCHASE_COMPLETED' ? 'bg-green-50 text-green-600' : order.status === 'PREPARING' || order.status === 'SHIPPING' ? 'bg-orange-50 text-orange-600' : order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{displayStatus}</span></div></td>
                        <td className="px-6 py-4 text-sm font-bold text-[#222222]">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6"><MdOutlineInventory2 className="text-[#FFD400]" size={24} /><h3 className="text-lg font-black text-[#222222]">재고 알림</h3></div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100% - 100px)' }}>
              {isProductsLoading ? (<p className="text-gray-400 text-xs">재고 확인 중...</p>) : lowStockProducts.length > 0 ? (lowStockProducts.map((alert: any) => (<div key={alert.id} onClick={() => navigate(`/admin/products/${alert.productId}`)} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-pointer hover:border-[#FFD400] transition-all"><div className="flex justify-between items-start mb-1"><p className="text-sm font-bold text-[#222222] truncate max-w-[150px]">{alert.name}</p><span className={`text-[10px] font-black px-2 py-0.5 rounded ${alert.status === '품절' ? 'bg-red-500 text-white' : 'bg-[#FFD400] text-black'}`}>{alert.status}</span></div><p className="text-xs text-gray-400 font-medium">{alert.stock}개 남음</p></div>))) : (<p className="text-gray-400 text-xs text-center py-10">재고 부족 상품이 없습니다.</p>)}
            </div>
            <Link to="/admin/products" className="block w-full mt-6 py-5 bg-gray-50 hover:bg-[#FFD400] rounded-2xl text-sm font-black transition-all text-center text-gray-500 hover:text-black border border-gray-100 hover:border-[#FFD400] shadow-sm">재고 관리 바로가기</Link>
          </div>
        </div>
      </div>

      {/* 가장 많이 팔린 제품 Top 10 */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-[#222222] flex items-center gap-2"><MdTrendingUp className="text-[#FFD400]" size={24} />베스트 셀러 TOP 10</h3>
          {/* [수정] 안내 텍스트 변경 */}
          <span className="text-xs font-bold text-gray-400">최근 7일 매출액 기준 (매시 정각 갱신)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-sm font-black text-[#222222] uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 w-16 text-center">순위</th>
                <th className="px-6 py-4 text-center">상품명</th>
                <th className="px-6 py-4 text-center">매출액 (7일)</th>
                <th className="px-6 py-4 text-center">누적매출액</th>
                <th className="px-6 py-4 text-center">판매수량</th>
                <th className="px-6 py-4 text-center">재고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isOrdersLoading ? (<tr><td colSpan={6} className="py-10 text-center text-gray-400">로딩 중...</td></tr>) : topProducts.length === 0 ? (<tr><td colSpan={6} className="py-10 text-center text-gray-400">판매 데이터가 없습니다.</td></tr>) : (
                topProducts.map((product, index) => (
                  <tr key={product.id} onClick={() => navigate(`/admin/products/${product.id}`)} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 text-center"><span className="font-bold text-[#222222]">{index + 1}</span></td>
                    <td className="px-6 py-4 max-w-[140px]"><div className="flex items-center gap-3">{product.image && (<img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover ml-[30px]" />)}<span className="font-bold text-[#222222] group-hover:text-blue-600 transition-colors truncate">{product.name}</span></div></td>
                    <td className="px-6 py-4 text-center"><span className="font-bold text-blue-600">₩ {(product as any).recentRevenue.toLocaleString()}</span></td>
                    <td className="px-6 py-4 text-center"><span className="font-bold text-gray-500">₩ {(product as any).cumulativeRevenue.toLocaleString()}</span></td>
                    <td className="px-6 py-4 text-center"><span className="font-bold text-[#222222]">{product.quantity.toLocaleString()}</span><span className="text-sm text-gray-400 ml-1">개</span></td>
                    <td className="px-6 py-4 text-center"><span className={`font-bold ${(product as any).stock === 0 ? 'text-red-500' : (product as any).stock < 10 ? 'text-orange-500' : 'text-gray-500'}`}>{(product as any).stock.toLocaleString()}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
