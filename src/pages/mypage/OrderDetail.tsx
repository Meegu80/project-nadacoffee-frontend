import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/order.api";
import {
   MdArrowBack,
   MdLocalShipping,
   MdPayment,
   MdReceipt,
   MdPerson,
   MdPhone,
   MdLocationOn,
   MdMessage,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { Loader2, Coffee } from "lucide-react";

const OrderDetail: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();

   const {
      data: order,
      isLoading,
      error,
   } = useQuery({
      queryKey: ["order", id],
      queryFn: async () => {
         const data = await orderApi.getOrderDetail(Number(id));
         console.log("📦 [DEBUG] Order Detail Data:", data);
         return data;
      },
      enabled: !!id,
   });

   if (isLoading)
      return (
         <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-yellow" size={48} />
         </div>
      );
   if (error || !order)
      return (
         <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-xl font-bold text-gray-400">
               주문 정보를 찾을 수 없습니다.
            </p>
            <button
               onClick={() => navigate(-1)}
               className="px-6 py-2 bg-brand-dark text-white rounded-full">
               뒤로가기
            </button>
         </div>
      );

   const statusLabels: any = {
      PENDING: "입금대기",
      PAYMENT_COMPLETED: "결제완료",
      PREPARING: "배송준비중",
      SHIPPING: "배송중",
      DELIVERED: "배송완료",
      CANCELLED: "주문취소",
      PURCHASE_COMPLETED: "구매확정",
   };

   return (
      <div className="min-h-screen bg-gray-50 pt-10 pb-20">
         <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-10">
               <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full hover:bg-white transition-colors text-gray-500 shadow-sm border border-gray-100 bg-white">
                  <MdArrowBack size={24} />
               </button>
               <div>
                  <h2 className="text-3xl font-black text-brand-dark tracking-tighter italic uppercase">
                     Order Detail
                  </h2>
                  <p className="text-sm text-gray-400 font-bold">
                     주문번호: {order.id}
                  </p>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-white rounded-[35px] p-8 shadow-xl border border-gray-100 flex items-center justify-between overflow-hidden relative">
                  <div className="relative z-10">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Current Status
                     </span>
                     <h3 className="text-4xl font-black text-brand-dark italic">
                        {statusLabels[order.status] || order.status}
                     </h3>
                     <p className="text-sm text-gray-400 mt-2 font-medium">
                        주문일시:{" "}
                        {order.createdAt
                           ? new Date(order.createdAt).toLocaleString()
                           : "-"}
                     </p>
                  </div>
                  <div className="w-24 h-24 bg-brand-yellow/10 rounded-full flex items-center justify-center text-brand-yellow relative z-10">
                     <MdLocalShipping size={48} />
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-yellow/5 rounded-full blur-3xl" />
               </div>

               <div className="bg-white rounded-[35px] shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                     <MdReceipt className="text-brand-dark" size={20} />
                     <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">
                        Ordered Items
                     </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                     {order.orderItems?.map((item: any) => (
                        <div
                           key={item.id}
                           className="p-8 flex items-center gap-6 group">
                           <div
                              className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm shrink-0 cursor-pointer hover:ring-4 hover:ring-brand-yellow/30 transition-all"
                              onClick={() =>
                                 navigate(
                                    `/products/${item.product?.id || item.prodId}`,
                                 )
                              }>
                              {item.product?.imageUrl ? (
                                 <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Coffee size={32} />
                                 </div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-xl font-black text-brand-dark truncate mb-1">
                                 {item.product?.name || "알 수 없는 상품"}
                              </h4>
                              <div className="flex items-center gap-2">
                                 <span
                                    className={twMerge([
                                       "px-2 py-0.5 rounded text-[10px] font-black text-white",
                                       (item.option?.value || "")
                                          .toUpperCase()
                                          .includes("ICE")
                                          ? "bg-blue-500"
                                          : "bg-red-500",
                                    ])}>
                                    {item.option?.value || "기본"}
                                 </span>
                                 <span className="text-sm text-gray-400 font-bold">
                                    수량: {item.quantity || 0}개
                                 </span>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-2xl font-black text-brand-dark italic">
                                 ₩{" "}
                                 {(
                                    (item.salePrice || 0) * (item.quantity || 0)
                                 ).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400 font-bold">
                                 단가: ₩{" "}
                                 {(item.salePrice || 0).toLocaleString()}
                              </p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[35px] shadow-xl border border-gray-100 overflow-hidden">
                     <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                        <MdLocalShipping
                           className="text-brand-dark"
                           size={20}
                        />
                        <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">
                           Delivery Info
                        </h3>
                     </div>
                     <div className="p-8 space-y-6">
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                              <MdPerson size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                 Recipient
                              </p>
                              <p className="font-bold text-brand-dark">
                                 {order.recipientName || "-"}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                              <MdPhone size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                 Contact
                              </p>
                              <p className="font-bold text-brand-dark">
                                 {order.recipientPhone || "-"}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                              <MdLocationOn size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                 Address
                              </p>
                              <p className="font-bold text-brand-dark text-sm leading-relaxed">
                                 ({order.zipCode || ""}) {order.address1 || ""}{" "}
                                 {order.address2 || ""}
                              </p>
                           </div>
                        </div>
                        {order.deliveryMessage && (
                           <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                 <MdMessage size={20} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                    Message
                                 </p>
                                 <p className="font-bold text-brand-dark text-sm">
                                    {order.deliveryMessage}
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* [수정] 결제 정보 요약: 배경 제거 및 중앙 정렬 */}
                  <div className="bg-white rounded-[35px] shadow-xl p-10 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                     <div className="relative z-10 w-full text-center">
                        <div className="flex items-center justify-center gap-2 mb-8 opacity-30">
                           <MdPayment size={24} className="text-brand-dark" />
                           <h3 className="font-black uppercase tracking-widest text-sm text-brand-dark">
                              Payment Summary
                           </h3>
                        </div>

                        <div className="space-y-5 w-full max-w-xs mx-auto">
                           <div className="flex justify-between items-center text-gray-400 font-bold">
                              <span>총 상품 금액</span>
                              <span className="text-brand-dark">
                                 ₩{" "}
                                 {(
                                    (order.totalPrice || 0) +
                                    (order.usedPoint || 0)
                                 ).toLocaleString()}
                              </span>
                           </div>
                           <div className="flex justify-between items-center text-gray-400 font-bold">
                              <span>포인트 사용</span>
                              <span className="text-red-500">
                                 - ₩ {(order.usedPoint || 0).toLocaleString()}
                              </span>
                           </div>
                           <div className="flex justify-between items-center text-gray-400 font-bold">
                              <span>배송비</span>
                              <span className="text-green-500">무료배송</span>
                           </div>

                           <div className="pt-8 border-t border-gray-100 mt-8 flex flex-col items-center gap-2">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                                 Final Payment
                              </span>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-gray-300 text-2xl font-light italic">
                                    ₩
                                 </span>
                                 <span className="text-6xl font-black text-brand-dark tracking-tighter leading-none drop-shadow-sm">
                                    {(order.totalPrice || 0).toLocaleString()}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* 배경 장식 (은은하게) */}
                     <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-yellow/5 rounded-full blur-3xl" />
                     <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-yellow/5 rounded-full blur-3xl" />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default OrderDetail;
