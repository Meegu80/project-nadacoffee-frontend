import { motion } from "framer-motion";
import { 
  MdOutlinePayments, MdOutlineShoppingCart, MdOutlinePeopleAlt, MdOutlineSmsFailed,
  MdTrendingUp, MdOutlineInventory2, MdOutlineChevronRight
} from "react-icons/md";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { adminOrderApi } from "../../api/admin.order.api";
import { adminMemberApi } from "../../api/admin.member.api";
import { getProducts } from "../../api/product.api";

function AdminDashboard() {
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({ queryKey: ["admin", "dashboard", "orders"], queryFn: () => adminOrderApi.getOrders({ limit: 1000 }) });
  const { data: membersData, isLoading: isMembersLoading } = useQuery({ queryKey: ["admin", "dashboard", "members"], queryFn: () => adminMemberApi.getMembers({ limit: 1000 }) });
  const { data: productsData, isLoading: isProductsLoading } = useQuery({ queryKey: ["admin", "dashboard", "products"], queryFn: () => getProducts({ limit: 100 }) });

  const getKSTDateString = (dateStr: string | Date) => new Date(dateStr).toLocaleDateString('en-CA');

  const calculateStats = () => {
    if (!ordersData || !membersData) return { todaySales: 0, todayOrders: 0, newMembers: 0, pendingOrders: 0, weeklySales: Array(7).fill(0) };
    const today = getKSTDateString(new Date());
    const todayOrdersList = ordersData.data.filter(o => getKSTDateString(o.createdAt) === today);
    const todaySales = todayOrdersList.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const newMembers = membersData.data.filter(m => getKSTDateString(m.createdAt) === today).length;
    const pendingOrders = ordersData.data.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'PREPARING').length;
    const weeklySales = Array(7).fill(0);
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); return getKSTDateString(d);
    });
    ordersData.data.forEach(order => {
      const index = last7Days.indexOf(getKSTDateString(order.createdAt));
      if (index !== -1) weeklySales[index] += (order.totalPrice || 0);
    });
    return { todaySales, todayOrders: todayOrdersList.length, newMembers, pendingOrders, weeklySales };
  };

  const statsData = calculateStats();
  const stats = [
    { id: 1, label: "오늘의 매출", value: `₩ ${statsData.todaySales.toLocaleString()}`, change: "Today", icon: MdOutlinePayments, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, label: "오늘의 주문", value: `${statsData.todayOrders}건`, change: "Today", icon: MdOutlineShoppingCart, color: "text-orange-600", bg: "bg-orange-50" },
    { id: 3, label: "신규 회원", value: `${statsData.newMembers}명`, change: "Today", icon: MdOutlinePeopleAlt, color: "text-purple-600", bg: "bg-purple-50" },
    { id: 4, label: "처리 대기", value: `${statsData.pendingOrders}건`, change: "Action Needed", icon: MdOutlineSmsFailed, color: "text-red-600", bg: "bg-red-50" },
  ];

  const lowStockProducts = productsData?.data.flatMap(p => {
    const lowStockOptions = p.options?.filter(opt => opt.stockQty < 10) || [];
    return lowStockOptions.map(opt => ({ id: `${p.id}-${opt.id}`, name: `${p.name} (${opt.name}: ${opt.value})`, stock: opt.stockQty, status: opt.stockQty === 0 ? "품절" : "품절임박" }));
  }).slice(0, 5) || [];

  const maxSales = Math.max(...statsData.weeklySales, 1);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-black text-[#222222] tracking-tight">DASHBOARD</h2><p className="text-sm text-gray-500 mt-1 font-medium">오늘의 나다커피 운영 현황입니다.</p></div>
        <div className="text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">마지막 업데이트: {new Date().toLocaleTimeString()}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
              {statsData.weeklySales.map((sales, i) => {
                const heightPercent = (sales / maxSales) * 100;
                const dateLabel = new Date(); dateLabel.setDate(dateLabel.getDate() - (6 - i));
                return (<div key={i} className="flex-1 flex flex-col items-center gap-2 group relative"><div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">₩ {sales.toLocaleString()}</div><motion.div initial={{ height: 0 }} animate={{ height: `${heightPercent}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={`w-full max-w-[40px] rounded-t-lg transition-all ${i === 6 ? 'bg-[#FFD400]' : 'bg-gray-100 group-hover:bg-gray-200'}`} /><span className="text-[10px] font-bold text-gray-400">{`${dateLabel.getMonth() + 1}.${dateLabel.getDate()}`}</span></div>);
              })}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between"><h3 className="text-lg font-black text-[#222222]">최근 주문 내역</h3><Link to="/admin/orders" className="text-xs font-bold text-gray-400 hover:text-[#222222] flex items-center gap-1">전체보기 <MdOutlineChevronRight size={16} /></Link></div>
            <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest"><tr><th className="px-6 py-4">주문번호</th><th className="px-6 py-4">주문자</th><th className="px-6 py-4">결제금액</th><th className="px-6 py-4">상태</th><th className="px-6 py-4">시간</th></tr></thead><tbody className="text-sm divide-y divide-gray-50">{isOrdersLoading ? (<tr><td colSpan={5} className="py-10 text-center text-gray-400">로딩 중...</td></tr>) : ordersData?.data.slice(0, 5).map((order) => (<tr key={order.id} className="hover:bg-gray-50/30 transition-colors"><td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.id}</td><td className="px-6 py-4 font-bold text-[#222222]">{order.recipientName || order.userName}</td><td className="px-6 py-4 font-black text-[#222222]">₩ {(order.totalPrice || 0).toLocaleString()}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-[10px] font-black ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : order.status === 'PREPARING' ? 'bg-orange-50 text-orange-600' : order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{order.status}</span></td><td className="px-6 py-4 text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table></div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-[#222222] text-white p-8 rounded-3xl shadow-xl shadow-black/10"><div className="flex items-center gap-2 mb-6"><MdOutlineInventory2 className="text-[#FFD400]" size={24} /><h3 className="text-lg font-black">재고 알림</h3></div><div className="space-y-4">{isProductsLoading ? (<p className="text-white/40 text-xs">재고 확인 중...</p>) : lowStockProducts.length > 0 ? (lowStockProducts.map((alert) => (<div key={alert.id} className="bg-white/5 p-4 rounded-2xl border border-white/10"><div className="flex justify-between items-start mb-1"><p className="text-sm font-bold text-white/90 truncate max-w-[150px]">{alert.name}</p><span className={`text-[10px] font-black px-2 py-0.5 rounded ${alert.status === '품절' ? 'bg-red-500' : 'bg-[#FFD400] text-black'}`}>{alert.status}</span></div><p className="text-xs text-white/40 font-medium">{alert.stock}개 남음</p></div>))) : (<p className="text-white/40 text-xs">재고 부족 상품이 없습니다.</p>)}</div><Link to="/admin/products" className="block w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all text-center">재고 관리 바로가기</Link></div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"><h3 className="text-lg font-black text-[#222222] mb-6">빠른 작업</h3><div className="grid grid-cols-2 gap-4">{[{ label: "상품 등록", path: "/admin/products/new", icon: MdOutlineInventory2 }, { label: "회원 관리", path: "/admin/members", icon: MdOutlinePeopleAlt }, { label: "공지 작성", path: "/support/notice", icon: MdOutlineSmsFailed }, { label: "주문 관리", path: "/admin/orders", icon: MdTrendingUp }].map((action) => (<Link key={action.label} to={action.path} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-[#FFD400] group transition-all"><action.icon size={24} className="text-gray-400 group-hover:text-black mb-2" /><span className="text-[10px] font-black text-gray-500 group-hover:text-black">{action.label}</span></Link>))}</div></div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
